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
const FOOD_SODIUM = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];
const FOOD_FIBER = [0.9, 1.9, 2.8, 3.7, 4.7];
const FOOD_PROTEIN = [1.6, 3.2, 4.8, 6.4, 8.0];

const BEV_ENERGY = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
const BEV_SUGARS = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5];

function fruitPointsFood(pct: number): number {
  if (pct > 80) return 5;
  if (pct > 60) return 2;
  if (pct > 40) return 1;
  return 0;
}

function fruitPointsBev(pct: number): number {
  if (pct > 80) return 10;
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

/** Nutri-Score 2023: cheeses always count protein; fats use sat-fat ratio; red meat caps protein. */
export function computeNutriScore(
  nutrition: Nutrition,
  category: NutriCategory = "food",
): { raw: number; nPoints: number; pPoints: number; letter: NutriLetter } {
  if (category === "water") {
    return { raw: -15, nPoints: 0, pPoints: 0, letter: "A" };
  }

  const sodium = sodiumMg(nutrition);
  const isBeverage = category === "beverage";

  let nPoints: number;
  if (category === "fat") {
    const ratio = nutrition.fat && nutrition.fat > 0 ? (nutrition.saturatedFat / nutrition.fat) * 100 : 100;
    const satRatioCuts = [10, 16, 22, 28, 34, 40, 46, 52, 58, 64];
    nPoints =
      thresholdPoints(nutrition.energyKj, FOOD_ENERGY) +
      thresholdPoints(nutrition.sugars, FOOD_SUGARS) +
      thresholdPoints(ratio, satRatioCuts) +
      thresholdPoints(sodium, FOOD_SODIUM);
  } else if (isBeverage) {
    nPoints =
      thresholdPoints(nutrition.energyKj, BEV_ENERGY) +
      thresholdPoints(nutrition.sugars, BEV_SUGARS) +
      thresholdPoints(nutrition.saturatedFat, FOOD_SAT) +
      thresholdPoints(sodium, FOOD_SODIUM);
  } else {
    nPoints =
      thresholdPoints(nutrition.energyKj, FOOD_ENERGY) +
      thresholdPoints(nutrition.sugars, FOOD_SUGARS) +
      thresholdPoints(nutrition.saturatedFat, FOOD_SAT) +
      thresholdPoints(sodium, FOOD_SODIUM);
  }

  const fruit = isBeverage ? fruitPointsBev(nutrition.fruitsVegetables) : fruitPointsFood(nutrition.fruitsVegetables);
  const fiber = thresholdPoints(nutrition.fiber, FOOD_FIBER);
  let protein = thresholdPoints(nutrition.protein, FOOD_PROTEIN);
  if (category === "red-meat") protein = Math.min(protein, 2);

  const proteinAlways = category === "cheese" || nPoints < 11 || fruit >= (isBeverage ? 10 : 5);
  const pPoints = fruit + fiber + (proteinAlways ? protein : 0);
  const raw = nPoints - pPoints;

  return { raw, nPoints, pPoints, letter: nutriLetter(raw, isBeverage) };
}

export function nutriLetter(raw: number, isBeverage: boolean): NutriLetter {
  if (isBeverage) {
    if (raw <= 1) return "B";
    if (raw <= 5) return "C";
    if (raw <= 9) return "D";
    return "E";
  }
  if (raw <= -1) return "A";
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
    return clamp(Math.round(lerp(raw, -15, -1, 100, 88)), 88, 100);
  }
  if (letter === "B") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, -2, 1, 84, 72)), 72, 84)
      : clamp(Math.round(lerp(raw, 0, 2, 84, 72)), 72, 84);
  }
  if (letter === "C") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, 2, 5, 68, 52)), 52, 68)
      : clamp(Math.round(lerp(raw, 3, 10, 68, 50)), 50, 68);
  }
  if (letter === "D") {
    return isBeverage
      ? clamp(Math.round(lerp(raw, 6, 9, 46, 32)), 32, 46)
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
  if (/cheese|fromage|cheddar|parmesan|gouda/.test(blob)) return "cheese";
  if (/\boil\b|butter|margarine|ghee/.test(blob) && /spread|staples|fat/.test(blob)) return "fat";
  if (/ham|beef|steak|bacon|salami|sausage|charcuterie/.test(blob)) return "red-meat";
  return "food";
}
