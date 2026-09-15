import { frontUrlFor } from "./pack-gtins";
import { PRODUCTS } from "./products";
import { evaluateDef } from "./evaluate";
import { isDemoBarcode, isDemoBrand } from "./quality";
import type { CatalogCard } from "@/lib/server/catalog";

export function hasProvenFront(title?: string | null, imageUrl?: string | null): boolean {
  if (frontUrlFor(title)) return true;
  if (imageUrl && /front_/i.test(imageUrl) && /openfoodfacts|openbeautyfacts|openpetfoodfacts/i.test(imageUrl)) {
    return true;
  }
  return false;
}

export function withProvenFront<T extends { title: string; brand?: string; imageUrl?: string | null }>(card: T): T {
  const front = frontUrlFor(card.title, card.brand);
  if (!front) return card;
  if (card.imageUrl === front) return card;
  return { ...card, imageUrl: front };
}

export function demoShelf(cards: CatalogCard[], limit = 24): CatalogCard[] {
  const out: CatalogCard[] = [];
  const seen = new Set<string>();
  for (const raw of cards) {
    const card = withProvenFront(raw);
    if (!hasProvenFront(card.title, card.imageUrl)) continue;
    const key = `${card.brand}|${card.title}`.toLowerCase();
    if (seen.has(key) || seen.has(card.barcode)) continue;
    seen.add(key);
    seen.add(card.barcode);
    out.push(card);
    if (out.length >= limit) break;
  }
  return out;
}

/** Memory path for cold Vercel: score only packs that already have a front. */
export function memoryDemoCards(limit = 24): CatalogCard[] {
  const raw: CatalogCard[] = [];
  for (const p of PRODUCTS) {
    if (isDemoBarcode(p.barcode) || isDemoBrand(p.brand)) continue;
    if (!frontUrlFor(p.title, p.brand)) continue;
    const scored = evaluateDef(p);
    raw.push({
      barcode: p.barcode,
      title: p.title,
      brand: p.brand,
      type: p.type,
      categoryPath: p.categoryPath,
      isOrganic: p.isOrganic,
      overallScore: scored.score.overall,
      imageUrl: scored.imageUrl,
      additiveCount: scored.additiveCount,
    });
    if (raw.length >= limit) break;
  }
  return demoShelf(raw, limit);
}
