import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runScoreGraph, executeGraph, HEALTHIE_GRAPH } from "../edge/score-graph.ts";
import { scoreProduct } from "./index.ts";
import { nutriToQuality, computeNutriScore } from "./nutri-score.ts";
import { ingredientsByIds } from "../catalog/match.ts";
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

describe("ONNX opset graph v3", () => {
  it("matches the 50/25/20/+5 food mixer", () => {
    const overall = runScoreGraph({
      nutritionQuality: 80,
      additiveScore: 80,
      processingScore: 100,
      organic: 1,
      isCosmetic: 0,
      isPet: 0,
      composition: 0,
      hazardCap: 100,
      proteinBoost: 0,
      letterCap: 100,
      novaCap: 100,
      riskCap: 100,
    });
    assert.equal(overall, Math.round(0.5 * 80 + 0.25 * 80 + 0.2 * 100 + 5));
  });

  it("caps cosmetics by max hazard", () => {
    const overall = runScoreGraph({
      nutritionQuality: 0,
      additiveScore: 0,
      processingScore: 0,
      organic: 0,
      isCosmetic: 1,
      isPet: 0,
      composition: 90,
      hazardCap: 24,
      proteinBoost: 0,
      letterCap: 100,
      novaCap: 100,
      riskCap: 100,
    });
    assert.equal(overall, 24);
  });

  it("weights pet toward ingredients", () => {
    const overall = runScoreGraph({
      nutritionQuality: 60,
      additiveScore: 80,
      processingScore: 62,
      organic: 1,
      isCosmetic: 0,
      isPet: 1,
      composition: 0,
      hazardCap: 100,
      proteinBoost: 0,
      letterCap: 100,
      novaCap: 100,
      riskCap: 100,
    });
    assert.equal(overall, Math.round(0.4 * 60 + 0.4 * 80 + 0.15 * 62 + 5));
  });

  it("executes the exported graph IR", () => {
    const a = executeGraph(HEALTHIE_GRAPH, {
      nutritionQuality: 50,
      additiveScore: 100,
      processingScore: 100,
      organic: 0,
      isCosmetic: 0,
      isPet: 0,
      composition: 0,
      hazardCap: 100,
      proteinBoost: 0,
      letterCap: 100,
      novaCap: 100,
      riskCap: 100,
    });
    assert.equal(a, Math.round(0.5 * 50 + 0.25 * 100 + 0.2 * 100));
  });

  it("clips food scores to 0–100", () => {
    const high = runScoreGraph({
      nutritionQuality: 100,
      additiveScore: 100,
      processingScore: 100,
      organic: 1,
      isCosmetic: 0,
      isPet: 0,
      composition: 0,
      hazardCap: 100,
      proteinBoost: 0,
      letterCap: 100,
      novaCap: 100,
      riskCap: 100,
    });
    assert.equal(high, 100);
  });
});

describe("nutrition quality mapping", () => {
  it("maps a beverage E well below the old middling 47", () => {
    const cola = computeNutriScore(n(180, 10.6, 0, 0, 0, 0, 0, 0), "beverage");
    assert.equal(cola.letter, "E");
    const q = nutriToQuality(cola.raw, cola.letter, true);
    assert.ok(q <= 28, `expected E drink quality ≤ 28, got ${q}`);
  });

  it("maps water to a top nutrition quality", () => {
    const water = computeNutriScore(n(0, 0, 0, 0, 0, 0, 0, 0), "water");
    assert.equal(water.letter, "A");
    assert.equal(nutriToQuality(water.raw, water.letter, true), 100);
  });
});

describe("end-to-end product scores", () => {
  it("rates still water as Excellent", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(0, 0, 0, 0.001, 0, 0, 0, 0),
      ingredients: ingredientsByIds(["water"]),
      ingredientsText: "Natural mineral water.",
      isOrganic: false,
      isBeverage: true,
      isWater: true,
      title: "Evian",
      categoryPath: "beverages",
      novaGroup: 1,
    });
    assert.equal(s.type, "food");
    assert.ok(s.overall >= 85, `water overall ${s.overall}`);
  });

  it("does not rate cola as Good", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(180, 10.6, 0, 0, 0, 0, 0, 0),
      ingredients: ingredientsByIds(["water", "sugar", "e150c", "e338", "natural-flavour", "carbon-dioxide"]),
      ingredientsText: "Carbonated water, sugar, colour (E150d), phosphoric acid, natural flavourings including caffeine.",
      isOrganic: false,
      isBeverage: true,
      title: "Coca-Cola Classic",
      categoryPath: "beverages",
      novaGroup: 4,
    });
    assert.equal(s.type, "food");
    if (s.type !== "food") return;
    assert.ok(s.overall < 50, `cola should not be Good, got ${s.overall}`);
    assert.ok(s.overall <= 39, `E drink ceiling 39, got ${s.overall}`);
    assert.equal(s.nutriLetter, "E");
    assert.ok(s.headline.length > 20);
    assert.ok(s.reasons.some((r) => r.kind === "hurt"));
  });

  it("does not rate diet cola as Good", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(1, 0, 0, 0.02, 0, 0, 0, 0),
      ingredients: ingredientsByIds(["water", "e150c", "e338", "e950", "e951", "natural-flavour", "carbon-dioxide"]),
      ingredientsText: "Carbonated water, colour, phosphoric acid, sweeteners (aspartame, acesulfame K), natural flavourings.",
      isOrganic: false,
      isBeverage: true,
      title: "Diet Coke",
      categoryPath: "beverages",
      novaGroup: 4,
    });
    assert.ok(s.overall < 50, `diet cola should not be Good, got ${s.overall}`);
  });

  it("rates plain oats as Excellent", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(1557, 1.1, 1.3, 0.01, 9, 11, 0, 8),
      ingredients: ingredientsByIds(["oats"]),
      ingredientsText: "Rolled oats.",
      isOrganic: false,
      title: "Quaker Oats",
      categoryPath: "breakfast",
      novaGroup: 1,
    });
    assert.ok(s.overall >= 80, `oats overall ${s.overall}`);
  });

  it("rates Nutella-style spread as Poor or Avoid", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(2252, 56.3, 10.6, 0.107, 0, 6.3, 13, 30.9),
      ingredients: ingredientsByIds(["sugar", "palm-oil", "hazelnut", "cocoa", "milk", "e322", "e500"]),
      ingredientsText: "Sugar, palm oil, hazelnuts, skimmed milk powder, fat-reduced cocoa, lecithin, vanillin.",
      isOrganic: false,
      title: "Nutella",
      categoryPath: "spreads",
      novaGroup: 4,
    });
    assert.ok(s.overall < 40, `nutella overall ${s.overall}`);
  });

  it("caps a high-concern extra so the pack cannot be Good", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(900, 1, 3, 2.2, 0, 18, 0, 12),
      ingredients: ingredientsByIds(["pork", "salt", "e250", "e621"]),
      ingredientsText: "Pork, salt, sodium nitrite, flavouring.",
      isOrganic: false,
      title: "Ham",
      categoryPath: "staples",
      novaGroup: 4,
    });
    assert.ok(s.overall <= 49, `nitrite cap, got ${s.overall}`);
  });

  it("caps a red cosmetic ingredient at 24", () => {
    const s = scoreProduct({
      type: "cosmetic",
      ingredients: ingredientsByIds(["water", "glycerin", "methylparaben", "fragrance"]),
      isOrganic: false,
    });
    assert.equal(s.type, "cosmetic");
    if (s.type !== "cosmetic") return;
    assert.equal(s.overall, 24);
    assert.equal(s.maxHazard, "red");
    assert.ok(s.headline.length > 10);
  });

  it("rates Nutella Biscuits as Poor or Avoid", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(2092, 35.7, 10.7, 0.85, 3.6, 7.1, 8, 25),
      ingredients: ingredientsByIds([
        "wheat-flour",
        "sugar",
        "palm-oil",
        "hazelnut",
        "cocoa",
        "milk",
        "sunflower-oil",
        "salt",
        "e503",
        "e500",
        "e450",
        "e322",
        "vanilla",
        "natural-flavour",
      ]),
      ingredientsText: "Wheat flour, palm oil, sugar, hazelnuts, skimmed milk powder, fat-reduced cocoa.",
      isOrganic: false,
      title: "Nutella Biscuits",
      categoryPath: "snacks",
      novaGroup: 4,
    });
    assert.ok(s.overall < 50, `biscuits overall ${s.overall}`);
    assert.ok(s.overall >= 20, `biscuits should not collapse to zero, got ${s.overall}`);
  });

  it("rates Purely Elizabeth protein granola as a middle Good", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(2092, 13.3, 10, 0.46, 10, 16.7, 8, 30),
      ingredients: ingredientsByIds([
        "oats",
        "pumpkin-seed",
        "sunflower-seed",
        "sugar",
        "cashew",
        "almond",
        "quinoa",
        "coconut-oil",
        "chia",
        "natural-flavour",
        "salt",
        "cinnamon",
        "vanilla",
      ]),
      ingredientsText: "Organic oats, pumpkin seeds, sunflower seeds, coconut sugar, cashews, almond butter.",
      isOrganic: true,
      title: "Almond Butter & Berries Protein Ancient Grain Granola",
      categoryPath: "breakfast",
      novaGroup: 3,
    });
    assert.ok(s.overall >= 50 && s.overall < 75, `granola overall ${s.overall}`);
  });

  it("rates 365 alkaline water as Excellent", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(0, 0, 0, 0.01, 0, 0, 0, 0),
      ingredients: ingredientsByIds(["water", "potassium-bicarbonate", "calcium-chloride", "magnesium-sulfate"]),
      ingredientsText: "Purified water, potassium bicarbonate, calcium chloride, magnesium sulfate.",
      isOrganic: false,
      isBeverage: true,
      isWater: true,
      title: "Alkaline & Electrolyte Water",
      categoryPath: "beverages",
      novaGroup: 1,
    });
    assert.ok(s.overall >= 75, `alkaline water overall ${s.overall}`);
  });

  it("does not rate Doritos Nacho Cheese as Good", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(2260, 2.5, 3.5, 1.6, 3.6, 7, 0, 28),
      ingredients: ingredientsByIds(["corn", "palm-oil", "salt", "e621", "e631", "e102", "e110", "e129"]),
      ingredientsText:
        "Corn, vegetable oil, maltodextrin, salt, cheddar, whey, MSG, yellow 6, yellow 5, red 40, disodium inosinate.",
      isOrganic: false,
      title: "Doritos Nacho Cheese",
      categoryPath: "snacks",
      novaGroup: 4,
    });
    assert.equal(s.type, "food");
    if (s.type !== "food") return;
    assert.ok(s.overall < 50, `Doritos must not be Good, got ${s.overall} ${s.headline}`);
    assert.ok(s.novaGroup === 4);
    assert.ok(s.novaCap <= 49, `UPF cap ${s.novaCap}`);
    assert.ok(s.nutriLetter !== "A" && s.nutriLetter !== "B", `chips must not mint a B, got ${s.nutriLetter}`);
    assert.ok(s.additiveScore < 90, `ingredients pillar still too kind: ${s.additiveScore}`);
  });

  it("does not let a thin Open Food Facts box turn chips into Good nutrition", () => {
    const s = scoreProduct({
      type: "food",
      nutrition: n(2260, 2.5, 0, 0, 0, 7, 0, 28),
      ingredients: ingredientsByIds(["e621", "e631"]),
      ingredientsText: "Corn, oil, maltodextrin, salt, MSG, disodium inosinate.",
      isOrganic: false,
      title: "Doritos Nacho Cheese",
      categoryPath: "snacks",
      novaGroup: 4,
    });
    assert.equal(s.type, "food");
    if (s.type !== "food") return;
    assert.ok(s.overall < 50, `thin-label UPF must not be Good, got ${s.overall}`);
    assert.ok(s.nutriLetter !== "A" && s.nutriLetter !== "B", `thin box letter ${s.nutriLetter}`);
  });
});
