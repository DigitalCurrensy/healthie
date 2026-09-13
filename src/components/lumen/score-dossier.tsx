import { bandLabel, cn, scoreBand } from "@/lib/utils";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";
import type { ScoreReason } from "@/lib/scoring/types";
import { nutritionQualityLabel } from "@/lib/copy";
import { Link } from "@tanstack/react-router";

export function ScoreDossier({ product }: { product: EvaluatedProduct }) {
  const s = product.score;
  const band = scoreBand(s.overall);

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold">Why this number</h2>
      <p className="mt-2 text-[15px] leading-relaxed">{s.headline}</p>
      <p className="mt-1 text-sm text-muted">
        {bandLabel(band)} · {s.overall}/100
        {s.type !== "cosmetic" ? ` · nutrition ${nutritionQualityLabel(s.nutriLetter).toLowerCase()}` : null}
      </p>

      <ul className="mt-4 space-y-3">
        {s.pillars.map((p) => (
          <li key={p.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0">{p.label}</span>
              <span className="shrink-0 tabular-nums text-muted">{p.score}/100</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(0, Math.min(100, p.score))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {s.type !== "cosmetic" && s.cappedBy ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-border)]">
          {s.cappedBy === "nutrition"
            ? "The nutrition box is the limit. A kinder ingredient list cannot talk this pack into Good."
            : s.cappedBy === "processing"
              ? "Ultra-processed food cannot be rated Good. A factory recipe is a treat, not a habit."
              : "The extras on the list set the limit. A high-concern ingredient, or a cluster of them, blocks a better rating."}
        </p>
      ) : null}

      {s.type === "cosmetic" && s.capped ? (
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-border)]">
          The toughest extra on the list is the limit. A calm rest of the formula cannot lift that.
        </p>
      ) : null}

      <ReasonList reasons={s.reasons} />

      {s.type === "pet" ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          For pet food, the bowl and the extras share the number. How processed is a smaller slice. Organic is a small
          bonus — it cannot cancel BHA, dyes, or by-product meal.
        </p>
      ) : s.type === "cosmetic" ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          For creams and washes, every flagged extra knocks the formula. The lowest-rated ingredient is the limit.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Nutrition is half the number. Ingredients a quarter. How processed a fifth. Organic is a small bonus — it
          cannot rescue a sugary drink or a nitrite ham.{" "}
          <Link to="/method" className="font-medium text-accent underline-offset-4 hover:underline">
            How this compares to Nutri-Score
          </Link>
        </p>
      )}
    </section>
  );
}

function ReasonList({ reasons }: { reasons: ScoreReason[] }) {
  const hurt = reasons.filter((r) => r.kind === "hurt" || r.kind === "cap");
  const help = reasons.filter((r) => r.kind === "help");
  const notes = reasons.filter((r) => r.kind === "note");
  return (
    <div className="mt-5 space-y-4">
      {hurt.length > 0 ? (
        <div>
          <p className="kicker">What pulled it down</p>
          <ul className="mt-2 space-y-2">
            {hurt.map((r) => (
              <ReasonCard key={`${r.kind}-${r.title}`} reason={r} />
            ))}
          </ul>
        </div>
      ) : null}
      {help.length > 0 ? (
        <div>
          <p className="kicker">What held it up</p>
          <ul className="mt-2 space-y-2">
            {help.map((r) => (
              <ReasonCard key={`${r.kind}-${r.title}`} reason={r} />
            ))}
          </ul>
        </div>
      ) : null}
      {notes.length > 0 ? (
        <div>
          <p className="kicker">Also worth knowing</p>
          <ul className="mt-2 space-y-2">
            {notes.map((r) => (
              <ReasonCard key={`${r.kind}-${r.title}`} reason={r} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ReasonCard({ reason }: { reason: ScoreReason }) {
  return (
    <li className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug">{reason.title}</p>
        {typeof reason.points === "number" ? (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              reason.points < 0 ? "text-score-poor" : "text-score-excellent",
            )}
          >
            {reason.points > 0 ? `+${reason.points}` : reason.points}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">{reason.detail}</p>
    </li>
  );
}
