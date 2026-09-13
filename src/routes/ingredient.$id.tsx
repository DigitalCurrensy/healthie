import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lumen/shell";
import { lookupIngredient } from "@/lib/server/functions";
import { CHILD_AVOID_IDS, ENDOCRINE_IDS, PREGNANCY_AVOID_IDS, allergensOf } from "@/lib/catalog/flags";
import { ingredientStory } from "@/lib/catalog/ingredient-stories";
import { ALLERGEN_OPTIONS } from "@/lib/prefs";
import { hazardBlurb, hazardLabel } from "@/lib/copy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ingredient/$id")({
  loader: ({ params }) => lookupIngredient({ data: { id: params.id } }),
  component: IngredientPage,
});

function IngredientPage() {
  const data = Route.useLoaderData();
  if (!data) {
    return (
      <AppShell>
        <h1 className="font-display text-2xl font-medium">Unknown ingredient</h1>
        <Link to="/ingredients" className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">
          Back to the index
        </Link>
      </AppShell>
    );
  }
  const { ingredient: ing, products } = data;
  const story = ingredientStory(ing.id, ing.description);
  const allergens = allergensOf(ing.id);
  const flags = [
    ENDOCRINE_IDS.has(ing.id) ? "May affect hormones" : null,
    PREGNANCY_AVOID_IDS.has(ing.id) ? "Extra care in pregnancy" : null,
    CHILD_AVOID_IDS.has(ing.id) ? "Extra care for children" : null,
    ing.isAdditive ? "Listed as an additive" : null,
  ].filter(Boolean) as string[];

  return (
    <AppShell>
      <p className="kicker">{ing.isAdditive ? "Additive" : "Ingredient"}</p>
      <h1 className="mt-1 font-display text-3xl font-medium sm:text-4xl">{ing.name}</h1>
      <p
        className={cn(
          "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium text-accent-fg",
          ing.hazard === "green" && "bg-hazard-green",
          ing.hazard === "yellow" && "bg-hazard-yellow",
          ing.hazard === "orange" && "bg-hazard-orange",
          ing.hazard === "red" && "bg-hazard-red",
        )}
      >
        {hazardLabel(ing.hazard)}
      </p>
      <p className="mt-3 max-w-prose text-sm text-muted">{hazardBlurb(ing.hazard)}</p>

      <section className="mt-8 space-y-6">
        <Block heading="What it is" body={story.whatItIs} />
        <Block heading="Why it’s used" body={story.whyUsed} />
        <Block heading="What to know" body={story.whatToKnow} />
        {story.whoShouldSkip ? <Block heading="Who should skip" body={story.whoShouldSkip} /> : null}
        {story.saferSwap ? <Block heading="A gentler swap" body={story.saferSwap} /> : null}
        {story.everydayExample ? <Block heading="You’ll see it in" body={story.everydayExample} /> : null}
      </section>

      {flags.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {flags.map((f) => (
            <li key={f} className="rounded-full bg-surface px-3 py-1 text-xs font-medium shadow-[var(--shadow-border)]">
              {f}
            </li>
          ))}
        </ul>
      ) : null}
      {allergens.length > 0 ? (
        <p className="mt-3 text-sm text-muted">
          Allergen: {allergens.map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label ?? id).join(", ")}
        </p>
      ) : null}

      <h2 className="mt-10 font-display text-xl font-medium">Found in</h2>
      <ul className="mt-3 space-y-2">
        {products.map((p) => (
          <li key={p.gtin_barcode}>
            <Link
              to="/product/$barcode"
              params={{ barcode: p.gtin_barcode }}
              className="flex min-h-14 items-center justify-between rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
            >
              <span className="font-medium">{p.title}</span>
              <span className="tabular-nums text-sm text-muted">{p.overall_score}</span>
            </Link>
          </li>
        ))}
        {products.length === 0 ? <li className="text-sm text-muted">No catalog matches yet.</li> : null}
      </ul>
      <Link to="/ingredients" className="tap-link mt-6 font-medium text-accent underline-offset-4 hover:underline">
        All ingredients
      </Link>
    </AppShell>
  );
}

function Block({ heading, body }: { heading: string; body: string }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium">{heading}</h2>
      <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted">{body}</p>
    </section>
  );
}
