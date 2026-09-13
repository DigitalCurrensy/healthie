import type { PriceBoard } from "@/lib/world";

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function PriceStrip({ board }: { board: PriceBoard | null | undefined }) {
  if (!board || !board.quotes.length || board.median == null || !board.currency) {
    return (
      <p className="mt-6 text-sm text-muted">
        No shelf price logged yet. When a shopper posts a receipt to Open Prices, it lands here.
      </p>
    );
  }

  return (
    <section className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="kicker">Shelf price · Open Prices</p>
      <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight">
        {money(board.median, board.currency)}
      </p>
      <p className="mt-1 text-sm text-muted">
        Median of {board.storeCount} store{board.storeCount === 1 ? "" : "s"}
        {board.low != null && board.high != null && board.low !== board.high
          ? ` · ${money(board.low, board.currency)}–${money(board.high, board.currency)}`
          : ""}
      </p>
      <ul className="mt-4 divide-y divide-border">
        {board.quotes.slice(0, 5).map((q, i) => (
          <li key={`${q.store}-${q.observedOn}-${i}`} className="flex min-h-11 items-baseline justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-sm">
              {q.store}
              {q.country ? <span className="text-muted"> · {q.country}</span> : null}
            </span>
            <span className="shrink-0 text-sm tabular-nums">
              {money(q.amount, q.currency)}
              {q.observedOn ? <span className="text-muted"> · {q.observedOn}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
