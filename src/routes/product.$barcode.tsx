import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { GitCompare, Heart, ImageUp, Images, ListPlus, ScanLine, Share2 } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { ProductCard, ProductThumb } from "@/components/lumen/product-card";
import { ScoreMeta, ScoreRing } from "@/components/lumen/score-ring";
import { ScoreDossier } from "@/components/lumen/score-dossier";
import { IngredientList } from "@/components/lumen/ingredient-list";
import { FileHitArea, ReadingOverlay } from "@/components/lumen/pack-photo";
import { ScannerSheet, ScanLaunchButton, beginLiveScan, useScanSession } from "@/components/lumen/scanner";
import { PriceStrip } from "@/components/lumen/price-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProduct, loadPrices, submitCrowdLabel } from "@/lib/server/functions";
import { readPackPhoto } from "@/lib/scan/read-pack";
import { peekLastPackRecord, rememberPack } from "@/lib/scan/session";
import { usePrefs } from "@/lib/prefs";
import { useHistory } from "@/lib/history";
import { productStory } from "@/lib/catalog/product-stories";
import { personalAlerts, forYouScore } from "@/lib/catalog/personal";
import { packWatchouts } from "@/lib/catalog/flags";
import { aisleFor } from "@/lib/catalog/aisles";
import { brandSlug } from "@/lib/catalog/brands";
import { offProductUrl } from "@/lib/catalog/pack-image";
import { aisleStanding } from "@/lib/catalog/standing";
import { councilNote, servingHonesty } from "@/lib/catalog/council";
import { scanSafety } from "@/lib/catalog/recalls";
import { peekLastGs1 } from "@/lib/scan/session";
import { formatGs1Expiry } from "@/lib/scan/gtin";
import { toast } from "sonner";
import {
  additiveCountLabel,
  howOftenLabel,
  nutritionQualityLabel,
  organicLabel,
  planetBlurb,
  planetLabel,
  processingBlurb,
  processingLabel,
  saltContext,
  sugarsContext,
  trafficWord,
  typeLabel,
  VOICE,
} from "@/lib/copy";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";
import type { PriceBoard } from "@/lib/world";
import { cn } from "@/lib/utils";
import { fdaToHit, type FdaRecall } from "@/lib/server/fda";

export const Route = createFileRoute("/product/$barcode")({
  loader: ({ params }) => getProduct({ data: { barcode: params.barcode } }),
  pendingComponent: ProductPending,
  component: ProductPage,
});

function ProductPending() {
  return (
    <AppShell>
      <p className="kicker">Looking it up</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Looking it up</h1>
      <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
        Our shelves first, then public product facts. A moment.
      </p>
    </AppShell>
  );
}

function ProductPage() {
  const data = Route.useLoaderData();
  if (data.status === "not_found") {
    return <NotFound barcode={data.barcode} />;
  }
  return <ProductView product={data.product} alternatives={data.alternatives} prices={data.prices} recall={data.recall} />;
}

function NotFound({ barcode }: { barcode: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const started = useRef(false);
  const scan = useScanSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);
  const [crowdOpen, setCrowdOpen] = useState(false);
  const [crowdTitle, setCrowdTitle] = useState("");
  const [crowdBrand, setCrowdBrand] = useState("");
  const [crowdList, setCrowdList] = useState("");

  async function runPhoto(file: File) {
    scan.stop();
    setError(null);
    setBusy("Reading the pack…");
    const result = await readPackPhoto(file);
    setBusy(null);
    if (result.status === "error") {
      rememberPack(file, barcode);
      setError(result.error);
      return;
    }
    if (result.barcode === barcode) {
      await router.invalidate();
      return;
    }
    await navigate({ to: "/product/$barcode", params: { barcode: result.barcode } });
  }

  async function takePhoto() {
    await beginLiveScan("photo", scan.apply);
  }

  useEffect(() => {
    if (started.current) return;
    const rec = peekLastPackRecord();
    if (!rec?.file) return;
    if (rec.barcode && rec.barcode !== barcode) return;
    started.current = true;
    void runPhoto(rec.file);
  }, [barcode]);

  function onSearchName(e: FormEvent) {
    e.preventDefault();
    const q = name.trim();
    if (q.length < 2) return;
    void navigate({ to: "/catalog", search: { q } });
  }

  return (
    <AppShell>
      {busy ? <ReadingOverlay title={busy} /> : null}
      <p className="kicker">Not in the index yet</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.04em]">We don’t have this barcode</h1>
      <p className="mt-3 max-w-prose font-mono text-sm text-muted">{barcode}</p>
      <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
        We searched the shelves and the public pantry. This code isn’t in either with enough of a label to score — so we
        won’t invent a number.
      </p>
      <div className="mt-6 grid gap-2 sm:max-w-md">
        <Button
          type="button"
          className="h-12"
          disabled={Boolean(busy)}
          onClick={() => void takePhoto()}
        >
          <ImageUp className="size-4" />
          Take a photo of the pack
        </Button>
        <FileHitArea
          onFile={(f) => void runPhoto(f)}
          onStart={() => {
            setError(null);
            setBusy("Opening the photo…");
          }}
          onEmpty={() => setBusy(null)}
          disabled={Boolean(busy)}
          label="Choose a pack photo from your camera roll"
          className="h-12 items-center justify-center gap-2 rounded-lg bg-surface px-4 text-[15px] font-medium text-fg shadow-[var(--shadow-border)]"
        >
          <Images className="size-4" />
          Camera roll
        </FileHitArea>
        <Button asChild variant="secondary" className="h-12">
          <Link to="/catalog">Browse aisles</Link>
        </Button>
      </div>
      <form
        onSubmit={onSearchName}
        className="mt-4 grid gap-2 sm:max-w-md"
        style={{ paddingBottom: kb > 40 ? kb : undefined }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Or search the name on the pack"
          aria-label="Search the product name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          enterKeyHint="search"
        />
        <Button type="submit" variant="secondary" className="h-12" disabled={name.trim().length < 2}>
          Search the shelves
        </Button>
      </form>
      {error ? <p className="mt-3 text-sm text-score-poor">{error}</p> : null}

      <div className="mt-8 max-w-md rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <p className="font-semibold">Add this pack</p>
        <p className="mt-1 text-sm text-muted">If you have it, type the name and the ingredient list. We score it the same way — we won’t invent a number.</p>
        {crowdOpen ? (
          <form
            className="mt-3 grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void submitCrowdLabel({
                data: { barcode, title: crowdTitle, brand: crowdBrand, ingredientsText: crowdList },
              }).then((res) => {
                if (res.ok) void router.invalidate();
                else setError(res.error);
              });
            }}
          >
            <Input value={crowdTitle} onChange={(e) => setCrowdTitle(e.target.value)} placeholder="Product name" aria-label="Product name" />
            <Input value={crowdBrand} onChange={(e) => setCrowdBrand(e.target.value)} placeholder="Brand" aria-label="Brand" />
            <textarea
              value={crowdList}
              onChange={(e) => setCrowdList(e.target.value)}
              placeholder="Ingredients, as printed"
              aria-label="Ingredients"
              className="min-h-24 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
            <Button type="submit" className="h-12" disabled={crowdTitle.trim().length < 3 || crowdList.trim().length < 4}>
              Score this list
            </Button>
          </form>
        ) : (
          <Button variant="secondary" className="mt-3 h-12" onClick={() => setCrowdOpen(true)}>
            Type the ingredients
          </Button>
        )}
      </div>
      <ScannerSheet
        open={scan.open}
        mode={scan.mode}
        liveStream={scan.stream}
        cameraError={scan.error}
        demo={scan.demo}
        onClose={scan.stop}
        onRetry={() => void scan.retry()}
        onDetect={(b) => void navigate({ to: "/product/$barcode", params: { barcode: b } })}
        onLabel={(f) => void runPhoto(f)}
      />
    </AppShell>
  );
}

function ProductView({
  product,
  alternatives,
  prices,
  recall,
}: {
  product: EvaluatedProduct;
  alternatives: EvaluatedProduct[];
  prices?: PriceBoard | null;
  recall?: FdaRecall | null;
}) {
  const s = product.score;
  const story = productStory(product);
  const prefs = usePrefs();
  const navigate = useNavigate();
  const record = useHistory((h) => h.record);
  const saved = prefs.favorites.includes(product.barcode);
  const compared = prefs.compare.includes(product.barcode);
  const listed = prefs.list.some((i) => i.barcode === product.barcode);
  const alerts = personalAlerts(product, prefs);
  const watchouts = packWatchouts(product.ingredients).filter(
    (w) => !alerts.some((a) => a.title === w.title),
  );
  const you = forYouScore(product, prefs);
  const aisle = aisleFor(product.categoryPath);
  const brand = brandSlug(product.brand);
  const standing = aisleStanding(product);
  const council = councilNote(product, standing);
  const serving = servingHonesty(product);
  const gs1 = peekLastGs1(product.barcode);
  const safety = [
    ...scanSafety({ gtin: product.barcode, lot: gs1?.lot, expiry: gs1?.expiry }),
    ...(recall ? [fdaToHit(recall)] : []),
  ];

  const [copied, setCopied] = useState(false);
  const [priceBoard, setPriceBoard] = useState(prices);
  const scan = useScanSession();
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    record({
      barcode: product.barcode,
      title: product.title,
      brand: product.brand,
      type: product.type,
      score: s.overall,
    });
  }, [product.barcode, product.title, product.brand, product.type, s.overall, record]);

  useEffect(() => {
    if (priceBoard?.quotes.length) return;
    void loadPrices({ data: { barcode: product.barcode } })
      .then((board) => {
        if (board?.quotes.length) setPriceBoard(board);
      })
      .catch(() => undefined);
  }, [product.barcode, priceBoard?.quotes.length]);

  async function share() {
    const text = `${product.title} · ${s.overall}/100 on Healthie. ${s.headline}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text });
        return;
      }
    } catch {
      /* cancelled */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.message("Couldn’t copy — select the score instead.");
    }
  }

  return (
    <AppShell>
      <header className="healthie-in flex items-start gap-4">
        <ProductThumb
          title={product.title}
          type={product.type}
          imageUrl={product.imageUrl}
          categoryPath={product.categoryPath}
          barcode={product.barcode}
          className="size-[4.5rem] rounded-lg text-xl"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="kicker">
            {typeLabel(product.type)}
            {product.brand ? ` · ${product.brand}` : ""}
            {product.isOrganic ? " · Organic" : ""}
          </p>
          <h1 className="mt-1 font-display text-[1.45rem] font-bold leading-tight sm:text-3xl">{product.title}</h1>
          <p className="mt-1 font-mono text-xs text-subtle">{product.barcode}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <ScoreRing score={s.overall} size={88} />
          <ScoreMeta
            letter={s.type === "food" ? s.nutriLetter : null}
            nova={s.type !== "cosmetic" ? s.novaGroup : null}
            per={s.type === "food" ? (product.isBeverage ? "per 100 ml" : "per 100 g") : null}
          />
        </div>
      </header>

      <p className="mt-4 max-w-prose text-[15px] leading-relaxed">{s.headline}</p>
      {standing ? <p className="mt-2 text-sm leading-relaxed text-muted">{standing.line}</p> : null}
      {serving ? <p className="mt-2 text-sm leading-relaxed text-muted">{serving}</p> : null}
      {gs1?.lot || gs1?.expiry ? (
        <p className="mt-2 text-sm text-muted">
          {gs1.lot ? `Lot ${gs1.lot}` : ""}
          {gs1.lot && gs1.expiry ? " · " : ""}
          {gs1.expiry ? `Best before ${formatGs1Expiry(gs1.expiry) ?? gs1.expiry}` : ""}
        </p>
      ) : null}

      {safety.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {safety.map((h) => (
            <li key={h.title} className="rounded-lg bg-score-bad px-4 py-3 text-accent-fg shadow-[var(--shadow-border)]">
              <p className="font-medium">{h.title}</p>
              <p className="mt-0.5 text-sm text-accent-fg/80">{h.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-4 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
        <p className="kicker">{council.kicker}</p>
        <p className="mt-1 text-[15px] leading-relaxed">{council.body}</p>
      </section>

      {watchouts.length > 0 ? (
        <section className="mt-4">
          <p className="kicker">Watch-outs</p>
          <ul className="mt-2 space-y-2">
            {watchouts.map((w) => (
              <li
                key={w.title}
                className={cn(
                  "rounded-lg px-4 py-3 shadow-[var(--shadow-border)]",
                  w.kind === "high" ? "bg-score-bad text-accent-fg" : "bg-surface",
                )}
              >
                <p className="font-medium">{w.title}</p>
                <p className={cn("mt-0.5 text-sm", w.kind === "high" ? "text-accent-fg/80" : "text-muted")}>{w.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {alerts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {alerts.map((a) => (
            <li
              key={a.title}
              className={cn(
                "rounded-lg px-4 py-3 shadow-[var(--shadow-border)]",
                a.kind === "stop" ? "bg-score-bad text-accent-fg" : "bg-surface",
              )}
            >
              <p className="font-medium">{a.title}</p>
              <p className={cn("mt-0.5 text-sm", a.kind === "stop" ? "text-accent-fg/80" : "text-muted")}>{a.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {you ? (
        <p className="mt-3 rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-border)]">
          Independent score stays {s.overall}. <span className="font-semibold">For you {you.score}</span>
          {" — "}
          {you.reasons.join(", ")}. The disc does not move for a profile.
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ScanLaunchButton
          mode="barcode"
          onSession={scan.apply}
          disabled={Boolean(busy)}
          className="col-span-2 h-12"
        >
          <ScanLine className="size-4" />
          Scan next pack
        </ScanLaunchButton>
        <Button
          className="h-12"
          variant={saved ? "default" : "secondary"}
          onClick={() => prefs.toggleFavorite(product.barcode)}
        >
          <Heart className={saved ? "fill-current" : undefined} />
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          className="h-12"
          variant={compared ? "default" : "secondary"}
          onClick={() => {
            const result = prefs.toggleCompare(product.barcode);
            if (result === "first") toast.message("Add one more to compare");
            if (result === "second") void navigate({ to: "/compare" });
            if (result === "replaced") {
              toast.message("Tray holds two. Replaced the first.");
              void navigate({ to: "/compare" });
            }
          }}
        >
          <GitCompare />
          {compared ? "Added" : "Compare"}
        </Button>
        <Button
          className="h-12"
          variant={listed ? "default" : "secondary"}
          onClick={() =>
            listed
              ? prefs.removeFromList(product.barcode)
              : prefs.addToList({
                  barcode: product.barcode,
                  title: product.title,
                  brand: product.brand,
                  score: s.overall,
                })
          }
        >
          <ListPlus />
          {listed ? "Listed" : "List"}
        </Button>
        <Button className="h-12" variant="secondary" onClick={() => void share()}>
          <Share2 />
          {copied ? "Copied" : "Share"}
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">The pack</h2>
        <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted">{story.story}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="How often" value={howOftenLabel(story.howOften)} />
          <Fact label="Who it’s for" value={story.whoItsFor} />
          <Fact label="Skip if" value={story.skipIf} />
          {story.packSize ? <Fact label="Pack" value={story.packSize} /> : null}
          {story.origin ? <Fact label="Origin" value={story.origin} /> : null}
          {story.servingNote ? <Fact label="A serving" value={story.servingNote} /> : null}
        </dl>
        {story.highlights.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {story.highlights.map((h) => (
              <li key={h} className="rounded-full bg-surface px-3 py-1 text-xs font-medium shadow-[var(--shadow-border)]">
                {h}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <Glance product={product} howOften={howOftenLabel(story.howOften)} />
      <PriceStrip board={priceBoard} />
      <ScoreDossier product={product} />
      <NutritionTable product={product} />

      {alternatives.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium">{s.overall >= 75 ? "Also in this aisle" : "Better neighbours"}</h2>
          <p className="mt-1 text-sm text-muted">Same aisle, cleaner number. Ranked by how close the job is — not by who paid.</p>
          <div className="mt-3 flex flex-col gap-2">
            {alternatives.map((p) => (
              <ProductCard
                key={p.barcode}
                barcode={p.barcode}
                title={p.title}
                brand={p.brand}
                type={p.type}
                isOrganic={p.isOrganic}
                score={p.score.overall}
                imageUrl={p.imageUrl}
                categoryPath={p.categoryPath}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium">Ingredients</h2>
        {product.ingredientsText ? (
          <p className="mt-1 text-sm leading-relaxed text-muted">{product.ingredientsText}</p>
        ) : null}
        <div className="mt-3">
          <IngredientList
            ingredients={product.ingredients}
            unmatched={product.unmatched}
            penalties={s.type !== "cosmetic" ? s.additivePenalties : undefined}
          />
        </div>
      </section>

      <p className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {aisle ? (
          <Link
            to="/aisle/$slug"
            params={{ slug: aisle.slug }}
            className="tap-link font-medium text-accent underline-offset-4 hover:underline"
          >
            {aisle.title} aisle
          </Link>
        ) : null}
        {product.brand ? (
          <Link
            to="/brand/$slug"
            params={{ slug: brand }}
            className="tap-link font-medium text-accent underline-offset-4 hover:underline"
          >
            More from {product.brand}
          </Link>
        ) : null}
        <Link to="/method" className="tap-link font-medium text-accent underline-offset-4 hover:underline">
          How scoring works
        </Link>
        <a
          href={offProductUrl(product.barcode, product.type)}
          target="_blank"
          rel="noreferrer"
          className="tap-link font-medium text-accent underline-offset-4 hover:underline"
        >
          Pack facts (open data)
        </a>
      </p>
      <p className="mt-4 mb-4 text-sm text-muted">{VOICE.disclaimer}</p>
      {busy ? <ReadingOverlay title={busy} /> : null}
      <ScannerSheet
        open={scan.open}
        mode={scan.mode}
        liveStream={scan.stream}
        cameraError={scan.error}
        demo={scan.demo}
        onClose={scan.stop}
        onRetry={() => void scan.retry()}
        onDetect={(b) => {
          scan.stop();
          void navigate({ to: "/product/$barcode", params: { barcode: b } });
        }}
        onLabel={(file) => {
          void (async () => {
            scan.stop();
            setBusy("Reading the pack…");
            const result = await readPackPhoto(file);
            setBusy(null);
            if (result.status === "error") {
              toast.message(result.error);
              return;
            }
            void navigate({ to: "/product/$barcode", params: { barcode: result.barcode } });
          })();
        }}
      />
    </AppShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="kicker">{label}</p>
      <p className="mt-1 text-[15px] leading-snug">{value}</p>
    </div>
  );
}

function Glance({ product, howOften }: { product: EvaluatedProduct; howOften: string }) {
  const s = product.score;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-medium">At a glance</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <Fact label="How often" value={howOften || "—"} />
        {s.type !== "cosmetic" ? (
          <Fact
            label="Nutrition box"
            value={`${nutritionQualityLabel(s.nutriLetter)}`}
          />
        ) : (
          <Fact
            label="Toughest extra"
            value={
              s.maxHazard === "green"
                ? "Nothing flagged"
                : s.maxHazard === "red"
                  ? "High concern"
                  : s.maxHazard === "orange"
                    ? "Worth watching"
                    : "Low concern"
            }
          />
        )}
        <Fact label="How processed" value={processingLabel(product.novaGroup)} />
        <Fact label="Extras" value={additiveCountLabel(product.additiveCount, product.type)} />
        {s.type !== "cosmetic" ? (
          <Fact label="Planet" value={`${planetLabel(product.ecoScore)} · ${product.ecoScore}/100`} />
        ) : null}
        <Fact label="Organic" value={organicLabel(product.isOrganic)} />
      </dl>
      {s.type !== "cosmetic" ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{processingBlurb(product.novaGroup)}</p>
      ) : null}
      {s.type !== "cosmetic" ? (
        <p className="mt-1 text-sm leading-relaxed text-muted">{planetBlurb(product.ecoScore)}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <a
            href={
              product.type === "cosmetic"
                ? `https://world.openbeautyfacts.org/product/${product.barcode}`
                : product.type === "pet"
                  ? `https://world.openpetfoodfacts.org/product/${product.barcode}`
                  : `https://world.openfoodfacts.org/product/${product.barcode}`
            }
            target="_blank"
            rel="noreferrer"
          >
            Source pack facts
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.title} buy`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Find in stores
          </a>
        </Button>
      </div>
    </section>
  );
}

function NutritionTable({ product }: { product: EvaluatedProduct }) {
  const n = product.nutrition;
  const s = product.score;
  if (!n || s.type === "cosmetic") return null;
  const per = product.isBeverage ? "100 ml" : "100 g";
  const lights = s.trafficLights;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-medium">Nutrition · per {per}</h2>
      <div className="mt-3 overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full text-left text-sm">
          <tbody>
            <NutriRow label="Energy" value={`${n.energyKj} kJ`} />
            <NutriRow
              label="Sugars"
              value={`${n.sugars} g`}
              light={lights?.sugars}
              note={sugarsContext(n.sugars, product.isBeverage)}
            />
            <NutriRow label="Saturated fat" value={`${n.saturatedFat} g`} light={lights?.saturatedFat} />
            <NutriRow label="Salt" value={`${n.salt} g`} light={lights?.salt} note={saltContext(n.salt)} />
            <NutriRow label="Fibre" value={`${n.fiber} g`} />
            <NutriRow label="Protein" value={`${n.protein} g`} />
            {n.fruitsVegetables > 0 ? (
              <NutriRow label="Fruit, veg, nuts" value={`${n.fruitsVegetables} %`} />
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NutriRow({
  label,
  value,
  light,
  note,
}: {
  label: string;
  value: string;
  light?: "green" | "amber" | "red";
  note?: string;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <th className="w-[38%] px-3 py-3 align-top font-medium sm:px-4">{label}</th>
      <td className="min-w-0 px-3 py-3 sm:px-4">
        <span className="inline-flex flex-wrap items-center gap-2 tabular-nums">
          {light ? (
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                light === "green" && "bg-score-excellent",
                light === "amber" && "bg-hazard-yellow",
                light === "red" && "bg-score-bad",
              )}
              aria-label={trafficWord(light)}
            />
          ) : null}
          {value}
          {light ? <span className="text-xs text-muted">{trafficWord(light)}</span> : null}
        </span>
        {note ? <p className="mt-1 text-xs font-normal leading-relaxed text-muted">{note}</p> : null}
      </td>
    </tr>
  );
}
