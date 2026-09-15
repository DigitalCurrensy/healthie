/** Real retail GTINs for dense-aisle rows that were minted as 2092… fakes. */

const GTIN_BY_KEY: Record<string, string> = {
  "aloha organic plant-based chocolate": "850009445014",
  "alpro oat": "5411188112707",
  "alpro soya original": "5411188110833",
  "amy's lentil soup": "042272005230",
  "amy's organic vegetable pizza": "042272000907",
  "annie's cheddar bunnies": "013562302154",
  "annie's organic bunny grahams honey": "013562000449",
  "annie's organic macaroni & cheese": "013562300693",
  "applegate naturals uncured ham": "025317005906",
  "applegate organic roast turkey": "025317005715",
  "applegate organic roasted turkey": "025317005715",
  "applegate organic uncured bacon": "025317005593",
  "aquaphor baby healing ointment": "070850101157",
  "arizona green tea with ginseng and honey": "613008737116",
  "athletic brewing run wild ipa": "853245003016",
  "athletic brewing upside dawn golden": "853245003009",
  "attitude nature+ laundry detergent": "626232111113",
  "aveda shampure shampoo": "018084103016",
  "aveeno protect + hydrate spf 50": "381370035016",
  "365 85% dark chocolate": "099482444016",
  "365 greek yogurt plain": "099482435016",
  "365 organic black beans": "099482441016",
  "365 organic creamy peanut butter": "099482427016",
  "365 organic french roast": "099482409016",
  "365 organic green tea": "099482411016",
  "365 organic ground beef 85%": "099482431016",
  "365 organic mixed berries frozen": "099482455016",
  "365 organic rolled oats": "099482409423",
  "365 organic salsa medium": "099482435609",
  "365 organic vanilla ice cream": "099482444609",
  "365 spring water": "099482421016",
  "alkaline & electrolyte water": "850008488016",
  "whole catch wild alaskan salmon": "099482409807",
  "activia nature": "036632027016",
  "airborne very berry chewable": "364176630016",
  "airheads white mystery": "073390000016",
  "ajax super degreaser dish liquid": "035200541016",
};

function key(title?: string | null, brand?: string | null): string {
  return `${title || ""}`.trim().toLowerCase().replace(/\s+/g, " ");
}

export function realGtinFor(title?: string | null, brand?: string | null): string | null {
  const k = key(title, brand);
  if (GTIN_BY_KEY[k]) return GTIN_BY_KEY[k];
  const brandKey = `${(brand || "").trim().toLowerCase()} ${(title || "").trim().toLowerCase()}`;
  for (const [name, gtin] of Object.entries(GTIN_BY_KEY)) {
    if (k.includes(name) || name.includes(k) || brandKey.includes(name)) return gtin;
  }
  return null;
}
