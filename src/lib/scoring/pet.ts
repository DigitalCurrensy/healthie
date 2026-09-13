import { clamp } from "../utils";
import { ecoScore } from "./eco";
import { runScoreGraph } from "../edge/score-graph";
import { foodHeadline, foodPillars, sortReasons } from "./explain";
import { scoreIntegrity } from "./integrity";
import { applyCaps, buildCaps, PET_WEIGHTS } from "./mix";
import { classifyNova, processingScore } from "./nova";
import { trafficLights } from "./traffic";
import type { FoodScoreBreakdown, MatchedIngredient, Nutrition, ScoreReason } from "./types";

const NAMED_MEAT = new Set(["chicken", "beef", "fish", "pork"]);

export function scorePet(input: {
  nutrition: Nutrition;
  ingredients: MatchedIngredient[];
  ingredientsText?: string;
  isOrganic: boolean;
  categoryPath?: string;
}): FoodScoreBreakdown {
  const nutritionScore = petNutritionQuality(input.nutrition, input.ingredients, input.ingredientsText ?? "");
  const integrity = scoreIntegrity(input.ingredients);
  const nova = classifyNova({
    ingredients: input.ingredients,
    ingredientsText: input.ingredientsText ?? "",
  });
  const proc = processingScore(nova);

  const mixUncapped = runScoreGraph({
    nutritionQuality: nutritionScore,
    additiveScore: integrity.score,
    processingScore: proc,
    organic: input.isOrganic ? 1 : 0,
    isCosmetic: 0,
    isPet: 1,
    composition: 0,
    hazardCap: 100,
    proteinBoost: 0,
    letterCap: 100,
    novaCap: 100,
    riskCap: 100,
  });

  const letter = nutritionScore >= 80 ? "A" : nutritionScore >= 62 ? "B" : nutritionScore >= 48 ? "C" : nutritionScore >= 30 ? "D" : "E";
  const caps = buildCaps({
    letter,
    nova,
    highCount: integrity.highCount,
    moderateCount: integrity.moderateCount,
    sweetenerCount: integrity.sweetenerCount,
  });
  const { overall, cappedBy } = applyCaps(mixUncapped, caps);

  const reasons: ScoreReason[] = [
    {
      kind: nutritionScore >= 70 ? "help" : "hurt",
      title: "What’s in the bowl",
      detail: petNutritionDetail(input.nutrition, input.ingredients, input.ingredientsText ?? ""),
    },
    ...integrity.reasons,
    {
      kind: nova === 4 ? "hurt" : "note",
      title: nova === 4 ? "Factory kibble pattern" : "How the bag is made",
      detail:
        nova === 4
          ? "Dyes, flavours or a long additive list are common in cheap kibble. Dogs and cats don’t need a tennis-ball colour."
          : "A shorter recipe is easier to trust.",
    },
    ...caps.reasons,
  ];
  if (input.isOrganic) {
    reasons.push({
      kind: "help",
      title: "Organic mark",
      detail: "A small bonus. It does not cancel BHA, dyes, or by-product meal.",
      points: 5,
    });
  }

  return {
    type: "pet",
    overall,
    nutritionScore,
    additiveScore: integrity.score,
    processingScore: proc,
    organicBonus: input.isOrganic ? 5 : 0,
    nutriRaw: Math.round((100 - nutritionScore) / 4),
    nutriLetter: letter,
    nPoints: 0,
    pPoints: 0,
    additivePenalties: integrity.penalties,
    isOrganic: input.isOrganic,
    isBeverage: false,
    novaGroup: nova,
    ecoScore: ecoScore({
      isOrganic: input.isOrganic,
      novaGroup: nova,
      ingredients: input.ingredients,
      categoryPath: input.categoryPath ?? "pet",
    }),
    trafficLights: trafficLights(input.nutrition, false),
    mixUncapped,
    letterCap: caps.letterCap,
    novaCap: caps.novaCap,
    riskCap: caps.riskCap,
    cappedBy,
    headline: foodHeadline({
      overall,
      letter,
      nova,
      isBeverage: false,
      sugars: input.nutrition.sugars,
      highCount: integrity.highCount,
      cappedBy,
      isPet: true,
    }),
    reasons: sortReasons(reasons),
    pillars: foodPillars({
      nutrition: nutritionScore,
      integrity: integrity.score,
      processing: proc,
      organic: input.isOrganic,
      weights: PET_WEIGHTS,
    }),
  };
}

function petNutritionQuality(n: Nutrition, ingredients: MatchedIngredient[], text: string): number {
  let s = 38;
  if (n.protein >= 32) s += 34;
  else if (n.protein >= 24) s += 26;
  else if (n.protein >= 18) s += 16;
  else s += Math.round(clamp(n.protein, 0, 18) * 0.7);

  const blob = text.toLowerCase();
  if (/by-product|by product|animal derivative|meat and animal/.test(blob)) s -= 16;
  if (ingredients.some((i) => NAMED_MEAT.has(i.id))) s += 12;
  if (ingredients.some((i) => i.id === "e102" || i.id === "e110" || i.id === "e129" || i.id === "e124")) s -= 10;
  if (n.fiber >= 2 && n.fiber <= 8) s += 4;
  return clamp(s, 0, 100);
}

function petNutritionDetail(n: Nutrition, ingredients: MatchedIngredient[], text: string): string {
  const named = ingredients.filter((i) => NAMED_MEAT.has(i.id)).map((i) => i.name);
  const byProduct = /by-product|by product|animal derivative|meat and animal/.test(text.toLowerCase());
  const meatBit = named.length
    ? `Named meat on the list: ${named.join(", ")}.`
    : "No named meat we recognise — a filler-led bag.";
  const byBit = byProduct ? " By-product meal is in the recipe." : "";
  return `${n.protein} g protein / 100 g. ${meatBit}${byBit} Pets need protein they can use, not a dye and a warehouse antioxidant.`;
}
