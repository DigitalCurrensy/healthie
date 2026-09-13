import { bandLabel, cn, scoreBand } from "@/lib/utils";

const BAND_COLOR: Record<ReturnType<typeof scoreBand>, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  poor: "var(--color-score-poor)",
  bad: "var(--color-score-bad)",
};

export function ScoreRing({
  score,
  size = 132,
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
      className="relative inline-flex shrink-0 flex-col items-center justify-center rounded-full text-accent-fg shadow-[var(--shadow-border)]"
      style={{ width: size, height: size, background: BAND_COLOR[band] }}
      role="img"
      aria-label={`Score ${Math.round(clamped)}, ${caption ?? bandLabel(band)}`}
    >
      <span className="font-display font-bold tabular-nums leading-none tracking-tight" style={{ fontSize: size * 0.34 }}>
        {Math.round(clamped)}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-fg/85">
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
    letter ? `Nutri-Score ${letter}` : null,
    nova ? `NOVA ${nova}` : null,
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
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold tabular-nums text-accent-fg",
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
    { label: "75–100", name: "Excellent", cls: "bg-score-excellent" },
    { label: "50–74", name: "Good", cls: "bg-score-good" },
    { label: "25–49", name: "Poor", cls: "bg-score-poor" },
    { label: "0–24", name: "Avoid", cls: "bg-score-bad" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
      {rows.map((r) => (
        <li key={r.name} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full", r.cls)} />
          <span className="font-semibold text-fg">{r.name}</span>
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
