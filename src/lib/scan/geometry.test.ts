import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { barcodeVariants, normalizeBarcode } from "../utils.ts";
import { barcodeWidth, coverMapping, lerpCorners, overlayToVideo, videoToOverlay } from "./geometry.ts";

describe("cover mapping", () => {
  it("round-trips a point on a cover-fitted overlay", () => {
    const map = coverMapping(1920, 1080, 390, 844);
    const overlay = videoToOverlay(960, 540, map);
    const back = overlayToVideo(overlay.x, overlay.y, map);
    assert.ok(Math.abs(back.x - 960) < 0.01);
    assert.ok(Math.abs(back.y - 540) < 0.01);
  });

  it("covers the overlay without letterboxing gaps", () => {
    const map = coverMapping(1920, 1080, 390, 844);
    const tl = videoToOverlay(0, 0, map);
    const br = videoToOverlay(1920, 1080, map);
    assert.ok(tl.x <= 0.5);
    assert.ok(tl.y <= 0.5);
    assert.ok(br.x >= 389.5);
    assert.ok(br.y >= 843.5);
  });
});

describe("trace helpers", () => {
  it("measures barcode width from corners", () => {
    assert.equal(
      barcodeWidth([
        { x: 10, y: 0 },
        { x: 110, y: 0 },
        { x: 110, y: 40 },
        { x: 10, y: 40 },
      ]),
      100,
    );
  });

  it("lerps corners toward a lock", () => {
    const out = lerpCorners([{ x: 0, y: 0 }], [{ x: 10, y: 10 }], 0.5);
    assert.deepEqual(out, [{ x: 5, y: 5 }]);
  });
});

describe("barcode variants", () => {
  it("pads a UPC-A to EAN-13 and still keeps the twelve digits", () => {
    const variants = barcodeVariants("049000006346");
    assert.ok(variants.includes("049000006346"));
    assert.ok(variants.includes("0049000006346"));
    assert.equal(normalizeBarcode("049000006346"), "0049000006346");
  });
});
