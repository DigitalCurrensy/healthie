import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { AisleCard, ProductCard } from "@/components/lumen/product-card";
import { PageHeader } from "@/components/lumen/empty";
import { BandLegend } from "@/components/lumen/score-ring";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listShelves, searchCatalog } from "@/lib/server/functions";
import { AISLES } from "@/lib/catalog/aisles";
import { metricsFromCards, rankedHouses } from "@/lib/catalog/brand-metrics";
import { bandLabel, typeLabel } from "@/lib/copy";
import { scoreBand, type ScoreBand } from "@/lib/utils";
import type { ProductType } from "@/lib/scoring/types";
import type { CatalogCard } from "@/lib/server/catalog";
import { usePrefs } from "@/lib/prefs";
import { cardFlaggedForMode, shoppingModeLabel } from "@/lib/catalog/mode";

type CatalogSearch = { q?: string };
type Kind = "all" | ProductType;
type BandFilter = "all" | ScoreBand;

export const Route = createFileRoute("/catalog")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loader: () => listShelves(),
  component: CatalogPage,
});

function CatalogPage() {
  const seeded = Route.useLoaderData();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [kind, setKind] = useState<Kind>("all");
  const [band, setBand] = useState<BandFilter>("all");
  const [shown, setShown] = useState(60);
  const [hideFlagged, setHideFlagged] = useState(true);
  const lifeStage = usePrefs((s) => s.lifeStage);
  const modeLabel = shoppingModeLabel(lifeStage);
  const [remote, setRemote] = useState<CatalogCard[] | null>(null);
  const [searching, setSearching] = useState(false);
  const houses = useMemo(() => metricsFromCards(seeded), [seeded]);
  const ranked = useMemo(() => rankedHouses(houses, 3), [houses]);
  const keepers = ranked.slice(0, 8);
  const treats = [...ranked].reverse().slice(0, 8);
  const aisleCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of seeded) {
      map.set(p.categoryPath, (map.get(p.categoryPath) ?? 0) + 1);
    }
    return map;
  }, [seeded]);

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
      if (lifeStage !== "none" && hideFlagged && cardFlaggedForMode(p.barcode, lifeStage)) return false;
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
  }, [seeded, query, kind, band, remote, lifeStage, hideFlagged]);

  const visible = filtered.slice(0, shown);

  return (
    <AppShell wide>
      <PageHeader
        kicker="The shop"
        title="Aisles"
        body="Twenty-seven aisles. Hundreds of packs — food, beauty, pet, household. We stock the worst on purpose so the mixer is honest. Search the world pantry when our shelves aren’t enough."
      />

      {modeLabel ? (
        <div className="mt-4 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <p className="font-medium">{modeLabel}</p>
          <p className="mt-1 text-sm text-muted">
            Packs with extras we’d skip in this mode are hidden. The independent number does not move.
          </p>
          <Button className="mt-2" size="sm" variant="secondary" onClick={() => setHideFlagged((v) => !v)}>
            {hideFlagged ? "Show flagged packs" : "Hide flagged packs"}
          </Button>
        </div>
      ) : null}

      <section className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AISLES.map((a) => (
            <AisleCard
              key={a.slug}
              slug={a.slug}
              title={a.title}
              kicker={a.kicker}
              image={a.image}
              count={aisleCounts.get(a.path) ?? 0}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Brand ranking</h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
          Houses with 3 or more packs, ranked by average score. No brand pays for a better number.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="kicker">Cleaner houses</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {keepers.map((b, i) => (
                <li key={b.slug}>
                  <Link
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
                  >
                    <span className="min-w-0">
                      <span className="text-xs tabular-nums text-muted">{i + 1} · </span>
                      <span className="font-semibold">{b.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {b.count} packs · {bandLabel(scoreBand(b.avg))}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums">{b.avg}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker">Treat houses</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {treats.map((b, i) => (
                <li key={b.slug}>
                  <Link
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
                  >
                    <span className="min-w-0">
                      <span className="text-xs tabular-nums text-muted">{ranked.length - i} · </span>
                      <span className="font-semibold">{b.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {b.count} packs · {bandLabel(scoreBand(b.avg))}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums">{b.avg}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Brands</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...houses]
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
            .slice(0, 96)
            .map((b) => (
              <Button key={b.slug} size="sm" variant="secondary" asChild>
                <Link to="/brand/$slug" params={{ slug: b.slug }}>
                  {b.name}
                  <span className="text-muted"> {b.avg}</span>
                </Link>
              </Button>
            ))}
        </div>
        {houses.length > 96 ? (
          <p className="mt-2 text-sm text-muted">{houses.length} brands on the shelves. The number is the house average. Search to jump to the rest.</p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Everything</h2>
        <div className="mt-4 space-y-3">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(60);
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
              <Button key={k} size="sm" variant={band === k ? "default" : "secondary"} onClick={() => { setBand(k); setShown(60); }}>
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
