import type { ProductType } from "@/lib/scoring/types";

export type ShelfRow = {
  barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  categoryPath: string;
  isOrganic: boolean;
  overallScore: number;
  imageUrl: string | null;
  additiveCount: number;
};

function digits(code: string): string {
  return code.replace(/\D/g, "");
}

function packKey(title: string, brand: string): string {
  return `${brand.trim().toLowerCase()}|${title.trim().toLowerCase()}`;
}

/** Collapse GTIN twins and title+brand clones (dense aisle fakes vs photographed SKUs). */
export function dedupeShelf<T extends { barcode: string; title: string; brand: string }>(rows: T[]): T[] {
  const codes = new Set<string>();
  const packs = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const raw = digits(row.barcode);
    if (!raw) continue;
    const padded = raw.length <= 13 ? raw.padStart(13, "0") : raw;
    if (codes.has(raw) || codes.has(padded)) continue;
    const key = packKey(row.title, row.brand);
    if (packs.has(key)) continue;
    codes.add(raw);
    codes.add(padded);
    packs.add(key);
    out.push(row);
  }
  return out;
}
