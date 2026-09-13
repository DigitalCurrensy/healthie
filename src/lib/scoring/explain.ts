import { bandLabel, scoreBand } from "../utils";
import type { NutriLetter, ScorePillar, ScoreReason } from "./types";

export function foodHeadline(input: {
  overall: number;
  letter: NutriLetter;
  nova: 1 | 2 | 3 | 4;
  isWater?: boolean;
  isBeverage: boolean;
  sugars: number;
  highCount: number;
  cappedBy: string | null;
  isPet: boolean;
}): string {
  const band = scoreBand(input.overall);
  if (input.isWater) return "Water. One ingredient. This is the baseline everything else is measured against.";
  if (input.isPet) {
    if (band === "excellent") return "Named meat, quiet extras — a bowl we’d feed without a second thought.";
    if (band === "good") return "Acceptable, but you can feed better without spending a fortune.";
    if (input.highCount > 0) return "Controversial extras in a pet bowl are a hard no. Swap the bag.";
    return "More filler and additives than we’d want in a daily bowl.";
  }
  if (band === "excellent") {
    return input.nova <= 2
      ? "Short list, honest nutrition. This is a keep."
      : "The nutrition holds up. Use it often.";
  }
  if (input.letter === "E" && input.nova === 4) {
    return input.isBeverage
      ? "A weak nutrition box and an ultra-processed recipe. A treat in a bottle, not a weekday pour."
      : "Weak nutrition and a factory recipe. Fine as a rare treat — not as a habit.";
  }
  if (input.letter === "E") {
    return input.isBeverage && input.sugars >= 8
      ? `Sugars are high for a drink (${input.sugars} g/100 ml) with nothing to slow them down.`
      : "The nutrition box is the problem — sugars, salt or saturated fat dominate.";
  }
  if (input.nova === 4 && (band === "poor" || band === "bad")) {
    return "Ultra-processed — built with extras a kitchen wouldn’t use. Better as a rare treat, not a Good rating.";
  }
  if (input.cappedBy === "ingredients") {
    return "The extras on the list set a ceiling. A high-concern ingredient, or a cluster of them, blocks a better rating.";
  }
  if (band === "good") return "Fine sometimes. There is usually a cleaner neighbour in the same aisle.";
  if (band === "poor") return "A treat at best. Look one shelf over for an everyday pick.";
  return "Hard pass for a regular shop. Better swaps are close by.";
}

export function cosmeticHeadline(input: {
  overall: number;
  maxHazard: "green" | "yellow" | "orange" | "red";
  capped: boolean;
}): string {
  if (input.maxHazard === "green") return "A calm formula. Nothing on the list is flagged. Fine for everyday use.";
  if (input.maxHazard === "red") {
    return "A high-concern extra sets the ceiling at 24. We’d leave this on the shelf.";
  }
  if (input.maxHazard === "orange") {
    return input.capped
      ? "The toughest extra is worth watching — it caps this bottle at Poor."
      : "A few extras we’d skip if you have a choice.";
  }
  return "Mostly gentle, with a couple of ingredients worth knowing.";
}

export function sortReasons(reasons: ScoreReason[]): ScoreReason[] {
  const order = { cap: 0, hurt: 1, note: 2, help: 3 };
  return [...reasons].sort((a, b) => order[a.kind] - order[b.kind]);
}

export function foodPillars(input: {
  nutrition: number;
  integrity: number;
  processing: number;
  organic: boolean;
  weights: { nutrition: number; integrity: number; processing: number; organic: number };
}): ScorePillar[] {
  const w = input.weights;
  const organicScore = input.organic ? 100 : 0;
  return [
    {
      id: "nutrition",
      label: "Nutrition quality",
      weightPct: Math.round(w.nutrition * 100),
      score: input.nutrition,
      contribution: Math.round(w.nutrition * input.nutrition),
    },
    {
      id: "ingredients",
      label: "Ingredients",
      weightPct: Math.round(w.integrity * 100),
      score: input.integrity,
      contribution: Math.round(w.integrity * input.integrity),
    },
    {
      id: "processing",
      label: "How processed",
      weightPct: Math.round(w.processing * 100),
      score: input.processing,
      contribution: Math.round(w.processing * input.processing),
    },
    {
      id: "organic",
      label: "Organic",
      weightPct: Math.round(w.organic * 100),
      score: organicScore,
      contribution: input.organic ? Math.round(w.organic * 100) : 0,
    },
  ];
}

export function letterPlain(letter: NutriLetter): string {
  switch (letter) {
    case "A":
      return "strong";
    case "B":
      return "good";
    case "C":
      return "okay";
    case "D":
      return "low";
    case "E":
      return "weak";
  }
}

export function bandPlain(score: number): string {
  return bandLabel(scoreBand(score));
}
