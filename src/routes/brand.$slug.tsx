import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { ProductCard } from "@/components/lumen/product-card";
import { PageHeader } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { loadBrand, loadBrandWorld } from "@/lib/server/functions";
import { typeLabel } from "@/lib/copy";
import type { CatalogCard } from "@/lib/server/catalog";

export const Route = createFileRoute("/brand/$slug")({
  loader: ({ params }) => loadBrand({ data: { slug: params.slug } }),
  component: BrandPage,
});

function BrandPage() {
  const { brand, local } = Route.useLoaderData();
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
  const avg =
    rows.length === 0 ? null : Math.round(rows.reduce((s, p) => s + p.overallScore, 0) / rows.length);
  const best = rows.reduce<(typeof rows)[number] | null>((a, b) => (!a || a.overallScore >= b.overallScore ? a ?? b : b), null);
  const worst = rows.reduce<(typeof rows)[number] | null>((a, b) => (!a || a.overallScore <= b.overallScore ? a ?? b : b), null);

  return (
    <AppShell>
      <PageHeader
        kicker="Brand"
        title={brand.name}
        body={`${rows.length} on our shelves${avg != null ? ` · average ${avg}/100` : ""}. Open Food Facts fills the rest. No brand pays for a better number.`}
      />
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
      <p className="mt-4 text-sm text-muted">{brand.types.map((t) => typeLabel(t as "food" | "cosmetic" | "pet")).join(" · ")}</p>
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
          <h2 className="font-display text-xl font-bold">Also on the world pantry</h2>
          <p className="mt-1 text-sm text-muted">Live from Open Food Facts. Open one to score it the Healthie way.</p>
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
