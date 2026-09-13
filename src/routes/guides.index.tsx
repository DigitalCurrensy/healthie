import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { Button } from "@/components/ui/button";
import { GUIDE_PERSONAS, GUIDES, type GuidePersona } from "@/lib/catalog/guides";

export const Route = createFileRoute("/guides/")({
  component: GuidesIndex,
});

function GuidesIndex() {
  const [persona, setPersona] = useState<GuidePersona | "all">("all");
  const list = useMemo(() => {
    if (persona === "all") return GUIDES;
    return GUIDES.filter((g) => (g.persona ?? ["shop"]).includes(persona));
  }, [persona]);
  const featured = list[0] ?? GUIDES[0]!;
  const rest = list.filter((g) => g.slug !== featured.slug);

  return (
    <AppShell wide>
      <PageHeader
        kicker="Read once, shop faster"
        title="Guides"
        body="Short notes for the shop — sugar, gut extras, kids’ lunchboxes, retinol, the freezer. Pick who you are shopping for."
      />

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GUIDE_PERSONAS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={persona === p.id ? "default" : "secondary"}
            className="shrink-0"
            onClick={() => setPersona(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {list.length} {list.length === 1 ? "guide" : "guides"}
      </p>

      <Link
        to="/guides/$slug"
        params={{ slug: featured.slug }}
        className="group relative mt-6 block overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]"
      >
        <img
          src={featured.image}
          alt=""
          className="aspect-[16/8] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fg/75 via-fg/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-accent-fg sm:p-7">
          <p className="kicker text-accent-fg/80">{featured.kicker}</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{featured.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-accent-fg/85 sm:text-[15px]">{featured.lede}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
            Open the guide <ArrowRight className="size-4" />
          </p>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rest.map((g) => (
          <Link
            key={g.slug}
            to="/guides/$slug"
            params={{ slug: g.slug }}
            className="group overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={g.image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fg/45 via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <p className="kicker">{g.kicker}</p>
              <h2 className="mt-1 font-display text-xl font-bold leading-snug">{g.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{g.lede}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-fg">
                {g.minutes} min read <ArrowRight className="size-3.5 text-subtle" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
