export type WorldIndex = {
  foodCount: number;
  beautyCount: number;
  petCount: number;
  localCount: number;
  lastDumpAt: string | null;
  lastDumpIngested: number;
  lastDumpFile: string | null;
  source: string;
};

export type PriceQuote = {
  amount: number;
  currency: string;
  store: string;
  country: string;
  observedOn: string;
};

export type PriceBoard = {
  barcode: string;
  quotes: PriceQuote[];
  median: number | null;
  low: number | null;
  high: number | null;
  currency: string | null;
  storeCount: number;
  source: "open-prices";
};

export function formatWorldCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const rounded = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
    return `${rounded} million`;
  }
  if (n >= 1_000) return `${Math.round(n / 100) / 10}k`;
  return n.toLocaleString("en-US");
}
