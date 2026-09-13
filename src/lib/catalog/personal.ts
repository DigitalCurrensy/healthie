import type { EvaluatedProduct } from "./evaluate";
import { ALLERGEN_OPTIONS, type Diet, type LifeStage } from "@/lib/prefs";
import { dietConflicts } from "./flags";
import type { AllergenId } from "@/lib/scoring/types";

export type AlertKind = "stop" | "care";

export type PersonalAlert = {
  kind: AlertKind;
  title: string;
  detail: string;
};

export type PrefsSlice = {
  diet: Diet;
  lifeStage: LifeStage;
  allergens: AllergenId[];
  avoidPalm: boolean;
  avoidFragrance: boolean;
  avoidNitrites: boolean;
  avoidUpf: boolean;
  sensitiveSkin: boolean;
};

export function personalAlerts(product: EvaluatedProduct, prefs: PrefsSlice): PersonalAlert[] {
  const out: PersonalAlert[] = [];
  const allergenHits = product.allergens.filter((a) => prefs.allergens.includes(a));
  if (allergenHits.length > 0) {
    out.push({
      kind: "stop",
      title: "Matches your allergens",
      detail: allergenHits.map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label ?? id).join(", "),
    });
  }
  const dietHits = dietConflicts(product.ingredients, prefs.diet);
  if (dietHits.length > 0) {
    out.push({
      kind: "stop",
      title: prefs.diet === "vegan" ? "Not vegan" : "Not vegetarian",
      detail: dietHits.join(", "),
    });
  }
  if (prefs.avoidPalm && product.flags.includes("palm-oil")) {
    out.push({ kind: "care", title: "Contains palm oil", detail: "You asked us to flag this." });
  }
  if (prefs.avoidNitrites && product.flags.includes("nitrites")) {
    out.push({ kind: "care", title: "Contains nitrites", detail: "Common in cured meat. You asked us to flag this." });
  }
  if (prefs.avoidFragrance && product.flags.includes("fragrance")) {
    out.push({ kind: "care", title: "Fragranced", detail: "You asked us to flag perfume on the list." });
  }
  if (prefs.avoidUpf && product.novaGroup === 4) {
    out.push({
      kind: "care",
      title: "Ultra-processed",
      detail: "Built with factory extras. You asked us to flag this pattern.",
    });
  }
  if (prefs.lifeStage === "pregnancy" && product.concerns.pregnancy.length > 0) {
    out.push({
      kind: "stop",
      title: "Not for pregnancy",
      detail: product.concerns.pregnancy.slice(0, 6).join(", "),
    });
  }
  if (prefs.lifeStage === "child" && product.concerns.child.length > 0) {
    out.push({
      kind: "stop",
      title: "Not for a child",
      detail: product.concerns.child.slice(0, 6).join(", "),
    });
  }
  if (prefs.sensitiveSkin && product.type === "cosmetic") {
    const rough = product.ingredients.filter(
      (i) => i.hazard === "red" || i.hazard === "orange" || i.id === "fragrance" || i.id === "sls" || i.id === "sles",
    );
    if (rough.length > 0) {
      out.push({
        kind: "care",
        title: "May not suit sensitive skin",
        detail: rough
          .slice(0, 5)
          .map((i) => i.name)
          .join(", "),
      });
    }
  }
  return out;
}

export function forYouScore(product: EvaluatedProduct, prefs: PrefsSlice): { score: number; reasons: string[] } | null {
  let delta = 0;
  const reasons: string[] = [];
  const allergenHits = product.allergens.filter((a) => prefs.allergens.includes(a));
  if (allergenHits.length) {
    delta -= 40;
    reasons.push("allergen");
  }
  const dietHits = dietConflicts(product.ingredients, prefs.diet);
  if (dietHits.length) {
    delta -= 25;
    reasons.push(prefs.diet);
  }
  if (prefs.avoidPalm && product.flags.includes("palm-oil")) {
    delta -= 12;
    reasons.push("palm oil");
  }
  if (prefs.avoidNitrites && product.flags.includes("nitrites")) {
    delta -= 20;
    reasons.push("nitrites");
  }
  if (prefs.avoidFragrance && product.flags.includes("fragrance")) {
    delta -= 15;
    reasons.push("fragrance");
  }
  if (prefs.avoidUpf && product.novaGroup === 4) {
    delta -= 15;
    reasons.push("ultra-processed");
  }
  if (prefs.lifeStage === "pregnancy" && product.concerns.pregnancy.length) {
    delta -= 18;
    reasons.push("pregnancy extras");
  }
  if (prefs.lifeStage === "child" && product.concerns.child.length) {
    delta -= 12;
    reasons.push("child extras");
  }
  if (delta === 0) return null;
  return { score: Math.max(0, Math.min(100, product.score.overall + delta)), reasons };
}
