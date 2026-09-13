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

function food(
  barcode: string,
  title: string,
  brand: string,
  categoryPath: string,
  ingredientIds: string[],
  ingredientsText: string,
  nutrition: Nutrition,
  extra?: { organic?: boolean; beverage?: boolean; water?: boolean; nova?: number; image?: string },
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "food",
    categoryPath,
    isOrganic: Boolean(extra?.organic),
    isBeverage: extra?.beverage,
    isWater: extra?.water,
    ingredientIds,
    ingredientsText,
    nutrition,
    novaGroup: extra?.nova,
    imageUrl: extra?.image,
  };
}

function beauty(
  barcode: string,
  title: string,
  brand: string,
  categoryPath: string,
  ingredientIds: string[],
  ingredientsText: string,
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "cosmetic",
    categoryPath,
    isOrganic: false,
    ingredientIds,
    ingredientsText,
  };
}

function pet(
  barcode: string,
  title: string,
  brand: string,
  ingredientIds: string[],
  ingredientsText: string,
  nutrition: Nutrition,
  extra?: { organic?: boolean; nova?: number },
): ProductDef {
  return {
    barcode,
    title,
    brand,
    type: "pet",
    categoryPath: "pet",
    isOrganic: Boolean(extra?.organic),
    ingredientIds,
    ingredientsText,
    nutrition,
    novaGroup: extra?.nova,
  };
}

/**
 * Photographed packs plus a supermarket matrix: worst, middle, and best
 * of the brands people actually scan. Open Food Facts still covers the long tail.
 */
export const SHELF_PRODUCTS: ProductDef[] = [
  // —— The three packs from the camera roll ——
  food(
    "009800830039",
    "Nutella Biscuits",
    "Ferrero",
    "snacks",
    ["wheat-flour", "sugar", "palm-oil", "hazelnut", "cocoa", "milk", "sunflower-oil", "salt", "e503", "e500", "e450", "e322", "vanilla", "natural-flavour"],
    "Wheat flour, palm oil, sugar, hazelnuts, skimmed milk powder, fat-reduced cocoa, whey powder, butter, sunflower oil, salt, raising agents (ammonium bicarbonate, sodium bicarbonate, disodium diphosphate), soy lecithin, vanillin.",
    n(2092, 35.7, 10.7, 0.85, 3.6, 7.1, 8, 25),
    { nova: 4, image: "/images/snacks.jpg" },
  ),
  food(
    "8000500310427",
    "Nutella Biscuits",
    "Ferrero",
    "snacks",
    ["wheat-flour", "sugar", "palm-oil", "hazelnut", "cocoa", "milk", "sunflower-oil", "salt", "e503", "e500", "e450", "e322", "vanilla", "natural-flavour"],
    "Wheat flour, palm oil, sugar, hazelnuts, skimmed milk powder, fat-reduced cocoa, whey powder, butter, sunflower oil, salt, raising agents (ammonium bicarbonate, sodium bicarbonate, disodium diphosphate), soy lecithin, vanillin.",
    n(2092, 35.7, 10.7, 0.85, 3.6, 7.1, 8, 25),
    { nova: 4, image: "/images/snacks.jpg" },
  ),
  food(
    "0810589032602",
    "Almond Butter & Berries Protein Ancient Grain Granola",
    "Purely Elizabeth",
    "breakfast",
    ["oats", "pumpkin-seed", "sunflower-seed", "sugar", "cashew", "almond", "quinoa", "coconut-oil", "chia", "natural-flavour", "salt", "cinnamon", "vanilla"],
    "Organic certified gluten-free oats, organic pumpkin seeds, organic sunflower seeds, organic coconut sugar, cashews, almond butter, organic cassava root fibre, almonds, dried cranberries (cranberries, sugar, sunflower oil), organic quinoa flakes, organic coconut oil, organic chia seeds, freeze-dried strawberries, almond meal, organic natural flavour, sea salt, organic cinnamon, vanilla extract.",
    n(2092, 13.3, 10, 0.46, 10, 16.7, 8, 30),
    { organic: true, nova: 3, image: "/images/breakfast.jpg" },
  ),
  food(
    "0081058903260",
    "Almond Butter & Berries Protein Ancient Grain Granola",
    "Purely Elizabeth",
    "breakfast",
    ["oats", "pumpkin-seed", "sunflower-seed", "sugar", "cashew", "almond", "quinoa", "coconut-oil", "chia", "natural-flavour", "salt", "cinnamon", "vanilla"],
    "Organic certified gluten-free oats, organic pumpkin seeds, organic sunflower seeds, organic coconut sugar, cashews, almond butter, organic cassava root fibre, almonds, dried cranberries (cranberries, sugar, sunflower oil), organic quinoa flakes, organic coconut oil, organic chia seeds, freeze-dried strawberries, almond meal, organic natural flavour, sea salt, organic cinnamon, vanilla extract.",
    n(2092, 13.3, 10, 0.46, 10, 16.7, 8, 30),
    { organic: true, nova: 3, image: "/images/breakfast.jpg" },
  ),
  food(
    "099482513931",
    "Alkaline & Electrolyte Water",
    "365 Whole Foods Market",
    "beverages",
    ["water", "potassium-bicarbonate", "calcium-chloride", "magnesium-sulfate"],
    "Purified water (reverse osmosis), potassium bicarbonate, calcium chloride, magnesium sulfate. Ionized to pH 9.5+.",
    n(0, 0, 0, 0.01, 0, 0, 0, 0),
    { beverage: true, water: true, nova: 1, image: "/images/beverages.jpg" },
  ),
  food(
    "099482514358",
    "Alkaline & Electrolyte Water",
    "365 Whole Foods Market",
    "beverages",
    ["water", "potassium-bicarbonate", "calcium-chloride", "magnesium-sulfate"],
    "Purified water (reverse osmosis), potassium bicarbonate, calcium chloride, magnesium sulfate. Ionized to pH 9.5+.",
    n(0, 0, 0, 0.01, 0, 0, 0, 0),
    { beverage: true, water: true, nova: 1, image: "/images/beverages.jpg" },
  ),

  // —— Drinks: best ——
  food("075720011504", "Topo Chico Mineral Water", "Topo Chico", "beverages", ["water", "carbon-dioxide"], "Sparkling mineral water.", n(0, 0, 0, 0.04, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("868164000307", "Liquid Death Mountain Water", "Liquid Death", "beverages", ["water"], "Still mountain water.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("078000084955", "LaCroix Lime", "LaCroix", "beverages", ["water", "carbon-dioxide", "natural-flavour"], "Carbonated water, naturally flavoured.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("078742433507", "Essentia Ionized Alkaline Water", "Essentia", "beverages", ["water", "potassium-bicarbonate", "magnesium-sulfate"], "Purified water, electrolytes for taste.", n(0, 0, 0, 0.01, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("180337000015", "Hint Water Watermelon", "Hint", "beverages", ["water", "natural-flavour"], "Purified water, natural flavour.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("851818001809", "Spindrift Lemon", "Spindrift", "beverages", ["water", "carbon-dioxide"], "Sparkling water, lemon juice.", n(8, 0.4, 0, 0, 0, 0, 8, 0), { beverage: true, nova: 1 }),
  food("099482435123", "365 Spring Water", "365 Whole Foods Market", "beverages", ["water"], "Spring water.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),

  // —— Drinks: middle ——
  food("850007339008", "Olipop Vintage Cola", "Olipop", "beverages", ["water", "sugar", "e330", "e440", "natural-flavour", "carbon-dioxide"], "Sparkling water, cassava root fibre, juice concentrates, natural flavour, stevia, nisin.", n(146, 2.1, 0, 0.1, 3.8, 0, 4, 0), { beverage: true, nova: 4 }),
  food("722252601012", "GT's Synergy Gingerade", "GT's", "beverages", ["water", "sugar", "tea"], "Kombucha (water, black tea, sugar), ginger juice.", n(50, 2, 0, 0, 0, 0, 0, 0), { beverage: true, nova: 3 }),
  food("898812001016", "Vita Coco Pure Coconut Water", "Vita Coco", "beverages", ["water"], "Coconut water.", n(79, 3.8, 0, 0.1, 0, 0, 0, 0), { beverage: true, nova: 1 }),
  food("786162350014", "BODYARMOR Lyte Peach Mango", "BODYARMOR", "beverages", ["water", "e330", "e955", "natural-flavour"], "Filtered water, coconut water concentrate, citric acid, sucralose, natural flavour.", n(42, 0, 0, 0.1, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("012000161186", "Bubly Grapefruit", "Bubly", "beverages", ["water", "carbon-dioxide", "natural-flavour"], "Carbonated water, natural flavour.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("853087003015", "Harmless Harvest Coconut Water", "Harmless Harvest", "beverages", ["water"], "Organic coconut water.", n(80, 3.5, 0, 0.1, 0, 0, 0, 0), { beverage: true, organic: true, nova: 1 }),

  // —— Drinks: worst ——
  food("613008721209", "Arizona Green Tea with Ginseng and Honey", "Arizona", "beverages", ["water", "sugar", "honey", "tea", "e330", "natural-flavour"], "Premium brewed green tea, high fructose corn syrup, honey, citric acid, natural flavour.", n(117, 7.1, 0, 0.04, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("076880003016", "Capri Sun Pacific Cooler", "Capri Sun", "beverages", ["water", "sugar", "e330", "e440", "natural-flavour"], "Water, sugar, pear and grape juice concentrates, citric acid, natural flavour.", n(113, 6.7, 0, 0.06, 0, 0, 8, 0), { beverage: true, nova: 4 }),
  food("844209005015", "Bang Energy Sour Heads", "Bang", "beverages", ["water", "e330", "e202", "e955", "e950", "natural-flavour", "carbon-dioxide"], "Carbonated water, citric acid, sucralose, acesulfame K, caffeine, Super Creatine.", n(0, 0, 0, 0.16, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("818094000016", "Rockstar Original", "Rockstar", "beverages", ["water", "sugar", "e330", "e202", "natural-flavour", "carbon-dioxide"], "Carbonated water, sugar, taurine, citric acid, caffeine, natural flavour.", n(230, 13, 0, 0.15, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("070970384016", "Yoo-hoo Chocolate Drink", "Yoo-hoo", "beverages", ["water", "sugar", "e322", "e407", "e102", "natural-flavour"], "Water, high fructose corn syrup, whey, cocoa, corn syrup solids, yellow 5 and 6.", n(180, 10, 0.2, 0.15, 0, 0.5, 0, 0.5), { beverage: true, nova: 4 }),
  food("043000012345", "Sunny D Tangy Original", "Sunny D", "beverages", ["water", "sugar", "e330", "e102", "e110", "natural-flavour"], "Water, sugar, citric acid, concentrated juices, yellow 5, yellow 6.", n(100, 5.4, 0, 0.15, 0, 0, 5, 0), { beverage: true, nova: 4 }),
  food("070470003018", "Kool-Aid Jammers Tropical Punch", "Kool-Aid", "beverages", ["water", "sugar", "e330", "e129", "e102", "natural-flavour"], "Water, high fructose corn syrup, citric acid, red 40, yellow 5, natural flavour.", n(117, 7, 0, 0.05, 0, 0, 0, 0), { beverage: true, nova: 4 }),

  // —— Breakfast: best ——
  food("039978001116", "Bob's Red Mill Extra Thick Rolled Oats", "Bob's Red Mill", "breakfast", ["oats"], "Whole grain oats.", n(1557, 1.1, 1.3, 0.01, 10, 13, 0, 7), { nova: 1 }),
  food("074873100012", "Food for Life Ezekiel 4:9 Sprouted Grain", "Food for Life", "breakfast", ["wheat-flour", "salt"], "Organic sprouted wheat, barley, millet, lentils, soybeans, spelt, salt.", n(1400, 0.5, 0.3, 0.5, 6, 8, 0, 1), { organic: true, nova: 1 }),
  food("058449860013", "Nature's Path Heritage Flakes", "Nature's Path", "breakfast", ["wheat-flour", "salt", "sugar"], "Kamut wheat, oats, spelt, barley, quinoa, salt, cane sugar.", n(1500, 5, 0.3, 0.6, 7, 10, 0, 2), { organic: true, nova: 1 }),
  food("030000315337", "Quaker Steel Cut Oats", "Quaker", "breakfast", ["oats"], "Steel cut oats.", n(1557, 1, 1.2, 0, 9, 11, 0, 7), { nova: 1 }),
  food("099482435215", "365 Organic Rolled Oats", "365 Whole Foods Market", "breakfast", ["oats"], "Organic whole grain rolled oats.", n(1557, 1.1, 1.3, 0.01, 10, 13, 0, 7), { organic: true, nova: 1 }),
  food("018627107016", "Kashi GO Original", "Kashi", "breakfast", ["wheat-flour", "oats", "sugar", "salt"], "Kashi seven whole grains, soy grits, cane sugar, salt.", n(1500, 9, 0.5, 0.7, 13, 13, 0, 3), { nova: 3 }),

  // —— Breakfast: middle ——
  food("602652171016", "KIND Healthy Grains Oats & Honey", "KIND", "breakfast", ["oats", "sugar", "honey", "sunflower-oil", "salt"], "Oats, cane sugar, honey, canola oil, brown rice, millet, salt.", n(1750, 16, 1.5, 0.3, 7, 8, 0, 12), { nova: 3 }),
  food("021908847807", "Cascadian Farm Organic Cinnamon Crunch", "Cascadian Farm", "breakfast", ["wheat-flour", "sugar", "cinnamon", "salt", "e322"], "Whole grain wheat, cane sugar, rice, cinnamon, salt, sunflower oil.", n(1600, 27, 0.5, 0.9, 6, 6, 0, 3), { organic: true, nova: 4 }),
  food("021908401016", "Annie's Organic Bunny Grahams Honey", "Annie's", "breakfast", ["wheat-flour", "sugar", "honey", "sunflower-oil", "salt"], "Organic wheat flour, organic cane sugar, organic honey, expeller-pressed sunflower oil, salt.", n(1800, 22, 1, 0.6, 4, 6, 0, 12), { organic: true, nova: 3 }),
  food("016000124317", "Honey Nut Cheerios", "General Mills", "breakfast", ["oats", "sugar", "honey", "salt", "almond"], "Whole grain oats, sugar, honey, salt, almond.", n(1550, 32, 0.7, 1.4, 7, 8, 0, 5), { nova: 4 }),

  // —— Breakfast: worst ——
  food("016000275171", "Cinnamon Toast Crunch", "General Mills", "breakfast", ["wheat-flour", "sugar", "palm-oil", "cinnamon", "salt", "e322"], "Whole grain wheat, sugar, rice flour, canola and/or palm oil, cinnamon, salt, soy lecithin.", n(1700, 32, 1.5, 1.4, 5, 5, 0, 9), { nova: 4 }),
  food("030000001016", "Cap'n Crunch Original", "Quaker", "breakfast", ["wheat-flour", "sugar", "palm-oil", "salt", "e102"], "Corn flour, sugar, oat flour, palm and/or coconut oil, salt, yellow 5 and 6.", n(1650, 44, 3.5, 1.5, 2, 4, 0, 5), { nova: 4 }),
  food("016000487801", "Reese's Puffs", "General Mills", "breakfast", ["wheat-flour", "sugar", "palm-oil", "peanut", "cocoa", "salt", "e322"], "Whole grain corn, sugar, Reese's peanut butter, dextrose, salt, cocoa, colour.", n(1680, 33, 2.5, 1.5, 4, 6, 0, 9), { nova: 4 }),
  food("038000199307", "Cookie Crisp", "General Mills", "breakfast", ["wheat-flour", "sugar", "cocoa", "palm-oil", "e322", "salt"], "Whole grain corn, sugar, corn meal, canola oil, cocoa, corn syrup, colour.", n(1620, 35, 1, 1.2, 3, 5, 0, 4), { nova: 4 }),
  food("038000845315", "Froot Loops", "Kellogg's", "breakfast", ["wheat-flour", "sugar", "e102", "e110", "e129", "salt"], "Corn flour blend, sugar, wheat flour, oat flour, hydrogenated vegetable oil, salt, colours.", n(1550, 36, 1, 1.2, 3, 5, 0, 3), { nova: 4 }),

  // —— Snacks: best ——
  food("016571940255", "RXBAR Chocolate Sea Salt", "RXBAR", "snacks", ["egg", "almond", "cocoa", "salt"], "Dates, egg whites, almonds, cashews, chocolate, cocoa, sea salt.", n(1570, 15, 2, 0.5, 5, 12, 20, 9), { nova: 3 }),
  food("021908847418", "Lärabar Apple Pie", "Lärabar", "snacks", ["almond"], "Dates, almonds, unsweetened apples, walnuts, raisins, cinnamon.", n(1800, 36, 1, 0.05, 6, 8, 40, 16), { nova: 1 }),
  food("850000123016", "That's it Apple Fruit Bar", "That's it", "snacks", [], "Apples.", n(1050, 48, 0, 0.02, 8, 2, 100, 0), { nova: 1 }),
  food("856069005016", "Simple Mills Almond Flour Crackers", "Simple Mills", "snacks", ["almond", "sunflower-seed", "salt"], "Nut and seed flour blend (almonds, sunflower seeds, flax), tapioca, cassava, sea salt.", n(2090, 2, 1.5, 1.1, 4, 8, 0, 16), { nova: 3 }),
  food("810027341016", "SkinnyPop Original", "SkinnyPop", "snacks", ["sunflower-oil", "salt"], "Popcorn, sunflower oil, salt.", n(1880, 0, 1, 0.7, 8, 6, 0, 10), { nova: 3 }),
  food("029000016912", "Planters Dry Roasted Peanuts", "Planters", "snacks", ["peanut", "salt"], "Peanuts, sea salt.", n(2500, 4, 7, 0.8, 8, 26, 0, 50), { nova: 1 }),

  // —— Snacks: middle ——
  food("722252101016", "Clif Builder's Chocolate", "Clif", "snacks", ["sugar", "cocoa", "e322", "natural-flavour"], "Soy protein isolate, cane syrup, palm kernel oil, cocoa, natural flavour.", n(1570, 20, 5, 0.7, 4, 20, 0, 8), { nova: 4 }),
  food("888849000016", "Quest Chocolate Chip Cookie Dough", "Quest", "snacks", ["almond", "cocoa", "e955", "e322", "natural-flavour"], "Protein blend, soluble corn fibre, almonds, chocolate chips, sucralose, natural flavour.", n(1400, 1, 3, 0.6, 16, 21, 0, 8), { nova: 4 }),
  food("013562000016", "Annie's Cheddar Bunnies", "Annie's", "snacks", ["wheat-flour", "sunflower-oil", "cheddar", "salt"], "Organic wheat flour, expeller-pressed sunflower oil, salt, cheddar, yeast.", n(2000, 2, 2, 1.4, 3, 8, 0, 18), { organic: true, nova: 3 }),
  food("015000873615", "Nature Valley Protein Peanut Almond", "Nature Valley", "snacks", ["peanut", "almond", "sugar", "palm-oil"], "Roasted peanuts, soy protein isolate, almonds, sugar, palm oil, honey.", n(2000, 14, 4, 0.6, 10, 20, 0, 24), { nova: 4 }),
  food("041196010334", "Pirate's Booty Aged White Cheddar", "Pirate's Booty", "snacks", ["wheat-flour", "sunflower-oil", "cheddar", "salt"], "Corn, rice, cheddar cheese, sunflower oil, salt.", n(1880, 2, 2, 1.2, 2, 6, 0, 14), { nova: 3 }),

  // —— Snacks: worst ——
  food("888109010016", "Hostess Twinkies", "Hostess", "snacks", ["sugar", "wheat-flour", "palm-oil", "egg", "e471", "e102", "e202"], "Sugar, water, enriched flour, high fructose corn syrup, palm oil, egg, emulsifiers, yellow 5.", n(1500, 42, 4, 0.9, 0.5, 3, 0, 12), { nova: 4 }),
  food("024300044016", "Little Debbie Cosmic Brownies", "Little Debbie", "snacks", ["sugar", "wheat-flour", "palm-oil", "cocoa", "e322", "e102"], "Sugar, corn syrup, enriched flour, palm oil, cocoa, soy lecithin, colours.", n(1900, 48, 8, 0.6, 2, 3, 0, 20), { nova: 4 }),
  food("014100044016", "Goldfish Cheddar", "Goldfish", "snacks", ["wheat-flour", "cheddar", "salt", "e102", "e110"], "Wheat flour, cheddar cheese, vegetable oils, salt, yeast, colours.", n(1950, 2, 2.5, 1.8, 2, 10, 0, 16), { nova: 4 }),
  food("024100044016", "Cheez-It Original", "Cheez-It", "snacks", ["wheat-flour", "cheddar", "palm-oil", "salt", "e102"], "Enriched flour, vegetable oil, cheese made with skim milk, salt, paprika, yeast, yellow 6.", n(2090, 2, 4, 2, 2, 10, 0, 26), { nova: 4 }),
  food("044000007129", "Chips Ahoy! Original", "Nabisco", "snacks", ["wheat-flour", "sugar", "palm-oil", "cocoa", "e322", "salt"], "Enriched flour, sugar, palm oil, chocolate chips, high fructose corn syrup, salt, soy lecithin.", n(2050, 32, 8, 0.7, 2, 5, 0, 22), { nova: 4 }),
  food("028400064064", "Lay's Sour Cream & Onion", "Lay's", "snacks", ["potato", "sunflower-oil", "salt", "milk", "e621"], "Potatoes, vegetable oil, sour cream & onion seasoning, salt, MSG.", n(2240, 2, 3.5, 1.4, 4, 6, 0, 35), { nova: 4 }),

  // —— Spreads: best / middle / worst ——
  food("044082100016", "Once Again Organic Creamy Almond Butter", "Once Again", "spreads", ["almond"], "Organic dry roasted almonds.", n(2500, 4, 4, 0, 12, 21, 0, 52), { organic: true, nova: 1 }),
  food("099482435307", "365 Organic Creamy Peanut Butter", "365 Whole Foods Market", "spreads", ["peanut"], "Organic peanuts.", n(2500, 4, 6, 0, 8, 25, 0, 50), { organic: true, nova: 1 }),
  food("072250837016", "Crazy Richard's 100% Peanuts", "Crazy Richard's", "spreads", ["peanut"], "Peanuts.", n(2500, 4, 6, 0, 8, 25, 0, 50), { nova: 1 }),
  food("894455000016", "Justin's Classic Almond Butter", "Justin's", "spreads", ["almond", "palm-oil", "salt"], "Dry roasted almonds, palm oil, sea salt.", n(2500, 5, 6, 0.3, 10, 20, 0, 50), { nova: 3 }),
  food("051500241110", "Smucker's Natural Peanut Butter", "Smucker's", "spreads", ["peanut", "salt"], "Peanuts, salt.", n(2500, 4, 6, 0.5, 8, 25, 0, 50), { nova: 1 }),
  food("051500000023", "Fluff Marshmallow Spread", "Fluff", "spreads", ["sugar", "e330", "egg"], "Corn syrup, sugar, dried egg white, vanillin.", n(1350, 70, 0, 0.1, 0, 0.5, 0, 0), { nova: 4 }),
  food("051500255179", "Jif Omega-3 Creamy", "Jif", "spreads", ["peanut", "sugar", "palm-oil", "salt"], "Roasted peanuts, sugar, molasses, fully hydrogenated vegetable oils, salt.", n(2500, 9, 7, 0.9, 6, 22, 0, 50), { nova: 4 }),

  // —— Dairy: best / middle / worst ——
  food("898248001016", "Siggi's Plain 0%", "Siggi's", "dairy", ["milk", "yogurt-cultures"], "Pasteurised skim milk, live cultures.", n(226, 4, 0, 0.1, 0, 11, 0, 0), { nova: 1 }),
  food("043192005016", "Nancy's Organic Plain Yogurt", "Nancy's", "dairy", ["milk", "yogurt-cultures"], "Organic pasteurised milk, live cultures.", n(250, 5, 2, 0.1, 0, 5, 0, 3.5), { organic: true, nova: 1 }),
  food("099482435409", "365 Greek Yogurt Plain", "365 Whole Foods Market", "dairy", ["milk", "yogurt-cultures"], "Cultured pasteurised milk.", n(226, 4, 0, 0.1, 0, 10, 0, 0), { nova: 1 }),
  food("898248001023", "Siggi's Vanilla 2%", "Siggi's", "dairy", ["milk", "sugar", "yogurt-cultures", "vanilla"], "Pasteurised milk, cane sugar, vanilla extract, live cultures.", n(330, 9, 1.5, 0.1, 0, 10, 0, 2), { nova: 3 }),
  food("052159000016", "Stonyfield Organic YoBaby", "Stonyfield", "dairy", ["milk", "sugar", "yogurt-cultures"], "Organic milk, organic sugar, live cultures.", n(380, 11, 2, 0.1, 0, 4, 0, 3), { organic: true, nova: 3 }),
  food("070470003025", "Go-Gurt Strawberry", "Yoplait", "dairy", ["milk", "sugar", "yogurt-cultures", "e330", "e440", "e129"], "Cultured milk, sugar, modified corn starch, kosher gelatine, red 40, natural flavour.", n(360, 13, 0.5, 0.1, 0, 3, 0, 1), { nova: 4 }),
  food("027000612016", "Cool Whip Original", "Cool Whip", "dairy", ["water", "sugar", "palm-oil", "e471", "e412"], "Water, hydrogenated vegetable oil, high fructose corn syrup, corn syrup, skim milk, light cream, emulsifiers.", n(1050, 17, 10, 0.05, 0, 0, 0, 16), { nova: 4 }),
  food("027000001016", "Jell-O Chocolate Pudding Cup", "Jell-O", "dairy", ["water", "sugar", "e407", "e202", "e102"], "Water, sugar, modified corn starch, cocoa, salt, sodium stearoyl lactylate, yellow 5 and 6.", n(450, 18, 0.5, 0.3, 1, 1, 0, 1.5), { nova: 4 }),

  // —— Chocolate: best / middle / worst ——
  food("037014000016", "Endangered Species 88% Dark", "Endangered Species", "chocolate", ["cocoa", "sugar", "vanilla"], "Chocolate liquor, cocoa butter, cane sugar, vanilla.", n(2450, 12, 22, 0.02, 14, 10, 0, 48), { nova: 1 }),
  food("099482435501", "365 85% Dark Chocolate", "365 Whole Foods Market", "chocolate", ["cocoa", "sugar", "vanilla"], "Cocoa mass, cocoa butter, cane sugar, vanilla.", n(2450, 11, 24, 0.02, 13, 12, 0, 46), { nova: 1 }),
  food("747599607016", "Ghirardelli 72% Twilight Delight", "Ghirardelli", "chocolate", ["cocoa", "sugar", "vanilla", "e322"], "Unsweetened chocolate, sugar, cocoa butter, vanilla, soy lecithin.", n(2300, 24, 20, 0.02, 10, 8, 0, 42), { nova: 3 }),
  food("040000002336", "3 Musketeers", "Mars", "chocolate", ["sugar", "cocoa", "milk", "e322"], "Milk chocolate, corn syrup, sugar, hydrogenated palm oil, cocoa powder.", n(1800, 62, 8, 0.3, 1, 2, 0, 12), { nova: 4 }),
  food("010700808016", "Butterfinger", "Ferrero", "chocolate", ["sugar", "peanut", "palm-oil", "cocoa", "milk", "e322"], "Corn syrup, sugar, ground roasted peanuts, hydrogenated palm oil, cocoa, milk.", n(1920, 48, 8, 0.5, 2, 6, 0, 18), { nova: 4 }),
  food("028000616016", "Nestlé Crunch", "Nestlé", "chocolate", ["sugar", "cocoa", "milk", "wheat-flour", "e322"], "Milk chocolate, crisped rice, sugar, cocoa butter, lecithin.", n(2100, 54, 14, 0.2, 1, 5, 0, 26), { nova: 4 }),

  // —— Staples: best / middle / worst ——
  food("099482435608", "365 Organic Black Beans", "365 Whole Foods Market", "staples", ["salt"], "Organic black beans, water, sea salt.", n(360, 0.5, 0.1, 0.4, 7, 8, 0, 0.5), { organic: true, nova: 1 }),
  food("073416000016", "Lundberg Organic Brown Rice", "Lundberg", "staples", [], "Organic whole grain brown rice.", n(1540, 0.7, 0.5, 0.01, 3.5, 7.5, 0, 2.7), { organic: true, nova: 1 }),
  food("042272000016", "Amy's Lentil Soup", "Amy's", "staples", ["tomato", "salt", "spice", "olive-oil"], "Filtered water, organic lentils, organic vegetables, extra virgin olive oil, spices, sea salt.", n(280, 2, 0.3, 0.7, 3, 4, 20, 2), { organic: true, nova: 3 }),
  food("013562003016", "Annie's Organic Macaroni & Cheese", "Annie's", "staples", ["wheat-flour", "cheddar", "salt"], "Organic pasta, cheddar, whey, salt, cultured milk.", n(1550, 6, 3, 1.2, 2, 10, 0, 6), { organic: true, nova: 3 }),
  food("021000010820", "Kraft Easy Mac Cups", "Kraft", "staples", ["wheat-flour", "cheddar", "salt", "e102", "e110"], "Enriched macaroni, whey, corn syrup solids, palm oil, salt, yellow 5 and 6.", n(1550, 8, 3.5, 1.9, 2, 9, 0, 7), { nova: 4 }),
  food("064144000016", "Chef Boyardee Beefaroni", "Chef Boyardee", "staples", ["wheat-flour", "tomato", "beef", "salt", "e102", "e621"], "Tomatoes, water, enriched pasta, beef, high fructose corn syrup, salt, yellow 5, MSG.", n(420, 4, 1.5, 1.1, 2, 4, 20, 4), { nova: 4 }),
  food("042800000016", "Totino's Party Pizza Pepperoni", "Totino's", "staples", ["wheat-flour", "palm-oil", "pork", "e250", "salt", "e102"], "Enriched flour, water, imitation mozzarella, pepperoni (pork, beef, nitrites), tomato paste.", n(1100, 4, 6, 1.6, 2, 8, 4, 14), { nova: 4 }),

  // —— Condiments ——
  food("099482435701", "365 Organic Salsa Medium", "365 Whole Foods Market", "condiments", ["tomato", "e260", "salt", "spice"], "Organic tomatoes, onions, jalapeño, vinegar, salt, garlic, spices.", n(80, 3, 0, 0.8, 1, 1, 80, 0), { organic: true, nova: 1 }),
  food("024600010016", "Huy Fong Sriracha", "Huy Fong", "condiments", ["e260", "sugar", "salt", "spice"], "Chili, sugar, salt, garlic, distilled vinegar, potassium sorbate, sodium bisulfite.", n(390, 10, 0, 3.5, 2, 1, 40, 0.5), { nova: 3 }),
  food("013000006016", "Sweet Baby Ray's Original BBQ", "Sweet Baby Ray's", "condiments", ["sugar", "tomato", "e260", "salt", "spice", "e202"], "High fructose corn syrup, distilled vinegar, tomato paste, modified corn starch, salt.", n(780, 38, 0, 1.8, 0.5, 0.5, 20, 0), { nova: 4 }),
  food("041303000800", "Hidden Valley Ranch Original", "Hidden Valley", "condiments", ["sunflower-oil", "e415", "e202", "e330", "salt", "spice", "e621"], "Vegetable oil, water, sugar, salt, egg yolk, vinegar, MSG, xanthan gum.", n(1800, 6, 6, 2, 0, 1, 0, 45), { nova: 4 }),

  // —— Beauty: best / middle / worst ——
  beauty("812791000016", "Vanicream Moisturizing Cream", "Vanicream", "skincare", ["water", "glycerin", "cetearyl", "tocopherol"], "Water, glycerin, petrolatum, cetearyl alcohol, sorbitol, tocopheryl acetate."),
  beauty("769915191016", "The Ordinary Niacinamide 10% + Zinc", "The Ordinary", "skincare", ["water", "niacinamide", "zinc-oxide", "glycerin", "phenoxyethanol"], "Aqua, niacinamide, pentylene glycol, zinc PCA, glycerin, phenoxyethanol."),
  beauty("850008980016", "Native Deodorant Coconut Vanilla", "Native", "body", ["shea", "tocopherol", "fragrance"], "Caprylic/capric triglyceride, tapioca starch, ozokerite, sodium bicarbonate, shea, fragrance, tocopherol."),
  beauty("301716000016", "Cetaphil Gentle Skin Cleanser", "Cetaphil", "skincare", ["water", "glycerin", "cetearyl", "panthenol", "phenoxyethanol"], "Water, cetyl alcohol, propylene glycol, sodium lauryl sulfate, stearyl alcohol, panthenol, phenoxyethanol."),
  beauty("014265000016", "Bath & Body Works Japanese Cherry Blossom", "Bath & Body Works", "body", ["water", "sles", "fragrance", "linalool", "limonene", "citronellol"], "Water, sodium laureth sulfate, fragrance, linalool, limonene, citronellol, red 33."),
  beauty("079400000016", "Degree Aerosol Dry Spray", "Degree", "body", ["alcohol-denat", "fragrance", "linalool", "limonene"], "Butane, hydrofluorocarbon 152a, cyclopentasiloxane, aluminum chlorohydrate, fragrance, alcohol denat."),

  // —— Pet: best / middle / worst ——
  pet("186073000016", "Open Farm Grass-Fed Beef", "Open Farm", ["beef", "salt", "tocopherol"], "Humanely raised beef, sweet potatoes, ocean whitefish meal, herring, pumpkin, coconut oil, mixed tocopherols.", n(1550, 3, 5, 0.6, 4, 30, 4, 14), { nova: 1 }),
  pet("076344080016", "Wellness CORE Grain-Free Turkey", "Wellness", ["chicken", "salt", "tocopherol"], "Deboned turkey, turkey meal, peas, potatoes, tomato pomace, mixed tocopherols.", n(1550, 3, 5.5, 0.7, 4, 34, 2, 14), { nova: 3 }),
  pet("017800848346", "Beneful IncrediBites", "Purina", ["chicken", "wheat-flour", "e320", "e102", "salt"], "Ground yellow corn, chicken by-product meal, corn gluten meal, animal fat, soy flour, sugar, salt, colours, BHA.", n(1450, 8, 5, 1.2, 3, 22, 0, 10), { nova: 4 }),
  pet("050000580788", "Friskies Tasty Treasures", "Friskies", ["chicken", "e407", "e102", "salt"], "Meat by-products, water, chicken, wheat gluten, soy flour, artificial flavours, guar gum, salt, added colour.", n(380, 1, 2.5, 0.8, 0.4, 8, 0, 6), { nova: 4 }),
];
