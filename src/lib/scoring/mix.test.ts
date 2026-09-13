import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCaps, buildCaps, novaCapFor } from "./mix.ts";

describe("mixer caps", () => {
  it("never lets ultra-processed food into Good (50+)", () => {
    assert.ok(novaCapFor(4, "A") < 50);
    assert.ok(novaCapFor(4, "B") < 50);
    assert.ok(novaCapFor(4, "C") < 50);
    assert.equal(novaCapFor(4, "B"), 49);
    assert.ok(novaCapFor(1, "A") === 100);
  });

  it("caps a B-box UPF mix of 62 at Poor", () => {
    const caps = buildCaps({
      letter: "B",
      nova: 4,
      highCount: 0,
      moderateCount: 0,
      sweetenerCount: 0,
      redTraffic: 0,
    });
    const { overall, cappedBy } = applyCaps(62, caps);
    assert.equal(overall, 49);
    assert.equal(cappedBy, "processing");
  });

  it("caps two red traffic lights at Poor", () => {
    const caps = buildCaps({
      letter: "C",
      nova: 3,
      highCount: 0,
      moderateCount: 0,
      sweetenerCount: 0,
      redTraffic: 2,
    });
    const { overall } = applyCaps(70, caps);
    assert.equal(overall, 49);
  });
});
