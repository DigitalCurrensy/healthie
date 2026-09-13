import type { Nutrition, ProductType } from "@/lib/scoring/types";

const JUNK_TITLE =
  /^(test product(\s+product)?|scanned (product|label|pack)|unknown|n\/a|null|product|sample)$/i;

export function nutritionIsPresent(n?: Nutrition | null): boolean {
  if (!n) return false;
  return (
    n.energyKj > 0 ||
    n.sugars > 0 ||
    n.saturatedFat > 0 ||
    n.salt > 0 ||
    n.protein > 0 ||
    n.fiber > 0 ||
    (n.fruitsVegetables ?? 0) > 0 ||
    (n.fat ?? 0) > 0
  );
}

export function recordIsScorable(input: {
  title?: string;
  type: ProductType;
  ingredientsText?: string;
  ingredientCount?: number;
  nutrition?: Nutrition | null;
  isWater?: boolean;
}): boolean {
  const title = (input.title || "").trim();
  if (title.length < 3) return false;
  if (JUNK_TITLE.test(title)) return false;
  if (/test product/i.test(title)) return false;

  const listLen = (input.ingredientsText || "").trim().length;
  const hasList = listLen >= 4 || (input.ingredientCount ?? 0) > 0;
  if (input.type === "cosmetic" || input.type === "pet") return hasList;
  if (input.isWater && hasList) return true;
  return hasList || nutritionIsPresent(input.nutrition);
}

export function isDemoBarcode(barcode: string): boolean {
  const d = barcode.replace(/\D/g, "");
  return d.startsWith("85001083") || d.startsWith("ocr");
}

export function isDemoBrand(brand: string): boolean {
  return /grove atelier|healthie pantry|maison bloom/i.test(brand);
}
