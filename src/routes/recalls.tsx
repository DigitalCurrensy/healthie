import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { listRecalls } from "@/lib/server/functions";

export const Route = createFileRoute("/recalls")({
  loader: () => listRecalls(),
  component: RecallsPage,
});

function RecallsPage() {
  const rows = Route.useLoaderData();
  return (
    <AppShell>
      <PageHeader
        kicker="Safety"
        title="Ongoing recalls"
        body="Live from openFDA food enforcement. If a scan’s GTIN or lot matches, the pack shows a stop. We do not invent lots for shelves that are clean."
      />
      <img
        src="/images/recall.jpg"
        alt="A pack and a recall notice"
        className="mt-6 aspect-[4/3] w-full rounded-xl object-cover shadow-[var(--shadow-border)]"
      />
      {rows.length === 0 ? (
        <p className="mt-6 text-[15px] text-muted">The feed is quiet or unreachable. Scan still checks the date on a Digital Link.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li key={r.eventId + r.product.slice(0, 24)} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="kicker">
                {r.classification || "Recall"}
                {r.date ? ` · ${r.date}` : ""}
              </p>
              <p className="mt-1 font-medium leading-snug">{r.firm || "A recalling firm"}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.product.slice(0, 280)}</p>
              {r.reason ? <p className="mt-2 text-sm leading-relaxed">{r.reason.slice(0, 220)}</p> : null}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-muted">
        Source: openFDA. Always check the pack and the{" "}
        <a className="tap-link font-medium text-accent" href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts">
          FDA recall board
        </a>
        . <Link to="/scan" search={{ autostart: false, mode: "barcode" }} className="tap-link font-medium text-accent">
          Scan a pack
        </Link>
      </p>
    </AppShell>
  );
}
