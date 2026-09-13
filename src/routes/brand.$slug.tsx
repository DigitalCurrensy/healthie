import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { ProductCard } from "@/components/lumen/product-card";
import { PageHeader } from "@/components/lumen/empty";
import { ScoreRing, BandLegend } from "@/components/lumen/score-ring";
import { Button } from "@/components/ui/button";
import { loadBrand, loadBrandWorld } from "@/lib/server/functions";
import { typeLabel, brandVerdict, brandVsShop, bandLabel } from "@/lib/copy";
import { ordinal } from "@/lib/catalog/brand-metrics";
import { scoreBand } from "@/lib/utils";
import type { CatalogCard } from "@/lib/server/catalog";

export const Route = createFileRoute("/brand/$slug")({
  loader: ({ params }) => loadBrand({ data: { slug: params.slug } }),
  component: BrandPage,
});

function BrandPage() {
  const { brand, local, shopAvg, rank, metrics } = Route.useLoaderData();
  const [extra, setExtra] = useState<CatalogCard[]>([]);

  useEffect(() => {
    if (!brand) return;
    void loadBrandWorld({ data: { name: brand.name } }).then(setExtra);
  }, [brand]);

  if (!brand) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold">Brand not found</h1>
        <Button asChild className="mt-6">
          <Link to="/catalog">Back to aisles</Link>
        </Button>
      </AppShell>
    );
  }

  const rows = local;
  const avg = metrics?.avg ?? (rows.length === 0 ? null : Math.round(rows.reduce((s, p) => s + p.overallScore, 0) / rows.length));
  const best = rows.reduce<(typeof rows)[number] | null>((a, b) => (!a || a.overallScore >= b.overallScore ? a ?? b : b), null);
  const worst = rows.reduce<(typeof rows)[number] | null>((a, b) => (!a || a.overallScore <= b.overallScore ? a ?? b : b), null);
  const bands = metrics?.bands;

  return (
    <AppShell>
      <PageHeader
        kicker="Brand"
        title={brand.name}
        body={avg != null ? brandVerdict(avg, rows.length || metrics?.count || 0) : `${rows.length} on our shelves. No brand pays for a better number.`}
      />

      {avg != null ? (
        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
          <ScoreRing score={avg} size={96} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-bold tracking-[-0.04em]">
              {bandLabel(scoreBand(avg))} house
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{brandVsShop(avg, shopAvg)}</p>
            {rank ? (
              <p className="mt-1 text-[15px] leading-relaxed text-muted">
                {ordinal(rank.place)} of {rank.of} houses with 3 or more packs. Higher is cleaner.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Too few packs here to rank against other houses.</p>
            )}
            <p className="mt-2 text-sm text-muted">{brand.types.map((t) => typeLabel(t as "food" | "cosmetic" | "pet")).join(" · ")}</p>
          </div>
        </section>
      ) : null}

      {bands && rows.length > 1 ? (
        <section className="mt-6">
          <h2 className="font-display text-lg font-bold">How the house scores</h2>
          <ul className="mt-3 space-y-2">
            {(
              [
                ["excellent", "Excellent", "bg-score-excellent"],
                ["good", "Good", "bg-score-good"],
                ["poor", "Poor", "bg-score-poor"],
                ["bad", "Avoid", "bg-score-bad"],
              ] as const
            ).map(([key, label, cls]) => {
              const n = bands[key];
              const pct = rows.length ? Math.round((n / (metrics?.count || rows.length)) * 100) : 0;
              return (
                <li key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{label}</span>
                    <span className="tabular-nums text-muted">
                      {n} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className={`h-full ${cls}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <BandLegend />
          </div>
        </section>
      ) : null}

      {best && worst && rows.length > 1 ? (
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            to="/product/$barcode"
            params={{ barcode: best.barcode }}
            className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
          >
            <p className="kicker">Best in house</p>
            <p className="mt-1 font-semibold">{best.title}</p>
            <p className="text-sm text-muted tabular-nums">{best.overallScore}/100</p>
          </Link>
          <Link
            to="/product/$barcode"
            params={{ barcode: worst.barcode }}
            className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]"
          >
            <p className="kicker">Needs a swap</p>
            <p className="mt-1 font-semibold">{worst.title}</p>
            <p className="text-sm text-muted tabular-nums">{worst.overallScore}/100</p>
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        {rows
          .slice()
          .sort((a, b) => b.overallScore - a.overallScore)
          .map((p) => (
            <ProductCard
              key={p.barcode}
              barcode={p.barcode}
              title={p.title}
              brand={p.brand}
              type={p.type}
              isOrganic={p.isOrganic}
              score={p.overallScore}
              imageUrl={p.imageUrl}
              categoryPath={p.categoryPath}
            />
          ))}
      </div>
      {extra.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Also scanned worldwide</h2>
          <p className="mt-1 text-sm text-muted">Same scoring rules. Open one to read the pack the Healthie way.</p>
          <div className="mt-4 flex flex-col gap-2">
            {extra.map((p) => (
              <ProductCard
                key={p.barcode}
                barcode={p.barcode}
                title={p.title}
                brand={p.brand}
                type={p.type}
                isOrganic={p.isOrganic}
                score={p.overallScore}
                imageUrl={p.imageUrl}
                categoryPath={p.categoryPath}
              />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
