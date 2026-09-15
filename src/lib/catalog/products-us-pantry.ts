import type { ProductDef } from "./products";
import type { Nutrition } from "@/lib/scoring/types";

function n(
  energyKj: number,
  sugars: number,
  sat: number,
  salt: number,
  fiber: number,
  protein: number,
  fv: number,
  fat?: number,
): Nutrition {
  return { energyKj, sugars, saturatedFat: sat, salt, fiber, protein, fruitsVegetables: fv, fat };
}

function drink(
  barcode: string,
  title: string,
  brand: string,
  ids: string[],
  text: string,
  nutrition: Nutrition,
  nova = 4,
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "food",
    categoryPath: "beverages",
    isOrganic: false,
    isBeverage: true,
    ingredientIds: ids,
    ingredientsText: text,
    nutrition,
    novaGroup: nova,
  };
}

function food(
  barcode: string,
  title: string,
  brand: string,
  path: string,
  ids: string[],
  text: string,
  nutrition: Nutrition,
  extra?: { organic?: boolean; nova?: number },
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "food",
    categoryPath: path,
    isOrganic: Boolean(extra?.organic),
    ingredientIds: ids,
    ingredientsText: text,
    nutrition,
    novaGroup: extra?.nova ?? 3,
  };
}

/** US pantry SKUs the demo shelf never mapped. Search and barcode must still find them. */
export const US_PANTRY_PRODUCTS: ProductDef[] = [
  drink(
    "012000001289",
    "Pepsi",
    "Pepsi",
    ["water", "sugar", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"],
    "Carbonated water, high fructose corn syrup, caramel color, sugar, phosphoric acid, caffeine, citric acid, natural flavor.",
    n(175, 11, 0, 0.02, 0, 0, 0, 0),
  ),
  drink(
    "012000005109",
    "Diet Pepsi",
    "Pepsi",
    ["water", "e950", "e951", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"],
    "Carbonated water, caramel color, aspartame, phosphoric acid, potassium benzoate, caffeine, citric acid, natural flavor, acesulfame potassium.",
    n(4, 0, 0, 0.03, 0, 0, 0, 0),
  ),
  drink(
    "012000007808",
    "Pepsi Zero Sugar",
    "Pepsi",
    ["water", "e950", "e951", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"],
    "Carbonated water, caramel color, phosphoric acid, aspartame, potassium benzoate, caffeine, citric acid, natural flavor, acesulfame potassium.",
    n(4, 0, 0, 0.04, 0, 0, 0, 0),
  ),
  drink(
    "012000001708",
    "Mountain Dew",
    "Pepsi",
    ["water", "sugar", "e330", "e102", "e110", "natural-flavour", "carbon-dioxide"],
    "Carbonated water, high fructose corn syrup, concentrated orange juice, citric acid, natural flavors, sodium benzoate, caffeine, yellow 5, yellow 6.",
    n(190, 13, 0, 0.05, 0, 0, 0, 0),
  ),
  drink(
    "012000008218",
    "Starry",
    "Pepsi",
    ["water", "sugar", "e330", "natural-flavour", "carbon-dioxide"],
    "Carbonated water, high fructose corn syrup, citric acid, natural flavor, sodium benzoate, sodium citrate.",
    n(160, 10, 0, 0.04, 0, 0, 0, 0),
  ),
  food(
    "014800000234",
    "Mott's Applesauce",
    "Mott's",
    "baby",
    ["apple", "sugar", "e330"],
    "Apples, high fructose corn syrup, water, ascorbic acid (vitamin C).",
    n(300, 16, 0, 0.01, 1.2, 0.2, 80, 0),
    { nova: 3 },
  ),
  food(
    "014800000517",
    "Mott's Natural Unsweetened Applesauce",
    "Mott's",
    "baby",
    ["apple"],
    "Apples, water, ascorbic acid (vitamin C).",
    n(180, 9, 0, 0, 1.5, 0.2, 95, 0),
    { nova: 1 },
  ),
  food(
    "015000004108",
    "Gerber Organic Applesauce",
    "Gerber",
    "baby",
    ["apple"],
    "Organic apples, vitamin C.",
    n(200, 10, 0, 0, 1.6, 0.2, 100, 0),
    { organic: true, nova: 1 },
  ),
  food(
    "037600005208",
    "Musselman's Natural Applesauce",
    "Musselman's",
    "baby",
    ["apple"],
    "Apples, water, ascorbic acid.",
    n(190, 9, 0, 0, 1.4, 0.2, 95, 0),
    { nova: 1 },
  ),
  food(
    "041196910756",
    "Santa Cruz Organic Apple Sauce",
    "Santa Cruz Organic",
    "baby",
    ["apple"],
    "Organic apples.",
    n(210, 11, 0, 0, 1.8, 0.3, 100, 0),
    { organic: true, nova: 1 },
  ),
];
