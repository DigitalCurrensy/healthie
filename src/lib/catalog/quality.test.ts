import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recordIsScorable } from "./quality.ts";
import { offProductToEvaluated } from "../server/off.ts";
import { PRODUCTS } from "./products.ts";
import { INGREDIENTS } from "./ingredients.ts";

describe("quality gate", () => {
  it("rejects empty OFF stubs so they never score 87", () => {
    const ev = offProductToEvaluated(
      {
        code: "9999999999999",
        product_name: "Test Product Product",
        brands: "MTR",
        ingredients_text: "",
        nutriments: {},
      },
      "openfoodfacts",
    );
    assert.equal(ev, null);
  });

  it("rejects a title with no list and no nutrition box", () => {
    assert.equal(
      recordIsScorable({
        title: "Scanned product",
        type: "food",
        ingredientsText: "",
        nutrition: { energyKj: 0, sugars: 0, saturatedFat: 0, salt: 0, fiber: 0, protein: 0, fruitsVegetables: 0 },
      }),
      false,
    );
  });

  it("keeps a real cola", () => {
    const coke = PRODUCTS.find((p) => p.barcode === "5449000000996");
    assert.ok(coke);
    assert.equal(
      recordIsScorable({
        title: coke.title,
        type: coke.type,
        ingredientsText: coke.ingredientsText,
        nutrition: coke.nutrition,
      }),
      true,
    );
  });

  it("drops Grove and synthetic 8500 GTINs from the default catalog", () => {
    assert.equal(
      PRODUCTS.some((p) => /grove atelier/i.test(p.brand)),
      false,
    );
    assert.equal(
      PRODUCTS.some((p) => p.barcode.startsWith("85001083")),
      false,
    );
  });

  it("has unique barcodes", () => {
    const set = new Set(PRODUCTS.map((p) => p.barcode));
    assert.equal(set.size, PRODUCTS.length);
  });

  it("does not seed the garbage barcode that used to score 87", () => {
    assert.equal(
      PRODUCTS.some((p) => p.barcode.replace(/\D/g, "") === "999999999999"),
      false,
    );
  });

  it("does not score an empty label as honest kitchen food", async () => {
    const { scoreProduct } = await import("../scoring/index.ts");
    const s = scoreProduct({
      type: "food",
      nutrition: { energyKj: 0, sugars: 0, saturatedFat: 0, salt: 0, fiber: 0, protein: 0, fruitsVegetables: 0 },
      ingredients: [],
      ingredientsText: "",
      isOrganic: false,
      isBeverage: false,
      title: "Test Product Product",
    });
    assert.equal(s.overall, 0);
    assert.notEqual(s.type === "food" && s.cappedBy, null);
  });

  it("has unique ingredient ids", () => {
    const set = new Set(INGREDIENTS.map((i) => i.id));
    assert.equal(set.size, INGREDIENTS.length);
  });
});
