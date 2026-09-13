import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/lumen/product-card";
import { GUIDE_BY_SLUG, GUIDES } from "@/lib/catalog/guides";
import { AISLE_BY_PATH } from "@/lib/catalog/aisles";
import { INGREDIENT_BY_ID } from "@/lib/catalog/ingredients";
import { listFeatured } from "@/lib/server/functions";

export const Route = createFileRoute("/guides/$slug")({
  loader: () => listFeatured(),
  component: GuidePage,
});

function GuidePage() {
  const cards = Route.useLoaderData();
  const { slug } = Route.useParams();
  const guide = GUIDE_BY_SLUG.get(slug);

  if (!guide) {
    return (
      <AppShell>
        <h1 className="font-display text-3xl font-bold">Guide not found</h1>
        <Button asChild className="mt-6">
          <Link to="/guides">All guides</Link>
        </Button>
      </AppShell>
    );
  }

  const related = cards.filter((c) => guide.relatedBarcodes.includes(c.barcode));
  const aisleCards =
    guide.aisle
      ? cards
          .filter((c) => c.categoryPath === guide.aisle)
          .slice()
          .sort((a, b) => a.overallScore - b.overallScore)
      : [];
  const aisleWorst = aisleCards.slice(0, 2);
  const aisleBest = aisleCards.slice(-2).reverse();
  const examples = related.length ? related : [...aisleWorst, ...aisleBest];
  const aisle = guide.aisle ? AISLE_BY_PATH.get(guide.aisle) : undefined;
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  return (
    <AppShell>
      <Link
        to="/guides"
        className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> All guides
      </Link>

      <div className="relative overflow-hidden rounded-2xl">
        <img src={guide.image} alt="" className="aspect-[16/8] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fg/70 via-transparent to-transparent" />
        <p className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent-fg/85">
          {guide.kicker} · {guide.minutes} min
        </p>
      </div>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">{guide.title}</h1>
      <p className="mt-3 max-w-prose text-[17px] leading-relaxed text-muted">{guide.lede}</p>

      {aisle ? (
        <Link
          to="/aisle/$slug"
          params={{ slug: aisle.slug }}
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold"
        >
          Shop the {aisle.title} aisle <ArrowRight className="size-4" />
        </Link>
      ) : null}

      <div className="mt-8 space-y-8">
        {guide.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-bold">{s.heading}</h2>
            <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>

      {guide.relatedIngredients.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">The extras we mean</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.relatedIngredients.map((id) => {
              const ing = INGREDIENT_BY_ID.get(id);
              if (!ing) return null;
              return (
                <Link
                  key={id}
                  to="/ingredient/$id"
                  params={{ id }}
                  className="inline-flex min-h-11 items-center rounded-full bg-surface px-3 text-sm font-semibold shadow-[var(--shadow-border)]"
                >
                  {ing.name}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {examples.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">On our shelves</h2>
          <p className="mt-1 text-sm text-muted">Real packs. Tap one — the score is the same as the rest of the shop.</p>
          <div className="mt-4 flex flex-col gap-2">
            {examples.slice(0, 6).map((p) => (
              <ProductCard
                key={p.barcode}
                barcode={p.barcode}
                title={p.title}
                brand={p.brand}
                type={p.type}
                isOrganic={p.isOrganic}
                score={p.overallScore}
                imageUrl={p.imageUrl}
                categoryPath={p.categoryPath}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">Keep reading</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map((g) => (
            <Link
              key={g.slug}
              to="/guides/$slug"
              params={{ slug: g.slug }}
              className="flex min-h-16 gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]"
            >
              <img src={g.image} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{g.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{g.kicker}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
