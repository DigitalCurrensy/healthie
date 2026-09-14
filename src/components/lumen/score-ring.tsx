import { bandLabel, cn, scoreBand } from "@/lib/utils";
import { nutritionQualityLabel, processingLabel } from "@/lib/copy";

const BAND_COLOR: Record<ReturnType<typeof scoreBand>, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  poor: "var(--color-score-poor)",
  bad: "var(--color-score-bad)",
};

export function ScoreRing({
  score,
  size = 168,
  caption,
}: {
  score: number;
  size?: number;
  caption?: string;
}) {
  const band = scoreBand(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div
      className="relative inline-flex shrink-0 flex-col items-center justify-center text-accent-fg"
      style={{ width: size, height: size, background: BAND_COLOR[band], borderRadius: "50%" }}
      role="img"
      aria-label={`Score ${Math.round(clamped)}, ${caption ?? bandLabel(band)}`}
    >
      <span
        className="font-display font-medium tabular-nums leading-none tracking-[-0.06em]"
        style={{ fontSize: size * 0.38 }}
      >
        {Math.round(clamped)}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-fg/80">
        {caption ?? bandLabel(band)}
      </span>
    </div>
  );
}

export function ScoreMeta({
  letter,
  nova,
  per,
}: {
  letter?: string | null;
  nova?: number | null;
  per?: string | null;
}) {
  const bits = [
    letter ? `${nutritionQualityLabel(letter)} nutrition` : null,
    nova ? processingLabel(nova) : null,
    per,
  ].filter(Boolean);
  if (bits.length === 0) return null;
  return <p className="mt-1 max-w-[8.5rem] text-center text-[11px] leading-snug text-muted">{bits.join(" · ")}</p>;
}

export function ScoreChip({ score, className }: { score: number; className?: string }) {
  const band = scoreBand(score);
  return (
    <span
      className={cn(
        "inline-flex size-14 shrink-0 items-center justify-center rounded-full font-display text-[1.15rem] font-medium tabular-nums tracking-[-0.04em] text-accent-fg",
        band === "excellent" && "bg-score-excellent",
        band === "good" && "bg-score-good",
        band === "poor" && "bg-score-poor",
        band === "bad" && "bg-score-bad",
        className,
      )}
      aria-label={`Score ${Math.round(score)}, ${bandLabel(band)}`}
    >
      {Math.round(score)}
    </span>
  );
}

export function BandLegend() {
  const rows = [
    { label: "75–100", name: "Excellent", line: "A keep.", cls: "bg-score-excellent" },
    { label: "50–74", name: "Good", line: "Fine sometimes.", cls: "bg-score-good" },
    { label: "25–49", name: "Poor", line: "A treat at best.", cls: "bg-score-poor" },
    { label: "0–24", name: "Avoid", line: "Leave it.", cls: "bg-score-bad" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
      {rows.map((r) => (
        <li key={r.name} className="flex items-start gap-2">
          <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", r.cls)} />
          <span>
            <span className="block text-[13px] font-semibold text-fg">{r.name}</span>
            <span className="block text-[11px] tabular-nums text-muted">
              {r.label} · {r.line}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
