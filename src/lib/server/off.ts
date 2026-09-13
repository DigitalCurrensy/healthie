import { parseIngredients } from "@/lib/catalog/match";
import { evaluateDef, type EvaluatedProduct } from "@/lib/catalog/evaluate";
import type { ProductDef } from "@/lib/catalog/products";
import { type Nutrition, type ProductType } from "@/lib/scoring";
import { aislePathFromTags } from "@/lib/catalog/aisles";
import { recordIsScorable } from "@/lib/catalog/quality";
import { barcodeVariants, normalizeBarcode } from "@/lib/utils";
import type { CatalogCard } from "./catalog";

const UA = "Healthie/1.0 (https://grok.com; product-scanner)";

type OffProduct = {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  image_url?: string;
  image_front_url?: string;
  nutriments?: Record<string, number | undefined>;
  labels_tags?: string[];
  categories_tags?: string[];
  nova_group?: number;
};

type OffResponse = { status?: number; product?: OffProduct; products?: OffProduct[]; count?: number };

type OffHost = "food" | "beauty" | "pet" | "products";

const AISLE_OFF_TAG: Record<string, { host: OffHost; tag: string }> = {
  beverages: { host: "food", tag: "en:beverages" },
  breakfast: { host: "food", tag: "en:breakfast-cereals" },
  dairy: { host: "food", tag: "en:yogurts" },
  spreads: { host: "food", tag: "en:spreads" },
  snacks: { host: "food", tag: "en:salty-snacks" },
  chocolate: { host: "food", tag: "en:chocolates" },
  staples: { host: "food", tag: "en:pastas" },
  condiments: { host: "food", tag: "en:sauces" },
  frozen: { host: "food", tag: "en:frozen-foods" },
  baby: { host: "food", tag: "en:baby-foods" },
  bakery: { host: "food", tag: "en:breads" },
  coffee: { host: "food", tag: "en:coffees" },
  protein: { host: "food", tag: "en:protein-bars" },
  candy: { host: "food", tag: "en:candies" },
  meat: { host: "food", tag: "en:meats" },
  alcohol: { host: "food", tag: "en:beers" },
  vitamins: { host: "food", tag: "en:dietary-supplements" },
  seafood: { host: "food", tag: "en:canned-fishes" },
  icecream: { host: "food", tag: "en:ice-creams" },
  household: { host: "products", tag: "en:dishwashing-products" },
  skincare: { host: "beauty", tag: "en:face-creams" },
  makeup: { host: "beauty", tag: "en:make-up" },
  oral: { host: "beauty", tag: "en:toothpastes" },
  hair: { host: "beauty", tag: "en:shampoos" },
  sun: { host: "beauty", tag: "en:sunscreens" },
  body: { host: "beauty", tag: "en:body-washings" },
  pet: { host: "pet", tag: "en:pet-foods" },
};

/** Small pantry fill. Aisles browse live; this must not 429 the product API. */
const HARVEST_QUERIES: { host: OffHost; tag: string }[] = [
  AISLE_OFF_TAG.beverages!,
  AISLE_OFF_TAG.breakfast!,
  AISLE_OFF_TAG.snacks!,
  AISLE_OFF_TAG.dairy!,
  AISLE_OFF_TAG.spreads!,
  AISLE_OFF_TAG.chocolate!,
  AISLE_OFF_TAG.skincare!,
  AISLE_OFF_TAG.pet!,
];

const globalRef = globalThis as typeof globalThis & { __offCoolUntil__?: number };

export function isOffCooling(): boolean {
  return Date.now() < (globalRef.__offCoolUntil__ ?? 0);
}

function tripCooldown(ms = 90_000) {
  globalRef.__offCoolUntil__ = Date.now() + ms;
}

function origin(host: OffHost): string {
  switch (host) {
    case "beauty":
      return "https://world.openbeautyfacts.org";
    case "pet":
      return "https://world.openpetfoodfacts.org";
    case "products":
      return "https://world.openproductsfacts.org";
    default:
      return "https://world.openfoodfacts.org";
  }
}

function sourceOf(host: OffHost): "openfoodfacts" | "openbeautyfacts" | "openpetfoodfacts" | "openproductsfacts" {
  switch (host) {
    case "beauty":
      return "openbeautyfacts";
    case "pet":
      return "openpetfoodfacts";
    case "products":
      return "openproductsfacts";
    default:
      return "openfoodfacts";
  }
}

async function fetchJson(url: string, ms = 6500): Promise<OffResponse | null> {
  if (isOffCooling()) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(ms),
    });
    if (res.status === 429 || res.status === 503) {
      tripCooldown();
      return null;
    }
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text[0] === "<") return null;
    return JSON.parse(text) as OffResponse;
  } catch {
    return null;
  }
}

function num(v: number | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function nutritionFromOff(n: Record<string, number | undefined> | undefined): Nutrition {
  const energyKj =
    num(n?.["energy-kj_100g"]) ||
    num(n?.energy_100g) ||
    (num(n?.["energy-kcal_100g"]) || num(n?.["energy-kcal"])) * 4.184;
  const sodiumG = num(n?.sodium_100g);
  const saltFromBox = num(n?.salt_100g);
  const salt = saltFromBox || (sodiumG ? sodiumG * 2.5 : 0);
  const sodiumMg = sodiumG ? sodiumG * 1000 : salt ? salt * 400 : undefined;
  return {
    energyKj,
    sugars: num(n?.sugars_100g),
    saturatedFat: num(n?.["saturated-fat_100g"]),
    salt,
    sodiumMg,
    fiber: num(n?.fiber_100g),
    protein: num(n?.proteins_100g),
    fruitsVegetables:
      num(n?.["fruits-vegetables-nuts-estimate-from-ingredients_100g"]) ||
      num(n?.["fruits-vegetables-legumes-estimate-from-ingredients_100g"]),
    fat: num(n?.fat_100g),
  };
}

function isOrganic(tags: string[] | undefined): boolean {
  if (!tags) return false;
  return tags.some((t) => /organic|bio|usda-organic|eu-organic|ab-agriculture-biologique/i.test(t));
}

function isBeverage(tags: string[] | undefined, name: string): boolean {
  const blob = `${(tags ?? []).join(" ")} ${name}`.toLowerCase();
  return /beverage|drink|soda|water|juice|tea|coffee|nectar/.test(blob);
}

function isWater(name: string, tags: string[] | undefined): boolean {
  const blob = `${(tags ?? []).join(" ")} ${name}`.toLowerCase();
  return /mineral-water|spring-water|natural-water/.test(blob) && !/flavour|flavor|juice|tea/.test(blob);
}

function inferFoodType(tags: string[], title: string): "food" | "pet" {
  const blob = `${tags.join(" ")} ${title}`.toLowerCase();
  if (/pet-food|cat-food|dog-food|kibble|wet-cat|wet-dog/.test(blob)) return "pet";
  return "food";
}

export function evaluatedToCard(p: EvaluatedProduct): CatalogCard {
  return {
    barcode: p.barcode,
    title: p.title,
    brand: p.brand,
    type: p.type,
    categoryPath: p.categoryPath,
    isOrganic: p.isOrganic,
    overallScore: p.score.overall,
    imageUrl: p.imageUrl,
    additiveCount: p.additiveCount,
  };
}

export function offProductToEvaluated(
  p: OffProduct,
  source: "openfoodfacts" | "openbeautyfacts" | "openpetfoodfacts" | "openproductsfacts",
  barcodeHint?: string,
): EvaluatedProduct | null {
  const barcode = normalizeBarcode(barcodeHint || p.code || p._id || "");
  if (barcode.length < 8) return null;
  const title = (p.product_name_en || p.product_name || p.generic_name || "").trim();
  const ingredientsText = p.ingredients_text_en || p.ingredients_text || "";
  const parsed = parseIngredients(ingredientsText);
  const tags = p.categories_tags ?? [];
  const type: ProductType =
    source === "openbeautyfacts"
      ? "cosmetic"
      : source === "openpetfoodfacts"
        ? "pet"
        : inferFoodType(tags, title);
  const nutrition = type === "cosmetic" ? undefined : nutritionFromOff(p.nutriments);
  if (
    !recordIsScorable({
      title,
      type,
      ingredientsText,
      ingredientCount: parsed.matched.length,
      nutrition,
      isWater: type === "food" ? isWater(title, tags) : false,
    })
  ) {
    return null;
  }
  const category = aislePathFromTags(tags, title, type);
  const def: ProductDef = {
    barcode,
    title,
    brand: (p.brands || "").split(",")[0]?.trim() || "",
    type,
    categoryPath: type === "pet" ? "pet" : category,
    isOrganic: isOrganic(p.labels_tags),
    isBeverage: type === "food" ? isBeverage(tags, title) : false,
    isWater: type === "food" ? isWater(title, tags) : false,
    ingredientIds: parsed.matched.map((m) => m.id),
    ingredientsText,
    nutrition,
    imageUrl: p.image_front_url || p.image_url,
    novaGroup: p.nova_group,
  };
  return evaluateDef(def, { unmatched: parsed.unmatched, source });
}

async function fetchHostProduct(host: OffHost, barcode: string): Promise<EvaluatedProduct | null> {
  const data = await fetchJson(`${origin(host)}/api/v2/product/${barcode}.json`);
  if (data?.status !== 1 || !data.product) return null;
  return offProductToEvaluated(data.product, sourceOf(host), barcode);
}

/** Live long-tail lookup. Sequential so one scan cannot 429 the world API. Food first. */
export async function lookupOpenFacts(barcode: string): Promise<EvaluatedProduct | null> {
  const hosts: OffHost[] = ["food", "beauty", "pet", "products"];
  for (const code of barcodeVariants(barcode)) {
    for (const host of hosts) {
      if (isOffCooling()) return null;
      const hit = await fetchHostProduct(host, code);
      if (hit) return hit;
    }
  }
  return null;
}

async function searchHost(host: OffHost, query: string, pageSize: number): Promise<EvaluatedProduct[]> {
  const url =
    `${origin(host)}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=${pageSize}`;
  const data = await fetchJson(url, 7000);
  const out: EvaluatedProduct[] = [];
  for (const p of data?.products ?? []) {
    const ev = offProductToEvaluated(p, sourceOf(host));
    if (ev) out.push(ev);
  }
  return out;
}

export async function searchOpenWorld(query: string): Promise<EvaluatedProduct[]> {
  const q = query.trim();
  if (q.length < 2 || isOffCooling()) return [];
  const [food, beauty, petFood] = await Promise.all([
    searchHost("food", q, 28),
    searchHost("beauty", q, 12),
    searchHost("pet", q, 8),
  ]);
  const seen = new Set<string>();
  const merged: EvaluatedProduct[] = [];
  for (const p of [...food, ...beauty, ...petFood]) {
    if (seen.has(p.barcode)) continue;
    seen.add(p.barcode);
    merged.push(p);
  }
  return merged;
}

export async function browseOpenWorld(categoryPath: string): Promise<EvaluatedProduct[]> {
  const spec = AISLE_OFF_TAG[categoryPath];
  if (!spec || isOffCooling()) return [];
  const url =
    `${origin(spec.host)}/cgi/search.pl?action=process&tagtype_0=categories` +
    `&tag_contains_0=contains&tag_0=${encodeURIComponent(spec.tag)}` +
    `&page_size=40&json=1&sort_by=unique_scans_n`;
  const data = await fetchJson(url, 7000);
  const out: EvaluatedProduct[] = [];
  for (const p of data?.products ?? []) {
    const ev = offProductToEvaluated(p, sourceOf(spec.host));
    if (ev) {
      ev.categoryPath = categoryPath;
      out.push(ev);
    }
  }
  return out;
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

let harvestOnce: Promise<EvaluatedProduct[]> | null = null;

/** Popular packs by aisle. Live barcode lookup is the world index; this fills the local cache. */
export function harvestPopular(): Promise<EvaluatedProduct[]> {
  harvestOnce ??= (async () => {
    if (isOffCooling()) {
      harvestOnce = null;
      return [];
    }
    const out: EvaluatedProduct[] = [];
    const seen = new Set<string>();
    for (const group of chunk(HARVEST_QUERIES, 2)) {
      if (isOffCooling()) break;
      const jobs = group.map(async (spec) => {
        const url =
          `${origin(spec.host)}/cgi/search.pl?action=process&tagtype_0=categories` +
          `&tag_contains_0=contains&tag_0=${encodeURIComponent(spec.tag)}` +
          `&tagtype_1=countries&tag_contains_1=contains&tag_1=united-states` +
          `&page_size=10&json=1&sort_by=unique_scans_n`;
        const data = await fetchJson(url, 5000);
        const rows: EvaluatedProduct[] = [];
        for (const p of data?.products ?? []) {
          const ev = offProductToEvaluated(p, sourceOf(spec.host));
          if (ev) rows.push(ev);
        }
        return rows;
      });
      const batches = await Promise.all(jobs);
      for (const batch of batches) {
        for (const ev of batch) {
          if (seen.has(ev.barcode)) continue;
          seen.add(ev.barcode);
          out.push(ev);
        }
      }
    }
    return out;
  })();
  return harvestOnce;
}

export async function worldCounts(): Promise<{ food: number; beauty: number; pet: number }> {
  async function count(host: OffHost): Promise<number> {
    const data = await fetchJson(`${origin(host)}/cgi/search.pl?action=process&json=1&page_size=1`, 6000);
    const n = data?.count;
    return typeof n === "number" && n > 0 ? n : 0;
  }
  const [food, beauty, pet] = await Promise.all([count("food"), count("beauty"), count("pet")]);
  return { food, beauty, pet };
}
