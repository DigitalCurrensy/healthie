import { ingredientsByIds } from "./match";
import { productConcerns } from "./flags";
import { PRODUCT_BY_BARCODE } from "./products";
import type { LifeStage } from "../prefs";

export function shoppingModeLabel(stage: LifeStage): string {
  if (stage === "pregnancy") return "Shopping for pregnancy";
  if (stage === "child") return "Shopping for a child";
  return "";
}

export function cardFlaggedForMode(barcode: string, stage: LifeStage): boolean {
  if (stage === "none") return false;
  const def = PRODUCT_BY_BARCODE.get(barcode);
  if (!def) return false;
  const c = productConcerns(ingredientsByIds(def.ingredientIds));
  return stage === "pregnancy" ? c.pregnancy.length > 0 : c.child.length > 0;
}
