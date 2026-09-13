import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeHistory, mergeList, shouldSkipCloudPush, snapshotIsBlank } from "./account-merge.ts";

const scan = (barcode: string, scannedAt: number, title = "Pack") => ({
  barcode,
  title,
  brand: "Brand",
  type: "food" as const,
  score: 40,
  scannedAt,
});

describe("account merge so history follows a second phone", () => {
  it("keeps the newer scan when both phones saw the same barcode", () => {
    const merged = mergeHistory([scan("1", 200, "Local")], [scan("1", 100, "Remote")]);
    assert.equal(merged[0]?.title, "Local");
    assert.equal(merged[0]?.scannedAt, 200);
  });

  it("unions two phones instead of replacing one with the other", () => {
    const merged = mergeHistory([scan("a", 2)], [scan("b", 1)]);
    assert.deepEqual(merged.map((s) => s.barcode), ["a", "b"]);
  });

  it("does not push while a device wipe is paused", () => {
    assert.equal(shouldSkipCloudPush({ paused: true, snapshot: { scans: [], saved: [], list: [] } }), true);
    assert.equal(shouldSkipCloudPush({ paused: false, snapshot: { scans: [1], saved: [], list: [] } }), false);
  });

  it("treats a fresh phone as blank so it will not blank the account", () => {
    assert.equal(snapshotIsBlank({ scans: [], saved: [], list: [] }), true);
    assert.equal(snapshotIsBlank({ scans: [scan("1", 1)], saved: [], list: [] }), false);
  });

  it("keeps remote list rows the local phone has not seen", () => {
    const merged = mergeList(
      [{ barcode: "x", title: "X", brand: "", score: 1, checked: false }],
      [{ barcode: "y", title: "Y", brand: "", score: 2, checked: true }],
    );
    assert.equal(merged.length, 2);
  });
});
