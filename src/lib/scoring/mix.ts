import { clamp } from "../utils";
import type { NutriLetter, ScoreReason } from "./types";

/** Frozen mixer. Journalists cite this stamp. Print How scoring works to PDF. */
export const MIXER_VERSION = "2026.09.13";
export const MIXER_NAME = "Healthie mixer";

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
  trafficCap: number;
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

/**
 * Ultra-processed food cannot be rated Good (50+).
 * A B nutrition box used to leave a 54 ceiling — Doritos landed in Good.
 * That was a calibration failure, not a feature.
 */
export function novaCapFor(nova: 1 | 2 | 3 | 4, letter: NutriLetter): number {
  if (nova <= 2) return 100;
  if (nova === 3) return 86;
  if (letter === "E") return 39;
  if (letter === "D") return 44;
  return 49;
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

/** Independent red lights: salt, sugars, sat fat. Total fat is not a second vote. */
export function trafficCapFor(redDrivers: number): number {
  if (redDrivers >= 3) return 39;
  if (redDrivers >= 2) return 49;
  return 100;
}

export function buildCaps(input: {
  letter: NutriLetter;
  nova: 1 | 2 | 3 | 4;
  highCount: number;
  moderateCount: number;
  sweetenerCount: number;
  redTraffic?: number;
}): MixCaps {
  const letter = letterCap(input.letter);
  const nova = novaCapFor(input.nova, input.letter);
  const risk = riskCapFor(input);
  const traffic = trafficCapFor(input.redTraffic ?? 0);
  const reasons: ScoreReason[] = [];
  if (letter < 100) {
    reasons.push({
      kind: "cap",
      title:
        input.letter === "E"
          ? "A weak nutrition box cannot be rated Good"
          : input.letter === "D"
            ? "This nutrition box cannot be rated Excellent"
            : input.letter === "C"
              ? "Okay nutrition cannot be rated Excellent"
              : "The nutrition box sets a limit",
      detail:
        input.letter === "E"
          ? "Sugars, salt or saturated fat dominate this box. Poor at best — a treat, not a habit."
          : input.letter === "D"
            ? "This is a treat pattern. It can only scrape into low Good if the list is clean and it is not ultra-processed."
            : input.letter === "C"
              ? "The box is middling. That is fine as a sometimes food. It is not everyday Excellent."
              : "The nutrition box is decent, but it is not the whole story.",
    });
  }
  if (nova < 100) {
    reasons.push({
      kind: "cap",
      title:
        input.nova === 4
          ? "Ultra-processed food cannot be rated Good"
          : "Processing sets a ceiling",
      detail:
        input.nova === 4
          ? "A factory recipe — flavours, colours, or many additives — cannot be rated Good. A sometimes treat, not a daily habit."
          : "This is simply processed food. Fine often. Not a keep unless the rest of the pack is honest.",
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
          ? "Two high-concern extras mean Avoid. We would leave this on the shelf."
          : "A cluster of extras keeps this at Poor: a sometimes product, not a habit.",
    });
  }
  if (traffic < 100) {
    reasons.push({
      kind: "cap",
      title:
        (input.redTraffic ?? 0) >= 3
          ? "Three red lights cannot be rated Good"
          : "Two red lights on the box cannot be rated Good",
      detail:
        traffic <= 39
          ? "Salt, saturated fat or sugar are in the red three times. Poor at best."
          : "Two red lights on salt, sugar or saturated fat keep this at Poor, not Good.",
    });
  }
  return { letterCap: letter, novaCap: nova, riskCap: risk, trafficCap: traffic, reasons };
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
  const ceiling = Math.min(caps.letterCap, caps.novaCap, caps.riskCap, caps.trafficCap);
  if (mix <= ceiling) return { overall: mix, cappedBy: null };
  if (ceiling === caps.riskCap && caps.riskCap <= caps.letterCap && caps.riskCap <= caps.novaCap && caps.riskCap <= caps.trafficCap) {
    return { overall: ceiling, cappedBy: "ingredients" };
  }
  if (ceiling === caps.trafficCap && caps.trafficCap <= caps.letterCap && caps.trafficCap <= caps.novaCap) {
    return { overall: ceiling, cappedBy: "nutrition" };
  }
  if (ceiling === caps.letterCap && caps.letterCap <= caps.novaCap) return { overall: ceiling, cappedBy: "nutrition" };
  if (ceiling === caps.novaCap) return { overall: ceiling, cappedBy: "processing" };
  return { overall: ceiling, cappedBy: "ingredients" };
}
