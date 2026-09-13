export * from "./types";
export * from "./nutri-score";
export * from "./food";
export * from "./cosmetic";
export * from "./embeddings";
export * from "./nova";
export * from "./traffic";
export * from "./eco";
export * from "./pet";
export * from "./explain";
export * from "./integrity";
export * from "./mix";

import { scoreCosmetic } from "./cosmetic";
import { scoreFood } from "./food";
import { scorePet } from "./pet";
import type { MatchedIngredient, Nutrition, ProductType, ScoreBreakdown } from "./types";

export function scoreProduct(input: {
  type: ProductType;
  nutrition?: Nutrition | null;
  ingredients: MatchedIngredient[];
  ingredientsText?: string;
  isOrganic: boolean;
  isBeverage?: boolean;
  isWater?: boolean;
  categoryPath?: string;
  title?: string;
  novaGroup?: number | null;
}): ScoreBreakdown {
  if (input.type === "cosmetic") {
    return scoreCosmetic({
      ingredients: input.ingredients,
      isOrganic: input.isOrganic,
    });
  }
  const nutrition = input.nutrition ?? {
    energyKj: 0,
    sugars: 0,
    saturatedFat: 0,
    salt: 0,
    fiber: 0,
    protein: 0,
    fruitsVegetables: 0,
  };
  if (input.type === "pet") {
    return scorePet({
      nutrition,
      ingredients: input.ingredients,
      ingredientsText: input.ingredientsText,
      isOrganic: input.isOrganic,
      categoryPath: input.categoryPath,
    });
  }
  return scoreFood({
    nutrition,
    ingredients: input.ingredients,
    ingredientsText: input.ingredientsText,
    isOrganic: input.isOrganic,
    isBeverage: Boolean(input.isBeverage),
    isWater: input.isWater,
    categoryPath: input.categoryPath,
    title: input.title,
    novaGroup: input.novaGroup,
  });
}
