import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { MIXER_VERSION } from "@/lib/scoring/mix";

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
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Print / save PDF
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a href="/method.txt" download>
                Download
              </a>
            </Button>
          </div>
        }
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
              High-concern extras (nitrites, some dyes in a child pack) knock the list hard. Moderate extras knock it
              less. A quiet kitchen list holds it up. One high-concern extra, or a cluster of moderate ones, keeps the
              pack at Poor. Two high-concern extras mean Avoid.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">How processed · 20%</p>
            <p className="mt-1 text-muted">
              Just food, a kitchen staple, simply made, or ultra-processed. A factory recipe — flavours, colours, many
              additives — cannot be rated Good. With a weak nutrition box it is Poor.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Organic · 5%</p>
            <p className="mt-1 text-muted">A verified organic mark adds a small bonus. It cannot rescue a sugary drink or a nitrite ham.</p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">The council — three locks Yuka does not have</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          A dietitian, an additive scientist, and a shopper would agree on these. They are not a paid board. They are
          rules that cannot be bought.
        </p>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">A weak nutrition box cannot be Good</p>
            <p className="mt-1 text-muted">
              Nutri-Score 2023 — including the drink-sweetener penalty — is half the number. A cola is a weak box. That
              is the ceiling.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Ultra-processed food cannot be Good</p>
            <p className="mt-1 text-muted">
              Yuka can still paint a chip yellow. We will not. A factory recipe is a treat, not a habit. Doritos is the
              proof.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">One high-concern extra cannot hide</p>
            <p className="mt-1 text-muted">
              Nitrites, some dyes, a paraben on a cream. Watch-outs sit on the pack without extra taps. Pregnancy and
              child notes do not wait for a profile.
            </p>
          </li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          On every pack we also say where it sits in its aisle, and — for a drink or a chip — what a real serving is,
          not just per 100 g. A can of cola is a dessert. Per 100 ml pretends it isn’t.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          The live camera lives on the{" "}
          <Link to="/install" className="tap-link font-medium text-accent">
            home screen
          </Link>
          . Ongoing pulls are on{" "}
          <Link to="/recalls" className="tap-link font-medium text-accent">
            Recalls
          </Link>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">How processed — four groups</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          This is the NOVA system, from public-health research. It asks how far a pack is from a kitchen, not how many
          calories it has. Healthie uses it as a fifth of the food number, and as a hard limit: ultra-processed food
          cannot be rated Good.
        </p>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Just food</p>
            <p className="mt-1 text-muted">
              An apple, oats, a piece of fish, plain yogurt, frozen peas. One ingredient, or close. This is the baseline.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Kitchen staple</p>
            <p className="mt-1 text-muted">
              Oil, sugar, salt, flour, butter. You cook with these. They are not a meal.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Simply made</p>
            <p className="mt-1 text-muted">
              Bread, cheese, tinned tomatoes, smoked fish. A few extra steps. Still recognisable as food.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Ultra-processed</p>
            <p className="mt-1 text-muted">
              Flavours, colours, emulsifiers, a list you could not shop. Doritos, cola, most bars. One pack is not
              poison. A diet of them crowds out real food — so we will not call them Good.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">How this compares</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Other labels answer one question. Healthie answers three, then puts a lock on the door so a factory chip
          cannot wear a green disc.
        </p>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Nutri-Score (the EU nutrition letter)</p>
            <p className="mt-1 text-muted">
              Looks only at the nutrition box — energy, sugars, saturated fat, salt, fibre, protein, fruit. A pack of
              chips can land a middling letter if salt is not terrible. It does not read additives. It does not know
              ultra-processed. We use this as half the number, not the whole verdict.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">NOVA (how processed)</p>
            <p className="mt-1 text-muted">
              Looks only at the recipe. Unsweetened soy milk and a bag of Doritos can both be ultra-processed. Nutrition
              is invisible. We use this as a fifth of the number, and as a lock: group 4 cannot be Good.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Yuka</p>
            <p className="mt-1 text-muted">
              Nutrition about 60%, additives 30%, organic 10%. No processing lock. That is why a flavoured chip can still
              come out yellow. Healthie is stricter on factory recipes.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Health Star Rating</p>
            <p className="mt-1 text-muted">
              A 0.5–5 star mark used in Australia and New Zealand. Industry-influenced, and it can reward low-fat
              reformulations that still carry a long additive list. We do not use it.
            </p>
          </li>
          <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium">Healthie</p>
            <p className="mt-1 text-muted">
              Nutrition half, extras a quarter, processing a fifth, organic a little. Then locks: a weak box cannot be
              Good; ultra-processed cannot be Good; one high-concern extra cannot hide. Same 0–100 for food, beauty,
              and pet.
            </p>
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
          Our shelves first. Then public product facts — millions of food, beauty, and pet barcodes. A pack that isn’t
          here yet is looked up when you scan it.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Shelf prices come from Open Prices, the public receipt and tag log. Sign in and scans, saved packs, and your
          notes follow you to the next phone.
        </p>
        <p className="mt-4 text-sm text-muted">
          Product facts from open data contributors. Healthie is a reading aid, not a diagnosis.{" "}
          <Link
            to="/guides/$slug"
            params={{ slug: "how-to-read-a-score" }}
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            How to read a score
          </Link>
        </p>
        <p className="mt-6 text-xs text-subtle">Method {MIXER_VERSION}</p>
      </section>
    </AppShell>
  );
}
