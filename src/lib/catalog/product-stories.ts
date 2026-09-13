import type { EvaluatedProduct } from "./evaluate";
import { bandSentence } from "@/lib/copy";

export type HowOften = "everyday" | "sometimes" | "rarely" | "skip";

export type ProductStory = {
  verdict: string;
  story: string;
  packSize?: string;
  origin?: string;
  servingNote?: string;
  howOften: HowOften;
  whoItsFor: string;
  skipIf: string;
  highlights: string[];
};

export const PRODUCT_STORIES: Record<string, ProductStory> = {
  "5449000000996": {
    verdict: "A treat in a can. Fine at a cinema. Not a weekday drink.",
    story:
      "Cola is water, sugar, caramel colour, and a bite of phosphoric acid. The recipe has not changed much in a century because it does not need to — it is sweet, cold, and easy to finish. One can is several teaspoons of sugar with nothing to slow it down.",
    packSize: "330 ml can",
    origin: "Worldwide",
    servingNote: "A can is a dessert. Pair it with a meal and it still counts as a dessert.",
    howOften: "rarely",
    whoItsFor: "People who want the classic taste on purpose.",
    skipIf: "You are watching sugar, teeth, or bone-friendly phosphate load — or you wanted a thirst quencher.",
    highlights: ["Several teaspoons of sugar per can", "Caramel colour and phosphoric acid", "No fibre, no protein"],
  },
  "8002270014901": {
    verdict: "Sparkling water. Thirst, with bubbles. A keep.",
    story:
      "Mineral water and carbon dioxide. That is the whole list. The mineral profile is the point — a little salt, a lot of fizz — and nothing has been added to make you drink a second bottle.",
    packSize: "750 ml glass",
    origin: "San Pellegrino Terme, Italy",
    servingNote: "Drink freely. The sodium is modest.",
    howOften: "everyday",
    whoItsFor: "Anyone who wants bubbles without a sweetener.",
    skipIf: "You need still water for a baby bottle, or you dislike minerality.",
    highlights: ["Two ingredients", "No sugar", "A clean swap for soda"],
  },
  "3274080005003": {
    verdict: "Still water from the Alps. As simple as shopping gets.",
    story:
      "Evian is water. The mountain story is marketing; the bottle is still just water, which is exactly what you want when you are thirsty.",
    packSize: "500 ml",
    origin: "Évian-les-Bains, France",
    servingNote: "Hydration. That is the serving.",
    howOften: "everyday",
    whoItsFor: "Everyone.",
    skipIf: "You would rather drink tap and skip the bottle — a fair choice at home.",
    highlights: ["One ingredient", "No extras", "The baseline every other drink is measured against"],
  },
  "5010029214439": {
    verdict: "Brewed tea, unsweetened. A weekday pour.",
    story:
      "Tea and water. No sugar, no ‘natural flavour’ fog. If you like iced tea and you do not want a dessert, this is the shape of the bottle to look for.",
    packSize: "500 ml",
    origin: "USA / Europe",
    servingNote: "A glass replaces a soda without the crash.",
    howOften: "everyday",
    whoItsFor: "People leaving sweet drinks without leaving ritual.",
    skipIf: "You are avoiding caffeine in the evening.",
    highlights: ["Unsweetened", "Short list", "Caffeine as in tea, not as in energy drinks"],
  },
  "9002490100070": {
    verdict: "A stimulant in a sweet can. Rarely, if at all.",
    story:
      "Sugar, caffeine, taurine, and a stack of sweeteners and acids. Energy drinks are built to be finished fast. The alertness is real; so is the sugar and the habit they train.",
    packSize: "250 ml",
    origin: "Austria / worldwide",
    servingNote: "Treat it like a strong coffee plus a dessert, not a sports drink.",
    howOften: "skip",
    whoItsFor: "Adults who already know what they are buying.",
    skipIf: "You are pregnant, under 18, sensitive to caffeine, or looking for hydration.",
    highlights: ["Sugar plus intense sweeteners", "High caffeine", "A long additive list"],
  },
  "3017620422003": {
    verdict: "Dessert in a jar. A spoon on Sunday, not a breakfast.",
    story:
      "Sugar and palm oil lead. Hazelnuts and cocoa follow. Nutella is honest about being a treat if you read the list; the breakfast marketing is the only fiction.",
    packSize: "400 g",
    origin: "Italy / worldwide",
    servingNote: "A tablespoon is already a dessert. Two tablespoons is a pastry without the pastry.",
    howOften: "rarely",
    whoItsFor: "People who want that exact taste and will keep the lid on.",
    skipIf: "You wanted a nut butter. This is not one. Also skip if you avoid palm oil or nuts.",
    highlights: ["Sugar first", "Palm oil second", "Hazelnuts, then milk"],
  },
  "009800830039": {
    verdict: "A biscuit with a Nutella heart. A treat. Not a lunchbox habit.",
    story:
      "Wheat, palm oil, and sugar wrap a smear of the same chocolate-hazelnut filling. Two biscuits are a dessert. The 20-pack is a sitting if you let it be. The front looks like breakfast; the list does not.",
    packSize: "9.7 oz · 20 biscuits",
    origin: "Italy",
    servingNote: "Two biscuits (28 g) already bring a dessert’s worth of sugar and saturated fat.",
    howOften: "rarely",
    whoItsFor: "People who wanted that exact Ferrero taste in a biscuit, on purpose.",
    skipIf: "Wheat, milk, or hazelnut allergy — or you wanted a weekday snack.",
    highlights: ["Palm oil and sugar lead", "Hazelnut filling", "Raising agents and lecithin"],
  },
  "8000500310427": {
    verdict: "A biscuit with a Nutella heart. A treat. Not a lunchbox habit.",
    story:
      "Wheat, palm oil, and sugar wrap a smear of the same chocolate-hazelnut filling. Two biscuits are a dessert. The 20-pack is a sitting if you let it be.",
    packSize: "304 g · 20 biscuits",
    origin: "Italy",
    servingNote: "Two biscuits are a treat. The sleeve is a sitting.",
    howOften: "rarely",
    whoItsFor: "People who wanted that exact Ferrero taste in a biscuit, on purpose.",
    skipIf: "Wheat, milk, or hazelnut allergy — or you wanted a weekday snack.",
    highlights: ["Palm oil and sugar lead", "Hazelnut filling", "Raising agents and lecithin"],
  },
  "0810589032602": {
    verdict: "A middle granola. Real nuts and seeds, plus coconut sugar and ‘natural flavour’.",
    story:
      "Oats, pumpkin seeds, sunflower seeds, cashews, almond butter, quinoa, chia. Protein comes from the nuts, not a powder. Coconut sugar and coconut oil still glue the clusters, and the pack says ‘with other natural flavors’. Better than a chocolate cereal. Not the same as a bowl of oats.",
    packSize: "8 oz",
    origin: "USA",
    servingNote: "A 60 g bowl is a meal-sized sprinkle. Portion it, or put it on yogurt instead of filling the bowl.",
    howOften: "sometimes",
    whoItsFor: "People who want a granola that actually contains nuts and seeds, and will keep the serving honest.",
    skipIf: "Tree-nut allergy (almond, cashew). Coeliac unless you trust the gluten-free oats claim.",
    highlights: ["10 g protein from nuts and seeds", "Coconut sugar still counts as sugar", "Organic oats and seeds"],
  },
  "0081058903260": {
    verdict: "A middle granola. Real nuts and seeds, plus coconut sugar and ‘natural flavour’.",
    story:
      "Oats, pumpkin seeds, sunflower seeds, cashews, almond butter, quinoa, chia. Protein comes from the nuts, not a powder. Coconut sugar and coconut oil still glue the clusters.",
    packSize: "8 oz",
    origin: "USA",
    servingNote: "A 60 g bowl is a meal-sized sprinkle.",
    howOften: "sometimes",
    whoItsFor: "People who want a granola that actually contains nuts and seeds.",
    skipIf: "Tree-nut allergy (almond, cashew).",
    highlights: ["10 g protein from nuts and seeds", "Coconut sugar still counts as sugar", "Organic oats and seeds"],
  },
  "099482513931": {
    verdict: "Water, with a mineral pinch and a pH claim. Drink it like water.",
    story:
      "Reverse-osmosis water, then potassium bicarbonate, calcium chloride, and magnesium sulfate to push the pH past 9.5. That is still water. The electrolytes are a taste, not a sports drink. Skip the story; keep the bottle if you like it.",
    packSize: "1 L",
    origin: "365 Whole Foods Market",
    servingNote: "Hydration. That is the serving.",
    howOften: "everyday",
    whoItsFor: "Anyone who wants water. The pH is marketing on top of a clean list.",
    skipIf: "You would rather drink tap and skip the bottle — a fair choice at home.",
    highlights: ["Water first", "Trace mineral salts", "No sugar"],
  },
  "099482514358": {
    verdict: "Water, with a mineral pinch and a pH claim. Drink it like water.",
    story:
      "Reverse-osmosis water, then potassium bicarbonate, calcium chloride, and magnesium sulfate to push the pH past 9.5. That is still water.",
    packSize: "25.3 fl oz",
    origin: "365 Whole Foods Market",
    servingNote: "Hydration. That is the serving.",
    howOften: "everyday",
    whoItsFor: "Anyone who wants water.",
    skipIf: "You would rather drink tap and skip the bottle.",
    highlights: ["Water first", "Trace mineral salts", "No sugar"],
  },
  "8500108320157": {
    verdict: "Almonds, roasted. That is the recipe. A keep.",
    story:
      "Organic dry-roasted almonds. No sugar, no palm, no emulsifier. The jar is thick because nuts are thick. Stir it. Eat it on toast, in porridge, from a spoon if you must.",
    packSize: "340 g",
    origin: "California almonds, packed for Healthie Pantry",
    servingNote: "A tablespoon is a proper snack — fat, fibre, protein.",
    howOften: "everyday",
    whoItsFor: "Anyone who wants a nut butter that is actually nuts. Tree-nut allergy: skip.",
    skipIf: "Tree-nut allergy.",
    highlights: ["One ingredient", "Organic", "No palm oil"],
  },
  "8500108320164": {
    verdict: "Sesame, stone-ground. Bitter in a good way.",
    story:
      "Tahini is sesame seeds under a stone. That is the Levantine pantry in a jar — for hummus, for dressing, for a drizzle on roasted vegetables.",
    packSize: "300 g",
    origin: "Eastern Mediterranean sesame",
    servingNote: "A spoon goes a long way. Stir the oil back in.",
    howOften: "everyday",
    whoItsFor: "Cooks, and anyone building a savoury breakfast.",
    skipIf: "Sesame allergy — this is the whole seed, nothing hidden.",
    highlights: ["One ingredient", "Organic sesame", "Naturally rich in calcium"],
  },
  "5000328722751": {
    verdict: "A salty crisp. Fine with a sandwich. Not a bowl for dinner.",
    story:
      "Potato, oil, salt. Walkers keeps the list short for a flavoured-crisp aisle. The salt and the oil are the whole story — there is no dye, no flavour dust. That is the best version of a fried snack.",
    packSize: "32.5 g bag",
    origin: "United Kingdom",
    servingNote: "One small bag is a side. A family bag is a meal you will not remember.",
    howOften: "sometimes",
    whoItsFor: "People who want a crisp that still looks like a potato.",
    skipIf: "You are watching salt or eating crisps as the meal.",
    highlights: ["Three ingredients", "Salty", "No flavourings"],
  },
  "8500108320171": {
    verdict: "A handful of nuts. The original snack.",
    story:
      "Almonds, hazelnuts, cashews, walnuts. Dry-roasted, unsalted, organic. This is what ‘snack’ meant before the aisle learned to puff and dye.",
    packSize: "200 g",
    origin: "Mixed origin nuts, packed for Healthie Pantry",
    servingNote: "A small handful. Protein and fat fill you; a second handful is dinner creeping in.",
    howOften: "everyday",
    whoItsFor: "Anyone packing a bag. Tree-nut allergy: skip.",
    skipIf: "Tree-nut allergy.",
    highlights: ["Whole nuts", "No salt", "No oil added"],
  },
  "7622300336738": {
    verdict: "A cookie with a filling. Dessert. Walk on by for a weekday snack.",
    story:
      "Oreos are wheat, sugar, and palm oil, dyed and raised and flavoured until they taste like childhood. That is allowed. Calling them a snack is the stretch.",
    packSize: "154 g",
    origin: "Mondelez, worldwide",
    servingNote: "Two biscuits are a treat. The sleeve is a sitting.",
    howOften: "rarely",
    whoItsFor: "Nostalgia, on purpose.",
    skipIf: "You wanted something with fibre, or you avoid palm oil and ultra-processed food.",
    highlights: ["Sugar and palm oil", "Ultra-processed", "A little cocoa for the colour"],
  },
  "3033490004521": {
    verdict: "Yogurt that learned dessert. Buy plain instead.",
    story:
      "Activia’s strawberry cup starts as yogurt and then picks up sugar, thickeners, flavour, and a colour. The live cultures are real. So is the sugar.",
    packSize: "125 g pot",
    origin: "Danone, Europe",
    servingNote: "One pot is a sweet snack, not a protein breakfast.",
    howOften: "sometimes",
    whoItsFor: "People who want a fruity yogurt and will not add their own fruit.",
    skipIf: "You are cutting sugar, or you wanted the protein of a strained yogurt.",
    highlights: ["Added sugar", "Thickeners and flavour", "Some fruit"],
  },
  "8500108320188": {
    verdict: "Milk and cultures. The yogurt to keep in the fridge.",
    story:
      "Organic skimmed milk, live cultures, nothing else. Thick because it was strained, not because a gum was invited. This is breakfast, a sauce, a base for whatever fruit you actually like.",
    packSize: "500 g",
    origin: "Healthie Dairy",
    servingNote: "A bowl is proper protein. Add honey or fruit if you want sweetness you can see.",
    howOften: "everyday",
    whoItsFor: "Anyone who eats dairy. High protein, low sugar.",
    skipIf: "Milk allergy or a vegan kitchen.",
    highlights: ["Two ingredients", "About 10 g protein in 100 g", "No thickeners"],
  },
  "5000159407236": {
    verdict: "Chocolate cereal is dessert that got up early.",
    story:
      "Rice, a lot of sugar, a little cocoa. Coco Pops are a childhood brand with a breakfast alibi. The vitamins on the box do not cancel the sugar in the bowl.",
    packSize: "480 g",
    origin: "Kellogg’s",
    servingNote: "A small bowl with milk is still a sweet. Oats are the weekday move.",
    howOften: "rarely",
    whoItsFor: "A Saturday treat if the house votes for it.",
    skipIf: "You wanted a fibre breakfast, or you are feeding children every morning.",
    highlights: ["Sugar near the top of the list", "Low fibre", "Cocoa for colour and flavour"],
  },
  "8500108320195": {
    verdict: "Oats. Cook them. A keep for every kitchen.",
    story:
      "Organic whole-grain rolled oats. Beta-glucan fibre, a slow breakfast, a crumble topping, a stand-in for breadcrumbs. The most useful bag in the pantry.",
    packSize: "750 g",
    origin: "Healthie Pantry",
    servingNote: "A cup dry, cooked in water or milk, with fruit. Overnight works too.",
    howOften: "everyday",
    whoItsFor: "Almost everyone. Coeliac: choose a certified gluten-free oat.",
    skipIf: "You cannot eat oats (rare) or you need certified gluten-free and this bag is not labelled so.",
    highlights: ["One ingredient", "High fibre", "Organic whole grain"],
  },
  "8715700110622": {
    verdict: "Tomato, then sugar. A tablespoon, not a pour.",
    story:
      "Heinz ketchup is tomatoes, vinegar, sugar, and salt. The tomatoes are real. The sugar is why children paint chips with it. A spoon is a condiment; a puddle is a dessert.",
    packSize: "460 g",
    origin: "Netherlands / UK",
    servingNote: "A tablespoon. Count it as a sweet if you go back for more.",
    howOften: "sometimes",
    whoItsFor: "Chip night.",
    skipIf: "You are watching sugar or salt, or you have a celery allergy (extracts can carry it).",
    highlights: ["Plenty of tomato", "Plenty of sugar", "Salty"],
  },
  "8500108320201": {
    verdict: "Tomatoes and a pinch of salt. Cook with this.",
    story:
      "Organic passata is crushed tomatoes. Use it as the start of a sauce, a soup, a shakshuka. This is what ketchup would be if it stayed in the savoury column.",
    packSize: "690 g carton",
    origin: "Italy / Healthie Pantry",
    servingNote: "A ladle is a vegetable serving.",
    howOften: "everyday",
    whoItsFor: "Anyone who cooks.",
    skipIf: "You needed a finished ketchup-style sauce.",
    highlights: ["Tomato first", "Low sugar", "Organic"],
  },
  "4000417025005": {
    verdict: "Sweets. Dye, gelatine, sugar. A party bag, not a snack.",
    story:
      "Haribo is sugar stuck together with gelatine and coloured with a handful of dyes. Fun at a birthday. A poor everyday nibble, especially for children who react to bright colours.",
    packSize: "160 g",
    origin: "Germany / worldwide",
    servingNote: "A few bears. The bag is designed to empty itself.",
    howOften: "rarely",
    whoItsFor: "Parties, on purpose.",
    skipIf: "Children sensitive to dyes, vegetarians (gelatine), or anyone treating sweets as a snack.",
    highlights: ["Very high sugar", "Several synthetic dyes", "Gelatine"],
  },
  "3046920029759": {
    verdict: "Dark, grown-up chocolate. A square is enough.",
    story:
      "Lindt 85% is cocoa first, sugar later. It is still a rich food — fat and calories are the point of chocolate — but it is not a sugar bar in a tuxedo.",
    packSize: "100 g",
    origin: "Switzerland",
    servingNote: "Two squares after dinner. The rest of the bar is tomorrow.",
    howOften: "sometimes",
    whoItsFor: "People who like bitter cocoa.",
    skipIf: "You wanted a sweet milk chocolate, or you avoid soy lecithin.",
    highlights: ["Cocoa-led", "Lower sugar than milk chocolate", "Still a dense fat"],
  },
  "8500108320218": {
    verdict: "Cocoa, cocoa butter, a little cane sugar. The bar to keep.",
    story:
      "Organic 90% is almost a cooking chocolate you can eat. Short list, high cocoa, no vanilla fog. Intense. A little goes a long way.",
    packSize: "80 g",
    origin: "Healthie Pantry",
    servingNote: "One or two squares. This is not a binge bar.",
    howOften: "sometimes",
    whoItsFor: "Dark-chocolate people, and bakers.",
    skipIf: "You need something sweeter to be satisfied — you will eat more of a milder bar instead.",
    highlights: ["Three organic ingredients", "Very high cocoa", "Low sugar"],
  },
  "3181232140562": {
    verdict: "Reconstituted ham with nitrite. Buy a roast, or skip.",
    story:
      "Parisian-style ham is pork plus a curing salt that keeps it pink. Nitrite is the concern — processed meat is the category to eat rarely, not the weekday sandwich default.",
    packSize: "4 slices",
    origin: "France / Europe",
    servingNote: "If you eat it, make it the exception. Pair with vegetables, not more processed meat.",
    howOften: "skip",
    whoItsFor: "People who want that exact deli taste and will not make it a habit.",
    skipIf: "You are pregnant, watching processed meat, or you thought this was a roast.",
    highlights: ["Nitrite-cured", "Salty", "Ultra-processed meat"],
  },
  "8076809513724": {
    verdict: "Durum wheat and water. The weekday pasta.",
    story:
      "Barilla spaghetti is semolina and water. Cook it in salted water, sauce it with tomatoes, eat it with people. A staple, not a health food and not a problem.",
    packSize: "500 g",
    origin: "Italy",
    servingNote: "A nest per person, more if the sauce is light.",
    howOften: "everyday",
    whoItsFor: "Almost everyone who eats wheat.",
    skipIf: "Gluten-free kitchen.",
    highlights: ["Two ingredients", "No egg", "A proper staple"],
  },
  "8500108320300": {
    verdict: "A scented lotion with a preservative stack. We’d pick the quieter jar.",
    story:
      "Bloom Daily Lotion moisturises, then perfumes, then preserves itself with parabens and phenoxyethanol, then tints with a yellow dye. Skin asked for comfort. The rest is shelf life and scent.",
    packSize: "200 ml",
    origin: "Maison Bloom",
    servingNote: "Leave-on, twice a day — so every extra in the list is extra all day.",
    howOften: "skip",
    whoItsFor: "People who want a heavily scented cream and accept the trade.",
    skipIf: "Pregnancy, children, sensitive skin, or anyone avoiding fragrance and parabens.",
    highlights: ["Parabens", "Fragrance and allergen molecules", "A dye for the cream"],
  },
  "8500108320317": {
    verdict: "Shea, olive, vitamin E. A keep for dry skin.",
    story:
      "Grove’s balm is a kitchen of fats: shea, olive, squalane. No perfume, no dye, no paraben. It melts on contact. Use it on hands, cheeks, the ends of hair.",
    packSize: "50 ml tin",
    origin: "Grove Atelier",
    servingNote: "A pea-size for the face, a fingertip for hands.",
    howOften: "everyday",
    whoItsFor: "Dry skin, winter, unscented households.",
    skipIf: "You dislike rich balms, or you have a shea/olive sensitivity (rare).",
    highlights: ["Short list", "Unscented", "Organic fats"],
  },
  "8500108320324": {
    verdict: "A simple serum. Niacinamide and hyaluronic acid, nothing loud.",
    story:
      "Water, glycerin, niacinamide, hyaluronic acid, panthenol, vitamin E. This is the modern ‘do a little’ bottle — barrier support without a perfume or a harsh preservative.",
    packSize: "30 ml",
    origin: "Grove Atelier",
    servingNote: "Three drops on damp skin, morning or night.",
    howOften: "everyday",
    whoItsFor: "Most skin types, including sensitive.",
    skipIf: "You already use a high-strength niacinamide and it disagrees with you.",
    highlights: ["No fragrance", "No parabens", "A short, recognisable list"],
  },
  "8500108320331": {
    verdict: "A stripping shampoo with formaldehyde-releasers. Wash with something quieter.",
    story:
      "SilkShine foams hard because of sulphates, then keeps in the bottle with DMDM hydantoin and MIT, then smells like a salon. Hair gets clean. Scalps often get a vote later.",
    packSize: "250 ml",
    origin: "Maison Bloom",
    servingNote: "Rinse-off, but the preservatives still matter for hands and kids’ baths.",
    howOften: "skip",
    whoItsFor: "People who want a big lather and a big scent.",
    skipIf: "Sensitive scalps, children, anyone avoiding formaldehyde-releasers and MIT.",
    highlights: ["Sulphates", "DMDM hydantoin and MIT", "Fragrance and dye"],
  },
  "8500108320348": {
    verdict: "A gentle wash. Oat-calm, no perfume. A keep.",
    story:
      "Decyl glucoside cleans without the squeak. Aloe, glycerin, panthenol. This is the bottle you put in a family bathroom and stop thinking about.",
    packSize: "250 ml",
    origin: "Grove Atelier",
    servingNote: "A little. Gentle cleansers still work at a modest dose.",
    howOften: "everyday",
    whoItsFor: "Sensitive scalps, children, unscented households.",
    skipIf: "You need a clarifying wash for heavy product build-up — use this most days, a stronger one rarely.",
    highlights: ["Mild cleanser", "No fragrance", "Organic extras"],
  },
  "8500108320355": {
    verdict: "SPF that leans on chemical filters we’d skip — especially for kids and pregnancy.",
    story:
      "Sunburst uses oxybenzone, octinoxate, and homosalate, then adds fragrance and a silicone slip. It will prevent a burn. The extra questions are about what else those filters do once they soak in.",
    packSize: "150 ml",
    origin: "Maison Bloom",
    servingNote: "Sun protection still matters. If this is what you have, wear it — then buy mineral next.",
    howOften: "skip",
    whoItsFor: "Adults who already tolerate chemical SPF and will not switch yet.",
    skipIf: "Pregnancy, children, reef travel, or anyone who can pick a zinc bottle.",
    highlights: ["Oxybenzone and octinoxate", "Fragrance", "Leave-on, all day"],
  },
  "8500108320362": {
    verdict: "Zinc on the skin. The sun bottle we’d pack.",
    story:
      "Mineral Shield is zinc oxide in a simple fat base — shea, caprylic triglyceride, vitamin E. It sits on the surface and bounces light. White cast is the trade. Calm chemistry is the prize.",
    packSize: "100 ml",
    origin: "Grove Atelier",
    servingNote: "More than you think, every two hours in strong sun.",
    howOften: "everyday",
    whoItsFor: "Faces, children, pregnancy, anyone who wants filters that stay on top.",
    skipIf: "You refuse any white cast and will not apply enough mineral as a result — find a tinted mineral.",
    highlights: ["Zinc oxide", "No fragrance", "No chemical filters"],
  },
  "8500108320379": {
    verdict: "A citrus cloud with allergens and MIT. We’d wash with olive instead.",
    story:
      "Citrus Body Wash smells like a holiday and lists lilial, limonene, linalool, SLS, and MIT. That is a lot of personality for something you rinse off — and MIT is a common contact allergen.",
    packSize: "400 ml",
    origin: "Maison Bloom",
    servingNote: "Rinse-off, but hands and kids still meet it every day.",
    howOften: "skip",
    whoItsFor: "People chasing that specific perfume.",
    skipIf: "Eczema, fragrance allergy, children, anyone who has reacted to MIT.",
    highlights: ["Lilial (a restricted allergen)", "MIT", "Heavy fragrance"],
  },
  "8500108320386": {
    verdict: "Olive soap in a bottle. Quiet, and enough.",
    story:
      "Castile-style wash: saponified olive oil, glycerin, aloe, vitamin E. It does not foam like a sulphate. It does not smell like a candle. Skin usually prefers that bargain.",
    packSize: "400 ml",
    origin: "Grove Atelier",
    servingNote: "A pump for the whole body. Follow with a simple balm if you run dry.",
    howOften: "everyday",
    whoItsFor: "Families, sensitive skin, unscented homes.",
    skipIf: "You need a sanitising wash for a clinic setting — this is soap, not a hospital product.",
    highlights: ["Olive-derived soap", "No fragrance", "No sulphates"],
  },
  "8500108320409": {
    verdict: "By-product meal, dye, and warehouse preservatives. Leave this bag.",
    story:
      "Yard Kibble leads with chicken by-product, then wheat, then the extras that keep a cheap bag looking fresh: propylene glycol, BHA, tartrazine. The colour is for you. The bowl is for them.",
    packSize: "3 kg",
    origin: "Maison Bloom Pets",
    servingNote: "If this is what’s in the house tonight, feed it and shop tomorrow.",
    howOften: "skip",
    whoItsFor: "Nobody we’d choose on purpose.",
    skipIf: "You can buy a bag with named meat and no dye — you can.",
    highlights: ["By-product meal", "BHA and propylene glycol", "Yellow dye"],
  },
  "8500108320416": {
    verdict: "Chicken, oats, vitamin E. A bowl you can feel good about.",
    story:
      "Open Pasture is organic chicken and organic oats, kept with tocopherols. Named meat, a grain you cook for yourself, no colour. Dogs do not read the bag. You do.",
    packSize: "2 kg",
    origin: "Grove Atelier Pets",
    servingNote: "Follow the weight chart on the side, then watch the waist.",
    howOften: "everyday",
    whoItsFor: "Most dogs. Transition slowly from a different bag.",
    skipIf: "Your vet has you on a prescription diet, or your dog cannot eat chicken.",
    highlights: ["Named organic chicken", "No dyes", "Short list"],
  },
  "8002270001234": {
    verdict: "Olive oil. Cook with it, dress with it, keep it.",
    story:
      "Organic extra virgin olive oil is a fruit fat. Use it cold on tomatoes, warm in a pan that is not screaming hot. This is the bottle that makes a short-list kitchen taste like one.",
    packSize: "500 ml",
    origin: "Mediterranean, packed for Healthie Pantry",
    servingNote: "A tablespoon to dress. More to cook.",
    howOften: "everyday",
    whoItsFor: "Every kitchen.",
    skipIf: "You need a high-heat frying fat — use a refined olive or sunflower for that job.",
    highlights: ["One ingredient", "Organic extra virgin", "A culinary fat, scored as one"],
  },
  "8500108320508": {
    verdict: "Real cheese. Salt, milk, time. A sometimes food with a straight face.",
    story:
      "Clothbound cheddar is milk, salt, cultures, and vegetarian rennet. Saturated fat and salt are honest here — it is cheese. A slice with apples is a different meal to a processed slice in a burger.",
    packSize: "200 g",
    origin: "Healthie Dairy",
    servingNote: "A matchbox-size piece. Taste it slowly and you will not need two.",
    howOften: "sometimes",
    whoItsFor: "People who eat dairy and like a proper cheese.",
    skipIf: "Milk allergy, vegan kitchen, or a low-salt medical diet.",
    highlights: ["Short list", "High protein", "Salty and rich, on purpose"],
  },
  "5010029000000": {
    verdict: "Juice from concentrate. Fruit without the fruit’s brakes.",
    story:
      "Tropicana Pure Premium from concentrate is orange juice with a little vitamin C added back. It still drinks like a sweet. Fibre stayed in the orchard.",
    packSize: "1 L",
    origin: "USA / Europe",
    servingNote: "A small glass, with food. Not a water substitute.",
    howOften: "rarely",
    whoItsFor: "Breakfast tables that want orange and will not eat the orange.",
    skipIf: "You are watching sugar, or you could eat a whole orange instead.",
    highlights: ["Fruit sugar, fast", "Low fibre", "From concentrate"],
  },
  "8500108320515": {
    verdict: "Pressed orange. Still a juice — better fruit, same advice.",
    story:
      "Not-from-concentrate organic orange juice. A nicer glass than a concentrate, with the same rule: it is a sweet fruit drink, not a serving of whole fruit.",
    packSize: "750 ml",
    origin: "Healthie Pantry",
    servingNote: "A small glass. Eat the orange when you can.",
    howOften: "sometimes",
    whoItsFor: "People who will drink juice anyway and want the cleaner bottle.",
    skipIf: "You are trying to cut liquid sugar.",
    highlights: ["Not from concentrate", "Organic", "Still low fibre"],
  },
  "8500108320423": {
    verdict: "A dyed, preserved pâté. Cats deserve a shorter list.",
    story:
      "Yard Pâté stretches chicken by-product with carrageenan, tartrazine, propylene glycol, and BHA. Wet food should be meat and a little gravy, not a chemistry set in a tin.",
    packSize: "12 × 85 g",
    origin: "Maison Bloom Pets",
    servingNote: "If it’s dinner tonight, feed it. Shop a named-meat tin tomorrow.",
    howOften: "skip",
    whoItsFor: "Nobody we’d choose.",
    skipIf: "You can buy a pâté with chicken or fish first and no dye.",
    highlights: ["By-product", "Dye and BHA", "Carrageenan"],
  },
  "8500108320430": {
    verdict: "Chicken, sardine, vitamin E. A tin we’d open.",
    story:
      "Open Pasture cat food is organic chicken and sardine. Cats are carnivores; this tin remembers that. Tocopherols keep it, nothing colours it.",
    packSize: "12 × 85 g",
    origin: "Grove Atelier Pets",
    servingNote: "Follow the feeding guide; cats hide extra weight in the fur.",
    howOften: "everyday",
    whoItsFor: "Most cats. Transition slowly.",
    skipIf: "Your vet has prescribed a different protein, or fish is a trigger for your cat.",
    highlights: ["Named meat and fish", "No dye", "Short list"],
  },
  "8500108320447": {
    verdict: "A foaming paste with triclosan and dye. There are calmer ways to clean teeth.",
    story:
      "BrightWhite uses SLS for foam, a yellow dye for the stripe, fragrance for the bathroom, and triclosan — an antibacterial we no longer need in a family toothpaste.",
    packSize: "75 ml",
    origin: "Maison Bloom",
    servingNote: "Twice a day is a lot of contact with whatever is in the tube.",
    howOften: "skip",
    whoItsFor: "People who want a minty foam and have not looked at the back.",
    skipIf: "Children, anyone avoiding triclosan or SLS, or a household trying to simplify.",
    highlights: ["Triclosan", "SLS", "Dye and fragrance"],
  },
  "8500108320454": {
    verdict: "A mineral paste. Quiet, and enough for most mouths.",
    story:
      "Glycerin, hydroxyapatite, vitamin E. Hydroxyapatite is the mineral teeth are made of. This tube does not foam much. It does not taste like a sweet. That is the point.",
    packSize: "75 ml",
    origin: "Grove Atelier",
    servingNote: "A pea-size, twice a day. Spit, don’t rinse, if your dentist says so.",
    howOften: "everyday",
    whoItsFor: "People who want a simple paste. Ask your dentist if you need extra fluoride.",
    skipIf: "Your dentist has you on a prescription fluoride for a reason — follow that.",
    highlights: ["No SLS", "No dye", "Mineral-based"],
  },
  "8500108320461": {
    verdict: "Retinol at night — skip this bottle in pregnancy, and skip the perfume either way.",
    story:
      "A retinol serum can earn its keep on adult skin. This one adds fragrance and PEG, which skin did not need with a strong active. If you are pregnant, skip retinol altogether.",
    packSize: "30 ml",
    origin: "Maison Bloom",
    servingNote: "Night only, a pea-size, with a plain moisturiser on top. Daytime sun care required.",
    howOften: "sometimes",
    whoItsFor: "Adults who already use retinol and tolerate it.",
    skipIf: "Pregnancy, breastfeeding, very sensitive skin, or anyone who wanted an unscented active.",
    highlights: ["Retinol", "Fragrance", "Not for pregnancy"],
  },
  "8500108320607": {
    verdict: "Soft white bread with extras. Fine for a sandwich. Sourdough is the everyday loaf.",
    story:
      "Cloud White is the supermarket sandwich loaf: sugar, emulsifier, a long-life crumb. It toasts. It is not the loaf we’d put on the table every morning.",
    packSize: "800 g",
    howOften: "sometimes",
    whoItsFor: "Packed lunches that need a soft slice.",
    skipIf: "You wanted fibre, or you can buy a short-list sourdough.",
    highlights: ["Added sugar", "Emulsifier", "Low fibre"],
  },
  "8500108320614": {
    verdict: "Flour, water, salt, time. The loaf to keep.",
    story:
      "Country Sourdough is a short list with a long ferment. Chew, acid, a crust. This is bread as a food, not as a sponge for spread.",
    packSize: "650 g",
    howOften: "everyday",
    whoItsFor: "Anyone who eats wheat.",
    skipIf: "Gluten-free kitchen.",
    highlights: ["Short list", "Organic flour", "No sugar added"],
  },
  "8500108320621": {
    verdict: "Granola that eats like a biscuit. Oats with a sugar coat.",
    story:
      "Clusters are oats glued with sugar, oil, and honey. A handful on yogurt is a dessert topping. A bowl is breakfast in name only.",
    packSize: "400 g",
    howOften: "rarely",
    whoItsFor: "A sprinkle, not a serving.",
    skipIf: "You wanted a weekday cereal — cook oats instead.",
    highlights: ["Sugar near the top", "Oil for crunch", "Honey for the story"],
  },
  "8500108320638": {
    verdict: "A sweet bar with a protein claim. A hike snack, not a meal.",
    story:
      "Trail bars are syrup, grains, and a little protein powder. Useful in a pack. Misleading in a desk drawer as lunch.",
    packSize: "68 g",
    howOften: "sometimes",
    whoItsFor: "Long walks, delayed meals.",
    skipIf: "You wanted something with a short list — nuts are sitting in the same aisle.",
    highlights: ["Syrup-led", "Palm oil", "Some protein"],
  },
  "8500108320645": {
    verdict: "Fish, olive oil, salt. A keep for the pantry.",
    story:
      "Tuna in olive oil is lunch that does not need a factory. Drain it or don’t. Eat it with beans, lemon, and a tomato.",
    packSize: "160 g",
    howOften: "everyday",
    whoItsFor: "Anyone who eats fish.",
    skipIf: "Fish allergy.",
    highlights: ["Named fish", "Olive oil", "High protein"],
  },
  "8500108320652": {
    verdict: "A frozen pizza with palm oil. Friday night, not a habit.",
    story:
      "Stone-baked on the box, emulsifier and palm in the list. Cheese and tomato are real. The crust is a processed food that happens to be round.",
    packSize: "330 g",
    howOften: "rarely",
    whoItsFor: "A planned treat with a salad.",
    skipIf: "You wanted a short-list dinner — dough, tomato, mozzarella is a 20-minute job.",
    highlights: ["Palm oil in the base", "Salty", "Ultra-processed"],
  },
  "8500108320669": {
    verdict: "A salty brick with dye and BHA. Emergency only.",
    story:
      "Instant noodles are palm oil, salt, MSG, and a colour. They fill a gap. They should not be the gap.",
    packSize: "85 g",
    howOften: "skip",
    whoItsFor: "Travel days, if nothing else is open.",
    skipIf: "You have a kitchen, even a kettle and a bag of oats.",
    highlights: ["Very salty", "Palm oil", "Dye and BHA"],
  },
  "8500108320676": {
    verdict: "Mostly water, a little almond, added sugar. Oat unsweetened is the better pour.",
    story:
      "Sweetened almond drinks are a nut flavour in a sugar water. Fine in coffee. A poor pint of ‘milk’ for a child.",
    packSize: "1 L",
    howOften: "sometimes",
    whoItsFor: "Coffee, when you want a splash of nut.",
    skipIf: "You wanted protein, or a no-sugar pour.",
    highlights: ["Low almond", "Added sugar", "Low protein"],
  },
  "8500108320683": {
    verdict: "Oats and water, unsweetened. The plant pour we’d keep.",
    story:
      "Organic oats, a little sunflower oil, salt. No sugar on the list. It will not match cow’s milk for protein — nothing in this aisle does — but it is an honest drink.",
    packSize: "1 L",
    howOften: "everyday",
    whoItsFor: "Coffee, cereal, cooking. Coeliac: check the gluten-free mark.",
    skipIf: "You needed milk’s protein, or you cannot eat oats.",
    highlights: ["Unsweetened", "Organic oats", "Short list"],
  },
  "8500108320690": {
    verdict: "Peanuts, then sugar and palm. Buy the jar that is just peanuts.",
    story:
      "Creamy supermarket peanut spread is often a dessert wearing a nut costume. The peanuts are real. The sugar and palm oil are why it never separates.",
    packSize: "340 g",
    howOften: "rarely",
    whoItsFor: "People who want that specific sweet-salty spread.",
    skipIf: "Peanut allergy, or you wanted a nut butter.",
    highlights: ["Added sugar", "Palm oil", "Salty"],
  },
  "8500108320706": {
    verdict: "Peanuts and a little salt. Stir it. A keep.",
    story:
      "Organic peanuts, sea salt. It will separate. That is how you know nobody invited palm oil to the jar.",
    packSize: "340 g",
    howOften: "everyday",
    whoItsFor: "Toast, apples, a spoon. Peanut allergy: skip.",
    skipIf: "Peanut allergy.",
    highlights: ["Two ingredients", "No palm", "No sugar"],
  },
  "8500108320713": {
    verdict: "A sweet sparkling lemon. A party pour, not a water.",
    story:
      "Limonata is sugar and citrus in bubbles. Pleasant. Still a soda.",
    packSize: "330 ml",
    howOften: "rarely",
    whoItsFor: "A warm afternoon, on purpose.",
    skipIf: "You were thirsty — drink water, then have this if you still want it.",
    highlights: ["Around two teaspoons of sugar in 100 ml", "Fizz", "A little lemon"],
  },
  "8500108320805": {
    verdict: "A scented foundation with paraben and dye. Tinted mineral is the calmer face.",
    story:
      "Radiance is slip, perfume, and a preservative. Makeup can be simple. This one is not.",
    packSize: "30 ml",
    howOften: "skip",
    whoItsFor: "People who want that specific finish and accept the extras.",
    skipIf: "Sensitive skin, pregnancy, fragrance avoidance.",
    highlights: ["Fragrance", "Paraben", "Silicone-heavy"],
  },
  "8500108320812": {
    verdict: "A tinted zinc. Coverage with a sun filter, and a short list.",
    story:
      "Mineral veil is zinc in a fat base. It evens tone and earns its keep in daylight. White-cast is milder when tinted.",
    packSize: "30 ml",
    howOften: "everyday",
    whoItsFor: "Barely-makeup days, pregnancy, sensitive skin.",
    skipIf: "You need full glam coverage — this is a veil, not a mask.",
    highlights: ["Zinc oxide", "No fragrance", "Organic fats"],
  },
  "8500108320829": {
    verdict: "A scented spray with triclosan. A salt stone will do the job.",
    story:
      "Cloud Deodorant is alcohol, perfume, and an antibacterial we don’t need in an armpit. Leave-on, all day.",
    packSize: "150 ml",
    howOften: "skip",
    whoItsFor: "People chasing that specific scent.",
    skipIf: "Sensitive skin, pregnancy, fragrance avoidance.",
    highlights: ["Triclosan", "Fragrance", "Alcohol denat."],
  },
  "8500108320836": {
    verdict: "A mineral stone. Quiet, and enough for most days.",
    story:
      "Salt and glycerin. No perfume, no antibacterial theatre. Pat it on damp skin. That’s the whole routine.",
    packSize: "One stone",
    howOften: "everyday",
    whoItsFor: "Unscented households, sensitive skin.",
    skipIf: "You need a heavy antiperspirit for a medical reason — talk to a pharmacist.",
    highlights: ["Two ingredients", "No fragrance", "No triclosan"],
  },
  "8500108320843": {
    verdict: "A glossy, scented, dyed lip. Pretty. Not a balm.",
    story:
      "Glass Lip Gloss is silicone and perfume on the mouth — a mucous membrane. Fine for an evening. A poor everyday chapstick.",
    packSize: "8 ml",
    howOften: "rarely",
    whoItsFor: "A night out.",
    skipIf: "You wanted moisture, or you avoid fragrance on lips.",
    highlights: ["Fragrance", "Dye", "Paraben"],
  },
  "8500108320850": {
    verdict: "Shea and olive on the lips. A keep in every pocket.",
    story:
      "A balm with a short list. No flavour, no shimmer. Put it on and forget it.",
    packSize: "10 ml",
    howOften: "everyday",
    whoItsFor: "Everyone, including children.",
    skipIf: "You want a flavoured gloss — that’s a different product.",
    highlights: ["Short list", "Unscented", "Organic fats"],
  },
  "8500108320904": {
    verdict: "A dyed chew with BHA. Dogs do not need a yellow stick.",
    story:
      "Dental sticks are often flour, glue, and a preservative. The teeth story is marketing. The dye is for the shopper.",
    packSize: "7 sticks",
    howOften: "skip",
    whoItsFor: "Nobody we’d choose.",
    skipIf: "You can buy a named-meat chew.",
    highlights: ["BHA", "Yellow dye", "Wheat-led"],
  },
  "8500108320911": {
    verdict: "Air-dried chicken. A chew you can read.",
    story:
      "Organic chicken, tocopherols. That’s a treat that still looks like food.",
    packSize: "100 g",
    howOften: "sometimes",
    whoItsFor: "Most dogs. Use as a treat, not a meal.",
    skipIf: "Chicken allergy, or a dog who cannot have chews (vet advice).",
    highlights: ["Named meat", "No dye", "Very high protein"],
  },
};

export function productStory(product: Pick<EvaluatedProduct, "barcode" | "score" | "type">): ProductStory {
  const hit = PRODUCT_STORIES[product.barcode];
  if (hit) return hit;
  return {
    verdict: bandSentence(product.score.overall, product.type),
    story: "We scored this from the nutrition box and the ingredient list on the pack.",
    howOften: product.score.overall >= 75 ? "everyday" : product.score.overall >= 50 ? "sometimes" : product.score.overall >= 25 ? "rarely" : "skip",
    whoItsFor: "Anyone comparing similar products in this aisle.",
    skipIf: "It clashes with the notes you keep in your profile — allergens, diet, or extras you asked us to flag.",
    highlights: [],
  };
}
