import type { FdaRecall } from "./fda";

/**
 * Nightly / CLI only. Do not import this from getProduct, searchCatalog, or loadFdaFeed.
 * Walks the full RES food/enforcement table via Link: rel="next" + search_after.
 * skip/limit tops out at 26,000; the live table is ~29k.
 */

type FdaRaw = {
  event_id?: string;
  recall_number?: string;
  classification?: string;
  recalling_firm?: string;
  product_description?: string;
  code_info?: string;
  more_code_info?: string;
  reason_for_recall?: string;
  report_date?: string;
  recall_initiation_date?: string;
  status?: string;
  product_quantity?: string;
  distribution_pattern?: string;
  voluntary_mandated?: string;
  city?: string;
  state?: string;
};

const START =
  "https://api.fda.gov/food/enforcement.json?limit=1000&sort=report_date:desc";

export function nextFromLink(header: string | null): string | null {
  if (!header) return null;
  const m = header.match(/<([^>]+)>;\s*rel="next"/i);
  return m?.[1] ?? null;
}

function clean(s?: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

function mapRow(r: FdaRaw): FdaRecall | null {
  if (!r.product_description) return null;
  return {
    eventId: String(r.event_id || r.recall_number || ""),
    recallNumber: r.recall_number || "",
    classification: r.classification || "",
    firm: r.recalling_firm || "",
    product: clean(r.product_description),
    codes: clean([r.code_info, r.more_code_info].filter(Boolean).join(" ")),
    reason: clean(r.reason_for_recall),
    date: r.report_date || "",
    started: r.recall_initiation_date || "",
    status: r.status || "",
    quantity: clean(r.product_quantity),
    where: clean(r.distribution_pattern),
    how: clean(r.voluntary_mandated),
    city: r.city || "",
    state: r.state || "",
  };
}

export async function harvestOpenFdaRes(opts?: {
  maxPages?: number;
  startUrl?: string;
}): Promise<FdaRecall[]> {
  const maxPages = Math.min(Math.max(opts?.maxPages ?? 40, 1), 80);
  const out: FdaRecall[] = [];
  const seen = new Set<string>();
  let url: string | null = opts?.startUrl || START;
  let pages = 0;
  while (url && pages < maxPages) {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) break;
    const json = (await res.json()) as { results?: FdaRaw[] };
    for (const raw of json.results ?? []) {
      const row = mapRow(raw);
      if (!row) continue;
      const key = row.recallNumber || row.eventId || `${row.firm}|${row.product}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
    pages += 1;
    url = nextFromLink(res.headers.get("link") || res.headers.get("Link"));
  }
  return out;
}
