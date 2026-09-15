import type { ProductType } from "@/lib/scoring/types";
import { normalizeBarcode } from "@/lib/utils";
import { isDemoBarcode } from "./quality";

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

/** 1.100.jpg ~2KB for 64px rows. 1.400.jpg ~20KB for tiles. 1.jpg is the full pack (~300KB+). */
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
