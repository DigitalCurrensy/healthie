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

function cos(
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

/** Alcohol, vitamins, household, seafood, ice cream, plus makeup/baby/international/store-brand depth. */
export const PREMIUM_PRODUCTS: ProductDef[] = [
  // —— Alcohol: best ——
  food("850016251004", "Athletic Brewing Run Wild IPA", "Athletic Brewing", "alcohol", ["water"], "Water, barley malt, hop extract, yeast.", n(80, 1.5, 0, 0.02, 0, 0.4, 0, 0), { beverage: true, nova: 3 }),
  food("850016251111", "Athletic Brewing Upside Dawn Golden", "Athletic Brewing", "alcohol", ["water"], "Water, barley malt, hop extract, yeast.", n(70, 1, 0, 0.02, 0, 0.3, 0, 0), { beverage: true, nova: 3 }),

  // —— Alcohol: middle ——
  food("728900001678", "Heineken Lager", "Heineken", "alcohol", ["water"], "Water, barley malt, hop extract, yeast.", n(176, 0, 0, 0.02, 0, 0.4, 0, 0), { beverage: true, nova: 3 }),
  food("080660956702", "Corona Extra", "Corona", "alcohol", ["water"], "Water, barley malt, hop extract, yeast.", n(176, 0, 0, 0.02, 0, 0.3, 0, 0), { beverage: true, nova: 3 }),
  food("083736160019", "Guinness Draught", "Guinness", "alcohol", ["water", "e150a"], "Water, barley malt, roasted barley, hop extract, yeast, nitrogen, carbon dioxide.", n(155, 0.5, 0, 0.03, 0, 0.5, 0, 0), { beverage: true, nova: 3 }),
  food("085000016204", "Barefoot Pinot Grigio", "Barefoot", "alcohol", ["e220"], "Pinot grigio grapes, sulphur dioxide.", n(320, 1.2, 0, 0.01, 0, 0.1, 100, 0), { beverage: true, nova: 3 }),

  // —— Alcohol: worst ——
  food("018200530130", "Bud Light", "Bud Light", "alcohol", ["water", "rice", "corn"], "Water, barley malt, rice, hops.", n(120, 0.3, 0, 0.02, 0, 0.3, 0, 0), { beverage: true, nova: 3 }),
  food("850007347011", "White Claw Black Cherry", "White Claw", "alcohol", ["water", "sugar", "natural-flavour", "e330", "e955", "carbon-dioxide"], "Carbonated water, alcohol from sugar, natural flavour, citric acid, sodium citrate, sucralose.", n(90, 2, 0, 0.04, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("850007347028", "White Claw Mango", "White Claw", "alcohol", ["water", "sugar", "natural-flavour", "e330", "e955", "carbon-dioxide"], "Carbonated water, alcohol from sugar, natural flavour, citric acid, sucralose.", n(90, 2, 0, 0.04, 0, 0, 0, 0), { beverage: true, nova: 4 }),
  food("087200501234", "Twisted Tea Original", "Twisted Tea", "alcohol", ["water", "sugar", "tea", "natural-flavour", "e330", "e202"], "Brewed black tea, cane sugar, alcohol, natural flavour, citric acid, sodium benzoate.", n(180, 8, 0, 0.03, 0, 0, 0, 0), { beverage: true, nova: 4 }),

  // —— Vitamins: best ——
  food("853566008168", "Ritual Essential for Women 18+", "Ritual", "vitamins", ["fish", "e551"], "Omega-3 DHA from algae, vitamin D3, folate, magnesium, vitamin K2, iron, vitamin E, vitamin B12, boron, delayed-release capsule.", n(80, 0, 0.2, 0, 0, 0, 0, 1), { nova: 4 }),
  food("031604026164", "Nature Made Vitamin D3 2000 IU", "Nature Made", "vitamins", ["e307", "e322"], "Vitamin D3, soybean oil, gelatin, glycerin, water.", n(20, 0, 0.1, 0, 0, 0.5, 0, 0.5), { nova: 4 }),
  food("031604005129", "Nature Made Extra Strength Fish Oil", "Nature Made", "vitamins", ["fish", "e307"], "Fish oil, gelatin, glycerin, water, tocopherols.", n(150, 0, 0.4, 0, 0, 0, 0, 4), { nova: 4 }),

  // —— Vitamins: middle ——
  food("300450256708", "Centrum Adults", "Centrum", "vitamins", ["e341", "e460", "e171", "e120"], "Dicalcium phosphate, microcrystalline cellulose, magnesium oxide, ascorbic acid, titanium dioxide, carmine, mixed vitamins and minerals.", n(20, 0, 0, 0.02, 0.2, 0, 0, 0), { nova: 4 }),
  food("300450256715", "Centrum Silver Adults 50+", "Centrum", "vitamins", ["e341", "e460", "e171", "e132"], "Calcium carbonate, microcrystalline cellulose, magnesium oxide, ascorbic acid, titanium dioxide, indigo carmine, mixed vitamins and minerals.", n(20, 0, 0, 0.02, 0.2, 0, 0, 0), { nova: 4 }),
  food("858494004168", "Olly Women's Multi Gummy", "Olly", "vitamins", ["sugar", "e440", "e330", "e102", "e129", "natural-flavour"], "Glucose syrup, sugar, water, gelatin, citric acid, pectin, natural flavour, yellow 5, red 40, mixed vitamins.", n(1420, 52, 0, 0.05, 1, 5, 0, 0), { nova: 4 }),
  food("858494002164", "Olly Sleep Melatonin Gummy", "Olly", "vitamins", ["sugar", "e440", "e330", "e133", "natural-flavour"], "Glucose syrup, sugar, water, gelatin, citric acid, pectin, natural flavour, blue 1, melatonin, L-theanine.", n(1420, 50, 0, 0.04, 1, 5, 0, 0), { nova: 4 }),
  food("031604026256", "Nature Made Multivitamin Gummies", "Nature Made", "vitamins", ["sugar", "e440", "e330", "e102", "e129"], "Glucose syrup, sugar, water, gelatin, citric acid, pectin, yellow 5, red 40, mixed vitamins.", n(1460, 55, 0, 0.05, 0, 4, 0, 0), { nova: 4 }),

  // —— Vitamins: worst ——
  food("016500557708", "Flintstones Complete Chewable", "Flintstones", "vitamins", ["sugar", "e102", "e110", "e129", "e133", "natural-flavour"], "Sugar, sodium ascorbate, ferrous fumarate, yellow 5, yellow 6, red 40, blue 1, artificial flavour, mixed vitamins.", n(1670, 72, 0, 0.08, 0, 0, 0, 0), { nova: 4 }),

  // —— Household: best ——
  cos("732913281160", "Seventh Generation Dish Liquid Free & Clear", "Seventh Generation", "household", ["water", "decyl-glucoside", "glycerin"], "Water, lauryl glucoside, sodium citrate, glycerin, sodium chloride, citric acid."),
  cos("732913121160", "Seventh Generation Laundry Detergent Free & Clear", "Seventh Generation", "household", ["water", "decyl-glucoside", "glycerin"], "Water, sodium lauryl sulfate from coconut, lauryl glucoside, sodium citrate, glycerin, protease, amylase."),

  // —— Household: middle ——
  cos("808124170168", "Mrs Meyer's Clean Day Basil Dish Soap", "Mrs Meyer's", "household", ["water", "sls", "fragrance", "limonene", "geraniol", "methylisothiazolinone"], "Water, sodium lauryl sulfate, lauryl glucoside, glycerin, fragrance, limonene, geraniol, methylisothiazolinone."),
  cos("808124171165", "Mrs Meyer's Multi-Surface Cleaner Lemon Verbena", "Mrs Meyer's", "household", ["water", "fragrance", "limonene", "methylisothiazolinone"], "Water, decyl glucoside, fragrance, limonene, sodium citrate, methylisothiazolinone."),
  cos("817939000168", "Method All-Purpose Pink Grapefruit", "Method", "household", ["water", "fragrance", "limonene", "ethylhexylglycerin"], "Water, decyl glucoside, sodium citrate, fragrance, limonene, ethylhexylglycerin, phenoxyethanol."),
  cos("037000140168", "Tide Free & Gentle", "Tide", "household", ["water", "sles", "tetrasodium-edta"], "Water, sodium laureth sulfate, propylene glycol, sodium citrate, borax, enzymes, tetrasodium EDTA. No dyes, no perfume."),

  // —— Household: worst ——
  cos("037000312160", "Tide Original HE Liquid", "Tide", "household", ["water", "sles", "fragrance", "tetrasodium-edta", "e1520"], "Water, sodium laureth sulfate, propylene glycol, borax, fragrance, dyes, tetrasodium EDTA, disodium distyrylbiphenyl disulfonate."),
  cos("044600003168", "Clorox Disinfecting Wipes Fresh Scent", "Clorox", "household", ["water", "benzalkonium-chloride", "fragrance", "e1520"], "Water, alkyl dimethyl benzyl ammonium chloride, fragrance, propylene glycol, alkyl dimethyl ethylbenzyl ammonium chloride."),
  cos("044600002161", "Clorox Regular Bleach", "Clorox", "household", ["water", "fragrance"], "Sodium hypochlorite, water, sodium chloride, sodium carbonate, sodium hydroxide, fragrance."),

  // —— Seafood: best ——
  food("829696000132", "Wild Planet Wild Skipjack Tuna No Salt", "Wild Planet", "seafood", ["fish"], "Skipjack tuna.", n(480, 0, 0.5, 0.15, 0, 26, 0, 1.5), { nova: 1 }),
  food("829696001016", "Wild Planet Wild Sardines in Extra Virgin Olive Oil", "Wild Planet", "seafood", ["fish", "olive-oil"], "Sardines, extra virgin olive oil.", n(870, 0, 3, 0.6, 0, 22, 0, 14), { nova: 1 }),
  food("859480006167", "Safe Catch Elite Wild Tuna", "Safe Catch", "seafood", ["fish"], "Wild tuna.", n(460, 0, 0.4, 0.2, 0, 25, 0, 1), { nova: 1 }),

  // —— Seafood: middle ——
  food("080000005164", "StarKist Chunk Light Tuna in Water", "StarKist", "seafood", ["fish", "salt", "e451"], "Light tuna, water, vegetable broth, salt, pyrophosphate.", n(360, 0, 0.2, 0.8, 0, 19, 0, 0.8), { nova: 3 }),
  food("086600000142", "Bumble Bee Solid White Albacore in Water", "Bumble Bee", "seafood", ["fish", "salt"], "White tuna, water, salt, pyrophosphate.", n(420, 0, 0.3, 0.7, 0, 23, 0, 1), { nova: 3 }),
  food("048000016168", "Chicken of the Sea Pink Salmon", "Chicken of the Sea", "seafood", ["fish", "salt"], "Pink salmon, salt.", n(560, 0, 1.2, 0.9, 0, 20, 0, 5), { nova: 1 }),

  // —— Seafood: worst ——
  food("080000006161", "StarKist Tuna Creations Sweet & Spicy", "StarKist", "seafood", ["fish", "sugar", "soy", "e621", "e330", "natural-flavour"], "Light tuna, water, sugar, soy sauce, chili, garlic, MSG, citric acid, natural flavour.", n(420, 6, 0.3, 1.4, 0, 16, 0, 1.5), { nova: 4 }),
  food("044400168168", "Gorton's Crunchy Fish Sticks", "Gorton's", "seafood", ["fish", "wheat-flour", "palm-oil", "salt", "e102", "e621"], "Minced Alaska pollock, enriched wheat flour, vegetable oil, salt, yellow 5, flavour, MSG.", n(1050, 2, 2, 1.2, 1, 10, 0, 12), { nova: 4 }),
  food("074331000168", "Trans-Ocean Imitation Crab", "Trans-Ocean", "seafood", ["fish", "sugar", "wheat-flour", "e621", "e120", "e415"], "Alaska pollock, water, sugar, wheat starch, salt, MSG, carmine, xanthan gum.", n(400, 6, 0, 1.5, 0, 8, 0, 0.5), { nova: 4 }),

  // —— Ice cream: best ——
  food("074570011506", "Häagen-Dazs Vanilla Ice Cream", "Häagen-Dazs", "icecream", ["milk", "sugar", "egg", "vanilla"], "Cream, skim milk, sugar, egg yolks, vanilla extract.", n(1040, 21, 11, 0.12, 0, 4, 0, 16), { nova: 3 }),
  food("074570030505", "Häagen-Dazs Belgian Chocolate", "Häagen-Dazs", "icecream", ["milk", "sugar", "cocoa", "egg"], "Cream, skim milk, sugar, cocoa, egg yolks.", n(1130, 22, 12, 0.14, 2, 4, 0, 18), { nova: 3 }),
  food("186852000364", "Talenti Alphonso Mango Sorbetto", "Talenti", "icecream", ["sugar", "e330"], "Mango, water, sugar, lemon juice.", n(540, 28, 0, 0.02, 1, 0.4, 70, 0), { nova: 3 }),

  // —— Ice cream: middle ——
  food("076840100056", "Ben & Jerry's Cherry Garcia", "Ben & Jerry's", "icecream", ["milk", "sugar", "cocoa", "e410", "e412", "e471"], "Cream, skim milk, sugar, cherries, chocolate chunks, egg yolks, guar gum, locust bean gum, carrageenan.", n(1090, 24, 9, 0.12, 1, 3.5, 8, 14), { nova: 4 }),
  food("076840100162", "Ben & Jerry's Half Baked", "Ben & Jerry's", "icecream", ["milk", "sugar", "wheat-flour", "cocoa", "e410", "e412", "e471"], "Cream, skim milk, sugar, wheat flour, cocoa, egg, chocolate chip cookie dough, brownie, guar gum, locust bean gum.", n(1170, 25, 9, 0.18, 1, 4, 0, 15), { nova: 4 }),
  food("858089003123", "Halo Top Chocolate", "Halo Top", "icecream", ["milk", "e968", "e955", "e960", "e412", "e410", "e1200"], "Skim milk, eggs, erythritol, prebiotic fiber, milk protein concentrate, cocoa, cream, organic cane sugar, vegetable glycerin, sea salt, organic locust bean gum, organic guar gum, organic stevia, sucralose.", n(330, 6, 1, 0.25, 5, 6, 0, 2), { nova: 4 }),
  food("077567001168", "Breyers Natural Vanilla", "Breyers", "icecream", ["milk", "sugar", "e410"], "Milk, cream, sugar, vegetable gum (tara), natural flavour.", n(840, 18, 6, 0.12, 0, 3, 0, 10), { nova: 3 }),

  // —— Ice cream: worst ——
  food("078742358168", "Great Value Neapolitan Ice Cream", "Great Value", "icecream", ["milk", "sugar", "e471", "e412", "e102", "e129", "e407"], "Milk, cream, sugar, corn syrup, whey, cocoa, mono and diglycerides, guar gum, yellow 5, red 40, carrageenan.", n(880, 20, 7, 0.16, 0, 3, 0, 12), { nova: 4 }),
  food("055653168168", "Magnum Double Chocolate Bar", "Magnum", "icecream", ["milk", "sugar", "cocoa", "palm-oil", "e471", "e322", "e407"], "Ice cream (skim milk, sugar, cream, cocoa, mono and diglycerides, locust bean gum, guar gum), milk chocolate (sugar, cocoa butter, chocolate, palm oil, soy lecithin).", n(1420, 26, 14, 0.18, 2, 4, 0, 22), { nova: 4 }),
  food("075856001168", "Klondike Original", "Klondike", "icecream", ["milk", "sugar", "palm-oil", "cocoa", "e471", "e412", "e102"], "Ice cream (nonfat milk, sugar, corn syrup, cream, whey, mono and diglycerides, guar gum), milk chocolate flavoured coating (sugar, coconut oil, chocolate, soy lecithin, yellow 5).", n(1260, 22, 12, 0.2, 1, 3, 0, 18), { nova: 4 }),

  // —— Makeup: best ——
  cos("850009123168", "Ilia Limitless Lash Mascara", "Ilia", "makeup", ["water", "glycerin", "shea", "panthenol", "jojoba"], "Water, beeswax, glycerin, shea butter, panthenol, jojoba, iron oxides. No fragrance."),
  cos("817963000168", "Glossier Cloud Paint Dusk", "Glossier", "makeup", ["water", "glycerin", "dimethicone", "ci-77499", "ethylhexylglycerin"], "Water, dimethicone, glycerin, iron oxides, phenoxyethanol, ethylhexylglycerin. No added fragrance."),
  cos("817963000175", "Glossier Boy Brow", "Glossier", "makeup", ["shea", "e901", "ci-77499"], "Ricinus communis seed oil, beeswax, shea, silica, iron oxides."),

  // —— Makeup: middle ——
  cos("041554504168", "Maybelline Fit Me Matte + Poreless", "Maybelline", "makeup", ["water", "dimethicone", "glycerin", "e171", "phenoxyethanol", "ci-77891"], "Water, dimethicone, isododecane, glycerin, titanium dioxide, iron oxides, phenoxyethanol, silica."),
  cos("022700168168", "CoverGirl Clean Fresh Skin Milk Foundation", "CoverGirl", "makeup", ["water", "glycerin", "dimethicone", "phenoxyethanol", "ci-77891"], "Water, glycerin, dimethicone, titanium dioxide, iron oxides, phenoxyethanol, caprylyl glycol."),

  // —— Makeup: worst ——
  cos("022700169165", "CoverGirl Lash Blast Volume", "CoverGirl", "makeup", ["water", "fragrance", "diazolidinyl-urea", "methylparaben", "propylparaben", "triethanolamine"], "Water, paraffin, acacia, fragrance, diazolidinyl urea, methylparaben, propylparaben, triethanolamine, iron oxides."),
  cos("041554505165", "Maybelline SuperStay Matte Ink", "Maybelline", "makeup", ["dimethicone", "fragrance", "phenoxyethanol", "triethanolamine", "ci-77499", "bht-cosmetic"], "Isododecane, dimethicone, nylon-12, fragrance, phenoxyethanol, triethanolamine, BHT, iron oxides."),

  // —— Baby wipes & cream: best ——
  cos("070844031168", "Aquaphor Baby Healing Ointment", "Aquaphor", "baby", ["petrolatum", "mineral-oil", "panthenol", "glycerin", "bisabolol"], "Petrolatum, mineral oil, ceresin, lanolin alcohol, panthenol, glycerin, bisabolol."),
  cos("817732000168", "The Honest Company Diaper Rash Cream", "Honest", "baby", ["zinc-oxide", "shea", "jojoba", "tocopherol"], "Zinc oxide, shea butter, jojoba, beeswax, tocopherol. No fragrance.", { organic: true }),
  cos("817732001165", "The Honest Company Plant-Based Wipes", "Honest", "baby", ["water", "aloe", "glycerin", "caprylyl-glycol"], "Water, aloe leaf juice, glycerin, chamomile, caprylyl glycol, ethylhexylglycerin.", { organic: true }),

  // —— Baby: middle ——
  cos("037000812168", "Pampers Sensitive Baby Wipes", "Pampers", "baby", ["water", "glycerin", "phenoxyethanol", "ethylhexylglycerin"], "Water, glycerin, phenoxyethanol, ethylhexylglycerin, sodium citrate, citric acid."),
  cos("300670123168", "Desitin Maximum Strength", "Desitin", "baby", ["zinc-oxide", "petrolatum", "mineral-oil"], "Zinc oxide 40%, petrolatum, mineral oil, wax, lanolin."),
  cos("036000168168", "Huggies Natural Care Wipes", "Huggies", "baby", ["water", "aloe", "glycerin", "phenoxyethanol"], "Water, aloe, glycerin, phenoxyethanol, sodium benzoate, malic acid."),

  // —— Baby: worst ——
  cos("081466000168", "Johnson's Baby Lotion", "Johnson's", "baby", ["water", "mineral-oil", "fragrance", "methylparaben", "propylparaben", "linalool"], "Water, mineral oil, isopropyl palmitate, fragrance, methylparaben, propylparaben, linalool, geraniol, dimethicone."),

  // —— International: best ——
  food("041331041162", "Goya Coconut Water", "Goya", "beverages", ["water"], "Coconut water.", n(80, 4, 0, 0.1, 0, 0, 100, 0), { beverage: true, nova: 1 }),
  food("041331051169", "Goya Extra Virgin Olive Oil", "Goya", "spreads", ["olive-oil"], "Extra virgin olive oil.", n(3380, 0, 14, 0, 0, 0, 0, 91), { nova: 1 }),

  // —— International: middle ——
  food("633752000168", "Tajín Clásico Seasoning", "Tajín", "condiments", ["salt", "spice", "e330"], "Chili peppers, sea salt, dehydrated lime, silicon dioxide.", n(420, 4, 0, 18, 8, 4, 0, 2), { nova: 3 }),
  food("078895123168", "Lee Kum Kee Premium Soy Sauce", "Lee Kum Kee", "condiments", ["water", "soy", "wheat-flour", "salt", "sugar"], "Water, soybeans, salt, wheat, sugar.", n(250, 4, 0, 14, 0, 4, 0, 0), { nova: 3 }),
  food("078895125162", "Lee Kum Kee Chili Garlic Sauce", "Lee Kum Kee", "condiments", ["salt", "sugar", "e260", "spice"], "Chili, salted chili, garlic, sugar, salt, acetic acid, soybean oil.", n(420, 8, 0.5, 5, 2, 2, 20, 4), { nova: 3 }),
  food("078895124165", "Lee Kum Kee Panda Oyster Sauce", "Lee Kum Kee", "condiments", ["sugar", "salt", "soy", "e621", "e415"], "Water, sugar, salt, oyster extract, soy sauce, modified corn starch, MSG, xanthan gum, caramel colour.", n(500, 20, 0, 9, 0, 2, 0, 0), { nova: 4 }),
  food("041331021168", "Goya Adobo All Purpose Seasoning", "Goya", "condiments", ["salt", "spice", "e621", "e551"], "Salt, garlic, tricalcium phosphate, oregano, black pepper, turmeric, MSG.", n(0, 0, 0, 70, 0, 0, 0, 0), { nova: 4 }),
  food("041331031165", "Goya Sazón Coriander & Annatto", "Goya", "condiments", ["salt", "e160b", "e621", "e102", "e129", "spice"], "Monosodium glutamate, salt, dehydrated garlic, cumin, yellow 5, red 40, coriander, annatto, tricalcium phosphate.", n(0, 0, 0, 55, 0, 0, 0, 0), { nova: 4 }),

  // —— International: worst ——
  food("028000123168", "Maggi Seasoning Sauce", "Maggi", "condiments", ["water", "salt", "wheat-flour", "e621", "e635", "e150d"], "Water, salt, wheat gluten, sugar, acetic acid, MSG, disodium inosinate and guanylate, caramel colour.", n(170, 2, 0, 22, 0, 4, 0, 0), { nova: 4 }),
  food("028000124165", "Maggi Chicken Flavor Bouillon Cubes", "Maggi", "condiments", ["salt", "sugar", "e621", "e635", "e150d", "palm-oil", "chicken"], "Salt, palmolein, flavour enhancers (MSG, disodium inosinate, disodium guanylate), sugar, corn starch, chicken fat, caramel colour, turmeric.", n(1260, 8, 12, 40, 0, 4, 0, 24), { nova: 4 }),

  // —— Aldi Simply Nature / Fusia ——
  food("409910001168", "Simply Nature Organic Creamy Peanut Butter", "Simply Nature", "spreads", ["peanut"], "Organic peanuts.", n(2500, 4, 7, 0, 8, 25, 0, 50), { organic: true, nova: 1 }),
  food("409910002165", "Simply Nature Organic Tomato Basil Pasta Sauce", "Simply Nature", "staples", ["tomato", "olive-oil", "salt", "spice"], "Organic tomatoes, organic extra virgin olive oil, organic basil, sea salt, organic garlic.", n(210, 5, 0.3, 0.7, 2, 1.5, 80, 2), { organic: true, nova: 3 }),
  food("409910003162", "Simply Nature Organic Plain Greek Yogurt", "Simply Nature", "dairy", ["milk", "yogurt-cultures"], "Organic cultured pasteurized milk.", n(310, 4, 2.5, 0.1, 0, 9, 0, 4), { organic: true, nova: 3 }),
  food("409910006163", "Simply Nature Organic Unsweetened Applesauce", "Simply Nature", "snacks", [], "Organic apples.", n(180, 9, 0, 0, 1.5, 0.2, 100, 0), { organic: true, nova: 1 }),
  food("409910004169", "Fusia Soy Sauce", "Fusia", "condiments", ["water", "soy", "wheat-flour", "salt", "sugar"], "Water, soybeans, wheat, salt, sugar.", n(250, 3, 0, 14, 0, 4, 0, 0), { nova: 3 }),
  food("409910005166", "Fusia Teriyaki Stir-Fry Sauce", "Fusia", "condiments", ["soy", "sugar", "salt", "e621", "e150d", "e415"], "Water, sugar, soy sauce, salt, modified corn starch, MSG, caramel colour, xanthan gum, garlic powder.", n(540, 22, 0, 4, 0, 2, 0, 0), { nova: 4 }),

  // —— Lidl Preferred Selection ——
  food("405648001168", "Preferred Selection Extra Virgin Olive Oil", "Lidl Preferred Selection", "spreads", ["olive-oil"], "Extra virgin olive oil.", n(3380, 0, 14, 0, 0, 0, 0, 91), { nova: 1 }),
  food("405648002165", "Preferred Selection Balsamic Vinegar of Modena", "Lidl Preferred Selection", "condiments", ["e150d"], "Wine vinegar, cooked grape must, caramel colour.", n(370, 20, 0, 0.04, 0, 0.4, 80, 0), { nova: 3 }),
  food("405648003162", "Preferred Selection Belgian Dark Chocolate 72%", "Lidl Preferred Selection", "chocolate", ["cocoa", "sugar", "e322", "e901"], "Cocoa mass, sugar, cocoa butter, soy lecithin, vanilla, beeswax.", n(2300, 24, 18, 0.02, 8, 8, 0, 42), { nova: 3 }),
  food("405648004169", "Preferred Selection Bronze Die Pasta", "Lidl Preferred Selection", "staples", ["wheat-flour"], "Durum wheat semolina.", n(1480, 3, 0.3, 0, 3, 12, 0, 1.5), { nova: 1 }),
  food("405648005166", "Preferred Selection Raspberry Fruit Spread", "Lidl Preferred Selection", "spreads", ["sugar", "e440", "e330"], "Raspberries, sugar, pectin, citric acid.", n(840, 48, 0, 0.02, 3, 0.5, 50, 0), { nova: 3 }),
  food("405648006163", "Preferred Selection Sparkling Lemonade", "Lidl Preferred Selection", "beverages", ["water", "sugar", "e330", "natural-flavour", "carbon-dioxide"], "Carbonated water, sugar, lemon juice from concentrate, citric acid, natural flavour.", n(170, 10, 0, 0.02, 0, 0, 4, 0), { beverage: true, nova: 4 }),

  // —— Trader Joe's depth ——
  food("009911524168", "Trader Joe's Everything but the Bagel Seasoning", "Trader Joe's", "condiments", ["sesame", "salt", "spice"], "Sesame seeds, sea salt, dehydrated garlic, dehydrated onion, poppy seeds, black sesame seeds.", n(1680, 2, 4, 18, 8, 12, 0, 28), { nova: 3 }),
  food("009911525165", "Trader Joe's Dark Chocolate 72% Pound Plus", "Trader Joe's", "chocolate", ["cocoa", "sugar", "e322"], "Cocoa mass, sugar, cocoa butter, soy lecithin, vanilla extract.", n(2260, 24, 18, 0.02, 8, 8, 0, 40), { nova: 3 }),
  food("009911526162", "Trader Joe's Organic Hummus", "Trader Joe's", "snacks", ["sesame", "olive-oil", "salt", "e330"], "Organic chickpeas, water, organic tahini, organic extra virgin olive oil, sea salt, organic lemon juice, organic garlic, citric acid.", n(840, 1, 1.5, 0.7, 4, 6, 8, 12), { organic: true, nova: 3 }),
  food("009911527169", "Trader Joe's Cauliflower Gnocchi", "Trader Joe's", "frozen", ["potato", "salt"], "Cauliflower, cassava flour, potato starch, extra virgin olive oil, sea salt.", n(540, 2, 0.3, 0.6, 4, 2, 40, 2), { nova: 3 }),
  food("009911528166", "Trader Joe's Speculoos Cookie Butter", "Trader Joe's", "spreads", ["sugar", "wheat-flour", "palm-oil", "e322", "e500"], "Speculoos cookies (wheat flour, sugar, palm oil, candy sugar syrup, soy flour, salt, cinnamon), soybean oil, sugar, soy lecithin, sodium bicarbonate.", n(2420, 35, 8, 0.6, 1, 3, 0, 38), { nova: 4 }),
  food("009911529163", "Trader Joe's Frozen Wild Blueberries", "Trader Joe's", "frozen", [], "Wild blueberries.", n(240, 7, 0, 0, 4, 0.7, 100, 0), { nova: 1 }),
  food("009911530169", "Trader Joe's Organic Fair Trade French Roast", "Trader Joe's", "coffee", ["coffee"], "Organic coffee.", n(8, 0, 0, 0, 0, 0.3, 0, 0), { beverage: true, organic: true, nova: 1 }),
];
