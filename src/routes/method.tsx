import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";

export const Route = createFileRoute("/method")({
  component: MethodPage,
});

function MethodPage() {
  return (
    <AppShell>
      <PageHeader
        kicker="The rules"
        title="How scoring works"
        body="A number from 0 to 100, the same for food, beauty, and pet. No brand pays for a better score. We read the pack — nutrition and the ingredient list — and we keep the language human."
      />

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Four colours</h2>
        <ul className="mt-3 space-y-2 text-[15px]">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">75–100 · Excellent</p>
            <p className="mt-1 text-muted">A keep. Everyday food, a calm cream, an honest bag of kibble.</p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">50–74 · Good</p>
            <p className="mt-1 text-muted">Fine sometimes. There is usually a better neighbour in the same aisle.</p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">25–49 · Poor</p>
            <p className="mt-1 text-muted">A treat, not a habit.</p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">0–24 · Avoid</p>
            <p className="mt-1 text-muted">Leave it. The swap is close by.</p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Food</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Half the number is the nutrition box. A quarter is the extras on the list. A fifth is how processed the pack
          is. Organic adds a little — it cannot rescue a sugary drink. Then ceilings apply, so a weak box or a
          high-concern extra cannot hide behind a pretty mix.
        </p>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Nutrition quality · 50%</p>
            <p className="mt-1 text-muted">
              Energy, sugars, saturated fat and salt pull the number down. Fibre, protein and fruit or vegetables lift
              it. Drinks are judged more strictly than solids. Water sits at the top. A letter E box — a cola, a
              candy — cannot be rated Good, no matter what else is true.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Ingredients · 25%</p>
            <p className="mt-1 text-muted">
              High-concern extras take 28 off. Moderate take 14. Low take 5. Palm oil takes 8. Four or more extras take
              another 8. Two intense sweeteners take another 10. One high-concern extra, or two moderate ones, caps
              the pack at Poor. Two high-concern extras cap it at Avoid.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">How processed · 20%</p>
            <p className="mt-1 text-muted">
              Just food, a kitchen staple, simply made, or ultra-processed. A factory recipe — flavours, colours, many
              additives — cannot be an everyday Excellent. With a weak nutrition box it cannot be Good either.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Organic · 5%</p>
            <p className="mt-1 text-muted">A verified organic mark adds a small bonus. It cannot rescue a sugary drink or a nitrite ham.</p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Alongside the number</h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">How processed</p>
            <p className="mt-1 text-muted">
              Just food, a kitchen staple, simply made, or ultra-processed. If your grandmother wouldn’t recognise the
              list, it’s the last one.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Sugar, salt, fat colours</p>
            <p className="mt-1 text-muted">Low, medium, high — per 100 g, the way a front-of-pack label would.</p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Planet</p>
            <p className="mt-1 text-muted">
              A rough mark from organic farming, processing, palm oil and a few heavy extras. Not a full life-cycle
              study — a compass.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Beauty</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          The lowest-rated ingredient sets the ceiling. One high-concern extra can keep a pretty bottle out of the
          green. Hormone-signal flags, pregnancy notes, and child notes sit beside the number — they never inflate it.
        </p>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
          {[
            { extra: "High concern", ceiling: "24", examples: "Parabens, BHT, lilial, triclosan" },
            { extra: "Worth watching", ceiling: "49", examples: "Some PEGs, phenoxyethanol, SLS" },
            { extra: "Low concern", ceiling: "74", examples: "Fragrance, linalool, limonene" },
            { extra: "No concern", ceiling: "75–100", examples: "Water, glycerin, shea, aloe" },
          ].map((row) => (
            <li key={row.extra} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{row.extra}</p>
                <p className="shrink-0 tabular-nums text-sm text-muted">Ceiling {row.ceiling}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{row.examples}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Pet</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          The bowl and the extras share the number — 40% named-meat protein, 40% controversial extras (BHA, dyes,
          propylene glycol, nitrites). How processed is 15%. Organic adds a little. Same 0–100 scale as the rest of
          the shop. A dye in a dog bowl is a hard no.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Better neighbours</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          When something scores below 75, we look in the same aisle for a product at 75 or above that is most like it —
          same job, cleaner list. Ranked by how close the recipe and nutrition sit, not by who paid.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Where the data comes from</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Our shelves first. Then the nightly Open Food Facts dump — about 4.7 million food barcodes, plus beauty and
          pet. We pull the newest night’s changes into this pantry. A pack that isn’t here yet is looked up live, so
          the long tail still scores when the pantry is already up.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Shelf prices come from Open Prices, the public receipt and tag log. Sign in and scans, saved packs, and your
          notes follow you to the next phone.
        </p>
        <p className="mt-4 text-sm text-muted">
          Product facts © Open Food Facts contributors, ODbL. Healthie is a reading aid, not a diagnosis.{" "}
          <Link
            to="/guides/$slug"
            params={{ slug: "how-to-read-a-score" }}
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            How to read a score
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
