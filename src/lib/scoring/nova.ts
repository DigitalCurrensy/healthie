import type { MatchedIngredient } from "./types";

/** NOVA ultra-processed classification (Monteiro / INRAE). */
export function classifyNova(input: {
  ingredients: MatchedIngredient[];
  ingredientsText: string;
  isWater?: boolean;
  isOrganic?: boolean;
  explicit?: number | null;
}): 1 | 2 | 3 | 4 {
  if (input.explicit === 1 || input.explicit === 2 || input.explicit === 3 || input.explicit === 4) {
    return input.explicit;
  }
  if (input.isWater) return 1;
  const additives = input.ingredients.filter((i) => i.isAdditive && i.riskClass !== "none");
  const text = input.ingredientsText.toLowerCase();
  const markers =
    /glucose-fructose|high fructose|hydrogenated|flavouring|flavoring|emulsifier|colour|color \(e|maltodextrin|dextrose|invert sugar|modified starch|anti-caking|humectant|stabiliser|stabilizer|gelling agent|artificial flavour|artificial flavor/.test(
      text,
    );
  if (additives.length >= 2 || markers) return 4;
  if (additives.length === 1) return 3;
  const count = input.ingredients.length;
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  return 3;
}

export function novaLabel(n: 1 | 2 | 3 | 4): string {
  switch (n) {
    case 1:
      return "Unprocessed";
    case 2:
      return "Culinary ingredient";
    case 3:
      return "Processed";
    case 4:
      return "Ultra-processed";
  }
}

/** Invert NOVA into a 0–100 pillar. Ultra-processed is a poor everyday pattern. */
export function processingScore(nova: 1 | 2 | 3 | 4): number {
  switch (nova) {
    case 1:
      return 100;
    case 2:
      return 86;
    case 3:
      return 62;
    case 4:
      return 16;
  }
}
