import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectRetailFormat,
  expandUpce,
  gtinCheckDigit,
  hasValidGtinCheck,
  validateScannedBarcode,
} from "./gtin.ts";

describe("GS1 check digit — 11 retail cases", () => {
  it("1 Coca-Cola Classic EAN-13 5449000000996", () => {
    assert.equal(hasValidGtinCheck("5449000000996"), true);
    assert.equal(gtinCheckDigit("544900000099"), 6);
    assert.equal(validateScannedBarcode("5449000000996"), "5449000000996");
    assert.equal(detectRetailFormat("5449000000996"), "ean-13");
  });

  it("2 Coca-Cola US UPC-A 0-49000-02890-4", () => {
    assert.equal(hasValidGtinCheck("049000028904"), true);
    assert.equal(validateScannedBarcode("049000028904"), "0049000028904");
    assert.equal(detectRetailFormat("049000028904"), "upc-a");
  });

  it("3 Nutella EAN-13", () => {
    assert.equal(validateScannedBarcode("3017620422003"), "3017620422003");
  });

  it("4 Evian EAN-13", () => {
    assert.equal(validateScannedBarcode("3274080005003"), "3274080005003");
  });

  it("5 UPC-A wiki 036000291452 pads to EAN-13", () => {
    assert.equal(hasValidGtinCheck("036000291452"), true);
    assert.equal(validateScannedBarcode("036000291452"), "0036000291452");
  });

  it("6 valid EAN-8 96385074", () => {
    assert.equal(hasValidGtinCheck("96385074"), true);
    assert.equal(validateScannedBarcode("96385074"), "96385074");
    assert.equal(detectRetailFormat("96385074"), "ean-8");
  });

  it("7 GTIN-14 leading-zero case code collapses to EAN-13", () => {
    assert.equal(validateScannedBarcode("05449000000996"), "5449000000996");
  });

  it("8 rejects a flipped Coca-Cola check digit", () => {
    assert.equal(hasValidGtinCheck("5449000000990"), false);
    assert.equal(validateScannedBarcode("5449000000990"), null);
  });

  it("9 rejects a random 8-digit string", () => {
    assert.equal(validateScannedBarcode("12345678"), null);
  });

  it("10 expands a known-good UPC-E", () => {
    const known = expandUpce("04252614");
    assert.ok(known);
    assert.equal(known!.length, 12);
    assert.equal(hasValidGtinCheck(known!), true);
  });

  it("11 rejects alphanumeric Code 128 on the camera path", () => {
    assert.equal(validateScannedBarcode("ABC12345"), null);
    assert.equal(validateScannedBarcode("not-a-code"), null);
    assert.equal(detectRetailFormat("ABC12345"), null);
  });
});
