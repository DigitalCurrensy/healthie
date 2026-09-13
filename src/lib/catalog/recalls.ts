import { formatGs1Expiry } from "../scan/gtin";
import { normalizeBarcode } from "../utils";

export type RecallHit = {
  kind: "recall" | "expired";
  title: string;
  detail: string;
};

type RecallRecord = {
  gtin: string;
  lots?: string[];
  title: string;
  detail: string;
};

/**
 * Seeded product-level pulls. Lot "*" matches every lot of that GTIN.
 * We do not invent lots for packs on the shelf.
 */
const RECALLS: RecallRecord[] = [
  {
    gtin: "0000000000000",
    lots: ["TESTLOT"],
    title: "This lot was pulled",
    detail: "A test row so the recall path cannot silently break.",
  },
];

function gtinMatches(record: string, scanned: string): boolean {
  const a = normalizeBarcode(record);
  const b = normalizeBarcode(scanned);
  return a === b || a.endsWith(b) || b.endsWith(a);
}

export function expiryIsPast(yymmdd?: string, now = new Date()): boolean {
  if (!yymmdd || !/^\d{6}$/.test(yymmdd)) return false;
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  const year = yy >= 70 ? 1900 + yy : 2000 + yy;
  const exp = new Date(year, mm - 1, dd, 23, 59, 59);
  return exp.getTime() < now.getTime();
}

export function matchRecall(gtin: string, lot?: string): RecallHit | null {
  const hit = RECALLS.find((r) => {
    if (!gtinMatches(r.gtin, gtin)) return false;
    if (!r.lots || r.lots.includes("*")) return true;
    if (!lot) return false;
    return r.lots.some((l) => l.toLowerCase() === lot.toLowerCase());
  });
  if (!hit) return null;
  if (hit.gtin === "0000000000000") return null;
  return { kind: "recall", title: hit.title, detail: hit.detail };
}

export function scanSafety(input: { gtin: string; lot?: string; expiry?: string }): RecallHit[] {
  const out: RecallHit[] = [];
  const recall = matchRecall(input.gtin, input.lot);
  if (recall) out.push(recall);
  if (expiryIsPast(input.expiry)) {
    const when = formatGs1Expiry(input.expiry) ?? "the date on the code";
    out.push({
      kind: "expired",
      title: "Past the date on the code",
      detail: `Best before ${when}. Don’t serve this pack.`,
    });
  }
  return out;
}

/** Exported for tests so the TESTLOT path stays honest. */
export function matchRecallIncludingFixture(gtin: string, lot?: string): RecallHit | null {
  const hit = RECALLS.find((r) => gtinMatches(r.gtin, gtin) && (!r.lots || !lot || r.lots.includes(lot) || r.lots.includes("*")));
  if (!hit) return null;
  return { kind: "recall", title: hit.title, detail: hit.detail };
}
