import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Camera, Search } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { AisleCard, ProductCard } from "@/components/lumen/product-card";
import { BandLegend, ScoreChip } from "@/components/lumen/score-ring";
import { ScannerSheet, beginLiveScan, useLensReturn, useScanSession } from "@/components/lumen/scanner";
import { ReadingOverlay } from "@/components/lumen/pack-photo";
import { readPackPhoto } from "@/lib/scan/read-pack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listFeatured, loadWorldIndex } from "@/lib/server/functions";
import type { CatalogCard } from "@/lib/server/catalog";
import { normalizeBarcode } from "@/lib/utils";
import { useHistory } from "@/lib/history";
import { usePrefs } from "@/lib/prefs";
import { AISLES } from "@/lib/catalog/aisles";
import { GUIDES } from "@/lib/catalog/guides";
import { formatWorldCount } from "@/lib/world";
import { HERO_FRONTS } from "@/lib/catalog/pack-gtins";
import { openLensOrInstall } from "@/lib/scan/gate";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [featured, world] = await Promise.all([listFeatured(), loadWorldIndex()]);
      return { featured, world };
    } catch {
      return {
        featured: [] as CatalogCard[],
        world: {
          foodCount: 4_707_634,
          beautyCount: 73_850,
          petCount: 15_067,
          localCount: 0,
          lastDumpAt: null,
          lastDumpIngested: 0,
          lastDumpFile: null,
          source: "openfoodfacts + openbeautyfacts + openpetfoodfacts",
        },
      };
    }
  },
  component: Home,
});

const STAGE = [
  { barcode: "5449000000996", title: "Coca-Cola Classic", brand: "Coca-Cola", score: 35, image: HERO_FRONTS.coke },
  { barcode: "3274080005003", title: "Evian", brand: "Evian", score: 95, image: HERO_FRONTS.evian },
] as const;

function Home() {
  const { featured, world } = Route.useLoaderData();
  const navigate = useNavigate();
  const history = useHistory((s) => s.items);
  const prefs = usePrefs();
  const [query, setQuery] = useState("");
  const scan = useScanSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openProduct(barcode: string) {
    const code = normalizeBarcode(barcode);
    setBusy("Looking that up…");
    setError(null);
    await navigate({ to: "/product/$barcode", params: { barcode: code } });
    setBusy(null);
  }

  async function onDetect(barcode: string) {
    scan.stop();
    await openProduct(barcode);
  }

  async function onImage(file: File) {
    scan.stop();
    setError(null);
    setBusy("Reading the pack…");
    const result = await readPackPhoto(file);
    setBusy(null);
    if (result.status === "error") {
      setError(result.error);
      return;
    }
    await openProduct(result.barcode);
  }

  useLensReturn((barcode) => {
    void onDetect(barcode);
  });

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const digits = normalizeBarcode(q);
    if (digits.length >= 8 && digits.length <= 14) {
      void openProduct(digits);
      return;
    }
    void navigate({ to: "/catalog", search: { q } });
  }

  const byCode = new Map(featured.map((p) => [p.barcode, p]));
  const pick = (id: string) => byCode.get(id);
  const faceoff = [pick("009800830039"), pick("0810589032602"), pick("099482513931")].filter(
    (p): p is CatalogCard => Boolean(p),
  );
  const spotlight = [
    pick("5449000000996"),
    pick("3017620422003"),
    pick("3274080005003"),
    pick("009800830039"),
    pick("0810589032602"),
    pick("099482513931"),
  ].filter((p): p is CatalogCard => Boolean(p));
  const recent = history.slice(0, 4);

  return (
    <AppShell wide>
      {busy ? <ReadingOverlay title={busy} /> : null}

      <section className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <p className="kicker">Independent pack scores</p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.045em]">
            Scan it.
            <br />
            Know immediately.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-muted">
            A 0–100 score for what’s in the pack — nutrition, extras, processing. Then the better neighbour in the same aisle.
          </p>
          <p className="mt-3 text-sm text-muted">
            <span className="font-semibold text-fg tabular-nums">{formatWorldCount(world.foodCount)}</span> food barcodes
            indexed, plus {formatWorldCount(world.beautyCount)} beauty and {formatWorldCount(world.petCount)} pet.
          </p>
          <div className="mt-8 flex max-w-md flex-col gap-3">
            <Button
              className="h-14 w-full text-base"
              disabled={Boolean(busy)}
              onClick={() => {
                setError(null);
                openLensOrInstall(() => {
                  void beginLiveScan("barcode", scan.apply);
                });
              }}
            >
              <Camera className="size-4" />
              Scan barcode
            </Button>
            <form onSubmit={onSearch} className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                id="home-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a name or type the barcode"
                className="h-12 pl-10"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                aria-label="Search by name or barcode"
              />
            </form>
            {error ? <p className="text-sm text-score-poor">{error}</p> : null}
          </div>
        </div>
        <div className="order-1 grid grid-cols-2 gap-2 lg:order-2 lg:col-span-7 lg:gap-4">
          {STAGE.map((p) => (
            <Link key={p.barcode} to="/product/$barcode" params={{ barcode: p.barcode }} className="group block min-w-0">
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-surface-2 p-6">
                <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" referrerPolicy="no-referrer" />
                <div className="absolute right-3 top-3">
                  <ScoreChip score={p.score} />
                </div>
              </div>
              <div className="mt-3">
                <p className="truncate font-display text-lg font-medium leading-none tracking-[-0.03em]">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.brand}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 border-y border-border py-8">
        <p className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight tracking-[-0.03em]">
          No brand pays for a better number.
        </p>
        <div className="mt-6">
          <BandLegend />
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Shop by aisle</h2>
            <p className="mt-1 text-sm text-muted">Twenty-seven aisles. The mixer is honest because the shelves are not.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalog">All aisles</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
          {AISLES.slice(0, 8).map((a) => (
            <AisleCard key={a.slug} slug={a.slug} title={a.title} kicker={a.kicker} image={a.image} />
          ))}
        </div>
      </section>

      {!prefs.onboardingDone ? (
        <section className="mt-12 flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 md:max-w-xl">
            <p className="kicker">20 seconds</p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em]">Flag allergens and extras</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Pregnancy, palm oil, fragrance, diet. We stop you in the aisle.
            </p>
          </div>
          <Button asChild className="h-12 w-full shrink-0 md:w-auto">
            <Link to="/you">Set your notes</Link>
          </Button>
        </section>
      ) : null}

      {faceoff.length === 3 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Three packs. Same aisle.</h2>
          <p className="mt-1 text-sm text-muted">Worst, middle, best — the mixer does not flatter the middle one.</p>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {faceoff.map((p) => (
              <Link key={p.barcode} to="/product/$barcode" params={{ barcode: p.barcode }} className="flex items-center gap-4">
                <ScoreChip score={p.overallScore} />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-medium leading-snug">{p.title}</p>
                  <p className="truncate text-sm text-muted">{p.brand}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Recently opened</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">History</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((p) => {
              const card = featured.find((f) => f.barcode === p.barcode);
              return (
                <ProductCard
                  key={p.barcode}
                  barcode={p.barcode}
                  title={p.title}
                  brand={p.brand}
                  type={p.type}
                  isOrganic={card?.isOrganic ?? false}
                  score={p.score}
                  imageUrl={card?.imageUrl}
                  categoryPath={card?.categoryPath}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">On the shelves</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalog">Full catalog</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(spotlight.length ? spotlight : featured.slice(0, 6)).map((p: CatalogCard) => (
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
              layout="tile"
            />
          ))}
        </div>
      </section>

      <section className="mt-14 mb-4">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Short reads</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/guides">All guides</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {GUIDES.slice(0, 6).map((g) => (
            <Link key={g.slug} to="/guides/$slug" params={{ slug: g.slug }} className="flex min-h-16 gap-4">
              <img src={g.image} alt="" className="size-[4.5rem] shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-medium leading-snug tracking-[-0.02em]">{g.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{g.lede}</p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-subtle" />
            </Link>
          ))}
        </div>
      </section>

      <ScannerSheet
        open={scan.open}
        mode={scan.mode}
        liveStream={scan.stream}
        cameraError={scan.error}
        demo={scan.demo}
        onClose={scan.stop}
        onRetry={() => void scan.retry()}
        onDetect={(b) => void onDetect(b)}
        onLabel={(f) => void onImage(f)}
      />
    </AppShell>
  );
}
