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
import { lookupOpenFacts, searchOpenWorld, browseOpenWorld, evaluatedToCard } from "./off";
import { extractLabel } from "./ocr";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";
import { lookupPrices } from "./prices";
import type { PriceBoard } from "@/lib/world";
import type { WorldIndex } from "@/lib/world";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

export type LookupResult =
  | { status: "found"; product: EvaluatedProduct; alternatives: EvaluatedProduct[] }
  | { status: "not_found"; barcode: string };

export const lookupBarcode = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ barcode: z.string().min(4).max(20) }).parse(input),
  )
  .handler(async ({ data }): Promise<LookupResult> => {
    await ensureCatalog();
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
    await ensureCatalog();
    const barcode = normalizeBarcode(data.barcode);
    const product = await findByBarcode(barcode);
    if (!product) {
      const remote = await lookupOpenFacts(barcode);
      if (remote) {
        await upsertEvaluated(remote, { protectCatalog: true });
        const alternatives = await recommendFor(remote);
        const prices = await withTimeout(lookupPrices(remote.barcode), 1800);
        return { status: "found" as const, product: remote, alternatives, prices };
      }
      return { status: "not_found" as const, barcode };
    }
    const alternatives = await recommendFor(product);
    const prices = await withTimeout(lookupPrices(product.barcode), 1800);
    return { status: "found" as const, product, alternatives, prices };
  });

export const getProductsByCodes = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ barcodes: z.array(z.string()).max(40) }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
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
    await ensureCatalog();
    if (data.q && data.q.trim().length >= 2) {
      const q = data.q.trim();
      const local = await searchProducts(q);
      let world: Awaited<ReturnType<typeof searchOpenWorld>> = [];
      try {
        world = await searchOpenWorld(q);
        void Promise.all(world.slice(0, 40).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      } catch {
        world = [];
      }
      const seen = new Set(local.map((p) => p.barcode));
      const merged = [
        ...local.map(evaluatedToCard),
        ...world.filter((p) => !seen.has(p.barcode)).map(evaluatedToCard),
      ];
      if (data.type && data.type !== "all") return merged.filter((c) => c.type === data.type);
      return merged;
    }
    const cards = await listCards();
    if (data.type && data.type !== "all") return cards.filter((c) => c.type === data.type);
    return cards;
  });

export const listFeatured = createServerFn({ method: "GET" }).handler(async () => {
  await ensureCatalog();
  return listFeaturedCards();
});

export const loadWorldIndex = createServerFn({ method: "GET" }).handler(async (): Promise<WorldIndex> => {
  await ensureCatalog();
  const { readWorldIndex } = await import("./world-meta");
  return readWorldIndex();
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
    await ensureCatalog();
    const result = await extractLabel(data.imageBase64, data.mimeType);
    if (!result.ok) return result;
    const named =
      result.product.source === "ocr"
        ? await findByName(result.product.title, result.product.brand)
        : null;
    const product = named ?? result.product;
    await upsertEvaluated(product, { protectCatalog: true });
    const alternatives = await recommendFor(product);
    return { ok: true as const, product, alternatives };
  });

export const lookupIngredient = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
    return getIngredient(data.id);
  });

export const loadAisle = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ path: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
    const local = await listCardsByAisle(data.path, 60);
    return { local, extra: [] as CatalogCard[] };
  });

export const loadAisleWorld = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ path: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
    try {
      const world = await browseOpenWorld(data.path);
      const seen = await barcodesInAisle(data.path);
      void Promise.all(world.slice(0, 36).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      return world.filter((p) => !seen.has(p.barcode)).slice(0, 36).map(evaluatedToCard);
    } catch {
      return [] as CatalogCard[];
    }
  });

export const loadBrand = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
    const brand = brandBySlug(data.slug);
    if (!brand) return { brand: null, local: [] as CatalogCard[], extra: [] as CatalogCard[] };
    const local = await listCardsForBrand(brand.name, 60);
    return { brand, local, extra: [] as CatalogCard[] };
  });

export const loadBrandWorld = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ name: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    await ensureCatalog();
    try {
      const world = await searchOpenWorld(data.name);
      const cards = await listCardsForBrand(data.name, 80);
      const seen = new Set(cards.map((c) => c.barcode));
      void Promise.all(world.slice(0, 40).map((p) => upsertEvaluated(p, { protectCatalog: true }).catch(() => undefined)));
      return world.filter((p) => !seen.has(p.barcode)).slice(0, 40).map(evaluatedToCard);
    } catch {
      return [] as CatalogCard[];
    }
  });

export const loadLabInsights = createServerFn({ method: "GET" }).handler(async () => {
  await ensureCatalog();
  const { readWorldIndex } = await import("./world-meta");
  const [lab, world] = await Promise.all([shelfInsights(), readWorldIndex()]);
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
    await ensureCatalog();
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
    await upsertEvaluated(product, { protectCatalog: true });
    return { ok: true as const, barcode: product.barcode };
  });
