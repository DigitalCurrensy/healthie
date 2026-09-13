/** GS1 check-digit, Digital Link, and retail-barcode validation. Camera reads must pass this before lookup. */

export type RetailFormat = "ean-13" | "ean-8" | "upc-a" | "upc-e" | "code-128" | "digital-link";

export type Gs1Scan = {
  gtin: string;
  lot?: string;
  expiry?: string;
  serial?: string;
  bestBefore?: string;
  produced?: string;
};

const GS = "\u001d";
const FIXED_AI: Record<string, number> = {
  "01": 14,
  "11": 6,
  "13": 6,
  "15": 6,
  "16": 6,
  "17": 6,
};
const VAR_AI = new Set(["10", "21"]);

export function gtinCheckDigit(body: string): number {
  const digits = body.replace(/\D/g, "");
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const n = Number(digits[digits.length - 1 - i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return (10 - (sum % 10)) % 10;
}

export function hasValidGtinCheck(code: string): boolean {
  const d = code.replace(/\D/g, "");
  if (d.length !== 8 && d.length !== 12 && d.length !== 13 && d.length !== 14) return false;
  if (!/^\d+$/.test(d)) return false;
  const body = d.slice(0, -1);
  return gtinCheckDigit(body) === Number(d[d.length - 1]);
}

function toLookupGtin(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 14 && hasValidGtinCheck(d)) return d.startsWith("0") ? d.slice(1) : d;
  if (d.length === 13 && hasValidGtinCheck(d)) return d;
  if (d.length === 12 && hasValidGtinCheck(d)) return `0${d}`;
  if (d.length === 8 && hasValidGtinCheck(d)) {
    const upca = expandUpce(d);
    if (upca) return upca.length === 12 ? `0${upca}` : upca;
    return d;
  }
  return null;
}

/** Expand UPC-E (8 digits, number-system + 6 data + check) to UPC-A (12). */
export function expandUpce(upce: string): string | null {
  const d = upce.replace(/\D/g, "");
  if (d.length !== 8) return null;
  if (d[0] !== "0" && d[0] !== "1") return null;
  const ns = d[0]!;
  const check = d[7]!;
  const body = d.slice(1, 7);
  const last = body[5]!;
  let upca: string;
  if (last === "0" || last === "1" || last === "2") {
    upca = `${ns}${body.slice(0, 2)}${last}0000${body.slice(2, 5)}`;
  } else if (last === "3") {
    upca = `${ns}${body.slice(0, 3)}00000${body.slice(3, 5)}`;
  } else if (last === "4") {
    upca = `${ns}${body.slice(0, 4)}00000${body[4]}`;
  } else {
    upca = `${ns}${body.slice(0, 5)}0000${last}`;
  }
  const full = `${upca}${check}`;
  return hasValidGtinCheck(full) ? full : null;
}

export function detectRetailFormat(code: string): RetailFormat | null {
  if (parseGs1DigitalLink(code)) return "digital-link";
  const d = code.replace(/\D/g, "");
  if (d.length === 13 && hasValidGtinCheck(d)) return "ean-13";
  if (d.length === 12 && hasValidGtinCheck(d)) return "upc-a";
  if (d.length === 8 && hasValidGtinCheck(d)) {
    if (expandUpce(d)) return "upc-e";
    return "ean-8";
  }
  if (d.length === 14 && hasValidGtinCheck(d)) return "ean-13";
  return null;
}

function applyAi(out: Record<string, string>, ai: string, val: string) {
  if (!val) return;
  out[ai] = decodeURIComponent(val);
}

function scanFromAis(ais: Record<string, string>): Gs1Scan | null {
  const rawGtin = ais["01"];
  if (!rawGtin) return null;
  const gtin = toLookupGtin(rawGtin.padStart(14, "0"));
  if (!gtin) return null;
  const bestBefore = ais["15"] || ais["16"];
  const expiry = ais["17"] || bestBefore;
  return {
    gtin,
    lot: ais["10"],
    expiry,
    serial: ais["21"],
    bestBefore,
    produced: ais["11"] || ais["13"],
  };
}

/** Parenthetical element string: (01)0544…(17)271231(10)LOT */
export function parseGs1ElementString(raw: string): Gs1Scan | null {
  const text = raw.trim();
  const marked = [...text.matchAll(/\((\d{2,4})\)([^()]+)/g)];
  if (marked.length > 0) {
    const ais: Record<string, string> = {};
    for (const m of marked) applyAi(ais, m[1]!, m[2]!.replace(new RegExp(GS, "g"), "").trim());
    return scanFromAis(ais);
  }
  let compact = text.replace(/[\s()]/g, "").replace(/^\][A-Za-z0-9]{2}/, "");
  if (!compact) return null;
  const ais: Record<string, string> = {};
  let i = 0;
  while (i < compact.length - 1) {
    if (compact[i] === GS) {
      i += 1;
      continue;
    }
    const ai = compact.slice(i, i + 2);
    const fixed = FIXED_AI[ai];
    if (fixed) {
      const val = compact.slice(i + 2, i + 2 + fixed);
      if (val.length < fixed) break;
      applyAi(ais, ai, val);
      i += 2 + fixed;
      continue;
    }
    if (VAR_AI.has(ai)) {
      i += 2;
      let val = "";
      while (i < compact.length && compact[i] !== GS) {
        val += compact[i];
        i += 1;
      }
      applyAi(ais, ai, val);
      if (compact[i] === GS) i += 1;
      continue;
    }
    break;
  }
  return scanFromAis(ais);
}

/**
 * GS1 Digital Link URI 1.2: a QR that *is* a product code, not a marketing URL.
 * https://id.gs1.org/01/05449000000996
 * https://brand.example/01/05449000000996/10/LOT/17/271231
 * Query-string AIs: ?17=271231&10=ABC
 * Dates: 17 use-by, 15 best-before, 16 sell-by, 11 production, 13 pack.
 */
export function parseGs1DigitalLink(raw: string): Gs1Scan | null {
  const text = raw.trim();
  if (!text) return null;
  const looksLikeUri =
    /^https?:\/\//i.test(text) ||
    /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(text) ||
    /\/01\/\d{8,14}/.test(text);
  if (!looksLikeUri) return null;

  let url: URL;
  try {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`;
    url = new URL(href);
  } catch {
    return null;
  }

  const ais: Record<string, string> = {};
  const parts = url.pathname.split("/").filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    const ai = parts[i]!;
    const val = parts[i + 1];
    if (!val) continue;
    if (ai === "01" && /^\d{8,14}$/.test(val)) {
      applyAi(ais, "01", val.padStart(14, "0"));
      i += 1;
    } else if (VAR_AI.has(ai) || FIXED_AI[ai]) {
      applyAi(ais, ai, val);
      i += 1;
    }
  }

  url.searchParams.forEach((v, k) => {
    if ((k === "01" || VAR_AI.has(k) || FIXED_AI[k]) && v) applyAi(ais, k, k === "01" ? v.padStart(14, "0") : v);
  });

  return scanFromAis(ais);
}

export function extractGs1Gtin(raw: string): string | null {
  return parseGs1DigitalLink(raw)?.gtin ?? parseGs1ElementString(raw)?.gtin ?? null;
}

export function inspectScannedBarcode(raw: string): Gs1Scan | null {
  const fromLink = parseGs1DigitalLink(raw);
  if (fromLink) return fromLink;
  const fromEl = parseGs1ElementString(raw);
  if (fromEl) return fromEl;
  const gtin = toLookupGtin(raw.trim());
  return gtin ? { gtin } : null;
}

/** Camera-path gate. Marketing QR with no product code is rejected. */
export function validateScannedBarcode(raw: string): string | null {
  return inspectScannedBarcode(raw)?.gtin ?? null;
}

/** YYMMDD from a date AI → a shop date, or null. */
export function formatGs1Expiry(yymmdd?: string): string | null {
  if (!yymmdd || !/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const year = yy >= 70 ? 1900 + yy : 2000 + yy;
  return new Date(year, mm - 1, dd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
