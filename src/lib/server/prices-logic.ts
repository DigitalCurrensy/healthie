import type { PriceBoard, PriceQuote } from "@/lib/world";

export type OpenPrice = {
  price?: number;
  currency?: string;
  date?: string;
  location?: {
    osm_brand?: string | null;
    osm_display_name?: string | null;
    osm_address_country?: string | null;
    osm_address_country_code?: string | null;
  } | null;
};

export type OpenPriceResponse = { items?: OpenPrice[]; total?: number };

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const v = s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
  return Math.round(v * 100) / 100;
}

function pickCurrency(quotes: PriceQuote[]): string | null {
  const usd = quotes.filter((q) => q.currency === "USD");
  if (usd.length) return "USD";
  const counts = new Map<string, number>();
  for (const q of quotes) counts.set(q.currency, (counts.get(q.currency) ?? 0) + 1);
  let best: string | null = null;
  let n = 0;
  for (const [c, k] of counts) {
    if (k > n) {
      best = c;
      n = k;
    }
  }
  return best;
}

function countryScore(country: string): number {
  const c = country.toUpperCase();
  if (c === "US" || c === "USA" || c === "UNITED STATES") return 4;
  return 0;
}

export function preferQuotes(quotes: PriceQuote[]): PriceQuote[] {
  return quotes.slice().sort((a, b) => {
    const sa = countryScore(a.country) + (a.currency === "USD" ? 2 : 0);
    const sb = countryScore(b.country) + (b.currency === "USD" ? 2 : 0);
    if (sb !== sa) return sb - sa;
    return (b.observedOn || "").localeCompare(a.observedOn || "");
  });
}

export function toQuote(row: OpenPrice): PriceQuote | null {
  const amount = num(row.price);
  if (amount == null) return null;
  const loc = row.location;
  const store = (loc?.osm_brand || loc?.osm_display_name?.split(",")[0] || "Store")
    .trim()
    .slice(0, 48);
  const country = (loc?.osm_address_country_code || loc?.osm_address_country || "").trim().slice(0, 32);
  return {
    amount,
    currency: (row.currency || "EUR").toUpperCase(),
    store,
    country,
    observedOn: row.date || "",
  };
}

export function quotesFromResponse(data: OpenPriceResponse): PriceQuote[] {
  const quotes: PriceQuote[] = [];
  const seen = new Set<string>();
  for (const item of data.items ?? []) {
    const q = toQuote(item);
    if (!q) continue;
    const key = `${q.store}|${q.amount}|${q.observedOn}`;
    if (seen.has(key)) continue;
    seen.add(key);
    quotes.push(q);
  }
  return quotes;
}

export function boardOf(barcode: string, quotes: PriceQuote[]): PriceBoard {
  const ranked = preferQuotes(quotes);
  const currency = pickCurrency(ranked);
  const inCur = currency ? ranked.filter((q) => q.currency === currency) : [];
  const amounts = inCur.map((q) => q.amount);
  const stores = new Set(inCur.map((q) => q.store));
  return {
    barcode,
    quotes: inCur.slice(0, 8),
    median: median(amounts),
    low: amounts.length ? Math.min(...amounts) : null,
    high: amounts.length ? Math.max(...amounts) : null,
    currency,
    storeCount: stores.size,
    source: "open-prices",
  };
}
