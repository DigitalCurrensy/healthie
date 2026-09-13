import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { ScoreChip, ScoreRing } from "@/components/lumen/score-ring";
import { useHistory } from "@/lib/history";
import { loadLabInsights } from "@/lib/server/functions";
import { bandLabel, scoreBand } from "@/lib/utils";
import { formatWorldCount } from "@/lib/world";
import { scoreCart } from "@/lib/catalog/cart";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/insights")({
  loader: () => loadLabInsights(),
  component: InsightsPage,
});

function InsightsPage() {
  const items = useHistory((s) => s.items);
  const list = usePrefs((s) => s.list);
  const { lab, world } = Route.useLoaderData();
  const avg = items.length === 0 ? null : Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);
  const worst = items.reduce<(typeof items)[number] | null>((w, i) => (!w || i.score < w.score ? i : w), null);
  const best = items.reduce<(typeof items)[number] | null>((w, i) => (!w || i.score > w.score ? i : w), null);
  const vsLab = avg == null ? null : avg - lab.avgScore;
  const week = scoreCart(list);
  const letter =
    avg == null
      ? `The shelves average ${lab.avgScore}. ${lab.nova4Pct}% of the food is ultra-processed. Drinks and snacks pull that number down — that's a supermarket.`
      : avg >= 75
        ? "Your scans are in good shape. Keep reaching for the green ones."
        : avg >= 50
          ? `A mixed bag${vsLab != null && vsLab < 0 ? ` — ${Math.abs(vsLab)} below the shelf average` : ""}. Swap the lowest score this week.`
          : "A lot of red this week. Pick one habit — drinks, snacks, or a bathroom bottle — and change that first.";

  return (
    <AppShell>
      <PageHeader
        kicker="The shop letter"
        title="Insights"
        body="What these shelves actually look like. Cola and still water sit in the same shop, so the average is honest."
      />

      <section className="mt-8 rounded-xl bg-accent px-5 py-6 text-accent-fg shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-fg/70">The shop today</p>
        <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">{lab.avgScore}</p>
        <p className="mt-1 text-sm text-accent-fg/80">Shelf average · {lab.productCount.toLocaleString()} packs scored</p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-accent-fg/80">{letter}</p>
      </section>

      {week ? (
        <section className="mt-6 flex items-start gap-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <ScoreRing score={week.overall} size={72} />
          <div className="min-w-0">
            <p className="kicker">Your list</p>
            <p className="mt-1 text-[15px] leading-relaxed">{week.headline}</p>
            {week.sugarLine ? <p className="mt-2 text-sm leading-relaxed text-muted">{week.sugarLine}</p> : null}
            <Link to="/lists" className="mt-2 inline-block text-sm font-medium text-accent">
              Open the list
            </Link>
          </div>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section className="mt-8 space-y-3">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="kicker">Your scans</p>
            <p className="mt-1 font-display text-5xl font-bold tabular-nums">{avg}</p>
            <p className="mt-1 text-sm text-muted">
              {items.length} scanned · {avg != null ? bandLabel(scoreBand(avg)) : ""}
              {vsLab != null ? ` · ${vsLab >= 0 ? "+" : ""}${vsLab} vs the shop` : ""}
            </p>
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
          Scan a pack and your week shows up here. Until then, this is the letter from the shelves.
        </p>
      )}

      <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [lab.productCount, "Packs scored"],
          [lab.brandCount, "Brands"],
          [`${lab.nova4Pct}%`, "Ultra-processed food"],
          [formatWorldCount(world.foodCount + world.beautyCount + world.petCount), "Indexed worldwide"],
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
            Organic packs average {lab.organicAvg}/100. The rest average {lab.conventionalAvg}/100. Organic is a bonus,
            not a free pass — the gap is {lab.organicDelta > 0 ? `+${lab.organicDelta}` : lab.organicDelta} points.
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          {lab.highRiskPct}% of packs carry at least one high-concern extra. Food {lab.foodAvg ?? "—"} · beauty{" "}
          {lab.cosmeticAvg ?? "—"} · pet {lab.petAvg ?? "—"}.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Brand ranking</h2>
        <p className="mt-1 text-sm text-muted">Houses with 3 or more packs. The number is the house average. No brand pays for a better one.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="kicker">Cleaner houses</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {lab.brandsBest.map((b, i) => (
                <li key={b.slug}>
                  <Link
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4 py-2.5 shadow-[var(--shadow-border)]"
                  >
                    <span className="min-w-0">
                      <span className="text-xs tabular-nums text-muted">{i + 1} · </span>
                      <span className="font-semibold">{b.name}</span>
                      <span className="block text-xs text-muted">{b.n} packs</span>
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
              {lab.brandsTreat.map((b) => (
                <li key={b.slug}>
                  <Link
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4 py-2.5 shadow-[var(--shadow-border)]"
                  >
                    <span className="min-w-0">
                      <span className="font-semibold">{b.name}</span>
                      <span className="block text-xs text-muted">{b.n} packs</span>
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
        <h2 className="font-display text-xl font-bold">Aisles, worst to best</h2>
        <p className="mt-1 text-sm text-muted">Average of everything we stock in that aisle. Tap through.</p>
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
        <p className="mt-1 text-sm text-muted">How often a flagged additive appears across the shop — a frequency list, not a scare list.</p>
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
                  {e.n} packs · {e.riskClass === "high" ? "High concern" : e.riskClass === "moderate" ? "Worth watching" : "Low concern"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 mb-4">
        <h2 className="font-display text-xl font-bold">The swaps that move the number</h2>
        <p className="mt-1 text-sm text-muted">Same aisle. Worst pack we stock versus the keep.</p>
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
        <p className="mt-6 text-sm text-muted">
          <Link to="/recalls" className="font-medium text-accent">
            Ongoing recalls
          </Link>
          {" · "}
          <Link to="/method" className="font-medium text-accent">
            How scoring works
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
