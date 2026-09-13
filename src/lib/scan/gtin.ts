/** GS1 check-digit, Digital Link, and retail-barcode validation. Camera reads must pass this before lookup. */

export type RetailFormat = "ean-13" | "ean-8" | "upc-a" | "upc-e" | "code-128" | "digital-link";

export type Gs1Scan = {
  gtin: string;
  lot?: string;
  expiry?: string;
  serial?: string;
};

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

/**
 * GS1 Digital Link: a QR that *is* a GTIN, not a marketing URL.
 * https://id.gs1.org/01/05449000000996
 * https://brand.example/01/05449000000996/10/LOT/17/271231
 * Query-string AIs: ?17=271231&10=ABC
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

  const parts = url.pathname.split("/").filter(Boolean);
  let gtin14: string | null = null;
  let lot: string | undefined;
  let expiry: string | undefined;
  let serial: string | undefined;

  for (let i = 0; i < parts.length; i += 1) {
    const ai = parts[i]!;
    const val = parts[i + 1];
    if (!val) continue;
    if (ai === "01" && /^\d{8,14}$/.test(val)) {
      gtin14 = val.padStart(14, "0");
      i += 1;
    } else if (ai === "10") {
      lot = decodeURIComponent(val);
      i += 1;
    } else if (ai === "17" && /^\d{6}$/.test(val)) {
      expiry = val;
      i += 1;
    } else if (ai === "21") {
      serial = decodeURIComponent(val);
      i += 1;
    }
  }

  url.searchParams.forEach((v, k) => {
    if (k === "01" && !gtin14 && /^\d{8,14}$/.test(v)) gtin14 = v.padStart(14, "0");
    if (k === "10" && !lot) lot = v;
    if (k === "17" && !expiry && /^\d{6}$/.test(v)) expiry = v;
    if (k === "21" && !serial) serial = v;
  });

  if (!gtin14) return null;
  const gtin = toLookupGtin(gtin14);
  if (!gtin) return null;
  return { gtin, lot, expiry, serial };
}

/**
 * GS1-128 / GS1 DataBar: AI (01) carries a GTIN-14.
 * Warehouse case codes look like (01)05449000000996 or 0105449000000996.
 */
export function extractGs1Gtin(raw: string): string | null {
  const fromLink = parseGs1DigitalLink(raw);
  if (fromLink) return fromLink.gtin;
  const compact = raw.trim().replace(/[\s()]/g, "").replace(/^\][A-Za-z0-9]{2}/, "");
  let gtin14: string | null = null;
  const marked = compact.match(/(?:^|[^0-9])01(\d{14})/);
  if (marked) gtin14 = marked[1]!;
  else if (/^01\d{14}/.test(compact) && compact.length >= 16) gtin14 = compact.slice(2, 16);
  if (!gtin14) return null;
  return toLookupGtin(gtin14);
}

export function inspectScannedBarcode(raw: string): Gs1Scan | null {
  const fromLink = parseGs1DigitalLink(raw);
  if (fromLink) return fromLink;
  const fromAi = extractGs1Gtin(raw);
  if (fromAi) return { gtin: fromAi };
  const gtin = toLookupGtin(raw.trim());
  return gtin ? { gtin } : null;
}

/**
 * Camera-path gate. Returns a lookup-ready digit string, or null if the read
 * is not a valid retail code. A marketing QR with no GTIN is rejected.
 */
export function validateScannedBarcode(raw: string): string | null {
  return inspectScannedBarcode(raw)?.gtin ?? null;
}

/** YYMMDD from AI (17) → a shop date, or null. */
export function formatGs1Expiry(yymmdd?: string): string | null {
  if (!yymmdd || !/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const year = yy >= 70 ? 1900 + yy : 2000 + yy;
  return `${dd} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mm - 1]} ${year}`;
}
