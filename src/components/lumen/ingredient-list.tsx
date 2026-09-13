import { Link } from "@tanstack/react-router";
import type { AdditivePenalty, MatchedIngredient } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { hazardLabel } from "@/lib/copy";
import { ingredientStory } from "@/lib/catalog/ingredient-stories";

export function IngredientList({
  ingredients,
  unmatched,
  penalties,
}: {
  ingredients: MatchedIngredient[];
  unmatched?: string[];
  penalties?: AdditivePenalty[];
}) {
  if (ingredients.length === 0 && (!unmatched || unmatched.length === 0)) {
    return <p className="text-sm text-muted">No ingredients were listed for this product.</p>;
  }

  const order = { red: 0, orange: 1, yellow: 2, green: 3 } as const;
  const sorted = [...ingredients].sort((a, b) => order[a.hazard] - order[b.hazard]);
  const penaltyById = new Map((penalties ?? []).map((p) => [p.ingredientId, p]));

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((ing) => {
        const story = ingredientStory(ing.id, ing.description);
        const penalty = penaltyById.get(ing.id);
        return (
          <li key={ing.id}>
            <Link
              to="/ingredient/$id"
              params={{ id: ing.id }}
              className="block min-h-11 rounded-lg bg-surface px-3.5 py-3 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    ing.hazard === "green" && "bg-hazard-green",
                    ing.hazard === "yellow" && "bg-hazard-yellow",
                    ing.hazard === "orange" && "bg-hazard-orange",
                    ing.hazard === "red" && "bg-hazard-red",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium leading-snug text-fg">
                      {ing.name}
                      {ing.eNumber ? (
                        <span className="ml-1.5 text-sm font-normal text-muted">{ing.eNumber}</span>
                      ) : null}
                    </p>
                    <span className="shrink-0 text-xs font-medium text-muted">
                      {penalty ? `−${penalty.points}` : hazardLabel(ing.hazard)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{story.whatToKnow}</p>
                  {ing.endocrine || ing.pregnancyAvoid || ing.childAvoid ? (
                    <p className="mt-1.5 text-xs text-muted">
                      {[
                        ing.endocrine ? "May affect hormones" : null,
                        ing.pregnancyAvoid ? "Extra care in pregnancy" : null,
                        ing.childAvoid ? "Extra care for children" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
      {unmatched && unmatched.length > 0 ? (
        <li className="px-1 pt-2 text-sm text-muted">Also on the pack: {unmatched.slice(0, 8).join(", ")}</li>
      ) : null}
    </ul>
  );
}
