import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader, EmptyState } from "@/components/lumen/empty";
import { ScoreRing } from "@/components/lumen/score-ring";
import { Button } from "@/components/ui/button";
import { getProductsByCodes } from "@/lib/server/functions";
import { usePrefs } from "@/lib/prefs";
import { additiveCountLabel, organicLabel, processingLabel } from "@/lib/copy";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const compare = usePrefs((s) => s.compare);
  const clear = usePrefs((s) => s.clearCompare);
  const [products, setProducts] = useState<EvaluatedProduct[]>([]);

  useEffect(() => {
    if (compare.length === 0) {
      setProducts([]);
      return;
    }
    void getProductsByCodes({ data: { barcodes: compare } }).then(setProducts);
  }, [compare]);

  return (
    <AppShell wide>
      <PageHeader
        kicker="Side by side"
        title="Compare"
        body="Two packs, same questions. The tray holds two — adding a third replaces the first. The better neighbour usually becomes obvious."
        action={
          compare.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          ) : null
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="Nothing in the tray"
          body="Open a product and tap Compare. Add a second one and they’ll sit here together."
          action={{ to: "/catalog", label: "Browse aisles" }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          {products.map((p) => {
            const s = p.score;
            return (
              <Link key={p.barcode} to="/product/$barcode" params={{ barcode: p.barcode }} className="min-w-0">
                <div className="flex h-full flex-col items-center rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
                  <ScoreRing score={s.overall} size={92} />
                  <p className="mt-3 line-clamp-2 text-center text-sm font-medium sm:text-base">{p.title}</p>
                  <p className="mt-1 text-xs text-muted">{p.brand}</p>
                  <p className="mt-3 line-clamp-4 text-center text-xs leading-relaxed text-muted sm:text-sm">{s.headline}</p>
                  <dl className="mt-4 w-full min-w-0 space-y-1.5 text-xs text-muted">
                    <Row label="Extras" value={additiveCountLabel(p.additiveCount, p.type)} />
                    <Row label="Processed" value={processingLabel(p.novaGroup)} />
                    <Row label="Planet" value={`${p.ecoScore}/100`} />
                    <Row label="Organic" value={organicLabel(p.isOrganic)} />
                    {s.type !== "cosmetic" && p.nutrition ? (
                      <>
                        <Row label="Sugars" value={`${p.nutrition.sugars} g`} />
                        <Row label="Protein" value={`${p.nutrition.protein} g`} />
                      </>
                    ) : null}
                    {s.type === "cosmetic" ? (
                      <Row
                        label="Toughest extra"
                        value={s.maxHazard === "green" ? "None" : s.maxHazard === "red" ? "High concern" : "Watch"}
                      />
                    ) : null}
                  </dl>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-1">
      <dt>{label}</dt>
      <dd className="truncate text-fg">{value}</dd>
    </div>
  );
}
