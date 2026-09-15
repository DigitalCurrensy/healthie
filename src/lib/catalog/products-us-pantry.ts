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
    novaGroup: 4,
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

export const US_PANTRY_PRODUCTS: ProductDef[] = [
  drink("012000001289", "Pepsi", "Pepsi", ["water", "sugar", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, caramel color, sugar, phosphoric acid, caffeine, citric acid, natural flavor.", n(175, 11, 0, 0.02, 0, 0, 0, 0)),
  drink("012000005109", "Diet Pepsi", "Pepsi", ["water", "e950", "e951", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"], "Carbonated water, caramel color, aspartame, phosphoric acid, potassium benzoate, caffeine, citric acid, natural flavor, acesulfame potassium.", n(4, 0, 0, 0.03, 0, 0, 0, 0)),
  drink("012000007808", "Pepsi Zero Sugar", "Pepsi", ["water", "e950", "e951", "e330", "e150c", "e338", "natural-flavour", "carbon-dioxide"], "Carbonated water, caramel color, phosphoric acid, aspartame, potassium benzoate, caffeine, citric acid, natural flavor, acesulfame potassium.", n(4, 0, 0, 0.04, 0, 0, 0, 0)),
  drink("012000001708", "Mountain Dew", "Pepsi", ["water", "sugar", "e330", "e102", "e110", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, concentrated orange juice, citric acid, natural flavors, sodium benzoate, caffeine, yellow 5, yellow 6.", n(190, 13, 0, 0.05, 0, 0, 0, 0)),
  drink("012000008218", "Starry", "Pepsi", ["water", "sugar", "e330", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, citric acid, natural flavor, sodium benzoate, sodium citrate.", n(160, 10, 0, 0.04, 0, 0, 0, 0)),
  drink("052000001234", "Gatorade Thirst Quencher Lemon-Lime", "Gatorade", ["water", "sugar", "salt", "e330", "e102"], "Water, sugar, dextrose, citric acid, salt, sodium citrate, monopotassium phosphate, natural flavor, yellow 5.", n(105, 6, 0, 0.45, 0, 0, 0, 0)),
  drink("048500001001", "Tropicana Pure Premium Orange Juice", "Tropicana", ["orange"], "100% orange juice.", n(190, 9, 0, 0, 0.3, 0.7, 100, 0)),
  food("014800000234", "Mott's Applesauce", "Mott's", "baby", ["apple", "sugar", "e330"], "Apples, high fructose corn syrup, water, ascorbic acid (vitamin C).", n(300, 16, 0, 0.01, 1.2, 0.2, 80, 0), { nova: 3 }),
  food("014800000517", "Mott's Natural Unsweetened Applesauce", "Mott's", "baby", ["apple"], "Apples, water, ascorbic acid (vitamin C).", n(180, 9, 0, 0, 1.5, 0.2, 95, 0), { nova: 1 }),
  food("015000004108", "Gerber Organic Applesauce", "Gerber", "baby", ["apple"], "Organic apples, vitamin C.", n(200, 10, 0, 0, 1.6, 0.2, 100, 0), { organic: true, nova: 1 }),
  food("037600005208", "Musselman's Natural Applesauce", "Musselman's", "baby", ["apple"], "Apples, water, ascorbic acid.", n(190, 9, 0, 0, 1.4, 0.2, 95, 0), { nova: 1 }),
  food("041196910756", "Santa Cruz Organic Apple Sauce", "Santa Cruz Organic", "baby", ["apple"], "Organic apples.", n(210, 11, 0, 0, 1.8, 0.3, 100, 0), { organic: true, nova: 1 }),
  food("030000010001", "Quaker Old Fashioned Oats", "Quaker", "breakfast", ["oats"], "Whole grain rolled oats.", n(1540, 1, 1.3, 0, 10, 13, 0, 7), { nova: 1 }),
  food("016000275107", "Cheerios Original", "General Mills", "breakfast", ["oats", "sugar", "salt"], "Whole grain oats, corn starch, sugar, salt, tripotassium phosphate, vitamin E.", n(1550, 4, 0.5, 0.6, 10, 12, 0, 7), { nova: 3 }),
  food("038000001001", "Kellogg's Froot Loops", "Kellogg's", "breakfast", ["sugar", "e102", "e110", "e129", "e133"], "Corn flour blend, sugar, wheat flour, whole grain oat flour, yellow 6, red 40, blue 1, yellow 5, BHT.", n(1600, 32, 1, 0.6, 3, 5, 0, 3), { nova: 4 }),
  food("051500255107", "Jif Creamy Peanut Butter", "Jif", "spreads", ["peanut", "sugar", "palm-oil", "salt"], "Roasted peanuts, sugar, molasses, fully hydrogenated vegetable oils, mono and diglycerides, salt.", n(2500, 8, 3.5, 0.5, 6, 22, 0, 50), { nova: 4 }),
  food("048001213107", "Skippy Creamy Peanut Butter", "Skippy", "spreads", ["peanut", "sugar", "palm-oil", "salt"], "Roasted peanuts, sugar, hydrogenated vegetable oil, salt.", n(2500, 7, 3.5, 0.5, 6, 22, 0, 50), { nova: 4 }),
  food("051000012345", "Campbell's Tomato Soup", "Campbell's", "staples", ["tomato", "sugar", "salt", "wheat-flour"], "Tomato puree, water, wheat flour, sugar, salt, potassium chloride, citric acid, ascorbic acid, flavoring.", n(310, 8, 0, 1.9, 1, 2, 40, 0), { nova: 4 }),
  food("041196010001", "Progresso Traditional Chicken Noodle", "Progresso", "staples", ["chicken", "salt", "wheat-flour"], "Chicken broth, carrots, cooked white chicken meat, egg noodles, celery, salt.", n(210, 1, 0.3, 1.7, 1, 6, 0, 1), { nova: 3 }),
  food("011110038107", "Hidden Valley Original Ranch", "Hidden Valley", "condiments", ["e322", "sugar", "salt", "e102"], "Vegetable oil, water, sugar, salt, egg yolk, buttermilk, natural flavor, MSG, spices, yellow 5, yellow 6.", n(2700, 4, 3, 2.1, 0, 1, 0, 70), { nova: 4 }),
];
