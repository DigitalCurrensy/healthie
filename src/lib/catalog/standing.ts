import { PRODUCTS } from "./products";
import { evaluateDef } from "./evaluate";
import { aisleFor } from "./aisles";
import type { EvaluatedProduct } from "./evaluate";

export type AisleStanding = {
  aisle: string;
  of: number;
  better: number;
  line: string;
};

type ShelfRow = { barcode: string; slug: string; overall: number };

let shelfCache: ShelfRow[] | null = null;

function shelf(): ShelfRow[] {
  if (shelfCache) return shelfCache;
  shelfCache = PRODUCTS.map((p) => {
    const scored = evaluateDef(p);
    const aisle = aisleFor(p.categoryPath);
    return {
      barcode: p.barcode,
      slug: aisle?.slug ?? p.categoryPath,
      overall: scored.score.overall,
    };
  });
  return shelfCache;
}

/** Where this pack sits among Healthie shelves in the same aisle. World-pantry packs still rank against the aisle. */
export function aisleStanding(product: EvaluatedProduct): AisleStanding | null {
  const aisle = aisleFor(product.categoryPath);
  const slug = aisle?.slug ?? product.categoryPath;
  const peers = shelf().filter((s) => s.slug === slug);
  if (peers.length < 4) return null;
  const better = peers.filter((s) => s.overall > product.score.overall).length;
  const of = peers.length;
  const name = aisle?.title ?? "this aisle";
  const worseShare = Math.round((better / of) * 10);
  let line: string;
  if (product.score.overall >= 75) {
    line = `Among the keeps in ${name} — ${of} packs on our shelves.`;
  } else if (better === 0) {
    line = `The strongest pack we stock in ${name}.`;
  } else if (worseShare >= 8) {
    line = `Worse than ${worseShare} in 10 packs in ${name}. The swap is on this aisle.`;
  } else if (worseShare >= 5) {
    line = `Middle of ${name}. ${better} of ${of} on our shelves score higher.`;
  } else {
    line = `Better than most of ${name} — ${of - better} of ${of} sit at or below this number.`;
  }
  return { aisle: name, of, better, line };
}
