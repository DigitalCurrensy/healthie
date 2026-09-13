import type { AllergenId, MatchedIngredient } from "@/lib/scoring/types";

export const INGREDIENT_ALLERGENS: Partial<Record<string, AllergenId[]>> = {
  "wheat-flour": ["gluten"],
  oats: ["gluten"],
  milk: ["milk"],
  hazelnut: ["nuts"],
  almond: ["nuts"],
  cashew: ["nuts"],
  sesame: ["sesame"],
  celery: ["celery"],
  mustard: ["mustard"],
  egg: ["egg"],
  peanut: ["peanut"],
  fish: ["fish"],
  e322: ["soy"],
  e220: ["sulphites"],
};

/** Endocrine-activity signals (SCCS / ECHA / IARC literature, not a legal list). */
export const ENDOCRINE_IDS = new Set([
  "methylparaben",
  "propylparaben",
  "butylparaben",
  "triclosan",
  "oxybenzone",
  "octinoxate",
  "homosalate",
  "lilial",
  "e320",
  "e321",
]);

/** Prefer to skip during pregnancy / breastfeeding. */
export const PREGNANCY_AVOID_IDS = new Set([
  ...ENDOCRINE_IDS,
  "phenoxyethanol",
  "mit",
  "dmdm",
  "e250",
  "e251",
  "e951",
  "alcohol-denat",
  "retinol",
  "salicylic",
]);

/** Extra caution for products used on children. */
export const CHILD_AVOID_IDS = new Set([
  ...PREGNANCY_AVOID_IDS,
  "sls",
  "e102",
  "e104",
  "e110",
  "e122",
  "e124",
  "e129",
  "fragrance",
  "ci19140",
]);

export const ANIMAL_IDS = new Set(["milk", "pork", "chicken", "yogurt-cultures", "e428", "e120", "fish", "honey"]);
export const NON_VEGAN_IDS = new Set(["milk", "pork", "chicken", "yogurt-cultures", "honey", "e428", "e120", "fish"]);

export function allergensOf(id: string): AllergenId[] {
  return INGREDIENT_ALLERGENS[id] ?? [];
}

export function productAllergens(ingredients: MatchedIngredient[]): AllergenId[] {
  const set = new Set<AllergenId>();
  for (const i of ingredients) for (const a of i.allergens) set.add(a);
  return [...set];
}

export function dietConflicts(
  ingredients: MatchedIngredient[],
  diet: "none" | "vegetarian" | "vegan",
): string[] {
  if (diet === "none") return [];
  const hits: string[] = [];
  for (const i of ingredients) {
    if (diet === "vegan" && NON_VEGAN_IDS.has(i.id)) hits.push(i.name);
    if (diet === "vegetarian" && (i.id === "pork" || i.id === "chicken" || i.id === "fish" || i.id === "e428")) {
      hits.push(i.name);
    }
  }
  return hits;
}

export function concernFlags(id: string): {
  endocrine: boolean;
  pregnancyAvoid: boolean;
  childAvoid: boolean;
} {
  return {
    endocrine: ENDOCRINE_IDS.has(id),
    pregnancyAvoid: PREGNANCY_AVOID_IDS.has(id),
    childAvoid: CHILD_AVOID_IDS.has(id),
  };
}

export function productConcerns(ingredients: MatchedIngredient[]): {
  endocrine: string[];
  pregnancy: string[];
  child: string[];
} {
  return {
    endocrine: ingredients.filter((i) => i.endocrine).map((i) => i.name),
    pregnancy: ingredients.filter((i) => i.pregnancyAvoid).map((i) => i.name),
    child: ingredients.filter((i) => i.childAvoid).map((i) => i.name),
  };
}
