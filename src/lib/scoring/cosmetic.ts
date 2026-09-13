import { clamp } from "../utils";
import { runScoreGraph } from "../edge/score-graph";
import { cosmeticHeadline, sortReasons } from "./explain";
import {
  HAZARD_CAP,
  HAZARD_RANK,
  type CosmeticScoreBreakdown,
  type HazardLevel,
  type MatchedIngredient,
  type ScoreReason,
} from "./types";

const COMPOSITION_DEDUCT: Record<HazardLevel, number> = {
  red: 22,
  orange: 10,
  yellow: 5,
  green: 0,
};

export function maxHazard(ingredients: MatchedIngredient[]): HazardLevel {
  let worst: HazardLevel = "green";
  for (const ing of ingredients) {
    if (HAZARD_RANK[ing.hazard] > HAZARD_RANK[worst]) worst = ing.hazard;
  }
  return worst;
}

export function scoreCosmetic(input: {
  ingredients: MatchedIngredient[];
  isOrganic: boolean;
}): CosmeticScoreBreakdown {
  const worst = maxHazard(input.ingredients);
  const cap = HAZARD_CAP[worst];

  let composition = 94;
  const seen = new Set<string>();
  const reasons: ScoreReason[] = [];

  for (const ing of input.ingredients) {
    if (seen.has(ing.id)) continue;
    seen.add(ing.id);
    const deduct = COMPOSITION_DEDUCT[ing.hazard];
    if (deduct > 0) {
      composition -= deduct;
      reasons.push({
        kind: "hurt",
        title: ing.name,
        detail: ing.description,
        ingredientId: ing.id,
        points: -deduct,
      });
    }
    if (ing.endocrine) {
      composition -= 4;
      reasons.push({
        kind: "hurt",
        title: `${ing.name} · hormone signal`,
        detail: "Flagged for endocrine activity in the literature we track. It never inflates the score — it only pulls it down.",
        ingredientId: ing.id,
        points: -4,
      });
    }
  }

  const organicBonus = input.isOrganic ? (worst === "green" ? 8 : 3) : 0;
  if (organicBonus) {
    composition += organicBonus;
    reasons.push({
      kind: "help",
      title: "Organic mark",
      detail: worst === "green" ? "A small lift on an already calm formula." : "A small lift. It cannot lift a high-concern extra over the ceiling.",
      points: organicBonus,
    });
  }
  composition = clamp(composition, 0, 100);

  if (worst === "green") {
    composition = clamp(Math.max(78, composition), 78, 100);
    reasons.push({
      kind: "help",
      title: "Nothing flagged",
      detail: "Water, glycerin, shea, oils — the list stays in everyday territory.",
    });
  }

  const overall = runScoreGraph({
    nutritionQuality: 0,
    additiveScore: 0,
    processingScore: 0,
    organic: 0,
    isCosmetic: 1,
    isPet: 0,
    composition,
    hazardCap: cap,
    proteinBoost: 0,
    letterCap: 100,
    novaCap: 100,
    riskCap: 100,
  });

  if (composition > cap) {
    reasons.unshift({
      kind: "cap",
      title: "The toughest extra sets the ceiling",
      detail: `The lowest-rated ingredient caps this bottle at ${cap}. A pretty list cannot outrun one high-concern extra.`,
    });
  }

  return {
    type: "cosmetic",
    overall,
    compositionScore: composition,
    maxHazard: worst,
    cap,
    capped: composition > cap,
    isOrganic: input.isOrganic,
    organicBonus,
    headline: cosmeticHeadline({ overall, maxHazard: worst, capped: composition > cap }),
    reasons: sortReasons(reasons),
    pillars: [
      {
        id: "composition",
        label: "Formula",
        weightPct: 100,
        score: composition,
        contribution: Math.round(composition),
      },
    ],
  };
}
