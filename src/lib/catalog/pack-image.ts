import type { ProductType } from "@/lib/scoring/types";
import { normalizeBarcode } from "@/lib/utils";
import { isDemoBarcode } from "./quality";

const OFF_IMG = /^https:\/\/images\.open(food|beauty|petfood)facts\.org\/images\/products\//i;

export function isGenericStill(url?: string | null): boolean {
  if (!url) return true;
  return url.startsWith("/images/");
}

export function realPackUrl(url?: string | null): string | null {
  if (!url || isGenericStill(url)) return null;
  return url;
}

function rawDigits(barcode?: string | null): string {
  return (barcode || "").replace(/\D/g, "");
}

function isSyntheticBarcode(digits: string): boolean {
  return digits.startsWith("2092");
}

export function localPackUrl(barcode?: string | null): string | null {
  const d = rawDigits(barcode);
  if (!d || isDemoBarcode(d) || isSyntheticBarcode(d) || d.length < 8 || d.length > 14) return null;
  return `/packs/${d}.jpg`;
}

function offHost(type?: ProductType): string {
  if (type === "cosmetic") return "images.openbeautyfacts.org";
  if (type === "pet") return "images.openpetfoodfacts.org";
  return "images.openfoodfacts.org";
}

export function offPath(digits: string): string | null {
  const padded = digits.replace(/\D/g, "").padStart(13, "0");
  if (padded.length !== 13) return null;
  return `${padded.slice(0, 3)}/${padded.slice(3, 6)}/${padded.slice(6, 9)}/${padded.slice(9)}`;
}

function offBase(barcode?: string | null, type?: ProductType): string | null {
  const d = rawDigits(barcode);
  if (!d || isDemoBarcode(d) || isSyntheticBarcode(d) || d.length < 8 || d.length > 14) return null;
  const path = offPath(d);
  if (!path) return null;
  return `https://${offHost(type)}/images/products/${path}`;
}

export function offPackUrl(barcode?: string | null, type?: ProductType): string | null {
  const base = offBase(barcode, type);
  return base ? `${base}/1.100.jpg` : null;
}

export function offPackUrls(
  barcode?: string | null,
  type?: ProductType,
  size: "thumb" | "tile" = "thumb",
): string[] {
  const base = offBase(barcode, type);
  if (!base) return [];
  if (size === "tile") return [`${base}/1.400.jpg`, `${base}/1.jpg`];
  return [`${base}/1.100.jpg`, `${base}/1.400.jpg`, `${base}/1.jpg`];
}

export function packCandidates(
  imageUrl?: string | null,
  barcode?: string | null,
  type?: ProductType,
): string[] {
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u) && !u.startsWith("/images/") && !u.startsWith("/packs/")) out.push(u);
  };
  add(realPackUrl(imageUrl));
  for (const u of offPackUrls(barcode, type, "thumb")) add(u);
  return out;
}

/** Prefer the 200px OFF derivative, then serve through /api/img so Vercel can cache it. */
export function optimizedPackSrc(url?: string | null, size: "thumb" | "tile" | "hero" = "thumb"): string | null {
  if (!url) return null;
  let next = url;
  if (size === "thumb") next = next.replace(/\.400\.jpg$/i, ".200.jpg");
  if (!OFF_IMG.test(next)) return next;
  return `/api/img?u=${encodeURIComponent(next)}`;
}

export function isAllowedPackHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "images.openfoodfacts.org" ||
      host === "images.openbeautyfacts.org" ||
      host === "images.openpetfoodfacts.org"
    );
  } catch {
    return false;
  }
}

export function offProductUrl(barcode: string, type: ProductType): string {
  const host =
    type === "cosmetic"
      ? "world.openbeautyfacts.org"
      : type === "pet"
        ? "world.openpetfoodfacts.org"
        : "world.openfoodfacts.org";
  return `https://${host}/product/${normalizeBarcode(barcode)}`;
}

export function packInitial(title: string): string {
  const t = title.trim();
  if (!t) return "H";
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}
