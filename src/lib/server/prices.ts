import { getSql } from "@/lib/db";
import { barcodeVariants } from "@/lib/utils";
import type { PriceBoard, PriceQuote } from "@/lib/world";
import { boardOf, quotesFromResponse, type OpenPriceResponse } from "./prices-logic";

export { preferQuotes, quotesFromResponse, toQuote } from "./prices-logic";

const UA = "Healthie/1.0 (https://grok.com; product-scanner)";
const CACHE_MS = 12 * 60 * 60 * 1000;

async function cachedBoard(barcode: string): Promise<PriceBoard | null> {
  const sql = await getSql();
  const rows = await sql<{
    amount: number;
    currency: string;
    store: string;
    country: string;
    observed_on: string | null;
    fetched_at: string;
  }>`
    select amount, currency, store, country, observed_on::text, fetched_at::text
    from product_prices
    where barcode = ${barcode}
    order by fetched_at desc, observed_on desc nulls last
    limit 12`;
  if (!rows.length) return null;
  const age = Date.now() - new Date(rows[0]!.fetched_at).getTime();
  if (!Number.isFinite(age) || age > CACHE_MS) return null;
  return boardOf(
    barcode,
    rows.map((r) => ({
      amount: Number(r.amount),
      currency: r.currency,
      store: r.store,
      country: r.country,
      observedOn: r.observed_on || "",
    })),
  );
}

async function persistQuotes(barcode: string, quotes: PriceQuote[]): Promise<void> {
  if (!quotes.length) return;
  const sql = await getSql();
  await sql.query(`delete from product_prices where barcode = $1`, [barcode]);
  for (const q of quotes.slice(0, 12)) {
    await sql.query(
      `insert into product_prices (barcode, amount, currency, store, country, observed_on)
       values ($1,$2,$3,$4,$5,$6)`,
      [barcode, q.amount, q.currency, q.store, q.country, q.observedOn || null],
    );
  }
}

async function fetchQuotes(code: string): Promise<PriceQuote[]> {
  const url =
    `https://prices.openfoodfacts.org/api/v1/prices?product_code=${encodeURIComponent(code)}` +
    `&order_by=-date&page_size=20`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return [];
  return quotesFromResponse((await res.json()) as OpenPriceResponse);
}

export async function lookupPrices(barcode: string): Promise<PriceBoard | null> {
  const codes = barcodeVariants(barcode);
  if (!codes.length) return null;
  const primary = codes[0]!;
  const hit = await cachedBoard(primary);
  if (hit && hit.quotes.length) return hit;
  try {
    let quotes: PriceQuote[] = [];
    for (const code of codes) {
      quotes = await fetchQuotes(code);
      if (quotes.length) {
        await persistQuotes(primary, quotes);
        break;
      }
    }
    const board = boardOf(primary, quotes);
    return board.quotes.length ? board : hit;
  } catch {
    return hit;
  }
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(
      amount,
    );
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
