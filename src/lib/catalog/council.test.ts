import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDef } from "./evaluate.ts";
import { PRODUCT_BY_BARCODE } from "./products.ts";
import { aisleStanding } from "./standing.ts";
import { councilNote, servingHonesty } from "./council.ts";

describe("council + aisle standing", () => {
  it("will not call Coca-Cola a keep, and names the can", () => {
    const def = PRODUCT_BY_BARCODE.get("5449000000996");
    assert.ok(def);
    const product = evaluateDef(def!);
    assert.ok(product.score.overall < 50);
    const serving = servingHonesty(product);
    assert.ok(serving && /330 ml can/i.test(serving));
    const note = councilNote(product, aisleStanding(product));
    assert.ok(/treat|habit|sugar|ultra/i.test(note.body));
  });

  it("ranks Doritos as worse than most of its aisle", () => {
    const def = PRODUCT_BY_BARCODE.get("028400090032") ?? PRODUCT_BY_BARCODE.get("028400064011");
    assert.ok(def, "Doritos barcode missing");
    const product = evaluateDef(def!);
    assert.ok(product.score.overall < 50);
    const standing = aisleStanding(product);
    assert.ok(standing);
    assert.ok(standing!.better >= 1);
  });
});
