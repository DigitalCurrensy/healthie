import { ecoScore } from "./eco";
import { runScoreGraph } from "../edge/score-graph";
import { foodHeadline, foodPillars, sortReasons } from "./explain";
import { scoreIntegrity } from "./integrity";
import { applyCaps, buildCaps, FOOD_WEIGHTS } from "./mix";
import { classifyNova, processingScore } from "./nova";
import { computeNutriScore, inferNutriCategory, nutriToQuality } from "./nutri-score";
import { trafficLights } from "./traffic";
import type { FoodScoreBreakdown, MatchedIngredient, Nutrition, RiskClass, ScoreReason } from "./types";

export function scoreFood(input: {
  nutrition: Nutrition;
  ingredients: MatchedIngredient[];
  ingredientsText?: string;
  isOrganic: boolean;
  isBeverage: boolean;
  isWater?: boolean;
  categoryPath?: string;
  title?: string;
  novaGroup?: number | null;
}): FoodScoreBreakdown {
  const category = inferNutriCategory({
    isBeverage: input.isBeverage,
    isWater: input.isWater,
    categoryPath: input.categoryPath,
    title: input.title,
  });
  const nutri = computeNutriScore(input.nutrition, category);
  const isBev = category === "beverage" || category === "water";
  const nutritionScore = nutriToQuality(nutri.raw, nutri.letter, isBev);

  const integrity = scoreIntegrity(input.ingredients);
  const nova = classifyNova({
    ingredients: input.ingredients,
    ingredientsText: input.ingredientsText ?? "",
    isWater: input.isWater,
    explicit: input.novaGroup,
  });
  const proc = processingScore(nova);

  const mixUncapped = runScoreGraph({
    nutritionQuality: nutritionScore,
    additiveScore: integrity.score,
    processingScore: proc,
    organic: input.isOrganic ? 1 : 0,
    isCosmetic: 0,
    isPet: 0,
    composition: 0,
    hazardCap: 100,
    proteinBoost: 0,
    letterCap: 100,
    novaCap: 100,
    riskCap: 100,
  });

  const caps = buildCaps({
    letter: nutri.letter,
    nova,
    highCount: integrity.highCount,
    moderateCount: integrity.moderateCount,
    sweetenerCount: integrity.sweetenerCount,
  });
  const { overall: mixed, cappedBy: mixCap } = applyCaps(mixUncapped, caps);
  const emptyLabel =
    !input.isWater &&
    input.ingredients.length === 0 &&
    !(
      input.nutrition.energyKj > 0 ||
      input.nutrition.sugars > 0 ||
      input.nutrition.saturatedFat > 0 ||
      input.nutrition.salt > 0 ||
      input.nutrition.protein > 0 ||
      input.nutrition.fiber > 0 ||
      (input.nutrition.fruitsVegetables ?? 0) > 0 ||
      (input.nutrition.fat ?? 0) > 0
    );
  const overall = emptyLabel ? 0 : mixed;
  const cappedBy = emptyLabel ? "empty-label" : mixCap;

  const reasons: ScoreReason[] = [];
  reasons.push({
    kind: nutri.letter === "A" || nutri.letter === "B" ? "help" : "hurt",
    title: `Nutrition box · ${nutri.letter}`,
    detail: nutritionReason(nutri.letter, nutri.nPoints, nutri.pPoints, input.nutrition, isBev, category === "water"),
  });
  reasons.push({
    kind: nova <= 2 ? "help" : nova === 3 ? "note" : "hurt",
    title: nova === 4 ? "Ultra-processed" : nova === 1 ? "Just food" : nova === 2 ? "Kitchen staple" : "Simply made",
    detail: processingReason(nova),
  });
  reasons.push(...integrity.reasons);
  if (input.isOrganic) {
    reasons.push({
      kind: "help",
      title: "Organic mark",
      detail: "A verified organic mark adds a small bonus. It cannot rescue a weak nutrition box.",
      points: 5,
    });
  }
  reasons.push(...caps.reasons);
  if (emptyLabel) {
    reasons.unshift({
      kind: "cap",
      title: "Not enough on the label",
      detail: "No ingredient list and no nutrition box — we will not invent a score.",
    });
  }

  const headline = foodHeadline({
    overall,
    letter: nutri.letter,
    nova,
    isWater: category === "water",
    isBeverage: isBev,
    sugars: input.nutrition.sugars,
    highCount: integrity.highCount,
    cappedBy,
    isPet: false,
  });

  return {
    type: "food",
    overall,
    nutritionScore,
    additiveScore: integrity.score,
    processingScore: proc,
    organicBonus: input.isOrganic ? 5 : 0,
    nutriRaw: nutri.raw,
    nutriLetter: nutri.letter,
    nPoints: nutri.nPoints,
    pPoints: nutri.pPoints,
    additivePenalties: integrity.penalties,
    isOrganic: input.isOrganic,
    isBeverage: isBev,
    novaGroup: nova,
    ecoScore: ecoScore({
      isOrganic: input.isOrganic,
      novaGroup: nova,
      ingredients: input.ingredients,
      categoryPath: input.categoryPath ?? "",
    }),
    trafficLights: trafficLights(input.nutrition, isBev),
    mixUncapped,
    letterCap: caps.letterCap,
    novaCap: caps.novaCap,
    riskCap: caps.riskCap,
    cappedBy,
    headline,
    reasons: sortReasons(reasons),
    pillars: foodPillars({
      nutrition: nutritionScore,
      integrity: integrity.score,
      processing: proc,
      organic: input.isOrganic,
      weights: FOOD_WEIGHTS,
    }),
  };
}

function nutritionReason(
  letter: string,
  nPoints: number,
  pPoints: number,
  n: Nutrition,
  isBeverage: boolean,
  isWater: boolean,
): string {
  if (isWater) return "Water has no sugars, no salt load, no extras. Nutrition letter A — the top of the scale.";
  const tsp = Math.round((n.sugars / 4) * 10) / 10;
  const sugarBit =
    n.sugars >= 5
      ? isBeverage
        ? `About ${tsp} teaspoons of sugar in 100 ml.`
        : `About ${tsp} teaspoons of sugar in 100 g.`
      : n.sugars <= 0.5
        ? "No meaningful sugar."
        : "Sugars are modest.";
  const saltBit = n.salt >= 1.5 ? " Salt is high." : n.salt >= 0.6 ? " Salt is moderate." : "";
  const fibreBit = n.fiber >= 6 ? " Fibre is a genuine plus." : n.fiber >= 3 ? " Some fibre helps." : "";
  const drinkBit =
    isBeverage && n.sugars >= 5
      ? " Nothing in the bottle slows that sugar down — no fibre, no protein."
      : "";
  return `${sugarBit}${drinkBit}${saltBit}${fibreBit} Energy, sugars, saturated fat and salt pulled ${nPoints} points off. Fibre, protein and fruit gave ${pPoints} back. Net ${nPoints - pPoints} — nutrition letter ${letter}.`;
}

function processingReason(nova: 1 | 2 | 3 | 4): string {
  switch (nova) {
    case 1:
      return "Close to how you’d find it in a kitchen — short list, no factory extras.";
    case 2:
      return "A pantry building block: oil, sugar, salt, flour. Fine when you cook with it.";
    case 3:
      return "Made with a few extra steps. Still recognisable as food.";
    case 4:
      return "Built in a factory with additives, flavours, or refined extras. A growing pile of research ties a diet of these to poorer health — not because one biscuit is poison, but because the pattern crowds out real food.";
  }
}

export function riskClassLabel(risk: RiskClass): string {
  switch (risk) {
    case "high":
      return "High risk";
    case "moderate":
      return "Moderate risk";
    case "low":
      return "Limited risk";
    case "none":
      return "No risk";
  }
}
