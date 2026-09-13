import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { preferQuotes, quotesFromResponse } from "./prices-logic.ts";

const cokePayload = {
  items: [
    {
      price: 1.1,
      currency: "EUR",
      date: "2026-04-06",
      location: {
        osm_brand: "HiperDino",
        osm_display_name: "HiperDino Express, España",
        osm_address_country: "España",
        osm_address_country_code: "ES",
      },
    },
    {
      price: 2.49,
      currency: "USD",
      date: "2026-08-01",
      location: {
        osm_brand: "Target",
        osm_display_name: "Target, Los Angeles",
        osm_address_country: "United States",
        osm_address_country_code: "US",
      },
    },
  ],
};

describe("Open Prices mapping", () => {
  it("reads store, country, and amount from the live API shape", () => {
    const quotes = quotesFromResponse(cokePayload);
    assert.equal(quotes.length, 2);
    assert.equal(quotes[0]?.store, "HiperDino");
    assert.equal(quotes[1]?.country, "US");
    assert.equal(quotes[1]?.amount, 2.49);
  });

  it("surfaces a US / USD shelf price ahead of a foreign euro tag", () => {
    const ranked = preferQuotes(quotesFromResponse(cokePayload));
    assert.equal(ranked[0]?.currency, "USD");
    assert.equal(ranked[0]?.store, "Target");
  });
});
