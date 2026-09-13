import { INGREDIENTS, type IngredientDef } from "./ingredients";
import { allergensOf, concernFlags } from "./flags";
import type { MatchedIngredient } from "@/lib/scoring/types";

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const E_NUM = /\be[\s-]?(\d{3,4}[a-z]?)\b/gi;

const ALIAS_INDEX = new Map<string, IngredientDef>();
for (const ing of INGREDIENTS) {
  ALIAS_INDEX.set(fold(ing.name), ing);
  if (ing.inciCode) ALIAS_INDEX.set(fold(ing.inciCode), ing);
  if (ing.eNumber) ALIAS_INDEX.set(fold(ing.eNumber), ing);
  for (const a of ing.aliases) ALIAS_INDEX.set(fold(a), ing);
}

/** Split on comma / semicolon / newline. Keep parentheses and “mono- and diglycerides”. */
export function splitIngredientList(text: string): string[] {
  if (!text.trim()) return [];
  const parts: string[] = [];
  let buf = "";
  let depth = 0;
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";" || ch === "\n") && depth === 0) {
      const piece = buf.replace(/\s+/g, " ").trim();
      if (piece) parts.push(piece);
      buf = "";
    } else {
      buf += ch;
    }
  }
  const last = buf.replace(/\s+/g, " ").trim();
  if (last) parts.push(last);
  return parts.filter((p) => p.length > 1 && p.length < 120);
}

export function matchToken(token: string): IngredientDef | undefined {
  const folded = fold(token);
  if (!folded) return undefined;
  const direct = ALIAS_INDEX.get(folded);
  if (direct) return direct;
  for (const [alias, ing] of ALIAS_INDEX) {
    if (alias.length < 4) continue;
    if (folded === alias) return ing;
    if (folded.includes(alias) && alias.length / folded.length > 0.55) return ing;
  }
  const e = [...token.matchAll(E_NUM)][0];
  if (e) {
    const code = `e${e[1]!.toLowerCase()}`;
    return ALIAS_INDEX.get(code) ?? ALIAS_INDEX.get(`e ${e[1]!.toLowerCase()}`);
  }
  return undefined;
}

export function parseIngredients(text: string): {
  matched: MatchedIngredient[];
  unmatched: string[];
} {
  const parts = splitIngredientList(text);
  const matched: MatchedIngredient[] = [];
  const unmatched: string[] = [];
  const seen = new Set<string>();

  const eHits = [...text.matchAll(E_NUM)];
  for (const hit of eHits) {
    const id = `e${hit[1]!.toLowerCase()}`;
    const ing =
      ALIAS_INDEX.get(id) ?? INGREDIENTS.find((i) => i.eNumber?.toLowerCase() === `e${hit[1]!.toLowerCase()}`);
    if (ing && !seen.has(ing.id)) {
      seen.add(ing.id);
      matched.push(toMatched(ing));
    }
  }

  for (const part of parts) {
    const ing = matchToken(part);
    if (ing) {
      if (!seen.has(ing.id)) {
        seen.add(ing.id);
        matched.push(toMatched(ing));
      }
    } else {
      unmatched.push(part);
    }
  }

  return { matched, unmatched };
}

export function toMatched(ing: IngredientDef): MatchedIngredient {
  const concerns = concernFlags(ing.id);
  return {
    id: ing.id,
    name: ing.name,
    eNumber: ing.eNumber,
    inciCode: ing.inciCode,
    hazard: ing.hazard,
    riskClass: ing.riskClass,
    isAdditive: ing.isAdditive,
    kind: ing.kind,
    description: ing.description,
    allergens: allergensOf(ing.id),
    endocrine: concerns.endocrine,
    pregnancyAvoid: concerns.pregnancyAvoid,
    childAvoid: concerns.childAvoid,
  };
}

export function ingredientsByIds(ids: string[]): MatchedIngredient[] {
  return ids
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((i): i is IngredientDef => Boolean(i))
    .map(toMatched);
}
