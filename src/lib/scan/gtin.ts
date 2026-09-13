/** GS1 check-digit and retail-barcode validation. Camera reads must pass this before lookup. */

export type RetailFormat = "ean-13" | "ean-8" | "upc-a" | "upc-e" | "code-128";

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
 * Camera-path gate. Returns a lookup-ready digit string, or null if the read
 * is not a valid retail code. Manual keypad entry does not use this gate.
 */
export function validateScannedBarcode(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) {
    const upca = expandUpce(digits);
    if (upca && hasValidGtinCheck(upca)) {
      return upca.length === 12 ? `0${upca}` : upca;
    }
    if (hasValidGtinCheck(digits)) return digits;
    return null;
  }
  if (digits.length === 12 && hasValidGtinCheck(digits)) return `0${digits}`;
  if (digits.length === 13 && hasValidGtinCheck(digits)) return digits;
  if (digits.length === 14 && hasValidGtinCheck(digits)) {
    return digits.startsWith("0") ? digits.slice(1) : digits;
  }
  return null;
}
