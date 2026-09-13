import type { MatchedIngredient, Nutrition, ProductType } from "./types";

const CATEGORIES = [
  "beverages",
  "breakfast",
  "dairy",
  "snacks",
  "chocolate",
  "frozen",
  "meat",
  "staples",
  "baby",
  "skincare",
  "hair",
  "body",
  "pet",
] as const;

export type CategoryId = (typeof CATEGORIES)[number];

export function categoryBucket(path: string): CategoryId {
  const p = path.toLowerCase();
  for (const c of CATEGORIES) {
    if (p.includes(c)) return c;
  }
  if (p.includes("alcohol") || p.includes("beer") || p.includes("wine") || p.includes("drink") || p.includes("soda") || p.includes("water") || p.includes("juice") || p.includes("coffee") || p.includes("tea")) {
    return "beverages";
  }
  if (p.includes("yogurt") || p.includes("cheese") || p.includes("milk") || p.includes("ice-cream") || p.includes("icecream") || p.includes("gelato")) return "dairy";
  if (p.includes("cereal") || p.includes("oat") || p.includes("granola") || p.includes("bread") || p.includes("bakery") || p.includes("bagel")) return "breakfast";
  if (p.includes("chip") || p.includes("crisp") || p.includes("cookie") || p.includes("protein") || p.includes("bar") || p.includes("candy") || p.includes("gummy")) return "snacks";
  if (p.includes("oil") || p.includes("butter") || p.includes("spread") || p.includes("sauce") || p.includes("ketchup") || p.includes("vitamin") || p.includes("supplement")) return "staples";
  if (p.includes("sun") || p.includes("spf") || p.includes("makeup") || p.includes("mascara") || p.includes("lotion") || p.includes("serum") || p.includes("cream") || p.includes("balm")) {
    return "skincare";
  }
  if (p.includes("shampoo") || p.includes("hair")) return "hair";
  if (p.includes("soap") || p.includes("wash") || p.includes("body") || p.includes("oral") || p.includes("tooth") || p.includes("household") || p.includes("clean")) return "body";
  if (p.includes("chocolate") || p.includes("cocoa")) return "chocolate";
  if (p.includes("pet") || p.includes("dog") || p.includes("cat") || p.includes("kibble")) return "pet";
  if (p.includes("frozen") || p.includes("pizza")) return "frozen";
  if (p.includes("baby") || p.includes("infant") || p.includes("formula") || p.includes("wipe")) return "baby";
  if (p.includes("meat") || p.includes("deli") || p.includes("bacon") || p.includes("ham") || p.includes("seafood") || p.includes("tuna") || p.includes("salmon")) return "meat";
  return "staples";
}

/** 32-d health embedding used for SQL cosine_similarity and in-process ranking. */
export function embedProduct(input: {
  type: ProductType;
  categoryPath: string;
  nutrition?: Nutrition | null;
  ingredients: MatchedIngredient[];
  isOrganic: boolean;
  overallScore: number;
}): number[] {
  const bucket = categoryBucket(input.categoryPath);
  const cat = CATEGORIES.map((c) => (c === bucket ? 1 : 0));
  const n = input.nutrition;
  const nutrition = [
    n ? Math.min(n.energyKj / 3350, 1) : 0,
    n ? Math.min(n.sugars / 50, 1) : 0,
    n ? Math.min(n.saturatedFat / 20, 1) : 0,
    n ? Math.min((n.salt || 0) / 4, 1) : 0,
    n ? Math.min(n.fiber / 10, 1) : 0,
    n ? Math.min(n.protein / 20, 1) : 0,
    n ? Math.min(n.fruitsVegetables / 100, 1) : 0,
  ];
  const additives = input.ingredients.filter((i) => i.isAdditive);
  const risk = [
    additives.filter((a) => a.riskClass === "high").length / 4,
    additives.filter((a) => a.riskClass === "moderate").length / 4,
    additives.filter((a) => a.riskClass === "low").length / 6,
    input.ingredients.filter((i) => i.hazard === "red").length / 4,
    input.ingredients.filter((i) => i.hazard === "orange").length / 6,
  ];
  const flags = [
    input.type === "food" ? 1 : 0,
    input.type === "cosmetic" ? 1 : 0,
    input.type === "pet" ? 1 : 0,
    input.isOrganic ? 1 : 0,
    input.overallScore / 100,
  ];
  const vec = [...cat, ...nutrition, ...risk, ...flags];
  while (vec.length < 32) vec.push(0);
  return vec.slice(0, 32);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    na += (a[i] ?? 0) ** 2;
    nb += (b[i] ?? 0) ** 2;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
