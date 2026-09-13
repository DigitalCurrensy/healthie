import { PRODUCTS, type ProductDef } from "./products";

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP = new Set(["the", "and", "with", "for", "from", "pack", "oz", "ct", "count"]);

function tokens(s: string): string[] {
  return fold(s)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Match a front-of-pack name to a catalog SKU when the barcode never made it into the photo. */
export function matchCatalogName(title: string, brand?: string): ProductDef | null {
  const q = fold(title);
  if (q.length < 4) return null;
  const qTokens = tokens(title);
  const brandFold = brand ? fold(brand) : "";
  let best: { def: ProductDef; score: number } | null = null;

  for (const p of PRODUCTS) {
    const t = fold(p.title);
    const b = fold(p.brand);
    let score = 0;
    if (t === q) score = 120;
    else if (t.includes(q) || q.includes(t)) score = 90;
    else {
      const tTokens = tokens(p.title);
      if (qTokens.length === 0 || tTokens.length === 0) continue;
      const set = new Set(tTokens);
      const hit = qTokens.filter((w) => set.has(w)).length;
      const coverage = hit / Math.max(qTokens.length, 2);
      if (hit >= 2 && coverage >= 0.5) score = Math.round(50 + coverage * 40);
    }
    if (brandFold && (b.includes(brandFold) || brandFold.includes(b))) score += 12;
    if (score > (best?.score ?? 0)) best = { def: p, score };
  }

  return best && best.score >= 55 ? best.def : null;
}
