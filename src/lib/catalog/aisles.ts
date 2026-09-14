import type { ProductType } from "@/lib/scoring/types";

export type Aisle = {
  slug: string;
  path: string;
  title: string;
  kicker: string;
  blurb: string;
  howToShop: string;
  image: string;
  kind: ProductType;
};

export const AISLES: Aisle[] = [
  {
    slug: "drinks",
    path: "beverages",
    title: "Drinks",
    kicker: "What you pour",
    blurb: "Water first. Then tea. Sweet sodas and energy drinks are a treat, not a habit.",
    howToShop: "Flip the pack. If sugar is in the first three ingredients, put it back unless you meant to.",
    image: "/images/beverages.jpg",
    kind: "food",
  },
  {
    slug: "breakfast",
    path: "breakfast",
    title: "Breakfast",
    kicker: "How the day starts",
    blurb: "Oats and plain yogurt beat chocolate cereal every morning of the week.",
    howToShop: "A good breakfast lists grain, fruit, or milk — not a rainbow of additives.",
    image: "/images/breakfast.jpg",
    kind: "food",
  },
  {
    slug: "dairy",
    path: "dairy",
    title: "Dairy",
    kicker: "From the fridge",
    blurb: "Plain cultured dairy is a quiet protein. Fruit-on-the-bottom often means sugar on the top.",
    howToShop: "Short list wins: milk, cultures, maybe salt. Skip the thickeners if you can.",
    image: "/images/dairy.jpg",
    kind: "food",
  },
  {
    slug: "bakery",
    path: "bakery",
    title: "Bakery",
    kicker: "The loaf",
    blurb: "Whole grain, short list. Soft white bread is a dessert that learned to sit next to dinner.",
    howToShop: "Grain should be first. Sugar and dough conditioners should not.",
    image: "/images/bakery.jpg",
    kind: "food",
  },
  {
    slug: "coffee",
    path: "coffee",
    title: "Coffee & tea",
    kicker: "The hot pour",
    blurb: "Beans and leaves are a keep. Bottled lattes and sweet teas are a can of soda in a paper cup.",
    howToShop: "If sugar is in the first three, it isn’t coffee. It’s dessert.",
    image: "/images/coffee.jpg",
    kind: "food",
  },
  {
    slug: "spreads",
    path: "spreads",
    title: "Spreads & oils",
    kicker: "On toast, in the pan",
    blurb: "Nuts and olives need almost nothing. Chocolate-hazelnut jars are dessert wearing a breakfast costume.",
    howToShop: "One ingredient is the gold standard. Palm oil and sugar are the giveaway.",
    image: "/images/spreads.jpg",
    kind: "food",
  },
  {
    slug: "snacks",
    path: "snacks",
    title: "Snacks",
    kicker: "Between meals",
    blurb: "Nuts, fruit, dark chocolate. The brightly packaged aisle is mostly sugar, salt, and dye.",
    howToShop: "If a child would call it candy, it isn’t a snack. It’s a treat.",
    image: "/images/snacks.jpg",
    kind: "food",
  },
  {
    slug: "chocolate",
    path: "chocolate",
    title: "Chocolate",
    kicker: "A square, not a bar",
    blurb: "Higher cocoa, shorter list. Sugar-first bars belong with dessert.",
    howToShop: "Look for cocoa first, sugar second. Lecithin is fine. A dozen extras are not.",
    image: "/images/chocolate.jpg",
    kind: "food",
  },
  {
    slug: "candy",
    path: "candy",
    title: "Candy",
    kicker: "The sweet wall",
    blurb: "Dye, sugar, and a flavour lab. A dark chocolate with a short list is the only keep in this postcode.",
    howToShop: "If the colour is neon, the score is not. Cocoa and sugar is a treat. The rainbow is a factory.",
    image: "/images/candy.jpg",
    kind: "food",
  },
  {
    slug: "frozen",
    path: "frozen",
    title: "Frozen",
    kicker: "The freezer door",
    blurb: "Peas and berries are honest. A pizza with a paragraph of extras is a factory, not a shortcut.",
    howToShop: "If you could cook it from the same list at home, keep it. If you need a chemist, put it back.",
    image: "/images/frozen.jpg",
    kind: "food",
  },
  {
    slug: "protein",
    path: "protein",
    title: "Protein",
    kicker: "Bars and shakes",
    blurb: "Named food first. A bar that needs three sweeteners and a flavour lab is a candy bar in gym clothes.",
    howToShop: "Protein is not a free pass. Read sugar, sweeteners, and the length of the list.",
    image: "/images/protein.jpg",
    kind: "food",
  },
  {
    slug: "pantry",
    path: "staples",
    title: "Pantry",
    kicker: "What you cook with",
    blurb: "Pasta, tomatoes, and real meat beat reconstituted slices with a long chemical coda.",
    howToShop: "Cooking from short-list staples is the easiest way to eat well without thinking about it.",
    image: "/images/staples.jpg",
    kind: "food",
  },
  {
    slug: "condiments",
    path: "condiments",
    title: "Condiments",
    kicker: "A spoonful",
    blurb: "Tomato and vinegar are honest. Sugar-heavy ketchup is a dessert that lives next to the fries.",
    howToShop: "A tablespoon shouldn’t deliver a dessert’s worth of sugar.",
    image: "/images/condiments.jpg",
    kind: "food",
  },
  {
    slug: "meat",
    path: "meat",
    title: "Meat & deli",
    kicker: "The counter",
    blurb: "Named meat, salt, maybe smoke. Nitrite pink is a factory, not a butcher.",
    howToShop: "If it is fluorescent pink and lasts three weeks, read the extras. Applegate-style short lists sit next to Oscar Mayer for a reason.",
    image: "/images/meat.jpg",
    kind: "food",
  },
  {
    slug: "baby",
    path: "baby",
    title: "Baby",
    kicker: "The first spoon",
    blurb: "One fruit, one vegetable, maybe meat. Pouches with juice concentrate and ‘natural flavour’ are baby dessert.",
    howToShop: "The shortest list wins. If you wouldn’t eat it, don’t spoon it.",
    image: "/images/baby.jpg",
    kind: "food",
  },
  {
    slug: "skincare",
    path: "skincare",
    title: "Skincare",
    kicker: "Face and body cream",
    blurb: "Skin does not need a perfume, a dye, and a preservative cocktail to stay soft.",
    howToShop: "If the scent is the selling point, the formula is working for the nose, not the skin.",
    image: "/images/skincare.jpg",
    kind: "cosmetic",
  },
  {
    slug: "makeup",
    path: "makeup",
    title: "Makeup",
    kicker: "What stays on the face",
    blurb: "Colour is the job. Fragrance, formaldehyde-releasers, and cheap preservatives are not.",
    image: "/images/makeup.jpg",
    howToShop: "Leave-on colour with a perfume is a all-day extra. Mineral tints and short INCI lists are the keep.",
    kind: "cosmetic",
  },
  {
    slug: "hair",
    path: "hair",
    title: "Hair",
    kicker: "Wash and leave-in",
    blurb: "Gentle cleansers beat the ‘silk shine’ bottles that strip, then perfume, then dye.",
    howToShop: "Sulphates and formaldehyde-releasers are optional. Your scalp will notice.",
    image: "/images/hair.jpg",
    kind: "cosmetic",
  },
  {
    slug: "sun",
    path: "sun",
    title: "Sun",
    kicker: "What you put on in daylight",
    blurb: "Mineral filters sit on the skin. Some chemical filters soak in — and a few we’d skip.",
    howToShop: "Zinc or titanium first. Fragrance and oxybenzone last, if at all.",
    image: "/images/sun.jpg",
    kind: "cosmetic",
  },
  {
    slug: "body",
    path: "body",
    title: "Bath & body",
    kicker: "Wash, brush, deodorant",
    blurb: "Soap, mineral paste, a salt stone. The citrus cloud in a plastic bottle is mostly perfume.",
    howToShop: "If it smells like a candle, it probably wears like one — on your skin, all day.",
    image: "/images/body.jpg",
    kind: "cosmetic",
  },
  {
    slug: "oral",
    path: "oral",
    title: "Oral care",
    kicker: "The sink",
    blurb: "Fluoride or hydroxyapatite to do the job. A candy flavour and SLS foam is optional, and usually a miss.",
    howToShop: "If it looks like dessert, it scores like dessert. Simple mineral paste is the keep.",
    image: "/images/oral.jpg",
    kind: "cosmetic",
  },
  {
    slug: "pet",
    path: "pet",
    title: "Pet",
    kicker: "The bowl",
    blurb: "Named meat, a grain you recognise, nothing dyed the colour of a tennis ball.",
    howToShop: "If the first ingredient is a by-product meal and the colour is neon, keep walking.",
    image: "/images/pet.jpg",
    kind: "pet",
  },
  {
    slug: "alcohol",
    path: "alcohol",
    title: "Alcohol",
    kicker: "The bottle aisle",
    blurb: "Beer, wine, and the cans that pretend to be both. A short list is still a drink. A sweet seltzer is a soda with a buzz.",
    howToShop: "If sugar or flavouring sits in the first three, it isn’t a simple pour. It’s a mixer.",
    image: "/images/alcohol.jpg",
    kind: "food",
  },
  {
    slug: "vitamins",
    path: "vitamins",
    title: "Vitamins",
    kicker: "The supplement wall",
    blurb: "A plain D3 capsule is a keep. A gummy that looks like candy is candy, with a vitamin stuck on.",
    howToShop: "Skip the dyes and the sugar shell. If a child would pick it from the sweet aisle, it isn’t a vitamin. It’s a treat.",
    image: "/images/vitamins.jpg",
    kind: "food",
  },
  {
    slug: "household",
    path: "household",
    title: "Household",
    kicker: "Under the sink",
    blurb: "Soap that cleans without a perfume cloud. Bleach and a fragrance lab do a job, then linger on your hands and in the air.",
    howToShop: "Free and clear first. If the scent is the selling point, the formula is working for the nose, not the sink.",
    image: "/images/household.jpg",
    kind: "cosmetic",
  },
  {
    slug: "seafood",
    path: "seafood",
    title: "Seafood",
    kicker: "From the tin",
    blurb: "Fish, water, maybe salt and oil. A fish stick with a batter paragraph is a factory, not a catch.",
    howToShop: "Named fish first. Broth, flavour, and a rainbow of extras belong back on the shelf.",
    image: "/images/seafood.jpg",
    kind: "food",
  },
  {
    slug: "ice-cream",
    path: "icecream",
    title: "Ice cream",
    kicker: "The freezer sweet",
    blurb: "Cream, milk, sugar, maybe egg. A pint with ten gums and three sweeteners is a lab dessert wearing a scoop.",
    howToShop: "Four ingredients is ice cream. A paragraph of gums is a frozen confection.",
    image: "/images/icecream.jpg",
    kind: "food",
  },
];

export const AISLE_BY_PATH = new Map(AISLES.map((a) => [a.path, a]));
export const AISLE_BY_SLUG = new Map(AISLES.map((a) => [a.slug, a]));

const TYPE_WORDS = new Set(["food", "cosmetic", "pet", "all"]);

export function aisleFor(categoryPath: string): Aisle | undefined {
  const key = (categoryPath || "").trim().toLowerCase();
  if (!key || TYPE_WORDS.has(key)) return undefined;
  const direct = AISLE_BY_PATH.get(key) ?? AISLE_BY_SLUG.get(key);
  if (direct) return direct;
  if (key.length < 4) return undefined;
  return AISLES.find((a) => key === a.path || key === a.slug);
}

export function aisleImage(categoryPath: string, fallback?: string | null): string {
  if (fallback && fallback.startsWith("/images/")) return fallback;
  return aisleFor(categoryPath)?.image || fallback || "/images/hero.jpg";
}

export function aislePathFromTags(
  tags: string[] | undefined,
  title: string,
  type: "food" | "cosmetic" | "pet",
): string {
  const blob = `${(tags ?? []).join(" ")} ${title}`.toLowerCase();

  if (type === "pet" || /\bpet-food|\bcat-food|\bdog-food|\bkibble|\bwet-cat|\bwet-dog/.test(blob)) {
    return "pet";
  }

  if (
    type === "cosmetic" ||
    /en:make-up|en:skin-care|en:shampoos|en:toothpastes|en:sunscreens|en:body-washings|en:dishwashing|en:laundry/.test(
      blob,
    )
  ) {
    if (/tooth|paste|mouthwash|oral|en:toothpastes/.test(blob)) return "oral";
    if (/mascara|foundation|lipstick|makeup|make-up|blush|concealer|eyeliner/.test(blob)) return "makeup";
    if (/sun|spf|sunscreen|en:sunscreens/.test(blob)) return "sun";
    if (/shampoo|conditioner|hair|en:shampoos/.test(blob)) return "hair";
    if (/laundry|detergent|dish|household|clean|bleach|en:dishwashing/.test(blob)) return "household";
    if (/soap|wash|shower|body|deodorant|en:body/.test(blob)) return "body";
    return "skincare";
  }

  if (/en:ice-creams|ice cream|gelato|frozen dessert/.test(blob)) return "icecream";
  if (/en:beers|en:wines|en:ciders|en:alcoholic-beverages|hard seltzer|en:spirits/.test(blob)) return "alcohol";
  if (/en:dietary-supplements|multivitamin|\bvitamin\b|omega-3|en:vitamins/.test(blob)) return "vitamins";
  if (/en:baby-foods|infant formula|baby food|en:infant/.test(blob)) return "baby";
  if (/en:coffees|en:teas|\bcoffee\b|k-cup/.test(blob) && !/ice cream/.test(blob)) return "coffee";
  if (/en:candies|en:gummi|gummy candy|\bcandy\b|lollipop/.test(blob)) return "candy";
  if (/en:chocolates|chocolate bar|\bcocoa\b/.test(blob) && !/cereal|drink|milk/.test(blob)) return "chocolate";
  if (/en:breakfast-cereals|granola|muesli|oatmeal|en:oat-flakes/.test(blob)) return "breakfast";
  if (
    /en:yogurts|en:cheeses|en:milks|yogurt|yoghurt|\bcheese\b|cottage cheese/.test(blob) &&
    !/cereal|chocolate bar/.test(blob)
  ) {
    return "dairy";
  }
  if (/en:breads|en:baguettes|sliced bread|\bbakery\b/.test(blob)) return "bakery";
  if (/en:protein-bars|protein powder|\bwhey\b/.test(blob)) return "protein";
  if (/en:salty-snacks|en:chips|potato chip|corn chip|pretzel|cracker/.test(blob)) return "snacks";
  if (/en:frozen-foods|frozen pizza|frozen meal/.test(blob)) return "frozen";
  if (/en:meats|en:hams|en:sausages|\bbacon\b|\bdeli\b|hot dog/.test(blob)) return "meat";
  if (/en:canned-fishes|en:fishes|\btuna\b|\bsalmon\b|sardine/.test(blob)) return "seafood";
  if (/en:spreads|nutella|peanut butter|en:nut-butters|olive oil|en:oils/.test(blob)) return "spreads";
  if (/en:sauces|ketchup|mustard|mayo|en:condiments/.test(blob)) return "condiments";
  if (/en:pastas|en:rices|en:canned-vegetables|en:flours/.test(blob)) return "staples";
  if (
    /en:sodas|en:energy-drinks|en:waters|en:fruit-juices|en:beverages|\bbeverage\b|\bsoda\b|sparkling water|\bjuice\b/.test(
      blob,
    )
  ) {
    return "beverages";
  }
  return "staples";
}
