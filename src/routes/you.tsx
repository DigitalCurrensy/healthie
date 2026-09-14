import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALLERGEN_OPTIONS, usePrefs, type LabCardSlice } from "@/lib/prefs";
import { useHistory, type HistoryItem } from "@/lib/history";
import { wipeLabStores } from "@/lib/persist";
import { VOICE } from "@/lib/copy";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AccountChip } from "@/components/lumen/account-chip";
import { pauseAccountPush } from "@/components/lumen/account-sync";

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
        setImportNote("That file isn\u2019t a Healthie notes file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <AppShell>
      <PageHeader
        kicker="Your notes"
        title={prefs.labName.trim() ? prefs.labName.trim() : "You"}
        body={
          user
            ? "Allergens, extras, and scans sync with your account. The independent score never moves for a profile."
            : `${VOICE.localPrefs} Sign in and the same notes follow you to another phone.`
        }
      />

      <section className="mt-8 border-b border-border pb-6">
        <p className="kicker">{user ? "Signed in" : "Across phones"}</p>
        <h2 className="mt-1 font-display text-xl font-medium">
          {user ? "These notes are yours" : "Take history with you"}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          {user
            ? "Scans, saved packs, the list, and these notes live on your account. Open Healthie on another phone and sign in \u2014 it\u2019s already there."
            : "Without an account, notes stay on this phone. Sign in with Google, X, or email and the next device is the same."}
        </p>
        <div className="mt-4">
          {isPending ? (
            <div className="h-8 w-28 animate-pulse bg-surface-2" />
          ) : (
            <AccountChip />
          )}
        </div>
      </section>

      {!prefs.onboardingDone ? (
        <div className="mt-6 border-b border-border pb-6">
          <p className="font-medium">Finish this once</p>
          <p className="mt-1 text-sm text-muted">Tick what matters, then we\u2019ll remember it on every product.</p>
          <Button className="mt-3" onClick={() => prefs.setOnboardingDone(true)}>
            I\u2019m done
          </Button>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Who you\u2019re shopping for</h2>
        <p className="mt-1 text-sm text-muted">
          Pregnancy or a child is a mode, not a note. Watch-outs become stops. Aisles hide those packs. The disc on the
          pack does not move.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["none", "pregnancy", "child"] as const).map((d) => (
            <Button
              key={d}
              size="sm"
              variant={prefs.lifeStage === d ? "default" : "secondary"}
              onClick={() => prefs.setLifeStage(d)}
            >
              {d === "none" ? "Everyone" : d === "pregnancy" ? "Pregnancy" : "A child"}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">How you eat</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["none", "vegetarian", "vegan"] as const).map((d) => (
            <Button key={d} size="sm" variant={prefs.diet === d ? "default" : "secondary"} onClick={() => prefs.setDiet(d)}>
              {d === "none" ? "No filter" : d === "vegetarian" ? "Vegetarian" : "Vegan"}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Allergens</h2>
        <p className="mt-1 text-sm text-muted">We\u2019ll stop you in the aisle. Always double-check the pack.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant={prefs.allergens.includes(a.id) ? "default" : "secondary"}
              onClick={() => prefs.toggleAllergen(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">I\u2019d rather skip</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant={prefs.avoidPalm ? "default" : "secondary"} onClick={prefs.toggleAvoidPalm}>
            Palm oil
          </Button>
          <Button size="sm" variant={prefs.avoidNitrites ? "default" : "secondary"} onClick={prefs.toggleAvoidNitrites}>
            Nitrites
          </Button>
          <Button size="sm" variant={prefs.avoidFragrance ? "default" : "secondary"} onClick={prefs.toggleAvoidFragrance}>
            Fragrance
          </Button>
          <Button size="sm" variant={prefs.avoidUpf ? "default" : "secondary"} onClick={prefs.toggleAvoidUpf}>
            Ultra-processed
          </Button>
          <Button size="sm" variant={prefs.sensitiveSkin ? "default" : "secondary"} onClick={prefs.toggleSensitiveSkin}>
            Sensitive skin
          </Button>
        </div>
      </section>

      <section className="mt-8 border-y border-border py-6">
        <h2 className="font-display text-xl font-medium">Your notes</h2>
        <p className="mt-1 text-sm text-muted">
          {user
            ? "Synced to your account. Export a file if you want a local copy."
            : "Sign in and this follows you. Export a file if you change devices without an account."}
        </p>
        <Input
          className="mt-3"
          value={prefs.labName}
          onChange={(e) => prefs.setLabName(e.target.value)}
          placeholder="A name, if you like"
          aria-label="A name for these notes"
          maxLength={40}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => prefs.setOnboardingDone(true)}>Save these notes</Button>
          <Button variant="secondary" onClick={exportLab}>
            Export
          </Button>
          <Button variant="secondary" asChild>
            <label>
              Import
              <input type="file" accept="application/json" className="sr-only" onChange={onImport} />
            </label>
          </Button>
        </div>
        {importNote ? <p className="mt-2 text-sm text-muted">{importNote}</p> : null}
        <button
          type="button"
          className="mt-4 text-sm text-score-bad underline-offset-4 hover:underline"
          onClick={() => {
            pauseAccountPush();
            prefs.resetLab();
            history.clear();
            void wipeLabStores();
            setImportNote(
              user
                ? "Gone from this phone. The account still has them \u2014 sign out and in to bring them back."
                : "Notes, history, saved packs, and the list are gone from this device.",
            );
          }}
        >
          Delete my data on this device
        </button>
      </section>

      {prefs.onboardingDone ? (
        <Button variant="ghost" className="mt-4" onClick={() => prefs.setOnboardingDone(false)}>
          Show the setup again
        </Button>
      ) : null}

      <section className="mt-8">
        <LinkRow to="/saved" label="Saved products" hint={`${prefs.favorites.length}`} />
        <LinkRow to="/lists" label="Shopping list" hint={`${prefs.list.length}`} />
        <LinkRow to="/history" label="Scan history" hint={`${history.items.length}`} />
        <LinkRow to="/compare" label="Compare tray" hint={`${prefs.compare.length}/2`} />
        <LinkRow to="/ingredients" label="Ingredient index" hint="What\u2019s in the pack" />
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
    <Link
      to={to}
      className="flex min-h-14 items-center justify-between border-b border-border py-3 transition-colors hover:text-pine"
    >
      <span className="font-medium">{label}</span>
      <span className="text-sm text-muted">{hint}</span>
    </Link>
  );
}
