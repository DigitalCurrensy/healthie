import type { ProductDef } from "./products";
import type { Nutrition } from "@/lib/scoring/types";
import { US_PANTRY_PRODUCTS } from "./products-us-pantry";

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

function food(
  barcode: string,
  title: string,
  brand: string,
  categoryPath: string,
  ingredientIds: string[],
  ingredientsText: string,
  nutrition: Nutrition,
  extra?: { organic?: boolean; nova?: number },
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "food",
    categoryPath,
    isOrganic: Boolean(extra?.organic),
    ingredientIds,
    ingredientsText,
    nutrition,
    novaGroup: extra?.nova,
  };
}

function cosmetic(
  barcode: string,
  title: string,
  brand: string,
  categoryPath: string,
  ingredientIds: string[],
  ingredientsText: string,
  extra?: { organic?: boolean },
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "cosmetic",
    categoryPath,
    isOrganic: Boolean(extra?.organic),
    ingredientIds,
    ingredientsText,
  };
}

export const EXTRA_PRODUCTS: ProductDef[] = [
  food("070505012016", "Applegate Organic Roasted Turkey", "Applegate", "meat", ["chicken", "salt"], "Organic turkey, water, sea salt.", n(440, 0, 0.4, 1.1, 0, 22, 0, 2), { organic: true, nova: 3 }),
  food("044700000016", "Boar's Head Ovengold Turkey", "Boar's Head", "meat", ["chicken", "salt"], "Turkey breast, water, salt, sugar, sodium phosphate.", n(420, 1, 0.3, 1.3, 0, 22, 0, 1), { nova: 3 }),
  food("044700001016", "Oscar Mayer Chopped Ham", "Oscar Mayer", "meat", ["pork", "e250", "salt", "sugar", "e621"], "Ham, water, salt, sugar, sodium nitrite, sodium phosphates, flavour.", n(540, 2, 2, 2.2, 0, 16, 0, 8), { nova: 4 }),
  food("044700002016", "Hormel Black Label Bacon", "Hormel", "meat", ["pork", "e250", "salt", "sugar", "e621"], "Cured with water, salt, sugar, sodium phosphates, sodium nitrite, flavour.", n(2260, 0, 14, 2.8, 0, 12, 0, 42), { nova: 4 }),
  food("025317000016", "Hillshire Farm Polska Kielbasa", "Hillshire Farm", "meat", ["pork", "e250", "salt", "e621"], "Pork, water, salt, flavour, sodium nitrite, sodium phosphates.", n(1260, 2, 8, 2.4, 0, 12, 0, 24), { nova: 4 }),
  food("025317001016", "Applegate Organic Uncured Bacon", "Applegate", "meat", ["pork", "salt", "sugar"], "Organic pork, water, sea salt, organic cane sugar.", n(2090, 0, 12, 1.8, 0, 12, 0, 36), { organic: true, nova: 3 }),
  food("040000011016", "Skittles Original", "Skittles", "candy", ["sugar", "e102", "e110", "e129", "e133", "palm-oil"], "Sugar, corn syrup, hydrogenated palm kernel oil, fruit juice from concentrate, yellow 5, yellow 6, red 40, blue 1.", n(1670, 80, 4, 0.02, 0, 0, 0, 4), { nova: 4 }),
  food("072330000016", "Haribo Goldbears", "Haribo", "candy", ["sugar", "e102", "e129", "e133"], "Glucose syrup, sugar, gelatine, dextrose, citric acid, flavouring, fruit and plant concentrates, yellow 5, red 40, blue 1.", n(1450, 56, 0, 0.05, 0, 6, 0, 0), { nova: 4 }),
  food("034000001016", "Twizzlers Strawberry", "Twizzlers", "candy", ["sugar", "e129", "e102"], "Corn syrup, wheat flour, sugar, cornstarch, palm oil, salt, glycerin, citric acid, potassium sorbate, red 40, yellow 5.", n(1470, 40, 0.5, 0.4, 0, 2, 0, 1), { nova: 4 }),
  food("021200001016", "UNREAL Dark Chocolate Gems", "UNREAL", "candy", ["cocoa", "sugar", "e330"], "Dark chocolate (cacao, cane sugar, cocoa butter), coloring from fruit and vegetables, citric acid.", n(2090, 36, 18, 0.05, 6, 6, 0, 32), { nova: 3 }),
  food("021200002016", "Endangered Species Dark Chocolate 72%", "Endangered Species", "candy", ["cocoa", "sugar"], "Bittersweet chocolate (chocolate liquor, sugar, cocoa butter, soy lecithin, vanilla).", n(2300, 24, 18, 0.02, 8, 8, 0, 40), { nova: 3 }),
  cosmetic("041554000016", "Maybelline Great Lash Mascara", "Maybelline", "makeup", ["fragrance", "e171"], "Water, paraffin, potassium cetyl phosphate, acacia, fragrance, CI 77499, titanium dioxide."),
  cosmetic("609332000016", "e.l.f. Halo Glow Liquid Filter", "e.l.f. Cosmetics", "makeup", ["fragrance", "e171"], "Water, dimethicone, glycerin, titanium dioxide, fragrance, phenoxyethanol."),
  cosmetic("850009000016", "Ilia Super Serum Skin Tint", "Ilia", "makeup", ["zinc-oxide"], "Aloe, squalane, zinc oxide, jojoba, mica. No fragrance.", { organic: true }),
  cosmetic("850009001016", "RMS Beauty UnCover-Up", "RMS Beauty", "makeup", ["zinc-oxide"], "Cocos nucifera oil, ricinus communis, zinc oxide, silica.", { organic: true }),
  cosmetic("193002000016", "Rare Beauty Soft Pinch Blush", "Rare Beauty", "makeup", ["fragrance", "e171"], "Dimethicone, phenyl trimethicone, silica, fragrance, titanium dioxide, iron oxides."),
  cosmetic("037000001016", "Crest 3D White Toothpaste", "Crest", "oral", ["sls", "e171", "fragrance"], "Sorbitol, water, hydrated silica, sodium lauryl sulfate, cellulose gum, flavour, titanium dioxide, sodium saccharin, sodium fluoride."),
  cosmetic("035000001016", "Colgate Total", "Colgate", "oral", ["sls", "e171", "fragrance"], "Water, sorbitol, hydrated silica, sodium lauryl sulfate, flavour, titanium dioxide, PVM/MA copolymer, sodium fluoride."),
  cosmetic("077326001016", "Tom's of Maine Fluoride-Free", "Tom's of Maine", "oral", ["hydroxyapatite"], "Calcium carbonate, water, glycerin, hydrated silica, xylitol, sodium bicarbonate, zinc citrate."),
  cosmetic("077326002016", "Hello Activated Charcoal", "Hello", "oral", ["sls"], "Sorbitol, water, hydrated silica, glycerin, sodium lauryl sulfate, flavour, charcoal powder."),
  cosmetic("310742000016", "Sensodyne Pronamel", "Sensodyne", "oral", ["sls", "fragrance"], "Sorbitol, water, hydrated silica, potassium nitrate, sodium lauryl sulfate, flavour, sodium fluoride."),
  ...US_PANTRY_PRODUCTS,
];
