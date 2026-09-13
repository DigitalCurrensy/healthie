import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { ScoreChip } from "@/components/lumen/score-ring";
import { useHistory } from "@/lib/history";
import { loadLabInsights } from "@/lib/server/functions";
import { bandLabel, scoreBand } from "@/lib/utils";
import { formatWorldCount } from "@/lib/world";

export const Route = createFileRoute("/insights")({
  loader: () => loadLabInsights(),
  component: InsightsPage,
});

function InsightsPage() {
  const items = useHistory((s) => s.items);
  const { lab, world } = Route.useLoaderData();
  const avg = items.length === 0 ? null : Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);
  const worst = items.reduce<(typeof items)[number] | null>((w, i) => (!w || i.score < w.score ? i : w), null);
  const best = items.reduce<(typeof items)[number] | null>((w, i) => (!w || i.score > w.score ? i : w), null);
  const vsLab =
    avg == null ? null : avg - lab.avgScore;
  const letter =
    avg == null
      ? null
      : avg >= 75
        ? "Your cart is in good shape. Keep reaching for the green ones."
        : avg >= 50
          ? `A mixed bag — ${vsLab != null && vsLab < 0 ? `${Math.abs(vsLab)} below our shelf average.` : "in range of the shop."} Swap the lowest score this week.`
          : "A lot of red this week. Pick one habit — drinks, snacks, or a bathroom bottle — and change that first.";

  return (
    <AppShell>
      <PageHeader
        kicker="The lab letter"
        title="Insights"
        body="What the shelves actually look like — scored from the live pantry, not a dummy cart. We stock the worst on purpose so a cola and a bottle of water don’t look the same."
      />

      <section className="mt-8 rounded-xl bg-accent px-5 py-6 text-accent-fg shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-fg/70">World index</p>
        <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">
          {formatWorldCount(world.foodCount + world.beautyCount + world.petCount)}
        </p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-accent-fg/80">
          Food, beauty, and pet barcodes from the nightly Open Food Facts dump. {lab.productCount.toLocaleString()} scored
          on this shelf right now
          {world.lastDumpIngested ? ` · ${world.lastDumpIngested} pulled in the last ingest` : ""}
          {world.lastDumpAt
            ? ` · pantry refresh ${new Date(world.lastDumpAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : ""}
          . Scan a pack that isn’t here — live lookup still covers the long tail.
        </p>
      </section>

      {items.length > 0 ? (
        <section className="mt-8 space-y-3">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="kicker">Your average</p>
            <p className="mt-1 font-display text-5xl font-bold tabular-nums">{avg}</p>
            <p className="mt-1 text-sm text-muted">
              {items.length} scanned · {avg != null ? bandLabel(scoreBand(avg)) : ""}
              {vsLab != null ? ` · ${vsLab >= 0 ? "+" : ""}${vsLab} vs the shop` : ""}
            </p>
            {letter ? <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">{letter}</p> : null}
          </div>
          {best && worst ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/product/$barcode"
                params={{ barcode: best.barcode }}
                className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
              >
                <p className="kicker">Best pick</p>
                <p className="mt-1 truncate font-semibold">{best.title}</p>
                <ScoreChip score={best.score} className="mt-3" />
              </Link>
              <Link
                to="/product/$barcode"
                params={{ barcode: worst.barcode }}
                className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
              >
                <p className="kicker">Swap this</p>
                <p className="mt-1 truncate font-semibold">{worst.title}</p>
                <ScoreChip score={worst.score} className="mt-3" />
              </Link>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted">
          You haven’t scanned yet. Below is the letter from the {lab.productCount} packs on our shelves — not a dummy
          cart. About half score Poor because supermarket drinks and snacks are in here on purpose.
        </p>
      )}

      <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [lab.productCount, "Packs scored"],
          [lab.brandCount, "Brands"],
          [lab.avgScore, "Shelf average"],
          [`${lab.nova4Pct}%`, "Food that is NOVA 4"],
        ].map(([n, label]) => (
          <div key={String(label)} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-display text-2xl font-bold tabular-nums">{n}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Score mix on the shelves</h2>
        <ul className="mt-3 space-y-2">
          {lab.bands.map((b) => {
            const pct = lab.productCount ? Math.round((b.n / lab.productCount) * 100) : 0;
            return (
              <li key={b.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{b.label}</span>
                  <span className="tabular-nums text-muted">
                    {b.n} · {pct}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={
                      b.key === "excellent"
                        ? "h-full bg-score-excellent"
                        : b.key === "good"
                          ? "h-full bg-score-good"
                          : b.key === "poor"
                            ? "h-full bg-score-poor"
                            : "h-full bg-score-bad"
                    }
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {lab.organicDelta != null ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Organic packs average {lab.organicAvg}/100. The rest average {lab.conventionalAvg}/100. Organic is a bonus, not a
            free pass — the gap is {lab.organicDelta > 0 ? `+${lab.organicDelta}` : lab.organicDelta} points.
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          {lab.highRiskPct}% of packs carry at least one high-concern extra. Food {lab.foodAvg ?? "—"} · beauty{" "}
          {lab.cosmeticAvg ?? "—"} · pet {lab.petAvg ?? "—"}.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Aisles, worst to best</h2>
        <p className="mt-1 text-sm text-muted">Average score of everything we stock in that aisle. Tap through.</p>
        <div className="mt-4 flex flex-col gap-2">
          {lab.aisles.map((a) => (
            <Link
              key={a.path}
              to="/aisle/$slug"
              params={{ slug: a.slug }}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <ScoreChip score={a.avg} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="truncate text-sm text-muted">
                  {a.n} packs · {a.worst.title} {a.worst.score} → {a.best.title} {a.best.score}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-subtle" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">The extras that show up</h2>
        <p className="mt-1 text-sm text-muted">How often a flagged additive appears across the shop — not a scare list, a frequency list.</p>
        <ul className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {lab.extras.map((e) => (
            <li key={e.id}>
              <Link
                to="/ingredient/$id"
                params={{ id: e.id }}
                className="flex min-h-12 items-center justify-between gap-3 px-4 py-2.5"
              >
                <span className="font-semibold">{e.name}</span>
                <span className="text-sm tabular-nums text-muted">
                  {e.n} packs · {e.riskClass}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 mb-4">
        <h2 className="font-display text-xl font-bold">The swaps that move the number</h2>
        <p className="mt-1 text-sm text-muted">Same aisle. Worst pack we stock versus the keep. The lift is the point.</p>
        <div className="mt-4 flex flex-col gap-2">
          {lab.swaps.map((s) => (
            <div key={s.from.barcode} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="kicker">+{s.lift} points</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Link to="/product/$barcode" params={{ barcode: s.from.barcode }} className="min-h-12">
                  <p className="text-sm text-muted">Put back</p>
                  <p className="font-semibold leading-snug">{s.from.title}</p>
                  <p className="text-sm tabular-nums text-muted">{s.from.score}/100 · {s.from.brand}</p>
                </Link>
                <Link to="/product/$barcode" params={{ barcode: s.to.barcode }} className="min-h-12">
                  <p className="text-sm text-muted">Reach for</p>
                  <p className="font-semibold leading-snug">{s.to.title}</p>
                  <p className="text-sm tabular-nums text-muted">{s.to.score}/100 · {s.to.brand}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
