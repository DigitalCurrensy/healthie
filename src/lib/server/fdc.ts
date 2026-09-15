import { evaluateDef, type EvaluatedProduct } from "@/lib/catalog/evaluate";
import type { ProductDef } from "@/lib/catalog/products";
import { parseIngredients } from "@/lib/catalog/match";
import { recordIsScorable } from "@/lib/catalog/quality";
import { aislePathFromTags } from "@/lib/catalog/aisles";
import type { Nutrition } from "@/lib/scoring/types";

type FdcNutrient = {
  nutrientName?: string;
  nutrientNumber?: string;
  value?: number;
  unitName?: string;
};

type FdcFood = {
  fdcId?: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  ingredients?: string;
  foodNutrients?: FdcNutrient[];
};

export type FdcSearchPage = {
  foods: FdcFood[];
  totalHits: number;
  totalPages: number;
  currentPage: number;
};

const UA = "Healthie/1.0 (https://healthie-hazel.vercel.app)";
const PAGE_SIZE_MAX = 200;
const LIVE_PAGE_SIZE = 25;

function key(): string {
  return process.env.FDC_API_KEY || process.env.USDA_FDC_API_KEY || "DEMO_KEY";
}

function num(n: FdcNutrient | undefined): number {
  return typeof n?.value === "number" && Number.isFinite(n.value) ? n.value : 0;
}

function pick(nuts: FdcNutrient[], names: string[], numbers: string[]): FdcNutrient | undefined {
  const lower = names.map((n) => n.toLowerCase());
  return nuts.find((n) => {
    const name = (n.nutrientName || "").toLowerCase();
    const no = String(n.nutrientNumber || "");
    return lower.some((w) => name === w || name.startsWith(w)) || numbers.includes(no);
  });
}

export function nutritionFromFdc(nuts: FdcNutrient[] | undefined): Nutrition | undefined {
  if (!nuts?.length) return undefined;
  const kcal = pick(nuts, ["energy", "energy (kcal)"], ["208", "1008"]);
  const kj = pick(nuts, ["energy (kj)"], ["268", "1062"]);
  const sugars = pick(nuts, ["sugars, total", "total sugars", "sugars"], ["2000", "269"]);
  const sat = pick(nuts, ["fatty acids, total saturated", "saturated fat"], ["1258", "606"]);
  const sodium = pick(nuts, ["sodium, na", "sodium"], ["307", "1093"]);
  const fiber = pick(nuts, ["fiber, total dietary", "fiber"], ["291", "1079"]);
  const protein = pick(nuts, ["protein"], ["203", "1003"]);
  const fat = pick(nuts, ["total lipid (fat)", "fat"], ["204", "1004"]);
  const sodiumMg = num(sodium);
  const energyKj = num(kj) || num(kcal) * 4.184;
  const nutrition: Nutrition = {
    energyKj,
    sugars: num(sugars),
    saturatedFat: num(sat),
    salt: sodiumMg ? sodiumMg / 400 : 0,
    sodiumMg: sodiumMg || undefined,
    fiber: num(fiber),
    protein: num(protein),
    fruitsVegetables: 0,
    fat: num(fat),
    saltKnown: Boolean(sodium),
    satKnown: Boolean(sat),
  };
  if (!nutrition.energyKj && !nutrition.sugars && !nutrition.protein && !nutrition.fat) return undefined;
  return nutrition;
}

function barcodeFor(food: FdcFood): string {
  const gtin = (food.gtinUpc || "").replace(/\D/g, "");
  if (gtin.length >= 8 && gtin.length <= 14) return gtin;
  return `fdc${food.fdcId || 0}`;
}

export function fdcFoodToEvaluated(food: FdcFood): EvaluatedProduct | null {
  const title = (food.description || "").trim();
  if (title.length < 3) return null;
  const ingredientsText = (food.ingredients || "").trim();
  const nutrition = nutritionFromFdc(food.foodNutrients);
  const parsed = parseIngredients(ingredientsText);
  if (
    !recordIsScorable({
      title,
      type: "food",
      ingredientsText,
      ingredientCount: parsed.matched.length,
      nutrition,
    })
  ) {
    return null;
  }
  const brand = (food.brandName || food.brandOwner || "").split(",")[0]?.trim() || "";
  const def: ProductDef = {
    barcode: barcodeFor(food),
    title,
    brand,
    type: "food",
    categoryPath: aislePathFromTags([], title, "food"),
    isOrganic: /organic/i.test(`${title} ${brand} ${ingredientsText}`),
    isBeverage: /soda|cola|pepsi|drink|juice|tea|water|ade\b/i.test(title),
    ingredientIds: parsed.matched.map((m) => m.id),
    ingredientsText,
    nutrition,
  };
  return evaluateDef(def, { unmatched: parsed.unmatched, source: "usda-fdc" });
}

/**
 * USDA search is 1-based. pageSize max 200.
 * Envelope: foods, totalHits, totalPages, currentPage.
 * Do not walk every page on a live query — "applesauce" branded is ~988 hits / 494 pages at size 2.
 */
export async function fetchFdcPage(query: string, pageNumber = 1, pageSize = LIVE_PAGE_SIZE): Promise<FdcSearchPage | null> {
  const q = query.trim();
  if (q.length < 2) return null;
  const size = Math.min(Math.max(pageSize, 1), PAGE_SIZE_MAX);
  const page = Math.max(pageNumber, 1);
  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key())}` +
    `&query=${encodeURIComponent(q)}&pageSize=${size}&pageNumber=${page}&dataType=Branded`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UA },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      foods?: FdcFood[];
      totalHits?: number;
      totalPages?: number;
      currentPage?: number;
    };
    return {
      foods: data.foods ?? [],
      totalHits: data.totalHits ?? 0,
      totalPages: data.totalPages ?? 0,
      currentPage: data.currentPage ?? page,
    };
  } catch {
    return null;
  }
}

export async function searchFoodDataCentral(query: string): Promise<EvaluatedProduct[]> {
  const page = await fetchFdcPage(query, 1, LIVE_PAGE_SIZE);
  if (!page) return [];
  const out: EvaluatedProduct[] = [];
  const seen = new Set<string>();
  for (const food of page.foods) {
    const ev = fdcFoodToEvaluated(food);
    if (!ev || seen.has(ev.barcode)) continue;
    seen.add(ev.barcode);
    out.push(ev);
  }
  return out;
}
