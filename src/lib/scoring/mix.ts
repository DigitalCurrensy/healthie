import { clamp } from "../utils";
import type { NutriLetter, ScoreReason } from "./types";

export const FOOD_WEIGHTS = {
  nutrition: 0.5,
  integrity: 0.25,
  processing: 0.2,
  organic: 0.05,
} as const;

export const PET_WEIGHTS = {
  nutrition: 0.4,
  integrity: 0.4,
  processing: 0.15,
  organic: 0.05,
} as const;

export type MixCaps = {
  letterCap: number;
  novaCap: number;
  riskCap: number;
  reasons: ScoreReason[];
};

export function letterCap(letter: NutriLetter): number {
  switch (letter) {
    case "A":
      return 100;
    case "B":
      return 90;
    case "C":
      return 74;
    case "D":
      return 58;
    case "E":
      return 39;
  }
}

export function novaCapFor(nova: 1 | 2 | 3 | 4, letter: NutriLetter): number {
  if (nova <= 2) return 100;
  if (nova === 3) return 86;
  if (letter === "A" || letter === "B") return 54;
  if (letter === "C") return 49;
  return 39;
}

export function riskCapFor(input: {
  highCount: number;
  moderateCount: number;
  sweetenerCount: number;
}): number {
  if (input.highCount >= 2) return 24;
  if (input.highCount >= 1) return 49;
  if (input.sweetenerCount >= 2) return 49;
  if (input.moderateCount >= 2) return 49;
  return 100;
}

export function buildCaps(input: {
  letter: NutriLetter;
  nova: 1 | 2 | 3 | 4;
  highCount: number;
  moderateCount: number;
  sweetenerCount: number;
}): MixCaps {
  const letter = letterCap(input.letter);
  const nova = novaCapFor(input.nova, input.letter);
  const risk = riskCapFor(input);
  const reasons: ScoreReason[] = [];
  if (letter < 100) {
    reasons.push({
      kind: "cap",
      title:
        input.letter === "E"
          ? "A weak nutrition box cannot be rated Good"
          : input.letter === "D"
            ? "A D nutrition box cannot be rated Excellent"
            : input.letter === "C"
              ? "Okay nutrition cannot be rated Excellent"
              : "Nutrition sets a ceiling",
      detail:
        input.letter === "E"
          ? "Letter E means sugars, salt or saturated fat dominate. The ceiling is 39 — Poor at best."
          : input.letter === "D"
            ? "Letter D is a treat pattern. The ceiling is 58 — it can be low Good only if the list is clean."
            : `Nutrition letter ${input.letter} sets a ceiling of ${letter}.`,
    });
  }
  if (nova < 100) {
    reasons.push({
      kind: "cap",
      title:
        input.nova === 4
          ? "Ultra-processed food cannot be an everyday Excellent"
          : "Processing sets a ceiling",
      detail:
        input.nova === 4
          ? `A factory recipe — flavours, colours, or many additives — is capped at ${nova}. It can be a rare treat, not a keep.`
          : `Simply processed food is capped at ${nova}.`,
    });
  }
  if (risk < 100) {
    reasons.push({
      kind: "cap",
      title:
        input.highCount >= 1
          ? "A high-concern extra blocks a Good rating"
          : input.sweetenerCount >= 2
            ? "Stacked sweeteners cannot be rated Good"
            : "A cluster of extras blocks Excellent or Good",
      detail:
        risk <= 24
          ? "Two high-concern extras cap the pack at 24 — Avoid."
          : "The ceiling is 49. That is Poor: a sometimes product, not a habit.",
    });
  }
  return { letterCap: letter, novaCap: nova, riskCap: risk, reasons };
}

export function mixWeighted(input: {
  nutrition: number;
  integrity: number;
  processing: number;
  organic: boolean;
  weights: { nutrition: number; integrity: number; processing: number; organic: number };
  proteinBoost?: number;
}): number {
  const w = input.weights;
  const raw =
    w.nutrition * input.nutrition +
    w.integrity * input.integrity +
    w.processing * input.processing +
    (input.organic ? w.organic * 100 : 0) +
    (input.proteinBoost ?? 0);
  return clamp(Math.round(raw), 0, 100);
}

export function applyCaps(
  mix: number,
  caps: MixCaps,
): { overall: number; cappedBy: string | null } {
  const ceiling = Math.min(caps.letterCap, caps.novaCap, caps.riskCap);
  if (mix <= ceiling) return { overall: mix, cappedBy: null };
  if (ceiling === caps.riskCap && caps.riskCap <= caps.letterCap && caps.riskCap <= caps.novaCap) {
    return { overall: ceiling, cappedBy: "ingredients" };
  }
  if (ceiling === caps.letterCap) return { overall: ceiling, cappedBy: "nutrition" };
  if (ceiling === caps.novaCap) return { overall: ceiling, cappedBy: "processing" };
  return { overall: ceiling, cappedBy: "ingredients" };
}
