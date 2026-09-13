import { clamp } from "../utils";
import type { MatchedIngredient } from "./types";

/** Simplified Eco-Score 0–100. Not ADEME official — a transparent proxy. */
export function ecoScore(input: {
  isOrganic: boolean;
  novaGroup: 1 | 2 | 3 | 4 | null;
  ingredients: MatchedIngredient[];
  categoryPath: string;
}): number {
  let s = 70;
  if (input.isOrganic) s += 15;
  if (input.novaGroup === 1) s += 10;
  if (input.novaGroup === 4) s -= 18;
  if (input.ingredients.some((i) => i.id === "palm-oil")) s -= 12;
  if (input.ingredients.some((i) => i.id === "e250" || i.id === "e251")) s -= 8;
  const cat = input.categoryPath;
  if (/beef|ham|meat|charcuterie/.test(cat)) s -= 20;
  if (/dairy/.test(cat)) s -= 6;
  if (/oat|plant|vegetable|water/.test(cat)) s += 8;
  if (input.ingredients.some((i) => i.id === "cyclopentasiloxane" || i.id === "dimethicone")) s -= 6;
  return clamp(Math.round(s), 0, 100);
}
