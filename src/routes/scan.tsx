import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/lumen/shell";
import { HealthieMark } from "@/components/lumen/logo";
import { PageHeader } from "@/components/lumen/empty";
import { ScanActions, ScannerSheet, beginLiveScan, useLensReturn, useScanSession } from "@/components/lumen/scanner";
import { ReadingOverlay } from "@/components/lumen/pack-photo";
import { ProductCard } from "@/components/lumen/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readPackPhoto } from "@/lib/scan/read-pack";
import { SAMPLE_PACKS } from "@/lib/scan/samples";
import { ensureScanEngine } from "@/lib/scan/engine";
import { normalizeBarcode } from "@/lib/utils";
import { VOICE } from "@/lib/copy";
import { useHistory } from "@/lib/history";
import { InstallCard } from "@/components/lumen/install";

export const Route = createFileRoute("/scan")({
  validateSearch: (s: Record<string, unknown>) => ({
    autostart: s.autostart === "1" || s.autostart === true || s.autostart === "true",
    mode: s.mode === "photo" ? ("photo" as const) : ("barcode" as const),
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const history = useHistory((s) => s.items);
  const scan = useScanSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    void ensureScanEngine();
  }, []);

  const autostart = Route.useSearch().autostart;
  const startMode = Route.useSearch().mode;
  const started = useRef(false);
  useEffect(() => {
    if (!autostart || started.current) return;
    started.current = true;
    void beginLiveScan(startMode, scan.apply);
  }, [autostart, startMode, scan.apply]);

  useLensReturn((barcode) => {
    void openProduct(barcode);
  });

  async function openProduct(barcode: string) {
    const code = normalizeBarcode(barcode);
    if (code.length < 8) {
      setError("That doesn’t look like a barcode yet — keep typing, or pick a pack below.");
      return;
    }
    scan.stop();
    setBusy("Looking that up…");
    setError(null);
    await navigate({ to: "/product/$barcode", params: { barcode: code } });
  }

  async function onImage(file: File) {
    scan.stop();
    setError(null);
    setBusy("Reading the pack…");
    const result = await readPackPhoto(file);
    if (result.status === "error") {
      setBusy(null);
      setError(result.error);
      return;
    }
    await openProduct(result.barcode);
  }

  function onManual(e: FormEvent) {
    e.preventDefault();
    void openProduct(manual);
  }

  const recent = history.slice(0, 4);

  return (
    <AppShell>
      {busy ? <ReadingOverlay title={busy} /> : null}

      <div className="mb-6 flex items-center gap-3">
        <HealthieMark className="size-11" />
        <PageHeader kicker="The lens" title="Scan" body={VOICE.scanHint} />
      </div>

      <section className="space-y-3">
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
        <form onSubmit={onManual} className="flex gap-2">
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="Or type the numbers"
            aria-label="Enter barcode"
            className="text-base"
          />
          <Button type="submit" className="h-12 shrink-0">
            Look up
          </Button>
        </form>
        {error ? <p className="text-sm text-score-poor">{error}</p> : null}
      </section>

      <section className="mt-6 flex items-center gap-4 rounded-md bg-pine px-4 py-4 text-accent-fg">
        <HealthieMark className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-fg/60">On your home screen</p>
          <p className="mt-1 font-display text-lg leading-tight">Add Healthie so the camera can open.</p>
          <p className="mt-1 text-sm text-accent-fg/75">Install, open the icon, then scan. This browser window may block the lens.</p>
        </div>
        <Button variant="secondary" className="shrink-0" asChild>
          <Link to="/install">How to install</Link>
        </Button>
      </section>
      <div className="hidden">
        <InstallCard />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-medium">Try a pack we already scored</h2>
        <p className="mt-1 text-sm text-muted">Same number as a live scan — useful on a computer.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SAMPLE_PACKS.map((p) => (
            <button
              key={p.barcode}
              type="button"
              onClick={() => void openProduct(p.barcode)}
              className="overflow-hidden rounded-md bg-surface text-left shadow-[var(--shadow-border)]"
            >
              <img src={p.image} alt="" className="aspect-square w-full object-cover" />
              <span className="block truncate px-2 py-1.5 text-xs font-semibold">{p.title}</span>
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-medium">Recently opened</h2>
          <div className="mt-3 flex flex-col gap-2">
            {recent.map((p) => (
              <ProductCard
                key={p.barcode}
                barcode={p.barcode}
                title={p.title}
                brand={p.brand}
                type={p.type}
                isOrganic={false}
                score={p.score}
                categoryPath={undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-8 text-sm text-muted">
        Prefer aisles?{" "}
        <Link to="/catalog" className="font-semibold text-fg underline-offset-4 hover:underline">
          Browse the catalog
        </Link>
        .
      </p>

      <ScannerSheet
        open={scan.open}
        mode={scan.mode}
        liveStream={scan.stream}
        cameraError={scan.error}
        demo={scan.demo}
        onClose={scan.stop}
        onRetry={() => void scan.retry()}
        onDetect={(b) => void openProduct(b)}
        onLabel={(f) => void onImage(f)}
      />
    </AppShell>
  );
}
