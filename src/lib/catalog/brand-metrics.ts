import { brandSlug } from "./brands";
import { scoreBand, type ScoreBand } from "@/lib/utils";

export type BrandMetrics = {
  slug: string;
  name: string;
  count: number;
  avg: number;
  bands: Record<ScoreBand, number>;
};

export function metricsFromCards(
  cards: { brand: string; overallScore: number }[],
): BrandMetrics[] {
  const map = new Map<string, { name: string; scores: number[] }>();
  for (const c of cards) {
    const name = c.brand.trim() || "Unknown";
    const slug = brandSlug(name);
    const cur = map.get(slug);
    if (!cur) map.set(slug, { name, scores: [c.overallScore] });
    else cur.scores.push(c.overallScore);
  }
  return [...map.entries()]
    .map(([slug, v]) => {
      const bands: Record<ScoreBand, number> = { excellent: 0, good: 0, poor: 0, bad: 0 };
      for (const s of v.scores) bands[scoreBand(s)] += 1;
      return {
        slug,
        name: v.name,
        count: v.scores.length,
        avg: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
        bands,
      };
    })
    .sort((a, b) => b.avg - a.avg || b.count - a.count || a.name.localeCompare(b.name));
}

export function shopAverage(cards: { overallScore: number }[]): number {
  if (cards.length === 0) return 0;
  return Math.round(cards.reduce((s, c) => s + c.overallScore, 0) / cards.length);
}

export function rankedHouses(all: BrandMetrics[], min = 3): BrandMetrics[] {
  return all.filter((b) => b.count >= min);
}

export function brandPlace(ranked: BrandMetrics[], slug: string): { place: number; of: number } | null {
  const i = ranked.findIndex((b) => b.slug === slug);
  if (i < 0) return null;
  return { place: i + 1, of: ranked.length };
}

export function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
