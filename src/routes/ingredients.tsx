import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { PageHeader } from "@/components/lumen/empty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { CHILD_AVOID_IDS, ENDOCRINE_IDS, PREGNANCY_AVOID_IDS } from "@/lib/catalog/flags";
import { ingredientStory } from "@/lib/catalog/ingredient-stories";
import { hazardLabel } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { HazardLevel } from "@/lib/scoring/types";

export const Route = createFileRoute("/ingredients")({
  component: IngredientsPage,
});

type Filter = "all" | HazardLevel | "hormones" | "additive";

function IngredientsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return INGREDIENTS.filter((ing) => {
      if (filter === "hormones" && !ENDOCRINE_IDS.has(ing.id)) return false;
      if (filter === "additive" && !ing.isAdditive) return false;
      if (filter !== "all" && filter !== "hormones" && filter !== "additive" && ing.hazard !== filter) return false;
      if (!needle) return true;
      return (
        ing.name.toLowerCase().includes(needle) ||
        ing.id.includes(needle) ||
        (ing.eNumber ?? "").toLowerCase().includes(needle) ||
        (ing.inciCode ?? "").toLowerCase().includes(needle)
      );
    }).sort((a, b) => {
      const order: Record<HazardLevel, number> = { red: 0, orange: 1, yellow: 2, green: 3 };
      return order[a.hazard] - order[b.hazard] || a.name.localeCompare(b.name);
    });
  }, [query, filter]);

  return (
    <AppShell>
      <PageHeader
        kicker="The back of the pack"
        title="Ingredients"
        body={`${INGREDIENTS.length} extras and everyday foods, written so you can decide in the aisle.`}
      />
      <div className="mt-4 space-y-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or code"
          aria-label="Search ingredients"
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["red", "High concern"],
              ["orange", "Watch"],
              ["yellow", "Low"],
              ["green", "Calm"],
              ["hormones", "Hormones"],
              ["additive", "Additives"],
            ] as const
          ).map(([k, label]) => (
            <Button key={k} size="sm" variant={filter === k ? "default" : "secondary"} onClick={() => setFilter(k)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{rows.length} ingredients</p>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((ing) => {
          const story = ingredientStory(ing.id, ing.description);
          return (
            <li key={ing.id}>
              <Link
                to="/ingredient/$id"
                params={{ id: ing.id }}
                className="flex items-start gap-3 rounded-xl bg-surface px-3.5 py-3 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    ing.hazard === "green" && "bg-hazard-green",
                    ing.hazard === "yellow" && "bg-hazard-yellow",
                    ing.hazard === "orange" && "bg-hazard-orange",
                    ing.hazard === "red" && "bg-hazard-red",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ing.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{story.whatToKnow}</p>
                  <p className="mt-1 text-xs text-muted">
                    {hazardLabel(ing.hazard)}
                    {ENDOCRINE_IDS.has(ing.id) || PREGNANCY_AVOID_IDS.has(ing.id) || CHILD_AVOID_IDS.has(ing.id)
                      ? ` · ${[
                          ENDOCRINE_IDS.has(ing.id) ? "hormones" : null,
                          PREGNANCY_AVOID_IDS.has(ing.id) ? "pregnancy" : null,
                          CHILD_AVOID_IDS.has(ing.id) ? "children" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}`
                      : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
