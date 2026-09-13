import type { HazardLevel, ProductType, RiskClass } from "@/lib/scoring/types";
import { scoreBand, type ScoreBand } from "@/lib/utils";

/** Consumer-facing voice. Never expose method names, labs, or scoring jargon. */

export function bandLabel(band: ScoreBand): string {
  switch (band) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "poor":
      return "Poor";
    case "bad":
      return "Avoid";
  }
}

export function bandSentence(score: number, type: ProductType): string {
  const band = scoreBand(score);
  if (type === "cosmetic") {
    switch (band) {
      case "excellent":
        return "A calm formula. Fine for everyday use.";
      case "good":
        return "Mostly gentle, with a couple of ingredients worth knowing.";
      case "poor":
        return "A few ingredients we’d skip if you have a choice.";
      case "bad":
        return "This one carries ingredients we’d leave on the shelf.";
    }
  }
  if (type === "pet") {
    switch (band) {
      case "excellent":
        return "A solid bowl. Named meat, quiet extras.";
      case "good":
        return "Acceptable, but you can feed better without spending a fortune.";
      case "poor":
        return "More filler and additives than we’d want in a daily bowl.";
      case "bad":
        return "Skip this bag. There are cleaner recipes in the same aisle.";
    }
  }
  switch (band) {
    case "excellent":
      return "A keep. Short list, honest nutrition.";
    case "good":
      return "Fine sometimes. Not the best in the aisle.";
    case "poor":
      return "A treat at best. Look one shelf over for a better everyday pick.";
    case "bad":
      return "Hard pass for a regular shop. Better swaps are close by.";
  }
}

export function typeLabel(type: ProductType): string {
  if (type === "cosmetic") return "Body & beauty";
  if (type === "pet") return "Pet";
  return "Food";
}

export function typeShort(type: ProductType): string {
  if (type === "cosmetic") return "Beauty";
  if (type === "pet") return "Pet";
  return "Food";
}

export function hazardLabel(hazard: HazardLevel): string {
  switch (hazard) {
    case "green":
      return "No concern";
    case "yellow":
      return "Low concern";
    case "orange":
      return "Worth watching";
    case "red":
      return "High concern";
  }
}

export function hazardBlurb(hazard: HazardLevel): string {
  switch (hazard) {
    case "green":
      return "Widely used and well understood at the amounts in food and beauty.";
    case "yellow":
      return "Not a red flag on its own. Pay attention if it shows up often.";
    case "orange":
      return "Some people do better without it. Worth swapping when you can.";
    case "red":
      return "Linked to health concerns. We’d skip products that lean on this.";
  }
}

export function riskLabel(risk: RiskClass): string {
  switch (risk) {
    case "none":
      return "No concern";
    case "low":
      return "Low concern";
    case "moderate":
      return "Moderate concern";
    case "high":
      return "High concern";
  }
}

export function processingLabel(n: 1 | 2 | 3 | 4 | number | null | undefined): string {
  if (n === 1) return "Just food";
  if (n === 2) return "Kitchen staple";
  if (n === 3) return "Simply made";
  if (n === 4) return "Ultra-processed";
  return "Not listed";
}

export function processingBlurb(n: 1 | 2 | 3 | 4 | number | null | undefined): string {
  if (n === 1) return "Close to how you’d find it in a kitchen — short list, no factory extras.";
  if (n === 2) return "A pantry building block: oil, sugar, salt, flour. Fine when you cook with it.";
  if (n === 3) return "Made with a few extra steps. Still recognisable as food.";
  if (n === 4) return "Built in a factory with additives, flavours, or refined extras. Cannot be rated Good — a rare treat, not a habit.";
  return "We don’t have enough of the recipe to say how processed this is.";
}

export function nutritionQualityLabel(letter: string | undefined): string {
  switch (letter) {
    case "A":
      return "Strong";
    case "B":
      return "Good";
    case "C":
      return "Okay";
    case "D":
      return "Low";
    case "E":
      return "Weak";
    default:
      return "—";
  }
}

export function trafficWord(light: "green" | "amber" | "red"): string {
  if (light === "green") return "Low";
  if (light === "amber") return "Medium";
  return "High";
}

export function sugarsContext(grams: number, isBeverage: boolean): string {
  const tsp = Math.round((grams / 4) * 10) / 10;
  if (grams <= 0.5) return "No added sweetness to speak of.";
  if (isBeverage) {
    if (grams >= 10) return `About ${tsp} teaspoons of sugar in 100 ml — a can would be a lot more.`;
    if (grams >= 5) return `About ${tsp} teaspoons of sugar in 100 ml.`;
    return "A light amount of sugar for a drink.";
  }
  if (grams >= 30) return `Very sweet — about ${tsp} teaspoons of sugar in 100 g.`;
  if (grams >= 15) return `Noticeably sweet — about ${tsp} teaspoons in 100 g.`;
  if (grams >= 5) return `A little sugar — about ${tsp} teaspoons in 100 g.`;
  return "Naturally low in sugar.";
}

export function saltContext(grams: number): string {
  if (grams >= 1.5) return "Salty. Easy to overshoot a day’s worth if this is a habit.";
  if (grams >= 0.6) return "A moderate amount of salt.";
  return "Light on salt.";
}

export function howOftenLabel(how: "everyday" | "sometimes" | "rarely" | "skip" | undefined): string {
  switch (how) {
    case "everyday":
      return "Everyday";
    case "sometimes":
      return "Sometimes";
    case "rarely":
      return "Rarely";
    case "skip":
      return "Skip";
    default:
      return "";
  }
}

export function organicLabel(isOrganic: boolean): string {
  return isOrganic ? "Organic" : "Not organic";
}

export function additiveCountLabel(n: number, type: ProductType): string {
  if (type === "cosmetic") {
    if (n === 0) return "No flagged extras";
    if (n === 1) return "1 ingredient to watch";
    return `${n} ingredients to watch`;
  }
  if (n === 0) return "No additives";
  if (n === 1) return "1 additive";
  return `${n} additives`;
}

export function planetLabel(score: number): string {
  if (score >= 75) return "Gentler on the planet";
  if (score >= 50) return "Mixed footprint";
  return "Heavier footprint";
}

export function planetBlurb(score: number): string {
  if (score >= 75) return "Shorter ingredient list, organic farming, or less industrial processing.";
  if (score >= 50) return "Some good signs, some industrial ones. Not the heaviest in the aisle.";
  return "Palm oil, heavy processing, or farming choices that cost more than they give back.";
}

export function brandVerdict(avg: number, count: number): string {
  const band = scoreBand(avg);
  const pack = count === 1 ? "1 pack" : `${count} packs`;
  if (band === "excellent") return `${pack} on our shelves. Average ${avg} — Excellent. This house mostly earns a daily pick.`;
  if (band === "good") return `${pack} on our shelves. Average ${avg} — Good. Fine sometimes; there is usually a cleaner neighbour.`;
  if (band === "poor") return `${pack} on our shelves. Average ${avg} — Poor. Most of this house is a treat, not a habit.`;
  return `${pack} on our shelves. Average ${avg} — Avoid. We’d leave most of this house on the shelf.`;
}

export function brandVsShop(avg: number, shopAvg: number): string {
  const delta = avg - shopAvg;
  if (delta === 0) return `In line with the shop average of ${shopAvg}.`;
  if (delta > 0) return `${delta} above the shop average of ${shopAvg}.`;
  return `${Math.abs(delta)} below the shop average of ${shopAvg}.`;
}

export const VOICE = {
  independent: "No brand pays for a better score.",
  localPrefs: "Without an account, notes stay on this phone.",
  scanHint: "Point the camera at the barcode. If this window blocks the lens, add Healthie to your home screen.",
  labelHint: "No barcode on the front? Take a photo of the pack. We’ll read the name.",
  notFound: "We don’t have this barcode yet. Photograph the front of the pack — we’ll read the name, even if there is no code in the shot.",
  disclaimer:
    "Healthie is a reading aid, not a diagnosis. If you have an allergy, always check the pack.",
} as const;
