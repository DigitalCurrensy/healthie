import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isHeicName, looksLikeImage, sniffHeic } from "./image.ts";

describe("phone photo intake", () => {
  it("accepts iPhone HEIC even when the type is empty", () => {
    const empty = new File([new Uint8Array([0, 0, 0])], "IMG_0493.HEIC", { type: "" });
    assert.equal(looksLikeImage(empty), true);
    assert.equal(isHeicName(empty), true);
  });

  it("accepts HEIC by mime type", () => {
    const typed = new File([new Uint8Array([0])], "pack", { type: "image/heic" });
    assert.equal(looksLikeImage(typed), true);
    assert.equal(isHeicName(typed), true);
  });

  it("sniffs the ftyp box", async () => {
    const bytes = new Uint8Array(16);
    bytes.set([0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], 4); // ftypheic
    const file = new File([bytes], "shot.bin", { type: "application/octet-stream" });
    assert.equal(await sniffHeic(file), true);
    assert.equal(looksLikeImage(file), false);
  });
});
