import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { ProductCard } from "@/components/lumen/product-card";
import { Button } from "@/components/ui/button";
import { loadAisle, loadAisleWorld } from "@/lib/server/functions";
import { AISLE_BY_SLUG } from "@/lib/catalog/aisles";
import { GUIDES } from "@/lib/catalog/guides";
import type { CatalogCard } from "@/lib/server/catalog";

export const Route = createFileRoute("/aisle/$slug")({
  loader: async ({ params }) => {
    const aisle = AISLE_BY_SLUG.get(params.slug);
    const data = aisle ? await loadAisle({ data: { path: aisle.path } }) : { local: [], extra: [] };
    return { aisleSlug: params.slug, ...data };
  },
  component: AislePage,
});

function AislePage() {
  const { aisleSlug, local } = Route.useLoaderData();
  const aisle = AISLE_BY_SLUG.get(aisleSlug);
  const [extra, setExtra] = useState<CatalogCard[]>([]);
  const [worldState, setWorldState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    if (!aisle) return;
    setWorldState("loading");
    void loadAisleWorld({ data: { path: aisle.path } })
      .then((rows) => setExtra(rows))
      .finally(() => setWorldState("done"));
  }, [aisle]);

  if (!aisle) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-medium">No aisle here</h1>
        <Button asChild className="mt-6">
          <Link to="/catalog">Back to aisles</Link>
        </Button>
      </AppShell>
    );
  }

  const rows = local;
  const avg =
    rows.length === 0 ? null : Math.round(rows.reduce((s, p) => s + p.overallScore, 0) / rows.length);
  const relatedGuide =
    aisle.path === "beverages"
      ? GUIDES.find((g) => g.slug === "sugar-simply")
      : aisle.path === "sun"
        ? GUIDES.find((g) => g.slug === "whats-in-sunscreen")
        : aisle.path === "pet"
          ? GUIDES.find((g) => g.slug === "pet-bowl")
          : aisle.path === "dairy"
            ? GUIDES.find((g) => g.slug === "how-to-shop-yogurt")
            : aisle.path === "skincare" || aisle.path === "body"
              ? GUIDES.find((g) => g.slug === "fragrance-explained")
              : GUIDES.find((g) => g.slug === "how-to-read-a-score");

  return (
    <AppShell wide>
      <div className="relative overflow-hidden rounded-xl">
        <img src={aisle.image} alt={`${aisle.title} aisle`} className="aspect-[16/8] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-fg/70 via-fg/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-accent-fg">
          <p className="kicker text-accent-fg/70">{aisle.kicker}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{aisle.title}</h1>
        </div>
      </div>
      <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-muted">{aisle.blurb}</p>
      <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted">{aisle.howToShop}</p>
      {avg != null ? (
        <p className="mt-3 text-sm text-muted">
          {rows.length} on our shelves · aisle average {avg}/100
        </p>
      ) : null}

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {rows.map((p) => (
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

      {worldState === "loading" ? (
        <p className="mt-8 text-sm text-muted">Looking for more packs in this aisle…</p>
      ) : extra.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Also scanned worldwide</h2>
          <p className="mt-1 text-sm text-muted">
            More packs people scan in this aisle. Open one for the Healthie score.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
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

      {relatedGuide ? (
        <Link
          to="/guides/$slug"
          params={{ slug: relatedGuide.slug }}
          className="mt-10 block rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
        >
          <p className="kicker">Guide</p>
          <p className="mt-1 font-medium">{relatedGuide.title}</p>
          <p className="mt-1 text-sm text-muted">{relatedGuide.lede}</p>
        </Link>
      ) : null}
    </AppShell>
  );
}
