import { frontUrlFor } from "./pack-gtins";
import type { CatalogCard } from "@/lib/server/catalog";

/** A pack is demo-safe only when we have a photographed front. */
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
