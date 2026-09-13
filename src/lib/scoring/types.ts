export type ProductType = "food" | "cosmetic" | "pet";
export type HazardLevel = "green" | "yellow" | "orange" | "red";
export type RiskClass = "none" | "low" | "moderate" | "high";
export type NutriLetter = "A" | "B" | "C" | "D" | "E";
export type TrafficLight = "green" | "amber" | "red";

export type Nutrition = {
  energyKj: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
  sodiumMg?: number;
  fiber: number;
  protein: number;
  fruitsVegetables: number;
  fat?: number;
};

export type AllergenId =
  | "gluten"
  | "milk"
  | "egg"
  | "nuts"
  | "peanut"
  | "soy"
  | "fish"
  | "sesame"
  | "celery"
  | "mustard"
  | "sulphites";

export type MatchedIngredient = {
  id: string;
  name: string;
  eNumber?: string;
  inciCode?: string;
  hazard: HazardLevel;
  riskClass: RiskClass;
  isAdditive: boolean;
  kind: "food" | "cosmetic" | "both" | "pet";
  description: string;
  allergens: AllergenId[];
  endocrine: boolean;
  pregnancyAvoid: boolean;
  childAvoid: boolean;
};

export type TrafficLights = {
  fat: TrafficLight;
  saturatedFat: TrafficLight;
  sugars: TrafficLight;
  salt: TrafficLight;
};

export type ScoreReasonKind = "help" | "hurt" | "cap" | "note";

export type ScoreReason = {
  kind: ScoreReasonKind;
  title: string;
  detail: string;
  ingredientId?: string;
  points?: number;
};

export type ScorePillarId = "nutrition" | "ingredients" | "processing" | "organic" | "composition";

export type ScorePillar = {
  id: ScorePillarId;
  label: string;
  weightPct: number;
  score: number;
  contribution: number;
};

export type AdditivePenalty = {
  name: string;
  riskClass: RiskClass;
  points: number;
  ingredientId: string;
};

export type FoodScoreBreakdown = {
  type: "food" | "pet";
  overall: number;
  nutritionScore: number;
  additiveScore: number;
  processingScore: number;
  organicBonus: number;
  nutriRaw: number;
  nutriLetter: NutriLetter;
  nPoints: number;
  pPoints: number;
  additivePenalties: AdditivePenalty[];
  isOrganic: boolean;
  isBeverage: boolean;
  novaGroup: 1 | 2 | 3 | 4 | null;
  ecoScore: number;
  trafficLights: TrafficLights | null;
  mixUncapped: number;
  letterCap: number;
  novaCap: number;
  riskCap: number;
  cappedBy: string | null;
  headline: string;
  reasons: ScoreReason[];
  pillars: ScorePillar[];
};

export type CosmeticScoreBreakdown = {
  type: "cosmetic";
  overall: number;
  compositionScore: number;
  maxHazard: HazardLevel;
  cap: number;
  capped: boolean;
  isOrganic: boolean;
  organicBonus: number;
  headline: string;
  reasons: ScoreReason[];
  pillars: ScorePillar[];
};

export type ScoreBreakdown = FoodScoreBreakdown | CosmeticScoreBreakdown;

export const HAZARD_CAP: Record<HazardLevel, number> = {
  red: 24,
  orange: 49,
  yellow: 74,
  green: 100,
};

export const HAZARD_RANK: Record<HazardLevel, number> = {
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

/** Marks off the ingredients pillar. High-concern extras cannot hide in a long list. */
export const ADDITIVE_PENALTY: Record<RiskClass, number> = {
  high: 28,
  moderate: 14,
  low: 5,
  none: 0,
};

export type NutriCategory = "food" | "beverage" | "cheese" | "fat" | "red-meat" | "water";
