import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { AisleCard, ProductCard } from "@/components/lumen/product-card";
import { PageHeader } from "@/components/lumen/empty";
import { BandLegend } from "@/components/lumen/score-ring";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listFeatured, searchCatalog } from "@/lib/server/functions";
import { AISLES } from "@/lib/catalog/aisles";
import { allBrands } from "@/lib/catalog/brands";
import { typeLabel } from "@/lib/copy";
import { scoreBand, type ScoreBand } from "@/lib/utils";
import type { ProductType } from "@/lib/scoring/types";
import type { CatalogCard } from "@/lib/server/catalog";

type CatalogSearch = { q?: string };
type Kind = "all" | ProductType;
type BandFilter = "all" | ScoreBand;

export const Route = createFileRoute("/catalog")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loader: () => listFeatured(),
  component: CatalogPage,
});

function CatalogPage() {
  const seeded = Route.useLoaderData();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [kind, setKind] = useState<Kind>("all");
  const [band, setBand] = useState<BandFilter>("all");
  const [shown, setShown] = useState(36);
  const [remote, setRemote] = useState<CatalogCard[] | null>(null);
  const [searching, setSearching] = useState(false);
  const brands = allBrands();

  useEffect(() => {
    const needle = query.trim();
    if (needle.length < 2) {
      setRemote(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = window.setTimeout(() => {
      void searchCatalog({ data: { q: needle, type: kind } })
        .then((rows) => setRemote(rows))
        .finally(() => setSearching(false));
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query, kind]);

  const filtered = useMemo(() => {
    const base = remote ?? seeded;
    return base.filter((p) => {
      if (kind !== "all" && p.type !== kind) return false;
      if (band !== "all" && scoreBand(p.overallScore) !== band) return false;
      if (remote) return true;
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.barcode.includes(needle) ||
        p.categoryPath.includes(needle)
      );
    });
  }, [seeded, query, kind, band, remote]);

  const visible = filtered.slice(0, shown);

  return (
    <AppShell wide>
      <PageHeader
        kicker="The shop"
        title="Aisles"
        body="Twenty-seven aisles of food, beauty, pet, and household. Search the world pantry, or stay on our shelves — we stock the worst on purpose so the mixer is honest."
      />

      <section className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AISLES.map((a) => (
            <AisleCard key={a.slug} slug={a.slug} title={a.title} kicker={a.kicker} image={a.image} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Brands</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.slice(0, 48).map((b) => (
            <Button key={b.slug} size="sm" variant="secondary" asChild>
              <Link to="/brand/$slug" params={{ slug: b.slug }}>
                {b.name}
                <span className="text-muted"> {b.count}</span>
              </Link>
            </Button>
          ))}
        </div>
        {brands.length > 48 ? (
          <p className="mt-2 text-sm text-muted">{brands.length} brands on the shelves. Search to jump to the rest.</p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Everything</h2>
        <div className="mt-4 space-y-3">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(36);
            }}
            placeholder="Search a name, brand, or barcode worldwide"
            aria-label="Search catalog"
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
          <div className="flex flex-wrap gap-2">
            {(["all", "food", "cosmetic", "pet"] as const).map((k) => (
              <Button key={k} size="sm" variant={kind === k ? "default" : "secondary"} onClick={() => setKind(k)}>
                {k === "all" ? "All" : typeLabel(k)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Any score"],
                ["excellent", "Excellent"],
                ["good", "Good"],
                ["poor", "Poor"],
                ["bad", "Avoid"],
              ] as const
            ).map(([k, label]) => (
              <Button key={k} size="sm" variant={band === k ? "default" : "secondary"} onClick={() => { setBand(k); setShown(36); }}>
                {label}
              </Button>
            ))}
          </div>
          <BandLegend />
        </div>
        <p className="mt-4 text-sm text-muted">
          {searching
            ? "Looking in Open Food Facts…"
            : remote
              ? `${filtered.length} matches · local shelves and the world pantry`
              : `${filtered.length} products on the Healthie shelves`}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {visible.map((p) => (
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
        {filtered.length > shown ? (
          <Button className="mt-4" variant="secondary" onClick={() => setShown((n) => n + 36)}>
            Show more · {filtered.length - shown} left
          </Button>
        ) : null}
      </section>
    </AppShell>
  );
}
