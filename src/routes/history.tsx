import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader, EmptyState } from "@/components/lumen/empty";
import { ScoreChip } from "@/components/lumen/score-ring";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/history";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const items = useHistory((s) => s.items);
  const clear = useHistory((s) => s.clear);
  const user = useCurrentUser();

  const groups = groupByDay(items);

  return (
    <AppShell>
      <PageHeader
        kicker={user ? "Every phone" : "This device"}
        title="History"
        body={
          user
            ? "Everything you’ve opened, synced to your account. Sign in on another phone and it is already here."
            : "Everything you’ve opened on this phone. Sign in and it will follow you."
        }
        action={
          items.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No scans yet"
          body="Scan a barcode or open a catalog item and it will appear here."
          action={{ to: "/", label: "Scan something" }}
        />
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-3 text-sm font-medium text-muted">{g.label}</h2>
              <ul className="flex flex-col gap-2">
                {g.items.map((item) => (
                  <li key={`${item.barcode}-${item.scannedAt}`}>
                    <Link
                      to="/product/$barcode"
                      params={{ barcode: item.barcode }}
                      className="flex min-h-14 items-center gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]"
                    >
                      <ScoreChip score={item.score} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-sm text-muted">
                          {item.brand || item.type} ·{" "}
                          {new Date(item.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function groupByDay<T extends { scannedAt: number }>(items: T[]) {
  const map = new Map<string, { label: string; items: T[] }>();
  const now = new Date();
  for (const item of items) {
    const d = new Date(item.scannedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const label = sameDay(d, now)
      ? "Today"
      : sameDay(d, new Date(now.getTime() - 86400000))
        ? "Yesterday"
        : d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    const cur = map.get(key);
    if (cur) cur.items.push(item);
    else map.set(key, { label, items: [item] });
  }
  return [...map.values()];
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
