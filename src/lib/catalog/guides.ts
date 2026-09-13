import { MORE_GUIDES } from "./guides-more";

export type GuidePersona =
  | "shop"
  | "parent"
  | "pregnancy"
  | "gym"
  | "beauty"
  | "pet"
  | "gut"
  | "weight";

export type Guide = {
  slug: string;
  title: string;
  kicker: string;
  lede: string;
  minutes: number;
  image: string;
  aisle?: string;
  persona?: GuidePersona[];
  relatedBarcodes: string[];
  relatedIngredients: string[];
  sections: { heading: string; body: string }[];
};

export const GUIDE_PERSONAS: { id: GuidePersona | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shop", label: "Everyday shop" },
  { id: "parent", label: "Parents" },
  { id: "pregnancy", label: "Pregnancy" },
  { id: "gym", label: "Training" },
  { id: "beauty", label: "Body & beauty" },
  { id: "pet", label: "Pet" },
  { id: "gut", label: "Gut" },
  { id: "weight", label: "Weight" },
];

const CORE_GUIDES: Guide[] = [
  {
    slug: "how-to-read-a-score",
    title: "How to read a score",
    kicker: "The 10-second version",
    lede: "0 to 100. Green is a keep. Red is a walk-away. The number is a recipe, not a vibe — and ceilings stop a pretty organic stamp from hiding a bad box.",
    minutes: 4,
    image: "/images/guide-score.jpg",
    persona: ["shop"],
    relatedBarcodes: ["5449000000996", "3274080005003", "3017620422003", "009800830039"],
    relatedIngredients: ["e150d", "e250", "e951"],
    sections: [
      {
        heading: "Four colours, one decision",
        body: "75–100 excellent: everyday food, a calm cream, an honest bag of kibble. 50–74 good: fine sometimes. 25–49 poor: a treat, not a habit. Below 25, we leave it on the shelf and take the neighbour. The disc is filled on purpose — Yuka taught people to read a number in a blink. We kept that.",
      },
      {
        heading: "What the number is made of",
        body: "Food: 50% nutrition (sugar, salt, saturated fat, fibre, protein, fruit), 25% extras, 20% processing, 5% organic. Then ceilings. A weak nutrition box cannot be rated Good. One high-concern extra cannot hide in a long list. Two of them, and the pack is Avoid. Creams and washes use a different recipe: the worst actor sets the ceiling. One rough preservative keeps a pretty bottle out of the green.",
      },
      {
        heading: "Ceilings, in plain English",
        body: "A cola cannot be ‘Good’ because the nutrition box is weak and the recipe is a factory drink. A ham with nitrite cannot be ‘Good’ because a high-concern extra sets a ceiling. Organic sugar is still sugar. Open any product and read ‘Why this number’ — it names what pulled the score down and what held it up. If that sentence and the disc disagree, believe the sentence.",
      },
      {
        heading: "What the number is not",
        body: "Not a medical opinion, a calorie counter, or a moral grade. Olive oil and yogurt can both belong in the house with different numbers. Use it to compare two similar things, not a steak to a shampoo.",
      },
    ],
  },
  {
    slug: "sugar-simply",
    title: "Sugar, simply",
    kicker: "The teaspoon test",
    lede: "Four grams is a teaspoon. Once drinks and cereals show up in teaspoons, the aisle gets quieter — and the ‘healthy’ granola looks like dessert.",
    minutes: 3,
    image: "/images/guide-sugar.jpg",
    aisle: "beverages",
    persona: ["shop", "parent", "weight"],
    relatedBarcodes: ["5449000000996", "3274080005003", "5000159407236"],
    relatedIngredients: ["sugar", "e951", "e955"],
    sections: [
      {
        heading: "Where it hides",
        body: "Juice from concentrate, breakfast cereal, ketchup, yogurt with a fruit swirl, ‘healthy’ granola. Sugar is not only in dessert. It borrowed dessert’s recipe and kept the breakfast marketing.",
      },
      {
        heading: "Drinks are the fast path",
        body: "A can of cola is several teaspoons in a few minutes, with no fibre to slow it down. Water, sparkling water, and unsweetened tea do the same job without the spike. If you only change one aisle this month, change the pour.",
      },
      {
        heading: "Fruit is not a loophole",
        body: "A whole orange comes with fibre and water. A glass of juice is the sugar without the brake. Treat juice like a sweet, not a serving of fruit.",
      },
      {
        heading: "Sweeteners are not free",
        body: "Aspartame, sucralose, acesulfame K. We mark them. They don’t add teaspoons, but they keep a sweet habit alive and they show up in ‘zero’ drinks that still score poorly on processing. Water is still the keep.",
      },
    ],
  },
  {
    slug: "ultra-processed",
    title: "Ultra-processed, in plain English",
    kicker: "If your grandmother wouldn’t recognise it",
    lede: "NOVA 4 is food built for the warehouse: flavours, colours, emulsifiers, a list you could not shop. One biscuit is not poison. A diet of them crowds out real food.",
    minutes: 4,
    image: "/images/guide-nova.jpg",
    aisle: "snacks",
    persona: ["shop", "gut", "weight"],
    relatedBarcodes: ["7622300336738", "009800830039", "8500108320157"],
    relatedIngredients: ["e471", "e621", "natural-flavour"],
    sections: [
      {
        heading: "Four kinds of making",
        body: "NOVA 1 is an apple, oats, a piece of fish. NOVA 2 is oil, sugar, salt. NOVA 3 is bread, cheese, tinned tomatoes. NOVA 4 is the rest: puffed, dyed, flavoured, built to last. Healthie uses that group as 20% of the food score, and a ceiling when the list is a factory.",
      },
      {
        heading: "Why it matters",
        body: "These foods are easy to overeat. Soft, sweet or salty, they don’t fill you the way a cooked meal does. The research is about the pattern, not one Tuesday biscuit.",
      },
      {
        heading: "The 10-second test",
        body: "Read the list. If you could shop those ingredients and make it at home, it’s probably fine. If you would need a plant in New Jersey, it’s a sometimes food. Open the snacks aisle and sort by score — the keepers are almost always the short lists.",
      },
    ],
  },
  {
    slug: "whats-in-sunscreen",
    title: "What’s in sunscreen",
    kicker: "Wear it. Choose it.",
    lede: "Sun protection is non-negotiable. The filter is not. Mineral sits on the skin. Some chemical filters soak in — and a few we’d skip around pregnancy and children.",
    minutes: 4,
    image: "/images/guide-sun.jpg",
    aisle: "sun",
    persona: ["beauty", "pregnancy", "parent"],
    relatedBarcodes: [],
    relatedIngredients: ["zinc-oxide", "oxybenzone", "octinoxate", "fragrance"],
    sections: [
      {
        heading: "Two families",
        body: "Zinc oxide and titanium dioxide sit on the surface and bounce light. Chemical filters absorb UV and can pass into the body in small amounts. Most people do well with either. A few chemical filters have extra questions attached — we mark those orange or red.",
      },
      {
        heading: "The ones we flag",
        body: "Oxybenzone, octinoxate, homosalate. Common in older ‘sport’ formulas. If you are pregnant, nursing, or putting it on a child, a mineral bottle is the calmer choice. Fragrance in SPF is optional and usually a miss — it sits on the skin all day, in the sun.",
      },
      {
        heading: "The only wrong sunscreen",
        body: "The one you don’t wear. If mineral feels too thick, find a hybrid you will actually put on. Then graduate later.",
      },
    ],
  },
  {
    slug: "pregnancy-shelf",
    title: "Pregnancy and the bathroom shelf",
    kicker: "A calmer cabinet",
    lede: "You do not need a new personality. You need fewer leave-on surprises: strong retinol, some chemical sun filters, and the preservatives we flag.",
    minutes: 4,
    image: "/images/guide-pregnancy.jpg",
    aisle: "skincare",
    persona: ["pregnancy", "beauty"],
    relatedBarcodes: [],
    relatedIngredients: ["retinol", "fragrance", "oxybenzone"],
    sections: [
      {
        heading: "Leave-on vs rinse-off",
        body: "A night serum sits on the skin for hours. A hand wash does not. Worry first about what stays. Parabens, some UV filters, formaldehyde-releasers, and high-strength retinol are the ones we mark for extra caution.",
      },
      {
        heading: "Food still counts",
        body: "Cured meats with nitrites, and drinks with certain sweeteners, are the grocery version of the same idea: skip the questionable extras while the body is doing extra work. Set your profile to Pregnancy. Every scan will surface those extras in the aisle, not after a lecture.",
      },
      {
        heading: "The bathroom pass",
        body: "Keep a mineral sunscreen, a bland moisturiser, and a fragrance-free wash. You do not need a ‘pregnancy line’. You need a shorter list. Open the sun and skincare aisles and sort by score — the calm bottles rise.",
      },
    ],
  },
  {
    slug: "pet-bowl",
    title: "The bowl, without the marketing",
    kicker: "Named meat. Quiet extras.",
    lede: "Dogs and cats do not need neon kibble, a perfume, or a preservative designed for a two-year warehouse stay.",
    minutes: 3,
    image: "/images/guide-pet.jpg",
    aisle: "pet",
    persona: ["pet"],
    relatedBarcodes: [],
    relatedIngredients: ["e320", "e321", "e102"],
    sections: [
      {
        heading: "Read the first line",
        body: "Chicken, salmon, beef. A named animal. ‘Meat meal’ and ‘by-product’ are legal; they are also a signal that the recipe is stretching protein.",
      },
      {
        heading: "Colour is not a nutrient",
        body: "Yellow dye in a brown food is for you, not for them. Same with propylene glycol, BHA, and the other keep-it-pretty extras we mark high concern. Open the pet aisle, sort by score, and the neon bags fall to the bottom.",
      },
      {
        heading: "The bowl, every day",
        body: "A weekend treat is not a diet. The bag you open fourteen times a week is. If the first five ingredients are grain, sugar, and a dye, that is breakfast cereal with a dog on it. Named meat, a short list, no perfume: that is a keep.",
      },
    ],
  },
  {
    slug: "additives-worth-skipping",
    title: "Additives worth skipping",
    kicker: "A short list, on purpose",
    lede: "Most extras in food are boring. A handful are not. Learn those, and the rest of the label gets easier.",
    minutes: 5,
    image: "/images/guide-additives.jpg",
    persona: ["shop", "parent"],
    relatedBarcodes: ["5449000000996", "009800830039"],
    relatedIngredients: ["e250", "e320", "e321", "e102", "e171", "e127", "e150d"],
    sections: [
      {
        heading: "High concern — we cap the score",
        body: "Nitrites (E250, E251) in cured meat. BHA and BHT in oily snacks and some pet food. Azo dyes linked to children’s behaviour (E102, E110, E122, E124, E129). Titanium dioxide (E171), banned as a food additive in the EU. Erythrosine / Red 3 (E127). Two of these in one pack, and Healthie will not let it be ‘Good’.",
      },
      {
        heading: "The middle ones",
        body: "Some sweeteners, some emulsifiers (polysorbate 80, carrageenan), caramel colour E150d, phosphates in cola, TBHQ in frying oil. Not a crisis in one sandwich. A pattern of them is a diet that forgot how to cook.",
      },
      {
        heading: "The harmless ones",
        body: "Citric acid, vitamin C, lecithin, pectin, cultures. Kitchen ideas with a number attached. We leave them green. Open any product page — extras are listed with their risk class, not a scare word.",
      },
    ],
  },
  {
    slug: "how-to-shop-yogurt",
    title: "How to shop yogurt",
    kicker: "Milk, cultures, the end",
    lede: "The best yogurt looks almost unfinished. Fruit, flavours, and thickeners are how a simple food becomes a dessert.",
    minutes: 3,
    image: "/images/guide-yogurt.jpg",
    aisle: "dairy",
    persona: ["shop", "parent"],
    relatedBarcodes: ["3033490004521", "8500108320188"],
    relatedIngredients: ["sugar", "e440", "e412"],
    sections: [
      {
        heading: "The winning list",
        body: "Milk. Live cultures. That’s the whole poem. Protein should be obvious — around 8 to 10 grams in a serving of strained yogurt is a good sign.",
      },
      {
        heading: "The fruit lie",
        body: "Strawberry yogurt is often sugar, starch, and a colour, with a little fruit for the photograph. Buy plain. Add the fruit on the bowl, where you can see it. Kids’ pouches train a sweet tooth before lunch. If it needs a cartoon, it needs a second look.",
      },
      {
        heading: "Plant pots",
        body: "Coconut and almond ‘yogurts’ can be excellent or a dessert. The difference is the list: cultures and a nut, or starch, flavour, and sugar. Scan it. The disc does not care what the lid promised.",
      },
    ],
  },
  {
    slug: "fragrance-explained",
    title: "Fragrance, explained",
    kicker: "One word, many extras",
    lede: "On a label, ‘fragrance’ or ‘parfum’ can hide dozens of small molecules. Some are fine. A few are common allergens. None of them clean, moisturise, or protect.",
    minutes: 3,
    image: "/images/guide-fragrance.jpg",
    aisle: "body",
    persona: ["beauty", "pregnancy"],
    relatedBarcodes: [],
    relatedIngredients: ["fragrance"],
    sections: [
      {
        heading: "Why brands love it",
        body: "Scent is memory and shelf appeal. A citrus wash sells itself with the cap off. The skin did not ask for that.",
      },
      {
        heading: "Leave-on is the issue",
        body: "A scented lotion, deodorant, or sunscreen sits for hours. That’s when linalool, limonene, lilial and friends become more than a mood. Rinse-off soap is less of a story. Set Healthie to avoid fragrance and we’ll flag it on every scan.",
      },
    ],
  },
  {
    slug: "palm-oil",
    title: "Palm oil, without the lecture",
    kicker: "Saturated, and a landscape",
    lede: "Cheap, stable, in everything from biscuits to chocolate spread. The health story is saturated fat. The other story is what it does to forests.",
    minutes: 3,
    image: "/images/guide-palm.jpg",
    aisle: "spreads",
    persona: ["shop"],
    relatedBarcodes: ["3017620422003", "009800830039"],
    relatedIngredients: ["palm-oil"],
    sections: [
      {
        heading: "On the nutrition side",
        body: "Palm oil is high in saturated fat. In a biscuit, that shows up in the score. In a teaspoon of cooking fat, you’d still rather reach for olive oil.",
      },
      {
        heading: "On the planet side",
        body: "We lower the planet mark when palm is in the recipe. Certified supply exists; most supermarket jars do not tell you which plantation they came from. Swap the daily offenders — chocolate spread, some biscuits, cheap instant noodles — and leave the rest alone.",
      },
    ],
  },
  {
    slug: "protein-bars",
    title: "Protein bars are not a free pass",
    kicker: "Gym clothes on a candy bar",
    lede: "Twenty grams of protein does not excuse three sweeteners, an emulsifier, and a flavour lab. Some bars are food. Most are a dessert that learned to sit next to a shaker.",
    minutes: 3,
    image: "/images/protein.jpg",
    aisle: "protein",
    persona: ["gym", "weight"],
    relatedBarcodes: ["857777004016", "888849000016", "021908453016"],
    relatedIngredients: ["e955", "e960", "e407"],
    sections: [
      {
        heading: "Named food first",
        body: "Dates, nuts, egg whites: that’s a keep. Milk protein isolate, polydextrose, sucralose: that’s a factory. Open the protein aisle. The score already did this work.",
      },
      {
        heading: "Sweeteners stack",
        body: "Sucralose plus stevia plus acesulfame K is a pattern, not a feature. We mark each one. A bar that needs three is hiding from sugar, not from processing.",
      },
      {
        heading: "How to shop it",
        body: "A delay, a train, a session that ran long — then a bar beats skipping food. The rest of the week, yogurt, eggs, leftovers. If the wrapper looks like a nightclub, the list will too. Scan it.",
      },
    ],
  },
  {
    slug: "coffee-not-dessert",
    title: "Coffee is not dessert",
    kicker: "Beans, then the pour-ins",
    lede: "Whole beans score like water. The bottled latte and the vanilla creamer do not. Sugar and hydrogenated oil turned a morning habit into a can of soda.",
    minutes: 3,
    image: "/images/coffee.jpg",
    aisle: "coffee",
    persona: ["shop"],
    relatedBarcodes: ["762111000016", "012000162016", "044000041016"],
    relatedIngredients: ["sugar", "palm-oil", "e102"],
    sections: [
      {
        heading: "The keep",
        body: "Coffee. Tea. Maybe milk. That’s the list. Organic or not barely moves the needle because there is nothing to hide.",
      },
      {
        heading: "The walk-away",
        body: "Bottled Frappuccino, pink drinks, powder creamer with yellow dye. Open the coffee aisle, sort by score, and the pattern is rude and obvious.",
      },
    ],
  },
  {
    slug: "the-freezer",
    title: "The freezer is two aisles",
    kicker: "Peas, or a factory",
    lede: "Frozen fruit and vegetables are honest. A rising-crust pepperoni pizza is a paragraph of extras that learned to sit next to the peas.",
    minutes: 3,
    image: "/images/frozen.jpg",
    aisle: "frozen",
    persona: ["shop", "parent"],
    relatedBarcodes: ["014500001016", "071921000016", "042272008016"],
    relatedIngredients: ["e250", "e102", "e621"],
    sections: [
      {
        heading: "The honest half",
        body: "Broccoli, berries, a short-list organic pizza. Frozen is a preservation method, not a sin. The score follows the list, not the temperature.",
      },
      {
        heading: "The other half",
        body: "DiGiorno, pizza rolls, tater tots with yellow dye. Nitrite, palm oil, MSG. Same freezer door. Wildly different numbers. That’s the point of an aisle view.",
      },
    ],
  },
  {
    slug: "first-spoon",
    title: "The first spoon",
    kicker: "Baby food without the pouch trick",
    lede: "One fruit, one vegetable, maybe meat. Pouches with juice concentrate and ‘natural flavour’ are baby dessert with better marketing.",
    minutes: 3,
    image: "/images/baby.jpg",
    aisle: "baby",
    persona: ["parent"],
    relatedBarcodes: ["015000001016", "015000041016", "070074580016"],
    relatedIngredients: ["sugar", "natural-flavour"],
    sections: [
      {
        heading: "The shortest list wins",
        body: "Organic carrots, water. That’s a keep. Puffs and ‘ranch crunchies’ are snacks with a baby label. Formula is a medical food — we score the recipe we can see, not the marketing around it.",
      },
      {
        heading: "Pouches are a vehicle",
        body: "Squeezing apple-and-something through a nozzle is convenient. It is also easy to drink 20 grams of sugar without sitting down. A spoon of plain puree, a piece of fruit they can hold: slower, and they learn what food looks like.",
      },
      {
        heading: "How to shop it",
        body: "Turn the pack. One fruit or vegetable, maybe meat, water. If juice concentrate, flavour, or sugar show up, it is a dessert with a baby font. Scan the pouch. The disc does not care that it was in the baby aisle.",
      },
    ],
  },
];

export const GUIDES: Guide[] = [...CORE_GUIDES, ...MORE_GUIDES];

export const GUIDE_BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));
