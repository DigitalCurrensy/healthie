import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreCart } from "./cart.ts";
import { matchRecallIncludingFixture, expiryIsPast, scanSafety } from "./recalls.ts";
import { inferNutriCategory, computeNutriScore } from "../scoring/nutri-score.ts";
import { matchFdaRecall, type FdaRecall } from "../server/fda.ts";

describe("cart week", () => {
  it("caps a list with two Poor packs at Poor", () => {
    const week = scoreCart([
      { barcode: "a", title: "Cola", score: 35, checked: false },
      { barcode: "b", title: "Chips", score: 27, checked: false },
      { barcode: "c", title: "Oats", score: 96, checked: false },
    ]);
    assert.ok(week);
    assert.ok(week!.overall < 50, `week ${week!.overall}`);
    assert.equal(week!.poor, 2);
  });

  it("names Coke teaspoons when the list has Classic", () => {
    const week = scoreCart([
      { barcode: "5449000000996", title: "Coca-Cola Classic", score: 35, checked: false },
    ]);
    assert.ok(week?.sugarLine && /teaspoons/i.test(week.sugarLine));
  });
});

describe("recall + expiry", () => {
  it("flags a fixture lot", () => {
    const hit = matchRecallIncludingFixture("0000000000000", "TESTLOT");
    assert.ok(hit);
    assert.equal(hit!.kind, "recall");
  });

  it("flags a date that already passed", () => {
    assert.equal(expiryIsPast("200101", new Date("2026-09-13")), true);
    assert.equal(expiryIsPast("291231", new Date("2026-09-13")), false);
    const hits = scanSafety({ gtin: "5449000000996", expiry: "200101" });
    assert.ok(hits.some((h) => h.kind === "expired"));
  });
});

describe("nuts category", () => {
  it("reads plain almonds as nuts, not a snack", () => {
    assert.equal(inferNutriCategory({ title: "Raw Almonds", categoryPath: "snacks" }), "nuts");
    assert.equal(inferNutriCategory({ title: "Raw Almonds", categoryPath: "staples" }), "nuts");
    const letter = computeNutriScore(
      { energyKj: 2400, sugars: 4, saturatedFat: 4, salt: 0, fiber: 12, protein: 21, fruitsVegetables: 0, fat: 50 },
      "nuts",
    ).letter;
    assert.ok(letter === "A" || letter === "B" || letter === "C", `almonds letter ${letter}`);
  });
});

describe("openFDA match", () => {
  it("matches a GTIN hiding in code_info and ignores a weak brand-only hit", () => {
    const feed: FdaRecall[] = [
      {
        eventId: "1",
        classification: "Class I",
        firm: "Acme",
        product: "Something else entirely",
        codes: "UPC 012345678905 lot A",
        reason: "Listeria",
        date: "20260901",
        status: "Ongoing",
      },
    ];
    const hit = matchFdaRecall({ barcode: "012345678905", title: "Plain Oats", brand: "Quaker" }, feed);
    assert.ok(hit);
    const miss = matchFdaRecall({ barcode: "5449000000996", title: "Coca-Cola Classic", brand: "Coca-Cola" }, feed);
    assert.equal(miss, null);
  });
});
