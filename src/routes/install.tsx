import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { InstallCard } from "@/components/lumen/install";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/install")({
  component: InstallPage,
});

function InstallPage() {
  return (
    <AppShell>
      <PageHeader
        kicker="The live lens"
        title="On your home screen"
        body="Add Healthie to your home screen, open it from the icon, then scan. That’s how the camera opens on a phone."
      />
      <img
        src="/images/install.jpg"
        alt="Healthie on a kitchen counter"
        className="mt-6 aspect-[4/3] w-full rounded-xl object-cover shadow-[var(--shadow-border)]"
      />
      <InstallCard />
      <ol className="mt-8 space-y-4 text-[15px] leading-relaxed">
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="font-medium">iPhone</p>
          <p className="mt-1 text-muted">Share → Add to Home Screen. Open the icon. Allow the camera once.</p>
        </li>
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="font-medium">Android</p>
          <p className="mt-1 text-muted">Chrome menu → Install app. Open from the drawer. Allow the camera once.</p>
        </li>
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="font-medium">Then scan</p>
          <p className="mt-1 text-muted">Scan a barcode. A marketing QR that isn’t a product code is ignored.</p>
        </li>
      </ol>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link to="/scan" search={{ autostart: false, mode: "barcode" }}>
            Open Scan
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/method">How scoring works</Link>
        </Button>
      </div>
    </AppShell>
  );
}
