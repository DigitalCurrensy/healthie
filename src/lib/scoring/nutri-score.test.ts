import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeNutriScore, nutriLetter, nutriToQuality } from "./nutri-score.ts";
import type { Nutrition } from "./types.ts";

function n(
  energyKj: number,
  sugars: number,
  sat: number,
  salt: number,
  fiber: number,
  protein: number,
  fv: number,
  fat?: number,
): Nutrition {
  return { energyKj, sugars, saturatedFat: sat, salt, fiber, protein, fruitsVegetables: fv, fat };
}

describe("Nutri-Score 2023", () => {
  it("reserves A for water among drinks", () => {
    const water = computeNutriScore(n(0, 0, 0, 0, 0, 0, 0, 0), "water");
    assert.equal(water.letter, "A");
    assert.equal(nutriToQuality(water.raw, water.letter, true), 100);
  });

  it("treats a general-food raw of 0 as A, not B", () => {
    assert.equal(nutriLetter(0, false, "food"), "A");
    assert.equal(nutriLetter(1, false, "food"), "B");
    assert.equal(nutriLetter(-1, false, "food"), "A");
  });

  it("rates cola as E", () => {
    const cola = computeNutriScore(n(180, 10.6, 0, 0, 0, 0, 0, 0), "beverage");
    assert.equal(cola.letter, "E");
    assert.ok(nutriToQuality(cola.raw, cola.letter, true) <= 28);
  });

  it("adds four negative points when a drink has non-nutritive sweeteners", () => {
    const diet = n(1, 0, 0, 0.02, 0, 0, 0, 0);
    const plain = computeNutriScore(diet, "beverage");
    const nns = computeNutriScore(diet, "beverage", { hasNonNutritiveSweetener: true });
    assert.equal(nns.nPoints, plain.nPoints + 4);
    assert.ok(nns.letter !== "A");
    assert.ok(nns.letter !== "B", `diet drink with sweeteners must not be B, got ${nns.letter}`);
  });

  it("always counts protein for beverages (no N≥11 cap)", () => {
    const milk = computeNutriScore(n(250, 5, 2, 0.1, 0, 3.4, 0, 3.5), "beverage");
    assert.ok(milk.pPoints >= 7, `protein should count on a drink, pPoints ${milk.pPoints}`);
  });

  it("uses 2023 salt (20 steps) and fibre tables on general food", () => {
    const salty = computeNutriScore(n(1600, 2, 3, 2.0, 1.0, 7, 0, 20), "food");
    const quiet = computeNutriScore(n(1600, 2, 3, 0.1, 1.0, 7, 0, 20), "food");
    assert.ok(salty.nPoints > quiet.nPoints, "2 g salt must cost more than 0.1 g");
    assert.ok(salty.letter === "D" || salty.letter === "E");
  });

  it("does not let protein rescue a high-N factory food (cap at N≥7)", () => {
    const upf = computeNutriScore(n(2200, 20, 8, 1.8, 1, 12, 0, 30), "food");
    assert.ok(upf.letter === "D" || upf.letter === "E", `high N food was ${upf.letter} raw ${upf.raw}`);
  });
});
