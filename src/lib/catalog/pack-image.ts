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
const LOCAL_PACKS = new Set([
  "5449000000996",
  "012000001258",
  "3017620422003",
  "3274080005003",
  "099482513931",
  "786162003016",
  "0810589032602",
  "009800830039",
  "8002270014901",
  "028400064057",
  "036632014016",
]);

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
  if (LOCAL_PACKS.has(d) || LOCAL_PACKS.has(barcode)) return `/packs/${LOCAL_PACKS.has(d) ? d : barcode}.jpg`;
  return null;
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

export function packToneClass(categoryPath?: string, type?: ProductType): string {
  if (categoryPath && TONE[categoryPath]) return TONE[categoryPath];
  if (type === "cosmetic") return "pack-skincare";
  if (type === "pet") return "pack-pet";
  return "pack-default";
}

export function offPackUrl(barcode?: string | null): string | null {
  if (!barcode) return null;
  if (isDemoBarcode(barcode)) return null;
  const d = normalizeBarcode(barcode);
  if (d.length < 8 || d.length > 14) return null;
  const padded = d.padStart(13, "0");
  const path = `${padded.slice(0, 3)}/${padded.slice(3, 6)}/${padded.slice(6, 9)}/${padded.slice(9)}`;
  return `https://images.openfoodfacts.org/images/products/${path}/front_small.jpg`;
}

export function packCandidates(imageUrl?: string | null, barcode?: string | null): string[] {
  const out: string[] = [];
  const add = (u: string | null) => {
    if (u && !out.includes(u)) out.push(u);
  };
  add(realPackUrl(imageUrl));
  add(localPackUrl(barcode));
  add(offPackUrl(barcode));
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
