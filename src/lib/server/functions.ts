import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeBarcode } from "@/lib/utils";
import {
  ensureCatalog,
  findByBarcode,
  findByBarcodes,
  findByName,
  getIngredient,
  listCards,
  listCardsByAisle,
  listCardsForBrand,
  barcodesInAisle,
  listFeaturedCards,
  recommendFor,
  searchProducts,
  shelfInsights,
  upsertEvaluated,
  type CatalogCard,
} from "./catalog";
import { brandBySlug } from "@/lib/catalog/brands";
import { brandPlace, metricsFromCards, rankedHouses, shopAverage } from "@/lib/catalog/brand-metrics";
import { lookupOpenFacts, searchOpenWorld, browseOpenWorld, evaluatedToCard } from "./off";
import { extractLabel } from "./ocr";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";
import { lookupPrices } from "./prices";
import type { PriceBoard } from "@/lib/world";
import type { WorldIndex } from "@/lib/world";
import { loadFdaFeed, matchFdaRecall, type FdaRecall } from "./fda";
import { demoShelf } from "@/lib/catalog/demo-shelf";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

function dedupeCards(cards: CatalogCard[]): CatalogCard[] {
  const seen = new Set<string>();
  const out: CatalogCard[] = [];
  for (const c of cards) {
    const key = `${c.brand}|${c.title}`.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key) || seen.has(c.barcode)) continue;
    seen.add(key);
    seen.add(c.barcode);
    out.push(c);
  }
  return out;
}

async function shelvesFallback(): Promise<CatalogCard[]> {
  const { PRODUCTS } = await import("@/lib/catalog/products");
  const { evaluateDef } = await import("@/lib/catalog/evaluate");
  const { isDemoBarcode, isDemoBrand } = await import("@/lib/catalog/quality");
  const raw = PRODUCTS.filter((p) => !isDemoBarcode(p.barcode) && !isDemoBrand(p.brand)).map((p) => {
    const scored = evaluateDef(p);
    return {
      barcode: p.barcode,
      title: p.title,
      brand: p.brand,
      type: p.type,
      categoryPath: p.categoryPath,
      isOrganic: p.isOrganic,
      overallScore: scored.score.overall,
      imageUrl: scored.imageUrl,
      additiveCount: scored.additiveCount,
    };
  });
  return demoShelf(raw, 24);
}

async function matchProductRecall(product: {
  barcode: string;
  title: string;
  brand: string;
}): Promise<FdaRecall | null> {
  const feed = await loadFdaFeed();
  return matchFdaRecall(product, feed);
}

export type LookupResult =
  | { status: "found"; product: EvaluatedProduct; alternatives: EvaluatedProduct[] }
  | { status: "not_found"; barcode: string };

export const lookupBarcode = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ barcode: z.string().min(4).max(20) }).parse(input),
  )
  .handler(async ({ data }): Promise<LookupResult> => {
    void ensureCatalog();
    const barcode = normalizeBarcode(data.barcode);
    if (barcode.length < 8) return { status: "not_found", barcode };

    let product = await findByBarcode(barcode);
    if (!product) {
      const remote = await lookupOpenFacts(barcode);
      if (remote) {
        await upsertEvaluated(remote, { protectCatalog: true });
        product = remote;
      }
    }
    if (!product) return { status: "not_found", barcode };

    const alternatives = await recommendFor(product);
    return { status: "found", product, alternatives };
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ barcode: z.string() }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    const barcode = normalizeBarcode(data.barcode);
    const product = await findByBarcode(barcode);
    if (!product) {
      const remote = await lookupOpenFacts(barcode);
      if (remote) {
        void upsertEvaluated(remote, { protectCatalog: true });
        const alternatives = await recommendFor(remote);
        const prices = await withTimeout(lookupPrices(remote.barcode), 600);
        const recall = await withTimeout(matchProductRecall(remote), 600);
        return { status: "found" as const, product: remote, alternatives, prices, recall };
      }
      return { status: "not_found" as const, barcode };
    }
    const alternatives = await recommendFor(product);
    const prices = await withTimeout(lookupPrices(product.barcode), 600);
    const recall = await withTimeout(matchProductRecall(product), 600);
    return { status: "found" as const, product, alternatives, prices, recall };
  });

export const getProductsByCodes = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ barcodes: z.array(z.string()).max(40) }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    return findByBarcodes(data.barcodes.map(normalizeBarcode));
  });

export const searchCatalog = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        q: z.string().max(80).optional(),
        type: z.enum(["food", "cosmetic", "pet", "all"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CatalogCard[]> => {
    void ensureCatalog();
    if (data.q && data.q.trim().length >= 2) {
      const q = data.q.trim();
      const local = await searchProducts(q);
      let world: Awaited<ReturnType<typeof searchOpenWorld>> = [];
      try {
        world = (await withTimeout(searchOpenWorld(q), 900)) ?? [];
        void Promise.all(world.slice(0, 24).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      } catch {
        world = [];
      }
      const seen = new Set(local.map((p) => p.barcode));
      const merged = [
        ...local.map(evaluatedToCard),
        ...world.filter((p) => !seen.has(p.barcode)).map(evaluatedToCard),
      ];
      const typed = data.type && data.type !== "all" ? merged.filter((c) => c.type === data.type) : merged;
      return demoShelf(dedupeCards(typed), 24);
    }
    const cards = await withTimeout(listCards(), 700);
    const source = cards && cards.length ? cards : await shelvesFallback();
    const typed = data.type && data.type !== "all" ? source.filter((c) => c.type === data.type) : source;
    return demoShelf(dedupeCards(typed), 24);
  });

export const listFeatured = createServerFn({ method: "GET" }).handler(async () => {
  void ensureCatalog();
  const cards = await withTimeout(listFeaturedCards(), 800);
  const source = cards && cards.length ? cards : await shelvesFallback();
  return demoShelf(source, 12);
});

export const listShelves = createServerFn({ method: "GET" }).handler(async () => {
  void ensureCatalog();
  const hot = await withTimeout(listCards(), 700);
  const source = hot && hot.length ? hot : await shelvesFallback();
  return demoShelf(dedupeCards(source), 24);
});

export const loadWorldIndex = createServerFn({ method: "GET" }).handler(async (): Promise<WorldIndex> => {
  const { readWorldIndex, fallbackWorldIndex } = await import("./world-meta");
  void ensureCatalog();
  return (await withTimeout(readWorldIndex(), 400)) ?? fallbackWorldIndex();
});

export const loadPrices = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ barcode: z.string() }).parse(input))
  .handler(async ({ data }): Promise<PriceBoard | null> => {
    return lookupPrices(normalizeBarcode(data.barcode));
  });

export const analyzeLabelImage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        imageBase64: z.string().min(20).max(2_500_000),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    void ensureCatalog();
    const result = await extractLabel(data.imageBase64, data.mimeType);
    if (!result.ok) return result;
    const named =
      result.product.source === "ocr"
        ? await findByName(result.product.title, result.product.brand)
        : null;
    const product = named ?? result.product;
    void upsertEvaluated(product, { protectCatalog: true });
    const alternatives = await recommendFor(product);
    return { ok: true as const, product, alternatives };
  });

export const lookupIngredient = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    return getIngredient(data.id);
  });

export const loadAisle = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ path: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    const local = (await withTimeout(listCardsByAisle(data.path, 24), 800)) ?? [];
    return { local: demoShelf(dedupeCards(local), 24), extra: [] as CatalogCard[] };
  });

export const loadAisleWorld = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ path: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    try {
      const world = (await withTimeout(browseOpenWorld(data.path), 900)) ?? [];
      const seen = (await withTimeout(barcodesInAisle(data.path), 400)) ?? new Set<string>();
      void Promise.all(world.slice(0, 24).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      return demoShelf(
        world.filter((p) => !seen.has(p.barcode)).slice(0, 24).map(evaluatedToCard),
        24,
      );
    } catch {
      return [] as CatalogCard[];
    }
  });

export const loadBrand = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    const brand = brandBySlug(data.slug);
    if (!brand) {
      return {
        brand: null,
        local: [] as CatalogCard[],
        extra: [] as CatalogCard[],
        shopAvg: 0,
        rank: null as { place: number; of: number } | null,
        metrics: null as ReturnType<typeof metricsFromCards>[number] | null,
      };
    }
    const local = (await withTimeout(listCardsForBrand(brand.name, 24), 800)) ?? [];
    const all = (await withTimeout(listCards(), 700)) ?? local;
    const houses = metricsFromCards(all);
    const ranked = rankedHouses(houses, 3);
    const metrics = houses.find((h) => h.slug === brand.slug) ?? metricsFromCards(local)[0] ?? null;
    return {
      brand,
      local: demoShelf(dedupeCards(local), 24),
      extra: [] as CatalogCard[],
      shopAvg: shopAverage(all),
      rank: metrics ? brandPlace(ranked, metrics.slug) : null,
      metrics,
    };
  });

export const loadBrandWorld = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ name: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    void ensureCatalog();
    try {
      const world = (await withTimeout(searchOpenWorld(data.name), 900)) ?? [];
      const cards = (await withTimeout(listCardsForBrand(data.name, 24), 700)) ?? [];
      const seen = new Set(cards.map((c) => c.barcode));
      void Promise.all(world.slice(0, 24).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      return demoShelf(
        world.filter((p) => !seen.has(p.barcode)).slice(0, 24).map(evaluatedToCard),
        24,
      );
    } catch {
      return [] as CatalogCard[];
    }
  });

export const loadLabInsights = createServerFn({ method: "GET" }).handler(async () => {
  void ensureCatalog();
  const { readWorldIndex, fallbackWorldIndex } = await import("./world-meta");
  const { labReport } = await import("@/lib/catalog/lab-insights");
  const [lab, world] = await Promise.all([
    withTimeout(shelfInsights(), 800).then((v) => v ?? labReport()),
    withTimeout(readWorldIndex(), 400).then((v) => v ?? fallbackWorldIndex()),
  ]);
  return { lab, world };
});

export const submitCrowdLabel = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        barcode: z.string().min(8).max(20),
        title: z.string().min(3).max(120),
        brand: z.string().max(80).optional(),
        ingredientsText: z.string().min(4).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    void ensureCatalog();
    const { parseIngredients } = await import("@/lib/catalog/match");
    const { evaluateDef } = await import("@/lib/catalog/evaluate");
    const { recordIsScorable } = await import("@/lib/catalog/quality");
    const { categoryBucket } = await import("@/lib/scoring");
    const parsed = parseIngredients(data.ingredientsText);
    if (
      !recordIsScorable({
        title: data.title,
        type: "food",
        ingredientsText: data.ingredientsText,
        ingredientCount: parsed.matched.length,
      })
    ) {
      return { ok: false as const, error: "Need a name and an ingredient list." };
    }
    const product = evaluateDef(
      {
        barcode: data.barcode.replace(/\D/g, ""),
        title: data.title.trim(),
        brand: data.brand?.trim() || "",
        type: "food",
        categoryPath: categoryBucket(data.title),
        isOrganic: /organic/i.test(data.title + data.ingredientsText),
        ingredientIds: parsed.matched.map((m) => m.id),
        ingredientsText: data.ingredientsText,
      },
      { unmatched: parsed.unmatched, source: "crowd" },
    );
    void upsertEvaluated(product, { protectCatalog: true });
    return { ok: true as const, barcode: product.barcode };
  });

export const listRecalls = createServerFn({ method: "GET" }).handler(async () => {
  const feed = await withTimeout(loadFdaFeed(), 800);
  return (feed ?? []).slice(0, 24);
});
