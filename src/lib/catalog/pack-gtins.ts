/** Retail GTINs that return HTTP 200 on Open Food Facts images/products/.../1.jpg. */

const GTIN_BY_KEY: Record<string, string> = {
  "alpro oat": "5411188123132",
  "alpro soya original": "5411188121923",
  "amy's lentil soup": "042272005024",
  "annie's cheddar bunnies": "013562494019",
  "annie's organic bunny grahams honey": "013562000159",
  "annie's organic macaroni & cheese": "013562000043",
  "applegate naturals uncured ham": "025317005906",
  "applegate organic roast turkey": "025317005715",
  "applegate organic roasted turkey": "025317005715",
  "365 organic black beans": "099482452704",
  "365 organic rolled oats": "099482479732",
  "365 spring water": "099482514389",
  "activia nature": "3033491147067",
  "airheads white mystery": "073390002213",
  "athletic brewing run wild ipa": "855352008057",
};

function key(title?: string | null): string {
  return `${title || ""}`.trim().toLowerCase().replace(/\s+/g, " ");
}

export function realGtinFor(title?: string | null, _brand?: string | null): string | null {
  const k = key(title);
  if (GTIN_BY_KEY[k]) return GTIN_BY_KEY[k];
  for (const [name, gtin] of Object.entries(GTIN_BY_KEY)) {
    if (k === name) return gtin;
  }
  return null;
}
