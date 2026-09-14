import type { ProductType } from "@/lib/scoring/types";
import { normalizeBarcode } from "@/lib/utils";
import { isDemoBarcode } from "./quality";

const GENERIC_STILLS = [
  "/images/beverages.jpg",
  "/images/breakfast.jpg",
  "/images/dairy.jpg",
  "/images/spreads.jpg",
  "/images/snacks.jpg",
  "/images/chocolate.jpg",
  "/images/staples.jpg",
  "/images/condiments.jpg",
  "/images/skincare.jpg",
  "/images/hair.jpg",
  "/images/sun.jpg",
  "/images/body.jpg",
  "/images/pet.jpg",
  "/images/frozen.jpg",
  "/images/baby.jpg",
  "/images/bakery.jpg",
  "/images/coffee.jpg",
  "/images/protein.jpg",
  "/images/meat.jpg",
  "/images/candy.jpg",
  "/images/makeup.jpg",
  "/images/oral.jpg",
  "/images/alcohol.jpg",
  "/images/vitamins.jpg",
  "/images/household.jpg",
  "/images/seafood.jpg",
  "/images/icecream.jpg",
  "/images/hero.jpg",
  "/images/guides.jpg",
];

export function isGenericStill(url?: string | null): boolean {
  if (!url) return true;
  if (url.startsWith("/images/")) return true;
  return GENERIC_STILLS.includes(url);
}

export function isSyntheticGtin(barcode?: string | null): boolean {
  const d = normalizeBarcode(barcode || "");
  return d.startsWith("2092");
}

export function realPackUrl(url?: string | null): string | null {
  if (!url || isGenericStill(url)) return null;
  return url;
}

export function localPackUrl(barcode?: string | null): string | null {
  if (!barcode) return null;
  const d = normalizeBarcode(barcode);
  if (isDemoBarcode(d) || isSyntheticGtin(d) || d.length < 8 || d.length > 14) return null;
  return `/packs/${d}.jpg`;
}

const TONE: Record<string, string> = {
  beverages: "pack-beverages",
  breakfast: "pack-breakfast",
  dairy: "pack-dairy",
  spreads: "pack-spreads",
  snacks: "pack-snacks",
  chocolate: "pack-chocolate",
  staples: "pack-staples",
  condiments: "pack-condiments",
  skincare: "pack-skincare",
  hair: "pack-hair",
  sun: "pack-sun",
  body: "pack-body",
  pet: "pack-pet",
  frozen: "pack-frozen",
  baby: "pack-baby",
  bakery: "pack-bakery",
  coffee: "pack-coffee",
  protein: "pack-protein",
  meat: "pack-meat",
  candy: "pack-candy",
  makeup: "pack-makeup",
  oral: "pack-oral",
  alcohol: "pack-alcohol",
  vitamins: "pack-vitamins",
  household: "pack-household",
  seafood: "pack-seafood",
  icecream: "pack-icecream",
};

export function packFaceStyle(barcode?: string | null): { background: string; color: string } {
  const d = (barcode || "0").replace(/\D/g, "") || "0";
  let h = 0;
  for (let i = 0; i < d.length; i += 1) h = (h * 33 + Number(d[i])) % 360;
  const h2 = (h + 48 + (Number(d.slice(-2)) || 0) * 3) % 360;
  return {
    background: `linear-gradient(145deg, hsl(${h} 18% 82%), hsl(${h2} 14% 74%))`,
    color: `hsl(${h} 18% 22%)`,
  };
}

function hueFromBarcode(barcode?: string | null): { h: number; h2: number } {
  const d = (barcode || "0").replace(/\D/g, "") || "0";
  let h = 0;
  for (let i = 0; i < d.length; i += 1) h = (h * 33 + Number(d[i])) % 360;
  return { h, h2: (h + 48 + (Number(d.slice(-2)) || 0) * 3) % 360 };
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
}

/** Deterministic SVG specimen so a missing SKU still has an image, not letters. */
export function generatedPackUri(title: string, brand: string, barcode?: string | null): string {
  const { h, h2 } = hueFromBarcode(barcode);
  const name = xmlEscape((title || "Healthie").slice(0, 32));
  const house = xmlEscape((brand || "").slice(0, 24));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${h} 16% 78%)"/>
        <stop offset="1" stop-color="hsl(${h2} 12% 70%)"/>
      </linearGradient>
    </defs>
    <rect width="320" height="400" fill="url(#g)"/>
    <rect x="18" y="18" width="284" height="364" fill="none" stroke="hsl(${h} 18% 28%)" stroke-opacity="0.22"/>
    <text x="28" y="318" fill="hsl(${h} 18% 18%)" font-family="Georgia, 'Times New Roman', serif" font-size="22">${name}</text>
    <text x="28" y="348" fill="hsl(${h} 10% 32%)" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${house}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function packToneClass(categoryPath?: string, type?: ProductType): string {
  if (categoryPath && TONE[categoryPath]) return TONE[categoryPath];
  if (type === "cosmetic") return "pack-skincare";
  if (type === "pet") return "pack-pet";
  return "pack-default";
}

function offHost(type?: ProductType): string {
  if (type === "cosmetic") return "images.openbeautyfacts.org";
  if (type === "pet") return "images.openpetfoodfacts.org";
  return "images.openfoodfacts.org";
}

function offPath(digits: string): string | null {
  const padded = digits.padStart(13, "0");
  if (padded.length !== 13) return null;
  return `${padded.slice(0, 3)}/${padded.slice(3, 6)}/${padded.slice(6, 9)}/${padded.slice(9)}`;
}

const OFF_FILES = ["front_small.jpg", "front_en.400.jpg"] as const;

export function offPackUrl(barcode?: string | null, type?: ProductType): string | null {
  const urls = offPackUrls(barcode, type);
  return urls[0] ?? null;
}

export function offPackUrls(barcode?: string | null, type?: ProductType): string[] {
  if (!barcode || isDemoBarcode(barcode) || isSyntheticGtin(barcode)) return [];
  const d = normalizeBarcode(barcode);
  if (d.length < 8 || d.length > 14) return [];
  const path = offPath(d);
  if (!path) return [];
  return OFF_FILES.map((file) => `https://${offHost(type)}/images/products/${path}/${file}`);
}

export function packCandidates(
  imageUrl?: string | null,
  barcode?: string | null,
  type?: ProductType,
): string[] {
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u)) out.push(u);
  };
  add(realPackUrl(imageUrl));
  add(localPackUrl(barcode));
  add(offPackUrls(barcode, type)[0] ?? null);
  return out.slice(0, 2);
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
