import { clamp } from "../utils";
import { ADDITIVE_PENALTY, type AdditivePenalty, type MatchedIngredient, type ScoreReason } from "./types";

const SWEETENERS = new Set(["e950", "e951", "e952", "e954", "e955", "e960"]);

export type IntegrityResult = {
  score: number;
  penalties: AdditivePenalty[];
  reasons: ScoreReason[];
  highCount: number;
  moderateCount: number;
  sweetenerCount: number;
  riskAdditiveCount: number;
};

/** Ingredients pillar: start at 100, mark off extras a kitchen would not use. */
export function scoreIntegrity(ingredients: MatchedIngredient[]): IntegrityResult {
  let score = 100;
  const penalties: AdditivePenalty[] = [];
  const reasons: ScoreReason[] = [];
  const seen = new Set<string>();

  for (const ing of ingredients) {
    if (seen.has(ing.id)) continue;
    seen.add(ing.id);

    let points = 0;
    if (ing.isAdditive) points = ADDITIVE_PENALTY[ing.riskClass];
    if (ing.id === "palm-oil") points = Math.max(points, 8);
    if (ing.id === "hfcs") points = Math.max(points, 6);

    if (points <= 0) continue;
    score -= points;
    penalties.push({ name: ing.name, riskClass: ing.riskClass, points, ingredientId: ing.id });
    reasons.push({
      kind: "hurt",
      title: ing.name,
      detail: ing.description,
      ingredientId: ing.id,
      points: -points,
    });
  }

  const riskAdds = ingredients.filter((i) => i.isAdditive && i.riskClass !== "none");
  const highCount = ingredients.filter((i) => i.riskClass === "high").length;
  const moderateCount = ingredients.filter((i) => i.riskClass === "moderate").length;
  const sweetenerCount = ingredients.filter((i) => SWEETENERS.has(i.id)).length;

  if (riskAdds.length >= 4) {
    score -= 8;
    reasons.push({
      kind: "hurt",
      title: "A long list of extras",
      detail: `${riskAdds.length} additives sit on this pack. One extra is a recipe. Four is a factory pattern.`,
      points: -8,
    });
  }

  if (sweetenerCount >= 2) {
    score -= 10;
    reasons.push({
      kind: "hurt",
      title: "Stacked intense sweeteners",
      detail: "Two or more intense sweeteners in one product is a diet-drink pattern, not a quiet recipe.",
      points: -10,
    });
  }

  if (penalties.length === 0 && riskAdds.length === 0) {
    reasons.push({
      kind: "help",
      title: "A quiet ingredient list",
      detail: "No high- or moderate-concern additives. The extras, if any, are pantry-familiar.",
    });
  }

  return {
    score: clamp(score, 0, 100),
    penalties,
    reasons,
    highCount,
    moderateCount,
    sweetenerCount,
    riskAdditiveCount: riskAdds.length,
  };
}
