import type { EvaluatedProduct } from "./evaluate";
import type { AisleStanding } from "./standing";
import { sugarsContext } from "../copy";
import { scoreBand } from "../utils";

export type CouncilNote = {
  kicker: string;
  body: string;
};

/**
 * One paragraph a dietitian, an additive scientist, and a shopper would agree on.
 * No named board. No mixer math.
 */
export function councilNote(product: EvaluatedProduct, standing: AisleStanding | null): CouncilNote {
  const s = product.score;
  const band = scoreBand(s.overall);
  const extras = product.ingredients.filter((i) => i.isAdditive || i.hazard === "red" || i.hazard === "orange");
  const high = product.ingredients.filter((i) => i.riskClass === "high" || i.hazard === "red");
  const child = product.concerns.child;
  const preg = product.concerns.pregnancy;
  const dyes = product.ingredients.filter((i) => /dye|colour|color|e102|e110|e129|e133|yellow|red 40|allura|sunset/i.test(`${i.id} ${i.name}`));

  if (product.isWater) {
    return {
      kicker: "Council note",
      body: "Water is the keep. Everything else in drinks is a flavour of it. Pour this without thinking.",
    };
  }

  if (s.type === "cosmetic") {
    if (s.overall <= 24) {
      return {
        kicker: "Council note",
        body: "A high-concern extra on a cream or wash is the whole story. We would not put this on a face every morning. The swap is the same shelf.",
      };
    }
    if (preg.length) {
      return {
        kicker: "Council note",
        body: `If you are pregnant, ${preg[0]} is the reason we would skip this bottle. The disc already knows. You should not have to hunt for it.`,
      };
    }
    return {
      kicker: "Council note",
      body:
        band === "excellent"
          ? "A short, quiet formula. Fine as a daily habit."
          : "Read the flagged extras. If one of them is why you came to the aisle, pick the neighbour with a calmer list.",
    };
  }

  if (s.type === "pet") {
    return {
      kicker: "Council note",
      body:
        high.length > 0
          ? "A dye or a controversial extra in a daily bowl is a hard no. Dogs do not get a treat-day exception."
          : "Named meat and a short list. That is the whole method for a bowl.",
    };
  }

  const can =
    product.isBeverage && product.nutrition && product.nutrition.sugars >= 5
      ? ` A 330 ml can is about ${Math.round(product.nutrition.sugars * 3.3)} g of sugar.`
      : "";

  if (high.length > 0) {
    return {
      kicker: "Council note",
      body: `${high[0]!.name} is a high-concern extra. That is enough to keep this off an everyday list${child.length ? " — and we would not pack it for a child" : ""}.`,
    };
  }

  if (s.novaGroup === 4 && band !== "excellent") {
    const dyeBit = dyes.length ? ` The colour (${dyes[0]!.name}) is cosmetic, not food.` : "";
    const aisleBit = standing && standing.better > 0 ? ` ${standing.line}` : "";
    return {
      kicker: "Council note",
      body: `Ultra-processed — flavours, extras, a list a kitchen would not write.${can}${dyeBit} A dietitian would not make this a weekday habit.${aisleBit}`,
    };
  }

  if (product.isBeverage && product.nutrition && product.nutrition.sugars >= 8) {
    return {
      kicker: "Council note",
      body: `${sugarsContext(product.nutrition.sugars, true)}${can} Nothing in the bottle slows that down. Water is the keep in this aisle.`,
    };
  }

  if (band === "excellent") {
    return {
      kicker: "Council note",
      body: "Short list, honest box. This is what ‘everyday’ is for. Keep it in the rotation.",
    };
  }

  if (band === "good") {
    return {
      kicker: "Council note",
      body: standing
        ? `Fine sometimes. ${standing.line}`
        : "Fine sometimes. There is usually a cleaner neighbour in the same aisle.",
    };
  }

  const extraBit = extras.length ? ` The list carries ${extras.length === 1 ? "an extra" : `${extras.length} extras`} you would not cook with.` : "";
  return {
    kicker: "Council note",
    body: `A treat, not a habit.${can}${extraBit} Look one shelf over.`,
  };
}

export function servingHonesty(product: EvaluatedProduct): string | null {
  const n = product.nutrition;
  if (!n || product.type !== "food" || product.isWater) return null;
  if (product.isBeverage && n.sugars >= 5) {
    const grams = Math.round(n.sugars * 3.3);
    const tsp = Math.round(grams / 4);
    return `A 330 ml can is about ${grams} g of sugar — roughly ${tsp} teaspoons. Per 100 ml hides that.`;
  }
  const snack = /snack|chip|crisp|nacho|cracker/i.test(product.categoryPath + product.title);
  if (snack) {
    const kcal = Math.round(((n.energyKj || 0) / 4.184) * 0.28);
    const salt = Math.round(n.salt * 0.28 * 10) / 10;
    return `A 28 g handful is about ${kcal} calories and ${salt} g of salt — before you finish the bag.`;
  }
  return null;
}
