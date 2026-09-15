import { normalizeBarcode } from "@/lib/utils";

export type FdaRecall = {
  eventId: string;
  recallNumber: string;
  classification: string;
  firm: string;
  product: string;
  codes: string;
  reason: string;
  date: string;
  started: string;
  status: string;
  quantity: string;
  where: string;
  how: string;
  city: string;
  state: string;
};

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

const globalRef = globalThis as typeof globalThis & {
  __fdaFeed__?: { at: number; rows: FdaRecall[] };
};

const TTL = 6 * 60 * 60 * 1000;
const GENERIC = /^(classic|original|organic|natural|the|and|with|food|pack|size)$/i;

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

/**
 * openFDA food/enforcement: RES recalls, 2004–present, weekly.
 * Live check 2026-09-09: 29,406 rows. status.exact = Terminated 27,917 / Ongoing 1,030 / Completed 459.
 * Paging is skip + limit (limit max 1,000). skip+limit caps at 26,000 hits; beyond that use search_after.
 * 1,030 ongoing fits in two pages of 1,000.
 */
export async function loadFdaFeed(): Promise<FdaRecall[]> {
  const hit = globalRef.__fdaFeed__;
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  const rows: FdaRecall[] = [];
  try {
    for (const skip of [0, 1000]) {
      const url =
        `https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"` +
        `&limit=1000&skip=${skip}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) break;
      const json = (await res.json()) as { results?: FdaRaw[]; meta?: { results?: { total?: number } } };
      for (const r of json.results ?? []) {
        const mapped = mapRow(r);
        if (mapped) rows.push(mapped);
      }
      const total = json.meta?.results?.total ?? 0;
      if ((json.results ?? []).length < 1000 || rows.length >= total) break;
    }
  } catch {
    /* feed down — keep last cache or empty */
  }
  if (rows.length) globalRef.__fdaFeed__ = { at: Date.now(), rows };
  return globalRef.__fdaFeed__?.rows ?? rows;
}

function digitRuns(s: string): string[] {
  return s.match(/\d{8,14}/g) ?? [];
}

export function matchFdaRecall(
  input: { barcode: string; title: string; brand: string },
  feed: FdaRecall[],
  extra?: FdaRecall[],
): FdaRecall | null {
  const pool = extra?.length ? [...extra, ...feed] : feed;
  const gtin = normalizeBarcode(input.barcode);
  const tail = gtin.slice(-12);
  const tail11 = gtin.slice(-11);
  for (const r of pool) {
    for (const code of digitRuns(r.codes)) {
      if (code === gtin || code === tail || (tail11.length >= 11 && code === tail11) || code.endsWith(tail) || tail.endsWith(code)) {
        return r;
      }
    }
  }
  const brand = input.brand.trim().toLowerCase();
  if (brand.length < 4) return null;
  const words = input.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC.test(w) && w !== brand);
  if (words.length === 0) return null;
  for (const r of pool) {
    const blob = `${r.product} ${r.firm}`.toLowerCase();
    if (!blob.includes(brand)) continue;
    const hits = words.filter((w) => blob.includes(w)).length;
    if (hits >= 2 || (hits >= 1 && words[0] && blob.includes(words[0]))) return r;
  }
  return null;
}

export function fdaToHit(r: FdaRecall): { kind: "recall"; title: string; detail: string } {
  const klass = r.classification ? `${r.classification}. ` : "";
  const why = r.reason || r.product;
  return {
    kind: "recall",
    title: "This pack is on an ongoing recall",
    detail: `${klass}${why}`.slice(0, 280),
  };
}

export function classLabel(classification: string): string {
  if (/class i\b/i.test(classification)) return "Serious risk";
  if (/class ii/i.test(classification)) return "Could cause harm";
  if (/class iii/i.test(classification)) return "Unlikely to cause harm";
  return classification || "Recall";
}
