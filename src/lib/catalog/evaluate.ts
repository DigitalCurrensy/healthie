import { categoryBucket, embedProduct, scoreProduct } from "@/lib/scoring";
import type { MatchedIngredient, ScoreBreakdown } from "@/lib/scoring";
import { ingredientsByIds } from "./match";
import { productAllergens, productConcerns } from "./flags";
import { realPackUrl } from "./pack-image";
import type { ProductDef } from "./products";
import type { AllergenId } from "@/lib/scoring/types";

export type EvaluatedProduct = {
  id: string;
  barcode: string;
  title: string;
  brand: string;
  type: ProductDef["type"];
  categoryPath: string;
  category: string;
  isOrganic: boolean;
  isBeverage: boolean;
  isWater: boolean;
  ingredientsText: string;
  ingredients: MatchedIngredient[];
  unmatched: string[];
  nutrition: ProductDef["nutrition"] | null;
  imageUrl: string | null;
  novaGroup: number | null;
  source: string;
  score: ScoreBreakdown;
  embedding: number[];
  additiveCount: number;
  allergens: AllergenId[];
  ecoScore: number;
  flags: string[];
  concerns: {
    endocrine: string[];
    pregnancy: string[];
    child: string[];
  };
};

export function evaluateDef(
  def: ProductDef,
  extra?: { unmatched?: string[]; source?: string },
): EvaluatedProduct {
  const ingredients = ingredientsByIds(def.ingredientIds);
  const score = scoreProduct({
    type: def.type,
    nutrition: def.nutrition,
    ingredients,
    ingredientsText: def.ingredientsText,
    isOrganic: def.isOrganic,
    isBeverage: def.isBeverage,
    isWater: def.isWater,
    categoryPath: def.categoryPath,
    title: def.title,
    novaGroup: def.novaGroup,
  });
  const embedding = embedProduct({
    type: def.type,
    categoryPath: def.categoryPath,
    nutrition: def.nutrition,
    ingredients,
    isOrganic: def.isOrganic,
    overallScore: score.overall,
  });
  const additiveCount =
    def.type === "cosmetic"
      ? ingredients.filter((i) => i.hazard !== "green").length
      : ingredients.filter((i) => i.isAdditive).length;
  const flags: string[] = [];
  if (ingredients.some((i) => i.id === "palm-oil")) flags.push("palm-oil");
  if (ingredients.some((i) => i.id === "e249" || i.id === "e250" || i.id === "e251" || i.id === "e252")) flags.push("nitrites");
  if (ingredients.some((i) => i.id === "fragrance")) flags.push("fragrance");
  if (ingredients.some((i) => i.endocrine)) flags.push("endocrine");
  const eco = score.type === "cosmetic" ? 50 : score.ecoScore;
  return {
    id: def.barcode,
    barcode: def.barcode,
    title: def.title,
    brand: def.brand,
    type: def.type,
    categoryPath: def.categoryPath,
    category: categoryBucket(def.categoryPath),
    isOrganic: def.isOrganic,
    isBeverage: Boolean(def.isBeverage),
    isWater: Boolean(def.isWater),
    ingredientsText: def.ingredientsText,
    ingredients,
    unmatched: extra?.unmatched ?? [],
    nutrition: def.nutrition ?? null,
    imageUrl: realPackUrl(def.imageUrl),
    novaGroup: score.type === "cosmetic" ? def.novaGroup ?? null : score.novaGroup,
    source: extra?.source ?? "catalog",
    score,
    embedding,
    additiveCount,
    allergens: productAllergens(ingredients),
    ecoScore: eco,
    flags,
    concerns: productConcerns(ingredients),
  };
}
