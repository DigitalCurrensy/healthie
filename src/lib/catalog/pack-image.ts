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

/** Pack shots we ship so the demo doesn’t wait on Open Food Facts CDN. */
export function isGenericStill(url?: string | null): boolean {
  if (!url) return true;
  if (url.startsWith("/images/")) return true;
  return GENERIC_STILLS.includes(url);
}

export function realPackUrl(url?: string | null): string | null {
  if (!url || isGenericStill(url)) return null;
  return url;
}

export function localPackUrl(barcode?: string | null): string | null {
  if (!barcode) return null;
  const d = normalizeBarcode(barcode);
  if (isDemoBarcode(d) || d.length < 8 || d.length > 14) return null;
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

const OFF_FILES = ["front_small.jpg", "front.400.jpg", "front_en.400.jpg"] as const;

export function offPackUrl(barcode?: string | null, type?: ProductType): string | null {
  const urls = offPackUrls(barcode, type);
  return urls[0] ?? null;
}

export function offPackUrls(barcode?: string | null, type?: ProductType): string[] {
  if (!barcode || isDemoBarcode(barcode)) return [];
  const d = normalizeBarcode(barcode);
  if (d.length < 8 || d.length > 14) return [];
  const path = offPath(d);
  if (!path) return [];
  const hosts = [offHost(type)];
  if (type && type !== "food") hosts.push("images.openfoodfacts.org");
  const out: string[] = [];
  for (const host of hosts) {
    for (const file of OFF_FILES) {
      out.push(`https://${host}/images/products/${path}/${file}`);
    }
  }
  return out;
}

export function packCandidates(imageUrl?: string | null, barcode?: string | null, type?: ProductType): string[] {
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u)) out.push(u);
  };
  add(realPackUrl(imageUrl));
  add(localPackUrl(barcode));
  for (const u of offPackUrls(barcode, type)) add(u);
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
