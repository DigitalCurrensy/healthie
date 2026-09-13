import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dumpRecordCode,
  newestDelta,
  nextDeltaToIngest,
  parseDeltaIndex,
  shouldRefreshDump,
  unprocessedDeltas,
} from "./dump-logic.ts";

const INDEX = `
openfoodfacts_products_1787551660_1787638043.json.gz
openfoodfacts_products_1787465359_1787551660.json.gz
openfoodfacts_products_1787378811_1787465359.json.gz
openfoodfacts_products_1786428017_1786515213.json.gz
`.trim();

describe("nightly OFF delta index", () => {
  it("sorts newest-first listings oldest → newest and never picks the oldest as 'latest'", () => {
    const files = parseDeltaIndex(INDEX);
    assert.equal(files[0], "openfoodfacts_products_1786428017_1786515213.json.gz");
    assert.equal(newestDelta(files), "openfoodfacts_products_1787551660_1787638043.json.gz");
  });

  it("first boot ingests only the newest night, not the 14-day backlog", () => {
    const files = parseDeltaIndex(INDEX);
    assert.deepEqual(unprocessedDeltas(files, null), [
      "openfoodfacts_products_1787551660_1787638043.json.gz",
    ]);
  });

  it("later nights pick files newer than the last finished dump", () => {
    const files = parseDeltaIndex(INDEX);
    const next = nextDeltaToIngest(files, "openfoodfacts_products_1787465359_1787551660.json.gz");
    assert.equal(next, "openfoodfacts_products_1787551660_1787638043.json.gz");
    assert.equal(nextDeltaToIngest(files, "openfoodfacts_products_1787551660_1787638043.json.gz"), null);
  });
});

describe("dump cadence", () => {
  it("runs when there is no previous dump", () => {
    assert.equal(shouldRefreshDump(null, Date.now()), true);
  });

  it("stays quiet inside the 20-hour window so live lookup is not starved", () => {
    const now = Date.parse("2026-08-25T18:00:00Z");
    assert.equal(shouldRefreshDump("2026-08-25T10:00:00.000Z", now), false);
    assert.equal(shouldRefreshDump("2026-08-24T10:00:00.000Z", now), true);
  });
});

describe("dump JSONL records", () => {
  it("reads barcode from _id when mongoexport omits code", () => {
    assert.equal(dumpRecordCode({ _id: "0415597403187" }), "0415597403187");
    assert.equal(dumpRecordCode({ code: "5449000000996", _id: "x" }), "5449000000996");
  });
});
