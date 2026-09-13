import { clamp } from "../utils";
import type { NutriCategory, NutriLetter, Nutrition } from "./types";

function thresholdPoints(value: number, cuts: number[]): number {
  for (let i = 0; i < cuts.length; i += 1) {
    if (value <= cuts[i]!) return i;
  }
  return cuts.length;
}

const FOOD_ENERGY = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const FOOD_SUGARS = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 41, 45];
const FOOD_SAT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/** Nutri-Score 2023 general foods: salt 0–20 at 0.2 g, not the old 10-step sodium table. */
const FOOD_SALT = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0];
const FOOD_FIBER = [3.0, 4.1, 5.2, 6.3, 7.4];
const FOOD_PROTEIN = [2.4, 4.8, 7.2, 9.6, 12.0, 14.4, 17.0];

/** Nutri-Score 2023 beverages: non-linear energy and sugars, salt on a 0.2 g scale. */
const BEV_ENERGY = [30, 90, 150, 210, 240, 270, 300, 330, 360, 390];
const BEV_SUGARS = [0.5, 2, 3.5, 5, 6, 7, 8, 9, 10, 11];
const BEV_SALT = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0];
const BEV_PROTEIN = [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0];
const NNS_POINTS = 4;

function fruitPointsFood(pct: number): number {
  if (pct > 80) return 5;
  if (pct > 60) return 2;
  if (pct > 40) return 1;
  return 0;
}

function fruitPointsBev(pct: number): number {
  if (pct > 80) return 6;
  if (pct > 60) return 4;
  if (pct > 40) return 2;
  return 0;
}

export function sodiumMg(n: Nutrition): number {
  if (typeof n.sodiumMg === "number" && Number.isFinite(n.sodiumMg)) {
    return n.sodiumMg;
  }
  return (n.salt || 0) * 400;
}

export type NutriScoreOpts = {
  hasNonNutritiveSweetener?: boolean;
};

/** Nutri-Score 2023: cheeses always count protein; fats use sat-fat ratio; red meat caps protein; drinks add a sweetener penalty. */
export function computeNutriScore(
  nutrition: Nutrition,
  category: NutriCategory = "food",
  opts?: NutriScoreOpts,
): { raw: number; nPoints: number; pPoints: number; letter: NutriLetter } {
  if (category === "water") {
    return { raw: -15, nPoints: 0, pPoints: 0, letter: "A" };
  }

  const isBeverage = category === "beverage";

  let nPoints: number;
  if (category === "fat" || category === "nuts") {
    const ratio = nutrition.fat && nutrition.fat > 0 ? (nutrition.saturatedFat / nutrition.fat) * 100 : 100;
    const satRatioCuts = [10, 16, 22, 28, 34, 40, 46, 52, 58, 64];
    nPoints =
      thresholdPoints(nutrition.energyKj, FOOD_ENERGY) +
      thresholdPoints(nutrition.sugars, FOOD_SUGARS) +
      thresholdPoints(ratio, satRatioCuts) +
      thresholdPoints(nutrition.salt || 0, FOOD_SALT);
  } else if (isBeverage) {
    nPoints =
      thresholdPoints(nutrition.energyKj, BEV_ENERGY) +
      thresholdPoints(nutrition.sugars, BEV_SUGARS) +
      thresholdPoints(nutrition.saturatedFat, FOOD_SAT) +
      thresholdPoints(nutrition.salt || 0, BEV_SALT);
    if (opts?.hasNonNutritiveSweetener) nPoints += NNS_POINTS;
  } else {
    nPoints =
      thresholdPoints(nutrition.energyKj, FOOD_ENERGY) +
      thresholdPoints(nutrition.sugars, FOOD_SUGARS) +
      thresholdPoints(nutrition.saturatedFat, FOOD_SAT) +
      thresholdPoints(nutrition.salt || 0, FOOD_SALT);
  }

  const fruit = isBeverage ? fruitPointsBev(nutrition.fruitsVegetables) : fruitPointsFood(nutrition.fruitsVegetables);
  const fiber = thresholdPoints(nutrition.fiber, FOOD_FIBER);
  let protein = isBeverage
    ? thresholdPoints(nutrition.protein, BEV_PROTEIN)
    : thresholdPoints(nutrition.protein, FOOD_PROTEIN);
  if (category === "red-meat") protein = Math.min(protein, 2);

  const fruitMaxed = fruit >= (isBeverage ? 6 : 5);
  const proteinAlways =
    isBeverage || category === "cheese" || category === "fat" || category === "nuts" || nPoints < 7 || fruitMaxed;
  const pPoints = fruit + fiber + (proteinAlways ? protein : 0);
  const raw = nPoints - pPoints;

  return { raw, nPoints, pPoints, letter: nutriLetter(raw, isBeverage, category) };
}

export function nutriLetter(raw: number, isBeverage: boolean, category: NutriCategory = "food"): NutriLetter {
  if (category === "water") return "A";
  if (isBeverage || category === "beverage") {
    if (raw <= 2) return "B";
    if (raw <= 6) return "C";
    if (raw <= 9) return "D";
    return "E";
  }
  if (category === "fat" || category === "nuts") {
    if (raw <= -6) return "A";
    if (raw <= 2) return "B";
    if (raw <= 10) return "C";
    if (raw <= 18) return "D";
    return "E";
  }
  if (raw <= 0) return "A";
  if (raw <= 2) return "B";
  if (raw <= 10) return "C";
  if (raw <= 18) return "D";
  return "E";
}

/**
 * Map a Nutri-Score letter (and its raw points) onto 0–100 nutrition quality.
 * Letters are the honest signal: E is weak food, not a middling 47.
 */
export function nutriToQuality(raw: number, letter: NutriLetter, isBeverage = false): number {
  if (letter === "A") {
    if (isBeverage) return 100;
    return clamp(Math.round(lerp(raw, -15, 0, 100, 88)), 88, 100);
  }
  if (letter === "B") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, -2, 2, 84, 72)), 72, 84)
      : clamp(Math.round(lerp(raw, 1, 2, 84, 72)), 72, 84);
  }
  if (letter === "C") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, 3, 6, 68, 52)), 52, 68)
      : clamp(Math.round(lerp(raw, 3, 10, 68, 50)), 50, 68);
  }
  if (letter === "D") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, 7, 9, 46, 32)), 32, 46)
      : clamp(Math.round(lerp(raw, 11, 18, 46, 30)), 30, 46);
  }
  return isBeverage
    ? clamp(Math.round(lerp(raw, 10, 28, 26, 8)), 6, 26)
    : clamp(Math.round(lerp(raw, 19, 40, 24, 6)), 6, 24);
}

function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  const t = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + (y1 - y0) * t;
}

export function inferNutriCategory(input: {
  isBeverage?: boolean;
  isWater?: boolean;
  categoryPath?: string;
  title?: string;
}): NutriCategory {
  if (input.isWater) return "water";
  const blob = `${input.categoryPath ?? ""} ${input.title ?? ""}`.toLowerCase();
  if (input.isBeverage || /beverage|soda|drink|juice|tea|coffee/.test(blob)) return "beverage";
  const snackish = /chip|crisp|nacho|cracker|puff|flavour|flavor|sauce|dip|cookie|biscuit|popcorn/.test(blob);
  const cheeseAisle = /dairy|cheese/.test(input.categoryPath ?? "");
  if (!snackish && cheeseAisle && /cheese|fromage|cheddar|parmesan|gouda/.test(blob)) return "cheese";
  if (/\boil\b|butter|margarine|ghee/.test(blob) && /spread|staples|fat/.test(blob)) return "fat";
  if (
    !snackish &&
    /\b(almonds?|walnuts?|cashews?|pistachios?|hazelnuts?|pecans?|peanuts?|tahini|seeds?)\b/.test(blob) &&
    !/chocolate|bar|candy|flavour|flavor|chip|nutella/.test(blob)
  ) {
    return "nuts";
  }
  if (/ham|beef|steak|bacon|salami|sausage|charcuterie/.test(blob) && !/flavour|flavor|chip|crisp/.test(blob)) {
    return "red-meat";
  }
  return "food";
}

/**
 * Energy-dense packs with a blank salt and sat-fat box used to mint a fake B
 * (Doritos from a thin Open Food Facts row scored “Good nutrition”).
 * We will not call that Good.
 */
export function nutritionBoxIsThin(n: Nutrition, category: NutriCategory): boolean {
  if (category === "water") return false;
  const energyDense = (n.energyKj || 0) >= 1200 || (n.fat ?? 0) >= 10;
  const saltUnknown = n.saltKnown === false;
  const saltGone = saltUnknown || ((n.salt || 0) < 0.02 && (n.sodiumMg ?? 0) < 10);
  const satGone = n.satKnown === false || (n.saturatedFat || 0) < 0.08;
  if (energyDense && saltUnknown) return true;
  return energyDense && saltGone && satGone;
}

export function honestNutriLetter(letter: NutriLetter, thin: boolean): NutriLetter {
  if (!thin) return letter;
  if (letter === "A" || letter === "B") return "C";
  return letter;
}
