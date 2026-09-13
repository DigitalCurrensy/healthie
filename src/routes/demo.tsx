import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { DEMO_SCRIPT } from "@/lib/scan/samples";
import { VOICE } from "@/lib/copy";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

function DemoPage() {
  return (
    <AppShell>
      <PageHeader
        kicker="Live demo"
        title="Three packs"
        body="Print these codes or pull the real packs. Scan each. The disc, the neighbour, and the reason should be on screen in a breath."
      />
      <ol className="mt-6 space-y-4">
        {DEMO_SCRIPT.map((pack, i) => (
          <li key={pack.barcode} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="kicker">
              {i + 1} · {pack.role}
            </p>
            <p className="mt-1 font-display text-xl font-bold">{pack.title}</p>
            <p className="mt-1 font-mono text-sm text-muted">{pack.barcode}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{pack.expect}</p>
            <Button asChild className="mt-3" size="sm">
              <Link to="/product/$barcode" params={{ barcode: pack.barcode }}>
                Open this pack
              </Link>
            </Button>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm leading-relaxed text-muted">{VOICE.disclaimer}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/scan" search={{ autostart: true, mode: "barcode" }}>
            Open Scan
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/install">Home screen</Link>
        </Button>
      </div>
    </AppShell>
  );
}
