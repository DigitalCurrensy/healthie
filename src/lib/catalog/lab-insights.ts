import { PRODUCTS } from "./products";
import { evaluateDef } from "./evaluate";
import { AISLES } from "./aisles";
import { INGREDIENTS } from "./ingredients";
import { scoreBand } from "@/lib/utils";
import { brandSlug } from "./brands";

export type LabCard = {
  barcode: string;
  title: string;
  brand: string;
  score: number;
  categoryPath: string;
  type: "food" | "cosmetic" | "pet";
  isOrganic: boolean;
};

export type LabAisleRow = {
  slug: string;
  path: string;
  title: string;
  n: number;
  avg: number;
  best: LabCard;
  worst: LabCard;
};

export type LabExtra = {
  id: string;
  name: string;
  n: number;
  riskClass: string;
};

export type LabSwap = {
  from: LabCard;
  to: LabCard;
  lift: number;
};

export type LabBrandRow = {
  slug: string;
  name: string;
  n: number;
  avg: number;
};

export type LabReport = {
  productCount: number;
  brandCount: number;
  aisleCount: number;
  avgScore: number;
  nova4Pct: number;
  highRiskPct: number;
  organicAvg: number | null;
  conventionalAvg: number | null;
  organicDelta: number | null;
  bands: { key: string; label: string; n: number }[];
  aisles: LabAisleRow[];
  extras: LabExtra[];
  swaps: LabSwap[];
  foodAvg: number | null;
  cosmeticAvg: number | null;
  petAvg: number | null;
  brandsBest: LabBrandRow[];
  brandsTreat: LabBrandRow[];
};

function card(p: ReturnType<typeof evaluateDef>): LabCard {
  return {
    barcode: p.barcode,
    title: p.title,
    brand: p.brand,
    score: p.score.overall,
    categoryPath: p.categoryPath,
    type: p.type,
    isOrganic: p.isOrganic,
  };
}

let cached: LabReport | null = null;

export function labReport(): LabReport {
  if (cached) return cached;
  const rows = PRODUCTS.map((d) => evaluateDef(d));
  const avg = Math.round(rows.reduce((s, p) => s + p.score.overall, 0) / rows.length);
  const nova4 = rows.filter((p) => p.type === "food" && p.novaGroup === 4);
  const food = rows.filter((p) => p.type === "food");
  const high = rows.filter((p) => p.ingredients.some((i) => i.riskClass === "high"));
  const organic = rows.filter((p) => p.isOrganic);
  const conventional = rows.filter((p) => !p.isOrganic);
  const mean = (list: typeof rows) =>
    list.length ? Math.round(list.reduce((s, p) => s + p.score.overall, 0) / list.length) : null;

  const bands = [
    { key: "excellent", label: "Excellent", n: rows.filter((p) => scoreBand(p.score.overall) === "excellent").length },
    { key: "good", label: "Good", n: rows.filter((p) => scoreBand(p.score.overall) === "good").length },
    { key: "poor", label: "Poor", n: rows.filter((p) => scoreBand(p.score.overall) === "poor").length },
    { key: "bad", label: "Avoid", n: rows.filter((p) => scoreBand(p.score.overall) === "bad").length },
  ];

  const byAisle = new Map<string, typeof rows>();
  for (const p of rows) {
    const list = byAisle.get(p.categoryPath) ?? [];
    list.push(p);
    byAisle.set(p.categoryPath, list);
  }
  const aisles: LabAisleRow[] = AISLES.map((a) => {
    const list = byAisle.get(a.path) ?? [];
    if (!list.length) return null;
    const sorted = list.slice().sort((x, y) => x.score.overall - y.score.overall);
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];
    return {
      slug: a.slug,
      path: a.path,
      title: a.title,
      n: list.length,
      avg: mean(list) ?? 0,
      best: card(best),
      worst: card(worst),
    };
  }).filter((x): x is LabAisleRow => Boolean(x));
  aisles.sort((a, b) => a.avg - b.avg);

  const extraCount = new Map<string, number>();
  for (const p of rows) {
    for (const ing of p.ingredients) {
      if (!ing.isAdditive) continue;
      if (ing.riskClass === "none") continue;
      extraCount.set(ing.id, (extraCount.get(ing.id) ?? 0) + 1);
    }
  }
  const extras: LabExtra[] = [...extraCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, n]) => {
      const def = INGREDIENTS.find((i) => i.id === id);
      return { id, name: def?.name ?? id, n, riskClass: def?.riskClass ?? "low" };
    });

  const swaps: LabSwap[] = [];
  for (const row of aisles) {
    if (row.best.score - row.worst.score >= 25) {
      swaps.push({ from: row.worst, to: row.best, lift: row.best.score - row.worst.score });
    }
  }
  swaps.sort((a, b) => b.lift - a.lift);

  const typeMean = (t: LabCard["type"]) => mean(rows.filter((p) => p.type === t));

  const houseMap = new Map<string, { name: string; scores: number[] }>();
  for (const p of rows) {
    const slug = brandSlug(p.brand);
    const cur = houseMap.get(slug);
    if (!cur) houseMap.set(slug, { name: p.brand, scores: [p.score.overall] });
    else cur.scores.push(p.score.overall);
  }
  const houses: LabBrandRow[] = [...houseMap.entries()]
    .map(([slug, v]) => ({
      slug,
      name: v.name,
      n: v.scores.length,
      avg: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
    }))
    .filter((h) => h.n >= 3)
    .sort((a, b) => b.avg - a.avg || b.n - a.n);

  cached = {
    productCount: rows.length,
    brandCount: new Set(rows.map((p) => p.brand)).size,
    aisleCount: aisles.length,
    avgScore: avg,
    nova4Pct: food.length ? Math.round((nova4.length / food.length) * 100) : 0,
    highRiskPct: Math.round((high.length / rows.length) * 100),
    organicAvg: mean(organic),
    conventionalAvg: mean(conventional),
    organicDelta:
      mean(organic) != null && mean(conventional) != null ? (mean(organic) as number) - (mean(conventional) as number) : null,
    bands,
    aisles,
    extras,
    swaps: swaps.slice(0, 6),
    foodAvg: typeMean("food"),
    cosmeticAvg: typeMean("cosmetic"),
    petAvg: typeMean("pet"),
    brandsBest: houses.slice(0, 8),
    brandsTreat: [...houses].reverse().slice(0, 8),
  };
  return cached;
}
