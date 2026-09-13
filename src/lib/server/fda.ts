import { normalizeBarcode } from "@/lib/utils";

export type FdaRecall = {
  eventId: string;
  classification: string;
  firm: string;
  product: string;
  codes: string;
  reason: string;
  date: string;
  status: string;
};

type FdaRaw = {
  event_id?: string;
  classification?: string;
  recalling_firm?: string;
  product_description?: string;
  code_info?: string;
  reason_for_recall?: string;
  report_date?: string;
  status?: string;
};

const globalRef = globalThis as typeof globalThis & {
  __fdaFeed__?: { at: number; rows: FdaRecall[] };
};

const TTL = 6 * 60 * 60 * 1000;
const GENERIC = /^(classic|original|organic|natural|the|and|with|food|pack|size)$/i;

function mapRow(r: FdaRaw): FdaRecall | null {
  if (!r.product_description) return null;
  return {
    eventId: String(r.event_id || ""),
    classification: r.classification || "",
    firm: r.recalling_firm || "",
    product: r.product_description,
    codes: r.code_info || "",
    reason: (r.reason_for_recall || "").replace(/\s+/g, " ").trim(),
    date: r.report_date || "",
    status: r.status || "",
  };
}

export async function loadFdaFeed(): Promise<FdaRecall[]> {
  const hit = globalRef.__fdaFeed__;
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  const rows: FdaRecall[] = [];
  try {
    for (const skip of [0, 100, 200]) {
      const url =
        `https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"` +
        `&limit=100&skip=${skip}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) break;
      const json = (await res.json()) as { results?: FdaRaw[] };
      for (const r of json.results ?? []) {
        const mapped = mapRow(r);
        if (mapped) rows.push(mapped);
      }
      if ((json.results ?? []).length < 100) break;
    }
  } catch {
    /* openFDA down — keep last cache or empty */
  }
  if (rows.length) globalRef.__fdaFeed__ = { at: Date.now(), rows };
  return globalRef.__fdaFeed__?.rows ?? rows;
}

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

export function matchFdaRecall(
  input: { barcode: string; title: string; brand: string },
  feed: FdaRecall[],
): FdaRecall | null {
  const gtin = normalizeBarcode(input.barcode);
  const tail = gtin.slice(-12);
  const tail11 = gtin.slice(-11);
  for (const r of feed) {
    const codes = digits(r.codes);
    if (codes.length >= 8 && (codes.includes(tail) || codes.includes(gtin) || (tail11.length >= 11 && codes.includes(tail11)))) {
      return r;
    }
  }
  const brand = input.brand.trim().toLowerCase();
  if (brand.length < 4) return null;
  const words = input.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC.test(w) && w !== brand);
  if (words.length === 0) return null;
  for (const r of feed) {
    const blob = `${r.product} ${r.firm}`.toLowerCase();
    if (!blob.includes(brand)) continue;
    const hits = words.filter((w) => blob.includes(w)).length;
    if (hits >= 2 || (hits >= 1 && words[0] && blob.includes(words[0]))) return r;
  }
  return null;
}

export function fdaToHit(r: FdaRecall): { kind: "recall"; title: string; detail: string } {
  const klass = r.classification ? `${r.classification}. ` : "";
  return {
    kind: "recall",
    title: "This pack is on an ongoing recall",
    detail: `${klass}${r.reason || r.product}`.slice(0, 280),
  };
}
