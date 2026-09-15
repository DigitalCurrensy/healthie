import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader, EmptyState } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { clearPackShots, listPackShots } from "@/lib/scan/pack-shots";

export const Route = createFileRoute("/shots")({
  component: ShotsPage,
});

function ShotsPage() {
  const [tick, setTick] = useState(0);
  const shots = useMemo(() => listPackShots(), [tick]);

  return (
    <AppShell>
      <PageHeader
        kicker="This device"
        title="Pack photos"
        body="Every shot you take stays here, even when we cannot read the pack. Type the barcode from the photo or search the name."
        action={
          shots.length ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearPackShots();
                setTick((n) => n + 1);
              }}
            >
              Clear
            </Button>
          ) : null
        }
      />
      {shots.length === 0 ? (
        <EmptyState title="No pack photos yet" body="Scan or photograph a pack. Unmatched shots land here." action={{ to: "/scan", label: "Open the lens" }} />
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {shots.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
              <img src={s.dataUrl} alt={s.title || "Pack photo"} className="aspect-square w-full object-contain bg-surface-2" />
              <div className="p-3">
                <p className="font-medium">{s.title || "Unread pack"}</p>
                <p className="mt-0.5 text-sm text-muted">{s.barcode || s.note || "Type the numbers from the pack"}</p>
                {s.barcode ? (
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/product/$barcode" params={{ barcode: s.barcode }}>
                      Open score
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="secondary" className="mt-3">
                    <Link to="/catalog" search={{ q: s.title || "" }}>
                      Search the name
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
