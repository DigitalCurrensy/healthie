import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { HealthieLockup } from "@/components/lumen/logo";
import { AisleCard, ProductCard } from "@/components/lumen/product-card";
import { BandLegend, ScoreChip } from "@/components/lumen/score-ring";
import { ScanActions, ScannerSheet, useLensReturn, useScanSession } from "@/components/lumen/scanner";
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
import { VOICE } from "@/lib/copy";
import { formatWorldCount } from "@/lib/world";
import { SAMPLE_PACKS } from "@/lib/scan/samples";

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
  const faceoff = [
    pick("009800830039"),
    pick("0810589032602"),
    pick("099482513931"),
  ].filter((p): p is CatalogCard => Boolean(p));
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

      <section className="healthie-in max-w-2xl">
        <HealthieLockup className="w-52 sm:w-72 md:w-80" />
        <p className="kicker mt-6">Food · beauty · pet</p>
        <h1 className="mt-2 font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.05em] sm:text-[3.15rem]">
          Scan it. Know immediately.
        </h1>
        <p className="mt-3 max-w-prose text-[16px] leading-relaxed text-muted">
          A 0–100 score for what’s in the pack — nutrition, extras, processing. Then the better neighbour in the same aisle.{" "}
          {VOICE.independent}
        </p>
        <p className="mt-4 text-sm text-muted">
          <span className="font-semibold text-fg tabular-nums">{formatWorldCount(world.foodCount)}</span> food barcodes
          indexed, plus {formatWorldCount(world.beautyCount)} beauty and {formatWorldCount(world.petCount)} pet. Scan
          anything — if it isn’t here yet, we look it up.
        </p>
        <figure className="mt-6 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <img
            src="/og.jpg"
            alt="Healthie — scan a pack, see the score"
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
          />
          <figcaption className="px-4 py-3 text-sm leading-relaxed text-muted">
            This is the card that shows up when you send Healthie in Mail, Messages, or on X.
          </figcaption>
        </figure>
      </section>

      <section className="healthie-in-2 mt-7 space-y-3">
        <ScanActions
          onSession={scan.apply}
          onImage={(f) => void onImage(f)}
          onStart={() => {
            setError(null);
            setBusy("Opening the photo…");
          }}
          onEmpty={() => setBusy(null)}
          disabled={Boolean(busy)}
        />
        <form onSubmit={onSearch} className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name or type the barcode"
            className="pl-10"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            aria-label="Search by name or barcode"
          />
        </form>
        {error ? <p className="text-sm text-score-poor">{error}</p> : null}
        <p className="text-sm text-muted">{VOICE.scanHint}</p>
        <BandLegend />
        <div className="pt-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">Try a scored pack</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SAMPLE_PACKS.map((p) => (
              <button
                key={p.barcode}
                type="button"
                onClick={() => void openProduct(p.barcode)}
                className="overflow-hidden rounded-lg bg-surface text-left shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-border-hover)]"
              >
                <img src={p.image} alt="" className="aspect-square w-full object-cover" />
                <span className="block truncate px-1.5 py-1 text-[11px] font-semibold">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!prefs.onboardingDone ? (
        <section className="healthie-in-3 mt-7 flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 md:max-w-xl">
            <p className="kicker">20 seconds</p>
            <h2 className="mt-1 font-display text-lg font-bold">Flag allergens and extras</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Pregnancy, palm oil, fragrance, diet. We stop you in the aisle. Sign in and it follows you to the next phone.
            </p>
          </div>
          <Button asChild className="h-12 w-full shrink-0 md:w-auto">
            <Link to="/you">Set your notes</Link>
          </Button>
        </section>
      ) : null}

      {faceoff.length === 3 ? (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Worst, middle, best</h2>
              <p className="mt-1 text-sm text-muted">The three packs from a real camera roll. Same aisle logic, three different lives.</p>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {faceoff.map((p) => (
              <Link
                key={p.barcode}
                to="/product/$barcode"
                params={{ barcode: p.barcode }}
                className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-border-hover)]"
              >
                <ScoreChip score={p.overallScore} />
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-snug">{p.title}</p>
                  <p className="truncate text-sm text-muted">{p.brand}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">Recently opened</h2>
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

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Shop by aisle</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalog">All aisles</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AISLES.map((a) => (
            <AisleCard key={a.slug} slug={a.slug} title={a.title} kicker={a.kicker} image={a.image} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Open a product</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalog">Full catalog</Link>
          </Button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
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
            />
          ))}
        </div>
      </section>

      <section className="mt-10 mb-4">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Short reads</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/guides">All guides</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {GUIDES.slice(0, 6).map((g) => (
            <Link
              key={g.slug}
              to="/guides/$slug"
              params={{ slug: g.slug }}
              className="flex min-h-16 gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-border-hover)]"
            >
              <img src={g.image} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{g.title}</p>
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
