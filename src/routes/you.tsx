import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { AppShell } from "@/components/lumen/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALLERGEN_OPTIONS, usePrefs, type LabCardSlice } from "@/lib/prefs";
import { useHistory, type HistoryItem } from "@/lib/history";
import { wipeLabStores } from "@/lib/persist";
import { VOICE } from "@/lib/copy";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AccountChip } from "@/components/lumen/account-chip";
import { pauseAccountPush } from "@/components/lumen/account-sync";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/you")({
  component: YouPage,
});

function YouPage() {
  const prefs = usePrefs();
  const history = useHistory();
  const [importNote, setImportNote] = useState<string | null>(null);
  const { user, isPending } = useCurrentUserState();

  function exportLab() {
    const blob = {
      v: 1 as const,
      labName: prefs.labName,
      diet: prefs.diet,
      lifeStage: prefs.lifeStage,
      allergens: prefs.allergens,
      avoidPalm: prefs.avoidPalm,
      avoidFragrance: prefs.avoidFragrance,
      avoidNitrites: prefs.avoidNitrites,
      avoidUpf: prefs.avoidUpf,
      sensitiveSkin: prefs.sensitiveSkin,
      history: history.items,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(blob, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "healthie-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as LabCardSlice & { history?: HistoryItem[]; v?: number };
        prefs.applyLabCard(raw);
        if (Array.isArray(raw.history)) history.replace(raw.history);
        prefs.setOnboardingDone(true);
        setImportNote("Notes restored on this phone.");
      } catch {
        setImportNote("That file is not a Healthie notes file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <AppShell>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Profile</p>
      <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
        {prefs.labName.trim() ? prefs.labName.trim() : "You"}
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
        {user
          ? "Allergens, extras, and scans sync with your account. The independent score never moves for a profile."
          : `${VOICE.localPrefs} Sign in and the same notes follow you to another phone.`}
      </p>

      <section className="mt-10 border-y border-border py-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Across phones</h2>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          {user
            ? "Scans, saved packs, the list, and these notes live on your account. Open Healthie on another phone and sign in — it is already there."
            : "Without an account, notes stay on this phone. Sign in with Google, X, or email and the next device is the same."}
        </p>
        <div className="mt-4">{isPending ? <div className="h-8 w-28 animate-pulse bg-surface-2" /> : <AccountChip />}</div>
      </section>

      {!prefs.onboardingDone ? (
        <div className="mt-8 border-b border-border pb-8">
          <p className="font-display text-2xl font-medium tracking-[-0.03em]">Finish this once</p>
          <p className="mt-2 text-sm text-muted">Tick what matters, then we will remember it on every product.</p>
          <Button className="mt-4 h-12" onClick={() => prefs.setOnboardingDone(true)}>
            Done
          </Button>
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Who are you shopping for?</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pregnancy or a child is a mode, not a note. Watch-outs become stops. Aisles hide those packs. The disc on the pack does not move.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {(
            [
              { id: "none" as const, label: "Everyone", line: "No extra stops." },
              { id: "pregnancy" as const, label: "Pregnancy", line: "High-concern extras become stops." },
              { id: "child" as const, label: "A child", line: "Dyes and extras get no pass." },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => prefs.setLifeStage(d.id)}
              className={cn(
                "min-h-24 px-4 py-4 text-left",
                prefs.lifeStage === d.id ? "bg-fg text-accent-fg" : "bg-surface text-fg",
              )}
            >
              <span className="block font-display text-xl font-medium tracking-[-0.03em]">{d.label}</span>
              <span className={cn("mt-1 block text-sm", prefs.lifeStage === d.id ? "text-accent-fg/70" : "text-muted")}>
                {d.line}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">How you eat</h2>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {(
            [
              { id: "none" as const, label: "No filter" },
              { id: "vegetarian" as const, label: "Vegetarian" },
              { id: "vegan" as const, label: "Vegan" },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => prefs.setDiet(d.id)}
              className={cn(
                "min-h-12 flex-1 px-4 text-left text-[15px] font-medium",
                prefs.diet === d.id ? "bg-fg text-accent-fg" : "bg-surface text-fg",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Allergens</h2>
        <p className="mt-2 text-sm text-muted">We stop you in the aisle. Always double-check the pack.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALLERGEN_OPTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => prefs.toggleAllergen(a.id)}
              className={cn(
                "min-h-12 px-3 text-left text-[14px] font-medium",
                prefs.allergens.includes(a.id) ? "bg-fg text-accent-fg" : "bg-surface text-fg",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">I'd rather skip</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(
            [
              { on: prefs.avoidPalm, toggle: prefs.toggleAvoidPalm, label: "Palm oil" },
              { on: prefs.avoidNitrites, toggle: prefs.toggleAvoidNitrites, label: "Nitrites" },
              { on: prefs.avoidFragrance, toggle: prefs.toggleAvoidFragrance, label: "Fragrance" },
              { on: prefs.avoidUpf, toggle: prefs.toggleAvoidUpf, label: "Ultra-processed" },
              { on: prefs.sensitiveSkin, toggle: prefs.toggleSensitiveSkin, label: "Sensitive skin" },
            ] as const
          ).map((x) => (
            <button
              key={x.label}
              type="button"
              onClick={x.toggle}
              className={cn(
                "min-h-12 px-3 text-left text-[14px] font-medium",
                x.on ? "bg-fg text-accent-fg" : "bg-surface text-fg",
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 border-y border-border py-8">
        <h2 className="font-display text-2xl font-medium tracking-[-0.03em]">Your notes</h2>
        <p className="mt-2 text-sm text-muted">
          {user
            ? "Synced to your account. Export a file if you want a local copy."
            : "Sign in and this follows you. Export a file if you change devices without an account."}
        </p>
        <Input
          className="mt-4"
          value={prefs.labName}
          onChange={(e) => prefs.setLabName(e.target.value)}
          placeholder="A name, if you like"
          aria-label="A name for these notes"
          maxLength={40}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="text-sm font-semibold underline-offset-4 hover:underline" onClick={() => prefs.setOnboardingDone(true)}>
            Save these notes
          </button>
          <button type="button" className="text-sm font-semibold underline-offset-4 hover:underline" onClick={exportLab}>
            Export
          </button>
          <label className="text-sm font-semibold underline-offset-4 hover:underline">
            Import
            <input type="file" accept="application/json" className="sr-only" onChange={onImport} />
          </label>
        </div>
        {importNote ? <p className="mt-2 text-sm text-muted">{importNote}</p> : null}
        <button
          type="button"
          className="mt-6 text-sm text-score-bad underline-offset-4 hover:underline"
          onClick={() => {
            pauseAccountPush();
            prefs.resetLab();
            history.clear();
            void wipeLabStores();
            setImportNote(
              user
                ? "Gone from this phone. The account still has them — sign out and in to bring them back."
                : "Notes, history, saved packs, and the list are gone from this device.",
            );
          }}
        >
          Delete my data on this device
        </button>
      </section>

      {prefs.onboardingDone ? (
        <button type="button" className="mt-6 text-sm text-muted underline-offset-4 hover:underline" onClick={() => prefs.setOnboardingDone(false)}>
          Show the setup again
        </button>
      ) : null}

      <section className="mt-10">
        <LinkRow to="/saved" label="Saved products" hint={`${prefs.favorites.length}`} />
        <LinkRow to="/lists" label="Shopping list" hint={`${prefs.list.length}`} />
        <LinkRow to="/history" label="Scan history" hint={`${history.items.length}`} />
        <LinkRow to="/compare" label="Compare tray" hint={`${prefs.compare.length}/2`} />
        <LinkRow to="/ingredients" label="Ingredient index" hint="What is in the pack" />
        <LinkRow to="/guides" label="Guides" hint="Short reads" />
        <LinkRow to="/method" label="How scoring works" hint="Plain English" />
      </section>
    </AppShell>
  );
}

function LinkRow({
  to,
  label,
  hint,
}: {
  to: "/history" | "/compare" | "/method" | "/saved" | "/ingredients" | "/lists" | "/guides";
  label: string;
  hint: string;
}) {
  return (
    <Link to={to} className="flex min-h-14 items-center justify-between border-b border-border py-3">
      <span className="font-medium">{label}</span>
      <span className="text-sm text-muted">{hint}</span>
    </Link>
  );
}
