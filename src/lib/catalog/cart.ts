import { PRODUCT_BY_BARCODE } from "./products";
import { scoreBand, type ScoreBand } from "../utils";
import { bandLabel } from "../copy";
import type { ListItem } from "../prefs";

export type CartWeek = {
  overall: number;
  band: ScoreBand;
  of: number;
  poor: number;
  avoid: number;
  headline: string;
  sugarTspWeek: number;
  sugarLine: string | null;
};

/**
 * The week, not the pack. Two Poor everyday items cap the list at Poor.
 * A can of cola a day is counted in teaspoons.
 */
export function scoreCart(items: Pick<ListItem, "barcode" | "title" | "score" | "checked">[]): CartWeek | null {
  const pool = items.filter((i) => !i.checked);
  const use = pool.length ? pool : items;
  if (use.length === 0) return null;

  const scores = use.map((i) => i.score);
  const poor = use.filter((i) => i.score < 50).length;
  const avoid = use.filter((i) => i.score < 25).length;
  let overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  if (avoid >= 1 && poor >= 2) overall = Math.min(overall, 24);
  else if (poor >= 2) overall = Math.min(overall, 49);
  else if (poor / use.length >= 0.5) overall = Math.min(overall, 49);

  let sugarTspWeek = 0;
  for (const item of use) {
    const def = PRODUCT_BY_BARCODE.get(item.barcode);
    if (!def?.isBeverage || !def.nutrition || def.isWater) continue;
    if (def.nutrition.sugars >= 5) {
      sugarTspWeek += Math.round((def.nutrition.sugars * 3.3) / 4);
    }
  }

  const band = scoreBand(overall);
  let headline: string;
  if (use.length === 1) {
    headline = `${use[0]!.title} alone is ${bandLabel(band).toLowerCase()}. Add the rest of the week.`;
  } else if (band === "excellent") {
    headline = `This list is a keep week — ${use.length} packs, none of them a factory habit.`;
  } else if (band === "good") {
    headline = `A mixed week. Fine if the Poor packs stay treats.`;
  } else if (avoid > 0) {
    headline = `${avoid} pack${avoid === 1 ? "" : "s"} on this list we’d leave on the shelf. The week is not a keep.`;
  } else {
    headline = `${poor} of ${use.length} packs cannot be everyday. This is a treat week, not a Good one.`;
  }

  const sugarLine =
    sugarTspWeek >= 8
      ? `Drinks on this list are about ${sugarTspWeek} teaspoons of sugar a day if you pour one each. A week is ${sugarTspWeek * 7} teaspoons.`
      : null;

  return { overall, band, of: use.length, poor, avoid, headline, sugarTspWeek, sugarLine };
}
