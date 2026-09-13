import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader, EmptyState } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { ScoreChip } from "@/components/lumen/score-ring";
import { usePrefs } from "@/lib/prefs";
import { useHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lists")({
  component: ListsPage,
});

function ListsPage() {
  const list = usePrefs((s) => s.list);
  const toggle = usePrefs((s) => s.toggleListItem);
  const remove = usePrefs((s) => s.removeFromList);
  const clear = usePrefs((s) => s.clearList);
  const history = useHistory((s) => s.items);
  const swapHint = history.filter((i) => i.score < 50).slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        kicker="Bring this to the shop"
        title="List"
        body="Add a product from its page. Tick it off as you walk the aisle."
        action={
          list.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          ) : null
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          body="Open a keep and tap Add to list. Or start from a poor score in Insights and swap it."
          action={{ to: "/catalog", label: "Browse aisles" }}
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {list.map((item) => (
            <li key={item.barcode} className="flex items-center gap-1 rounded-xl bg-surface py-1 pl-1 pr-1 shadow-[var(--shadow-border)]">
              <button
                type="button"
                onClick={() => toggle(item.barcode)}
                className="flex size-11 shrink-0 items-center justify-center rounded-md"
                aria-label={item.checked ? "Mark as not done" : "Mark as done"}
              >
                <span
                  className={cn(
                    "size-5 rounded-sm border border-border",
                    item.checked && "border-accent bg-accent",
                  )}
                />
              </button>
              <Link
                to="/product/$barcode"
                params={{ barcode: item.barcode }}
                className={cn("min-w-0 flex-1 py-2", item.checked && "opacity-50")}
              >
                <p className="truncate font-medium">{item.title}</p>
                <p className="truncate text-sm text-muted">{item.brand}</p>
              </Link>
              <ScoreChip score={item.score} />
              <Button variant="ghost" size="icon" aria-label={`Remove ${item.title}`} onClick={() => remove(item.barcode)}>
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {swapHint.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium">Worth swapping</h2>
          <p className="mt-1 text-sm text-muted">From what you’ve opened. Tap through and add the better neighbour.</p>
          <ul className="mt-3 space-y-2">
            {swapHint.map((i) => (
              <li key={i.barcode}>
                <Link
                  to="/product/$barcode"
                  params={{ barcode: i.barcode }}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <span className="min-w-0 truncate font-medium">{i.title}</span>
                  <ScoreChip score={i.score} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppShell>
  );
}
