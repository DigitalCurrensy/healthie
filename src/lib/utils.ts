import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeBarcode(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12) return `0${digits}`;
  if (digits.length === 14 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Every GTIN shape a pack might print — UPC-A, EAN-13, GTIN-14. */
export function barcodeVariants(raw: string): string[] {
  const digits = raw.replace(/\D/g, "");
  const out: string[] = [];
  const add = (value: string) => {
    if (value.length >= 8 && value.length <= 14 && !out.includes(value)) out.push(value);
  };
  add(digits);
  add(normalizeBarcode(digits));
  if (digits.length === 13 && digits.startsWith("0")) add(digits.slice(1));
  if (digits.length === 14) {
    add(digits.slice(1));
    if (digits.startsWith("00")) add(digits.slice(2));
  }
  if (digits.length === 12) add(digits);
  return out;
}

export type ScoreBand = "excellent" | "good" | "poor" | "bad";

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "excellent";
  if (score >= 50) return "good";
  if (score >= 25) return "poor";
  return "bad";
}

export function bandLabel(band: ScoreBand): string {
  switch (band) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "poor":
      return "Poor";
    case "bad":
      return "Avoid";
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
