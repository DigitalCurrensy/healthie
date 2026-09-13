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

/** Extra US supermarket matrix — worst / middle / best of brands people actually scan. */
export const CART_PRODUCTS: ProductDef[] = [
  food("012000001258", "Pepsi", "Pepsi", "beverages", ["water", "sugar", "e338", "e150c", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, caramel colour, sugar, phosphoric acid, caffeine, citric acid, natural flavour.", n(175, 11, 0, 0.01, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("049000028911", "Diet Coke", "Coca-Cola", "beverages", ["water", "e950", "e951", "e338", "e150c", "natural-flavour", "carbon-dioxide"], "Carbonated water, caramel colour, phosphoric acid, aspartame, potassium benzoate, natural flavours, citric acid, caffeine.", n(1, 0, 0, 0.02, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("049000028904", "Sprite", "Coca-Cola", "beverages", ["water", "sugar", "e330", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, citric acid, natural flavours, sodium citrate, sodium benzoate.", n(160, 10, 0, 0.04, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("078000018661", "Dr Pepper", "Dr Pepper", "beverages", ["water", "sugar", "e338", "e150c", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, caramel colour, phosphoric acid, natural and artificial flavours, sodium benzoate, caffeine.", n(167, 10.5, 0, 0.04, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("012000001296", "Mountain Dew", "Pepsi", "beverages", ["water", "sugar", "e330", "e102", "e110", "natural-flavour", "carbon-dioxide"], "Carbonated water, high fructose corn syrup, concentrated orange juice, citric acid, natural flavour, sodium benzoate, caffeine, yellow 5.", n(230, 13, 0, 0.06, 0, 0, 1, 0), { beverage: true, nova: 4 }),
  food("9002490100070", "Red Bull", "Red Bull", "beverages", ["water", "sugar", "e330", "natural-flavour", "carbon-dioxide"], "Water, sucrose, glucose, citric acid, carbon dioxide, taurine, caffeine, niacin, flavours.", n(192, 11, 0, 0.1, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("070847811041", "Monster Energy", "Monster", "beverages", ["water", "sugar", "e330", "e202", "natural-flavour", "carbon-dioxide"], "Carbonated water, sucrose, glucose, citric acid, taurine, sodium citrate, colour, caffeine, ginseng, guarana, sucralose.", n(197, 11, 0, 0.16, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("048500001333", "Tropicana Pure Premium Orange", "Tropicana", "beverages", ["water"], "100% orange juice.", n(190, 9.2, 0, 0, 0.3, 0.7, 100, 0), { beverage: true, nova: 1 }),
  food("025000056610", "Simply Orange Pulp Free", "Simply", "beverages", ["water"], "Orange juice.", n(190, 9, 0, 0, 0.3, 0.7, 100, 0), { beverage: true, nova: 1 }),
  food("012000161059", "Starbucks Frappuccino Coffee", "Starbucks", "beverages", ["water", "milk", "sugar", "coffee", "natural-flavour"], "Starbucks coffee, reduced fat milk, sugar, maltodextrin, pectin, natural flavour.", n(320, 12, 1.2, 0.1, 0, 2.5, 0, 2), { beverage: true, nova: 4 }),
  food("076737311127", "Snapple Lemon Tea", "Snapple", "beverages", ["water", "sugar", "tea", "e330", "natural-flavour"], "Filtered water, sugar, citric acid, tea, natural flavours.", n(130, 7.5, 0, 0.02, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("786162003016", "smartwater", "smartwater", "beverages", ["water"], "Vapor distilled water, electrolytes for taste.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),
  food("075720001104", "Poland Spring Natural Spring Water", "Poland Spring", "beverages", ["water"], "Natural spring water.", n(0, 0, 0, 0, 0, 0, 0, 0), { beverage: true, water: true, nova: 1 }),

  food("038000047125", "Frosted Flakes", "Kellogg's", "breakfast", ["sugar", "wheat-flour", "salt", "e160a"], "Milled corn, sugar, malt flavor, salt, BHT.", n(1550, 35, 0.2, 1.1, 1.5, 5, 0, 0.5), { nova: 4 }),
  food("038000311011", "Froot Loops", "Kellogg's", "breakfast", ["sugar", "wheat-flour", "e102", "e110", "e129", "salt"], "Corn flour blend, sugar, wheat flour, whole grain oat, salt, natural flavour, red 40, yellow 6, blue 1.", n(1550, 36, 0.5, 0.9, 3, 5, 0, 3), { nova: 4 }),
  food("016000275245", "Cinnamon Toast Crunch", "General Mills", "breakfast", ["sugar", "wheat-flour", "cinnamon", "palm-oil", "salt"], "Whole grain wheat, sugar, rice flour, canola oil, cinnamon, salt, trisodium phosphate, caramel colour.", n(1700, 32, 0.5, 1.3, 6, 5, 0, 9), { nova: 4 }),
  food("016000275269", "Lucky Charms", "General Mills", "breakfast", ["sugar", "oats", "e102", "e129", "salt"], "Whole grain oats, marshmallows, sugar, corn syrup, modified corn starch, salt, colours.", n(1600, 32, 0.5, 1.1, 6, 6, 0, 4), { nova: 4 }),
  food("016000275276", "Honey Nut Cheerios", "General Mills", "breakfast", ["oats", "sugar", "honey", "salt", "natural-flavour"], "Whole grain oats, sugar, corn starch, honey, brown sugar syrup, salt, tripotassium phosphate, natural almond flavour.", n(1550, 33, 0.5, 1.2, 7, 7, 0, 5), { nova: 4 }),
  food("038000140505", "Special K Original", "Kellogg's", "breakfast", ["wheat-flour", "sugar", "salt"], "Rice, wheat gluten, sugar, defatted wheat germ, salt, malt flavor.", n(1550, 13, 0.2, 0.9, 2, 18, 0, 0.5), { nova: 4 }),
  food("030000315107", "Cap'n Crunch Original", "Quaker", "breakfast", ["sugar", "wheat-flour", "e102", "e110", "salt"], "Corn flour, sugar, oat flour, brown sugar, coconut oil, salt, yellow 5 and 6.", n(1650, 44, 4, 1.3, 2, 4, 0, 5), { nova: 4 }),
  food("038000845205", "Pop-Tarts Frosted Strawberry", "Kellogg's", "breakfast", ["wheat-flour", "sugar", "palm-oil", "e102", "e129", "salt"], "Enriched flour, corn syrup, high fructose corn syrup, dextrose, soybean and palm oil, strawberry, red 40, yellow 6.", n(1620, 38, 4, 0.9, 1, 4, 2, 9), { nova: 4 }),

  food("044000032119", "Oreo Original", "Oreo", "snacks", ["wheat-flour", "sugar", "palm-oil", "cocoa", "e500", "salt"], "Unbleached flour, sugar, palm oil, canola oil, cocoa, high fructose corn syrup, leavening, salt, soy lecithin, chocolate, vanillin.", n(2010, 38, 7, 0.9, 2, 4, 0, 21), { nova: 4 }),
  food("044000016416", "Ritz Crackers", "Ritz", "snacks", ["wheat-flour", "palm-oil", "sugar", "salt", "e500"], "Unbleached flour, soybean oil, sugar, partially hydrogenated cottonseed oil, salt, leavening, high fructose corn syrup.", n(2090, 8, 4, 1.8, 2, 6, 0, 26), { nova: 4 }),
  food("028400064057", "Doritos Nacho Cheese", "Doritos", "snacks", ["corn", "palm-oil", "salt", "e621", "e102", "e110", "e129"], "Corn, vegetable oil, maltodextrin, salt, cheddar, whey, MSG, yellow 6, yellow 5, red 40.", n(2260, 2.5, 3.5, 1.6, 3, 7, 0, 28), { nova: 4 }),
  food("028400090711", "Cheetos Crunchy", "Cheetos", "snacks", ["corn", "palm-oil", "salt", "e102", "e110", "e621"], "Enriched corn meal, vegetable oil, cheese seasoning, salt, yellow 6, MSG.", n(2260, 2, 3.5, 1.8, 2, 6, 0, 35), { nova: 4 }),
  food("028400090056", "Lay's Classic", "Lay's", "snacks", ["potato", "sunflower-oil", "salt"], "Potatoes, vegetable oil, salt.", n(2260, 0.5, 3, 1.3, 3, 7, 0, 35), { nova: 3 }),
  food("014100043016", "Goldfish Cheddar", "Goldfish", "snacks", ["wheat-flour", "cheddar", "salt", "e102", "e110"], "Wheat flour, cheddar cheese, canola oil, salt, yeast, paprika, spices, yellow 6, yellow 5.", n(1950, 0, 2.5, 1.7, 2, 10, 0, 16), { nova: 4 }),
  food("024100103016", "Cheez-It Original", "Cheez-It", "snacks", ["wheat-flour", "cheddar", "palm-oil", "salt", "e102"], "Enriched flour, vegetable oil, cheese, salt, paprika, yeast, yellow 6.", n(2090, 0, 4, 1.9, 2, 10, 0, 26), { nova: 4 }),
  food("040000173002", "Twix", "Mars", "snacks", ["sugar", "wheat-flour", "palm-oil", "cocoa", "milk", "e322"], "Milk chocolate, caramel, cookie, sugar, glucose syrup, palm oil, cocoa butter, skim milk, lactose, soy lecithin.", n(2090, 48, 18, 0.4, 1, 4, 0, 24), { nova: 4 }),
  food("040000173019", "Snickers", "Mars", "snacks", ["sugar", "peanut", "palm-oil", "cocoa", "milk", "e322"], "Milk chocolate, peanuts, corn syrup, sugar, palm oil, skim milk, lactose, salt, egg whites, soy lecithin.", n(2040, 47, 10, 0.5, 2, 8, 0, 24), { nova: 4 }),
  food("040000191013", "M&M's Milk Chocolate", "Mars", "snacks", ["sugar", "cocoa", "milk", "e102", "e110", "e129", "e322"], "Milk chocolate, sugar, cocoa butter, milk, lactose, soy lecithin, blue 1, yellow 5, yellow 6, red 40.", n(2010, 65, 12, 0.1, 2, 4, 0, 21), { nova: 4 }),
  food("022000006016", "Skittles Original", "Skittles", "snacks", ["sugar", "e330", "e102", "e110", "e129", "natural-flavour"], "Sugar, corn syrup, hydrogenated palm kernel oil, less than 2% citric acid, tapioca dextrin, natural flavours, colours.", n(1690, 75, 4, 0, 0, 0, 0, 4), { nova: 4 }),
  food("070662030016", "Cup Noodles Chicken", "Nissin", "staples", ["wheat-flour", "palm-oil", "salt", "e621", "e102"], "Enriched flour, vegetable oil, salt, dried vegetables, MSG, spices, yellow 5.", n(1900, 4, 8, 4.5, 2, 9, 2, 16), { nova: 4 }),

  food("036632014016", "Chobani Nonfat Plain", "Chobani", "dairy", ["milk"], "Cultured nonfat milk, live cultures.", n(250, 4, 0, 0.1, 0, 10, 0, 0), { nova: 1 }),
  food("036632027016", "Chobani Flip Cookie Dough", "Chobani", "dairy", ["milk", "sugar", "wheat-flour", "palm-oil"], "Low-fat yogurt, sugar, wheat flour, chocolate chips, palm oil, natural flavour.", n(540, 15, 2, 0.15, 0.5, 8, 0, 5), { nova: 4 }),
  food("070470003415", "Yoplait Original Strawberry", "Yoplait", "dairy", ["milk", "sugar", "e440", "natural-flavour"], "Cultured grade A low fat milk, sugar, strawberries, modified corn starch, kosher gelatin, colored with fruit juice, natural flavour.", n(380, 18, 0.5, 0.1, 0, 4, 4, 1), { nova: 4 }),
  food("036632003016", "Fage Total 0%", "Fage", "dairy", ["milk"], "Grade A pasteurized skimmed milk, live cultures.", n(230, 4, 0, 0.1, 0, 10, 0, 0), { nova: 1 }),
  food("898529000016", "Siggi's Plain 0%", "Siggi's", "dairy", ["milk"], "Pasteurized skim milk, live cultures.", n(250, 4, 0, 0.1, 0, 11, 0, 0), { nova: 1 }),
  food("021000010011", "Kraft Singles American", "Kraft", "dairy", ["cheddar", "milk", "salt", "e102", "e110"], "Milk, whey, milk protein concentrate, milkfat, sodium citrate, salt, calcium phosphate, whey protein concentrate, cheese culture, sorbic acid, lactic acid, annatto, paprika extract, enzymes, vitamin D3.", n(1260, 8, 10, 2.4, 0, 10, 0, 16), { nova: 4 }),
  food("021000655016", "Philadelphia Original Cream Cheese", "Philadelphia", "dairy", ["milk", "salt"], "Pasteurized milk and cream, salt, carob bean gum, cheese culture.", n(1450, 3, 18, 0.9, 0, 5, 0, 34), { nova: 3 }),

  food("070852000016", "Ben & Jerry's Chocolate Fudge Brownie", "Ben & Jerry's", "dairy", ["milk", "sugar", "cocoa", "egg", "wheat-flour"], "Cream, liquid sugar, skim milk, water, cocoa, wheat flour, egg, cocoa powder, soybean oil, egg yolks, guar gum.", n(1050, 24, 8, 0.2, 2, 4, 0, 14), { nova: 4 }),
  food("074570020016", "Häagen-Dazs Vanilla", "Häagen-Dazs", "dairy", ["milk", "sugar", "egg", "vanilla"], "Cream, skim milk, sugar, egg yolks, vanilla extract.", n(1050, 21, 12, 0.15, 0, 4, 0, 17), { nova: 3 }),
  food("852109000016", "Halo Top Vanilla Bean", "Halo Top", "dairy", ["milk", "e955", "e960", "e412"], "Skim milk, eggs, erythritol, prebiotic fiber, milk protein concentrate, cream, organic cane sugar, vegetable glycerin, vanilla, sea salt, organic carob gum, organic guar gum, organic stevia, monk fruit.", n(330, 6, 1, 0.2, 5, 6, 0, 2), { nova: 4 }),

  beauty("011111000016", "Dove Deep Moisture Body Wash", "Dove", "body", ["water", "sles", "fragrance", "glycerin", "linalool"], "Water, sodium laureth sulfate, glycerin, fragrance, stearic acid, lauric acid, sodium lauroyl isethionate, linalool."),
  beauty("080878000016", "Pantene Repair & Protect Shampoo", "Pantene", "hair", ["water", "sles", "fragrance", "linalool", "limonene"], "Water, sodium lauryl sulfate, sodium laureth sulfate, fragrance, citric acid, sodium citrate, sodium benzoate, linalool, limonene."),
  beauty("037000000016", "Head & Shoulders Classic Clean", "Head & Shoulders", "hair", ["water", "sles", "fragrance", "linalool"], "Water, sodium lauryl sulfate, sodium laureth sulfate, zinc pyrithione, fragrance, magnesium carbonate, linalool."),
  beauty("012044000016", "Old Spice Fiji Deodorant", "Old Spice", "body", ["fragrance", "linalool", "limonene"], "Aluminum zirconium tetrachlorohydrex gly, cyclopentasiloxane, stearyl alcohol, fragrance, dimethicone."),
  beauty("070501000016", "Neutrogena Oil-Free Acne Wash", "Neutrogena", "skincare", ["water", "salicylic", "fragrance", "sles"], "Water, sodium C14-16 olefin sulfonate, cocamidopropyl betaine, sodium chloride, salicylic acid, fragrance, menthol."),
  beauty("022700000016", "Olay Regenerist Micro-Sculpting Cream", "Olay", "skincare", ["water", "glycerin", "fragrance", "phenoxyethanol", "retinol"], "Water, glycerin, isohexadecane, niacinamide, isopropyl isostearate, nylon-12, dimethicone, panthenol, tocopheryl acetate, fragrance, phenoxyethanol."),
  beauty("333787000016", "CeraVe Moisturizing Cream", "CeraVe", "skincare", ["water", "glycerin", "cetearyl", "phenoxyethanol", "tocopherol"], "Water, glycerin, ceteareth-20, cetearyl alcohol, caprylic/capric triglyceride, cetyl alcohol, ceramide NP, hyaluronic acid, phenoxyethanol."),
  beauty("360600000016", "La Roche-Posay Toleriane Double Repair", "La Roche-Posay", "skincare", ["water", "glycerin", "niacinamide", "phenoxyethanol"], "Water, glycerin, dimethicone, niacinamide, ammonium polyacryloyldimethyl taurate, ceramide, panthenol, phenoxyethanol."),
];
