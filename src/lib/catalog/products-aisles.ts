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
  extra?: { organic?: boolean; beverage?: boolean; water?: boolean; nova?: number },
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
  };
}

/** Missing supermarket aisles: frozen, baby, bakery, coffee, protein + store brands. */
export const AISLE_PRODUCTS: ProductDef[] = [
  // —— Frozen: best ——
  food("014500001016", "Birds Eye Steamfresh Broccoli", "Birds Eye", "frozen", ["salt"], "Broccoli.", n(145, 1.5, 0, 0.05, 3, 2, 100, 0), { nova: 1 }),
  food("041498000016", "365 Organic Mixed Berries Frozen", "365 Whole Foods Market", "frozen", [], "Organic strawberries, blueberries, blackberries, raspberries.", n(220, 8, 0, 0, 4, 1, 100, 0), { organic: true, nova: 1 }),
  food("000111108016", "Kirkland Organic Strawberries", "Kirkland", "frozen", [], "Organic strawberries.", n(180, 7, 0, 0, 3, 1, 100, 0), { organic: true, nova: 1 }),
  food("042272008016", "Amy's Organic Vegetable Pizza", "Amy's", "frozen", ["wheat-flour", "tomato", "cheddar", "olive-oil", "salt"], "Organic wheat flour, organic tomatoes, organic mozzarella, organic vegetables, extra virgin olive oil, sea salt.", n(920, 4, 3, 0.9, 3, 8, 20, 8), { organic: true, nova: 3 }),
  food("025800000016", "Evol Chicken Cilantro Tamale Bowl", "Evol", "frozen", ["chicken", "corn", "salt", "spice"], "Chicken, corn masa, black beans, vegetables, spices, sea salt.", n(650, 3, 2, 0.8, 5, 14, 15, 8), { nova: 3 }),

  // —— Frozen: middle ——
  food("013800000016", "Lean Cuisine Chicken Fettuccini", "Lean Cuisine", "frozen", ["wheat-flour", "chicken", "milk", "salt", "e412"], "Cooked enriched pasta, sauce, cooked chicken, skim milk, modified corn starch, salt, xanthan gum.", n(520, 4, 1.5, 0.9, 2, 12, 2, 4), { nova: 4 }),
  food("000138001016", "Healthy Choice Cafe Steamers Grilled Chicken", "Healthy Choice", "frozen", ["chicken", "rice", "salt", "e412"], "Cooked chicken, vegetables, cooked rice, sauce, salt, xanthan gum.", n(480, 5, 1, 0.8, 4, 16, 20, 3), { nova: 4 }),
  food("003000001016", "Marie Callender's Chicken Pot Pie", "Marie Callender's", "frozen", ["wheat-flour", "chicken", "palm-oil", "salt"], "Wheat flour, chicken broth, chicken, palm oil, carrots, peas, salt.", n(1100, 4, 8, 1.3, 2, 10, 8, 18), { nova: 4 }),
  food("072655000016", "Red Baron Classic Crust Pepperoni", "Red Baron", "frozen", ["wheat-flour", "palm-oil", "pork", "e250", "salt"], "Enriched flour, cheese, pepperoni (pork, beef, nitrites), tomato sauce, palm oil, salt.", n(1170, 5, 6, 1.5, 2, 11, 6, 14), { nova: 4 }),

  // —— Frozen: worst ——
  food("071921000016", "DiGiorno Rising Crust Pepperoni", "DiGiorno", "frozen", ["wheat-flour", "palm-oil", "pork", "e250", "salt", "e621"], "Enriched flour, water, cheese, pepperoni, tomato paste, palm oil, sugar, salt, MSG.", n(1130, 6, 7, 1.6, 2, 12, 6, 14), { nova: 4 }),
  food("007192100016", "Tombstone Original Pepperoni", "Tombstone", "frozen", ["wheat-flour", "palm-oil", "pork", "e250", "salt"], "Enriched flour, cheese, pepperoni, tomato sauce, vegetable oil, salt.", n(1170, 5, 6, 1.7, 2, 11, 6, 14), { nova: 4 }),
  food("001380055016", "Stouffer's Lasagna with Meat & Sauce", "Stouffer's", "frozen", ["wheat-flour", "beef", "tomato", "salt", "e621"], "Tomato sauce, cooked pasta, beef, ricotta, mozzarella, salt, sugar, MSG.", n(650, 6, 4, 1.1, 2, 10, 15, 8), { nova: 4 }),
  food("072655881016", "Totino's Pizza Rolls Pepperoni", "Totino's", "frozen", ["wheat-flour", "palm-oil", "pork", "e250", "e102", "salt"], "Enriched flour, imitation mozzarella, pepperoni, tomato paste, palm oil, yellow 6.", n(1130, 4, 5, 1.4, 2, 8, 4, 12), { nova: 4 }),
  food("041500000016", "Ore-Ida Tater Tots", "Ore-Ida", "frozen", ["potato", "palm-oil", "salt", "e102"], "Potatoes, vegetable oil, salt, dextrose, yellow 5.", n(800, 0.5, 2, 1.1, 2, 2, 0, 10), { nova: 4 }),
  food("072655002016", "Hot Pockets Pepperoni Pizza", "Hot Pockets", "frozen", ["wheat-flour", "palm-oil", "pork", "e250", "e102", "salt"], "Enriched flour, water, imitation cheese, pepperoni, tomato paste, palm oil, yellow 6.", n(1130, 5, 6, 1.6, 2, 9, 4, 14), { nova: 4 }),

  // —— Ice cream in frozen ——
  food("074570030016", "Häagen-Dazs Chocolate Ice Cream", "Häagen-Dazs", "frozen", ["milk", "sugar", "cocoa", "egg"], "Cream, skim milk, sugar, cocoa, egg yolks.", n(1130, 22, 12, 0.15, 2, 4, 0, 18), { nova: 3 }),
  food("007284950016", "Talenti Sea Salt Caramel Gelato", "Talenti", "frozen", ["milk", "sugar", "egg", "salt"], "Milk, sugar, cream, egg yolk, caramel, sea salt.", n(1050, 24, 8, 0.3, 0, 4, 0, 14), { nova: 3 }),
  food("072655881116", "Drumstick Vanilla", "Drumstick", "frozen", ["milk", "sugar", "palm-oil", "cocoa", "e322"], "Dairy mix, sugar, palm oil, cocoa, soy lecithin, vanillin.", n(1170, 22, 8, 0.2, 1, 3, 0, 16), { nova: 4 }),
  food("041303000016", "Great Value Vanilla Ice Cream", "Great Value", "frozen", ["milk", "sugar", "e471", "e412"], "Milk, cream, sugar, corn syrup, whey, mono and diglycerides, guar gum.", n(880, 20, 7, 0.15, 0, 3, 0, 12), { nova: 4 }),

  // —— Baby: best ——
  food("015000001016", "Gerber Organic 1st Foods Carrot", "Gerber", "baby", [], "Organic carrots, water.", n(150, 4, 0, 0.05, 2, 0.5, 100, 0), { organic: true, nova: 1 }),
  food("023614000016", "Earth's Best Organic Peas", "Earth's Best", "baby", [], "Organic peas, water.", n(220, 3, 0, 0.04, 3, 3, 100, 0), { organic: true, nova: 1 }),
  food("819573000016", "Once Upon a Farm Cold-Pressed Apple", "Once Upon a Farm", "baby", [], "Organic apple, lemon.", n(230, 11, 0, 0, 2, 0.3, 100, 0), { organic: true, nova: 1 }),
  food("819573013016", "Serenity Kids Savory Chicken", "Serenity Kids", "baby", ["chicken", "olive-oil", "salt"], "Chicken, organic vegetables, olive oil, spices.", n(420, 2, 1.5, 0.2, 2, 8, 40, 6), { organic: true, nova: 1 }),
  food("050000580016", "Happy Baby Organics Bananas", "Happy Baby", "baby", [], "Organic bananas.", n(370, 16, 0, 0, 2, 1, 100, 0), { organic: true, nova: 1 }),

  // —— Baby: middle / worst ——
  food("015000041016", "Gerber Graduates Puffs Vanilla", "Gerber", "baby", ["rice", "sugar", "e330", "natural-flavour"], "Rice flour, whole wheat flour, sugar, mixed tocopherols, natural flavour, vanilla.", n(1550, 8, 0, 0.3, 2, 6, 0, 1), { nova: 4 }),
  food("015000061016", "Gerber Lil Crunchies Ranch", "Gerber", "baby", ["corn", "palm-oil", "salt", "e621"], "Whole grain sorghum, degermed yellow corn meal, high oleic sunflower oil, ranch seasoning, salt.", n(1880, 2, 1, 0.6, 2, 6, 0, 8), { nova: 4 }),
  food("070074580016", "Similac Advance Infant Formula", "Similac", "baby", ["milk", "sugar", "sunflower-oil", "e322"], "Nonfat milk, lactose, high oleic safflower oil, soy oil, whey protein concentrate, coconut oil, soy lecithin.", n(2090, 11, 4, 0.2, 0, 11, 0, 28), { nova: 4 }),
  food("300871000016", "Enfamil NeuroPro Infant Formula", "Enfamil", "baby", ["milk", "sugar", "palm-oil", "e322"], "Nonfat milk, lactose, vegetable oils (palm olein, coconut, soy, high oleic sunflower), whey protein-lipid concentrate, soy lecithin.", n(2090, 11, 4.5, 0.2, 0, 11, 0, 28), { nova: 4 }),
  food("050000000016", "Beech-Nut Fruities Pear Banana", "Beech-Nut", "baby", ["sugar", "natural-flavour"], "Pear, banana, apple juice concentrate, natural flavour.", n(280, 14, 0, 0, 2, 0.4, 90, 0), { nova: 3 }),

  // —— Bakery: best ——
  food("013764027016", "Food for Life Ezekiel 4:9 Sprouted", "Food for Life", "bakery", ["wheat-flour", "salt"], "Organic sprouted wheat, barley, millet, lentils, soybeans, spelt, water, salt.", n(990, 0.5, 0.2, 0.6, 5, 8, 0, 1), { organic: true, nova: 1 }),
  food("013764005016", "Dave's Killer Bread 21 Whole Grains", "Dave's Killer Bread", "bakery", ["wheat-flour", "sugar", "salt"], "Organic whole wheat, water, 21 whole grains and seeds, organic cane sugar, sea salt, yeast.", n(1050, 5, 0.5, 0.7, 5, 6, 0, 3), { organic: true, nova: 3 }),
  food("085239000016", "Canyon Bakehouse Mountain White", "Canyon Bakehouse", "bakery", ["egg", "salt", "e412"], "Water, brown rice flour, tapioca flour, eggs, sugar, xanthan gum, salt, yeast.", n(990, 4, 0.5, 0.8, 2, 3, 0, 2), { nova: 4 }),
  food("072250011016", "Nature's Own 100% Whole Wheat", "Nature's Own", "bakery", ["wheat-flour", "sugar", "salt"], "Whole wheat flour, water, yeast, wheat gluten, sugar, salt.", n(1020, 4, 0.4, 0.8, 4, 5, 0, 1.5), { nova: 3 }),
  food("000111105016", "Kirkland Organic Whole Wheat", "Kirkland", "bakery", ["wheat-flour", "salt"], "Organic whole wheat flour, water, yeast, sea salt.", n(990, 2, 0.3, 0.6, 5, 6, 0, 1), { organic: true, nova: 1 }),

  // —— Bakery: worst ——
  food("072250000016", "Wonder Classic White", "Wonder", "bakery", ["wheat-flour", "sugar", "palm-oil", "salt", "e471"], "Enriched flour, water, sugar, yeast, soybean oil, salt, calcium propionate, monoglycerides, soy lecithin.", n(1130, 6, 0.5, 1.0, 1, 4, 0, 2), { nova: 4 }),
  food("048121000016", "Pepperidge Farm Farmhouse Butter Bread", "Pepperidge Farm", "bakery", ["wheat-flour", "sugar", "milk", "salt"], "Enriched wheat flour, water, sugar, yeast, butter, salt, soybean oil.", n(1170, 6, 1.5, 0.9, 1, 4, 0, 3), { nova: 4 }),
  food("048121018016", "Thomas' Original English Muffins", "Thomas'", "bakery", ["wheat-flour", "sugar", "salt", "e471"], "Enriched wheat flour, water, farina, yeast, salt, sugar, calcium propionate, soybean oil.", n(960, 2, 0.3, 0.9, 2, 4, 0, 1), { nova: 4 }),
  food("071319000016", "Martin's Potato Rolls", "Martin's", "bakery", ["wheat-flour", "sugar", "potato", "milk", "salt"], "Enriched flour, water, sugar, potato flour, yeast, soybean oil, salt.", n(1170, 8, 1, 0.9, 2, 6, 0, 3), { nova: 4 }),
  food("007225011116", "Nature's Own Butterbread", "Nature's Own", "bakery", ["wheat-flour", "sugar", "salt", "e471"], "Unbleached enriched flour, water, sugar, yeast, butter, salt.", n(1130, 5, 1, 0.9, 1, 4, 0, 2), { nova: 4 }),

  // —— Coffee & tea: best ——
  food("762111000016", "Peet's Major Dickason's Whole Bean", "Peet's", "coffee", ["coffee"], "Coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, nova: 1 }),
  food("099482441016", "365 Organic French Roast", "365 Whole Foods Market", "coffee", ["coffee"], "Organic coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, organic: true, nova: 1 }),
  food("000111106016", "Kirkland Colombian Supremo", "Kirkland", "coffee", ["coffee"], "Coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, nova: 1 }),
  food("076737211016", "Traditional Medicinals Organic Ginger", "Traditional Medicinals", "coffee", ["tea"], "Organic ginger, organic lemongrass.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, organic: true, nova: 1 }),
  food("076737000016", "Yogi Ginger Tea", "Yogi", "coffee", ["tea"], "Organic ginger root, lemongrass, licorice, peppermint.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, organic: true, nova: 1 }),
  food("099482513016", "365 Organic Green Tea", "365 Whole Foods Market", "coffee", ["tea"], "Organic green tea.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, organic: true, nova: 1 }),

  // —— Coffee: middle / worst ——
  food("043000123016", "Folgers Classic Roast Ground", "Folgers", "coffee", ["coffee"], "Coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, nova: 1 }),
  food("025500000016", "Dunkin' Original Blend Ground", "Dunkin'", "coffee", ["coffee"], "Coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, nova: 1 }),
  food("012000162016", "Starbucks Frappuccino Mocha Bottle", "Starbucks", "coffee", ["milk", "sugar", "coffee", "cocoa", "natural-flavour"], "Starbucks coffee, reduced-fat milk, sugar, cocoa, natural flavour, pectin.", n(340, 14, 1.2, 0.1, 1, 3, 0, 2.5), { beverage: true, nova: 4 }),
  food("012000163016", "Starbucks Pink Drink", "Starbucks", "coffee", ["water", "sugar", "natural-flavour", "e330"], "Brewed green coffee extract, white grape juice concentrate, natural flavour, citric acid.", n(120, 7, 0, 0.05, 0, 0, 8, 0), { beverage: true, nova: 4 }),
  food("076737311016", "Tazo Iced Passion Bottled", "Tazo", "coffee", ["water", "sugar", "tea", "e330", "natural-flavour"], "Water, sugar, hibiscus, citric acid, natural flavour.", n(130, 8, 0, 0.02, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("048500002016", "Dunkin' Bottled Iced Coffee Vanilla", "Dunkin'", "coffee", ["milk", "sugar", "coffee", "natural-flavour"], "Coffee, skim milk, sugar, cream, natural flavour, pectin.", n(280, 12, 1, 0.1, 0, 2, 0, 2), { beverage: true, nova: 4 }),
  food("070847812016", "International Delight French Vanilla Creamer", "International Delight", "coffee", ["sugar", "palm-oil", "e471", "e102", "natural-flavour"], "Water, sugar, palm oil, sodium caseinate, dipotassium phosphate, natural and artificial flavours, yellow 5 and 6.", n(1360, 20, 1.5, 0.1, 0, 0, 0, 8), { nova: 4 }),
  food("044000041016", "Coffee-Mate Original Powder", "Coffee-Mate", "coffee", ["sugar", "palm-oil", "e339", "e102"], "Corn syrup solids, hydrogenated vegetable oil, sodium caseinate, dipotassium phosphate, mono and diglycerides, yellow 5.", n(2090, 10, 5, 0.2, 0, 0, 0, 25), { nova: 4 }),

  // —— Protein: best ——
  food("857777004016", "RXBAR Chocolate Sea Salt", "RXBAR", "protein", ["egg", "cocoa", "cashew", "salt"], "Egg whites, dates, cashews, chocolate, cocoa, natural flavors, sea salt.", n(1550, 13, 2, 0.5, 5, 20, 8, 7), { nova: 3 }),
  food("021908453016", "Lärabar Peanut Butter Chocolate Chip", "Lärabar", "protein", ["peanut", "cocoa", "salt"], "Dates, peanuts, chocolate chips, sea salt.", n(1880, 18, 4, 0.3, 4, 9, 8, 14), { nova: 1 }),
  food("021908000016", "Lärabar Apple Pie", "Lärabar", "protein", [], "Dates, almonds, unsweetened apples, walnuts, raisins, cinnamon.", n(1550, 18, 0.5, 0.02, 5, 6, 40, 8), { nova: 1 }),
  food("850009333016", "That's it Apple + Mango Bar", "That's it", "protein", [], "Apples, mango.", n(1170, 22, 0, 0.02, 4, 1, 100, 0), { nova: 1 }),
  food("810003000016", "Orgain Organic Protein Powder Vanilla", "Orgain", "protein", ["natural-flavour", "salt", "e960"], "Organic pea protein, organic brown rice protein, organic chia, organic vanilla, stevia, sea salt.", n(1550, 4, 1, 0.6, 4, 21, 0, 3), { organic: true, nova: 4 }),

  // —— Protein: middle / worst ——
  food("888849000016", "Quest Chocolate Chip Cookie Dough Bar", "Quest", "protein", ["milk", "e955", "e960", "natural-flavour", "e412"], "Protein blend (milk protein isolate, whey protein isolate), polydextrose, water, almonds, cocoa butter, sucralose, stevia, xanthan gum, natural flavour.", n(1420, 1, 3, 0.6, 14, 21, 0, 8), { nova: 4 }),
  food("643843000016", "Premier Protein Chocolate Shake", "Premier Protein", "protein", ["milk", "e955", "e960", "e407", "natural-flavour"], "Water, milk protein concentrate, cocoa, calcium caseinate, sucralose, acesulfame K, carrageenan, natural flavour.", n(250, 1, 1, 0.3, 3, 13, 0, 3), { beverage: true, nova: 4 }),
  food("660726000016", "Muscle Milk Chocolate", "Muscle Milk", "protein", ["milk", "sugar", "e407", "e955", "natural-flavour"], "Water, milk protein isolate, calcium caseinate, sugar, cocoa, sunflower oil, carrageenan, sucralose, natural flavour.", n(280, 2, 0.5, 0.3, 2, 11, 0, 3), { beverage: true, nova: 4 }),
  food("070074581016", "Ensure Original Vanilla", "Ensure", "protein", ["milk", "sugar", "e322", "e407", "natural-flavour"], "Water, corn maltodextrin, sugar, milk protein concentrate, soy oil, soy protein isolate, soy lecithin, carrageenan, natural flavour.", n(420, 9, 0.5, 0.2, 0, 4, 0, 3), { beverage: true, nova: 4 }),
  food("041679000016", "Boost Original Chocolate", "Boost", "protein", ["milk", "sugar", "cocoa", "e407", "natural-flavour"], "Water, sugar, milk protein concentrate, cocoa, soy oil, carrageenan, natural flavour.", n(420, 10, 0.5, 0.2, 0, 4, 0, 3), { beverage: true, nova: 4 }),
  food("722252101016", "Clif Bar Chocolate Chip", "Clif", "protein", ["oats", "sugar", "cocoa", "natural-flavour"], "Organic brown rice syrup, organic rolled oats, soy protein isolate, organic cane syrup, chocolate chips, barley malt extract.", n(1550, 21, 2, 0.4, 4, 10, 0, 6), { organic: true, nova: 4 }),
  food("722252000016", "Clif Builder's Chocolate", "Clif", "protein", ["sugar", "milk", "e322", "natural-flavour"], "Soy protein isolate, beet syrup, palm kernel oil, cane sugar, cocoa, soy lecithin, natural flavour.", n(1760, 18, 8, 0.5, 2, 20, 0, 12), { nova: 4 }),
  food("838766007016", "Fairlife Core Power Chocolate", "Fairlife", "protein", ["milk", "sugar", "cocoa", "e407", "natural-flavour"], "Ultra-filtered milk, sugar, cocoa, lactase, carrageenan, natural flavour, stevia.", n(250, 6, 1, 0.3, 1, 11, 0, 2.5), { beverage: true, nova: 4 }),

  // —— Store brands across aisles ——
  food("078742433016", "Great Value Cola", "Great Value", "beverages", ["water", "sugar", "e150d", "e338", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, caramel colour, phosphoric acid, natural flavour, caffeine.", n(175, 11, 0, 0.02, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("078742000016", "Great Value Whole Milk", "Great Value", "dairy", ["milk"], "Milk, vitamin D3.", n(260, 5, 2, 0.1, 0, 3.3, 0, 3.3), { nova: 1 }),
  food("085239041016", "Good & Gather Organic Rolled Oats", "Good & Gather", "breakfast", ["oats"], "Organic whole grain rolled oats.", n(1550, 1, 1, 0, 10, 13, 0, 7), { organic: true, nova: 1 }),
  food("085239000116", "Good & Gather Sea Salt Potato Chips", "Good & Gather", "snacks", ["potato", "sunflower-oil", "salt"], "Potatoes, sunflower oil, sea salt.", n(2260, 0.5, 1.5, 0.8, 3, 6, 0, 32), { nova: 3 }),
  food("009911520016", "Trader Joe's Organic Tomato Sauce", "Trader Joe's", "staples", ["tomato", "salt"], "Organic tomatoes, sea salt.", n(130, 4, 0, 0.5, 1.5, 1.5, 90, 0), { organic: true, nova: 1 }),
  food("009911521016", "Trader Joe's Mandarin Orange Chicken", "Trader Joe's", "frozen", ["chicken", "sugar", "wheat-flour", "soy", "e621"], "Chicken, batter, sauce (sugar, soy sauce, orange juice concentrate), MSG.", n(920, 12, 2, 1.1, 1, 12, 4, 10), { nova: 4 }),
  food("009911522016", "Trader Joe's Unexpected Cheddar", "Trader Joe's", "dairy", ["milk", "salt"], "Pasteurized milk, salt, cheese cultures, enzymes.", n(1680, 0, 14, 1.5, 0, 22, 0, 28), { nova: 3 }),
  food("009911523016", "Trader Joe's Organic Extra Virgin Olive Oil", "Trader Joe's", "spreads", ["olive-oil"], "Organic extra virgin olive oil.", n(3380, 0, 14, 0, 0, 0, 0, 91), { organic: true, nova: 1 }),
  food("011110038016", "Kroger Carbmaster Vanilla Yogurt", "Kroger", "dairy", ["milk", "e955", "e960", "e440", "natural-flavour"], "Cultured milk, modified corn starch, sucralose, acesulfame K, natural flavour, pectin.", n(170, 3, 0, 0.1, 0, 9, 0, 0), { nova: 4 }),
  food("011110000016", "Kroger Value Cola", "Kroger", "beverages", ["water", "sugar", "e150d", "e338", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, caramel colour, phosphoric acid, caffeine, natural flavour.", n(175, 11, 0, 0.02, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("041303041016", "Simply Nature Organic Spaghetti", "Simply Nature", "staples", ["wheat-flour"], "Organic durum wheat semolina.", n(1480, 3, 0.3, 0, 3, 12, 0, 1.5), { organic: true, nova: 1 }),
  food("041303000116", "Simply Nature Sparkling Water Lime", "Simply Nature", "beverages", ["water", "carbon-dioxide", "natural-flavour"], "Carbonated water, natural flavour.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),

  // —— More global pantry brands ——
  food("041196910016", "Goya Black Beans", "Goya", "staples", ["salt"], "Black beans, water, salt.", n(360, 0.5, 0.1, 0.5, 6, 7, 0, 0.5), { nova: 1 }),
  food("046100000016", "Old El Paso Taco Seasoning", "Old El Paso", "condiments", ["salt", "spice", "e621", "e102"], "Chili pepper, salt, maltodextrin, spices, corn starch, onion, MSG, yellow 5.", n(1260, 8, 0, 8, 8, 8, 0, 4), { nova: 4 }),
  food("052000001016", "Campbell's Tomato Soup", "Campbell's", "staples", ["tomato", "sugar", "salt", "e330"], "Tomato puree, high fructose corn syrup, wheat flour, salt, potassium chloride, citric acid, flavouring.", n(310, 8, 0, 1.2, 1, 1, 40, 0), { nova: 4 }),
  food("041196000016", "Progresso Traditional Chicken Noodle", "Progresso", "staples", ["chicken", "wheat-flour", "salt", "e621"], "Chicken broth, carrots, cooked white chicken, celery, egg noodles, salt, flavour, MSG.", n(170, 1, 0.3, 0.9, 1, 4, 8, 1), { nova: 4 }),
  food("041000000016", "Knorr Chicken Bouillon", "Knorr", "condiments", ["salt", "sugar", "e621", "e150d", "chicken"], "Salt, sugar, corn starch, chicken fat, MSG, turmeric, caramel colour.", n(840, 8, 4, 20, 0, 4, 0, 8), { nova: 4 }),
  food("070784000016", "McCormick Pure Vanilla Extract", "McCormick", "condiments", ["vanilla", "e150d"], "Vanilla bean extractives in water, alcohol.", n(0, 0, 0, 0, 0, 0, 0, 0), { nova: 2 }),
  food("041303123016", "Good & Gather Marinara", "Good & Gather", "staples", ["tomato", "olive-oil", "salt", "spice"], "Tomatoes, extra virgin olive oil, salt, garlic, basil, oregano.", n(210, 5, 0.3, 0.7, 2, 1.5, 80, 2), { nova: 3 }),
];
