import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchCatalogName } from "./lookup.ts";
import { aislePathFromTags } from "./aisles.ts";
import { formatWorldCount } from "../world.ts";

describe("front-of-pack name match", () => {
  it("finds Nutella Biscuits from a front photo with no barcode", () => {
    const hit = matchCatalogName("Nutella Biscuits", "Nutella");
    assert.ok(hit, "expected a catalog hit");
    assert.equal(hit.title, "Nutella Biscuits");
    assert.match(hit.barcode, /009800830039|8000500310427/);
  });

  it("finds Purely Elizabeth granola from a cropped flavour line", () => {
    const hit = matchCatalogName("Almond Butter & Berries Protein Ancient Grain Granola", "Purely Elizabeth");
    assert.ok(hit, "expected a catalog hit");
    assert.match(hit.title, /Almond Butter/);
    assert.equal(hit.brand, "Purely Elizabeth");
  });

  it("finds 365 alkaline water from the bottle face", () => {
    const hit = matchCatalogName("Alkaline & Electrolyte Water", "365 Whole Foods Market");
    assert.ok(hit, "expected a catalog hit");
    assert.match(hit.title, /Alkaline/);
    assert.equal(hit.isWater, true);
  });

  it("still matches a short OCR title when the brand is on the pack", () => {
    const biscuits = matchCatalogName("biscuits", "Nutella");
    assert.ok(biscuits);
    assert.equal(biscuits.title, "Nutella Biscuits");
  });
});

describe("aisle mapping from Open Food Facts tags", () => {
  it("puts Nutella in spreads, not staples", () => {
    assert.equal(aislePathFromTags(["en:spreads", "en:sweet-spreads"], "Nutella", "food"), "spreads");
  });

  it("puts toothpaste in oral, not skincare", () => {
    assert.equal(aislePathFromTags(["en:toothpastes"], "Colgate Total", "cosmetic"), "oral");
  });

  it("puts ice cream in icecream, not dairy", () => {
    assert.equal(aislePathFromTags(["en:ice-creams"], "Häagen-Dazs Vanilla", "food"), "icecream");
  });

  it("puts candy separately from snacks", () => {
    assert.equal(aislePathFromTags(["en:candies"], "Haribo Goldbears", "food"), "candy");
  });
});

describe("world count copy", () => {
  it("renders millions without a trailing .0", () => {
    assert.equal(formatWorldCount(4_707_634), "4.7 million");
    assert.equal(formatWorldCount(73850), "73.9k");
  });
});
