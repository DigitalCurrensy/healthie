/** Proven fronts only. image_front_small_url from OFF/OBF with matching brand. */

export type PackFront = { gtin: string; frontUrl: string };

const FRONT_BY_KEY: Record<string, PackFront> = {
  "coca-cola classic": {
    gtin: "5000112548068",
    frontUrl: "https://images.openfoodfacts.org/images/products/500/011/254/8068/front_de.82.400.jpg",
  },
  "coca-cola": {
    gtin: "5000112548068",
    frontUrl: "https://images.openfoodfacts.org/images/products/500/011/254/8068/front_de.82.400.jpg",
  },
  evian: {
    gtin: "3068320055008",
    frontUrl: "https://images.openfoodfacts.org/images/products/306/832/005/5008/front_en.179.400.jpg",
  },
  "evian natural mineral water": {
    gtin: "3068320055008",
    frontUrl: "https://images.openfoodfacts.org/images/products/306/832/005/5008/front_en.179.400.jpg",
  },
  nutella: {
    gtin: "3017620425035",
    frontUrl: "https://images.openfoodfacts.org/images/products/301/762/042/5035/front_en.583.400.jpg",
  },
  "nutella biscuits": {
    gtin: "8000500310397",
    frontUrl: "https://images.openfoodfacts.org/images/products/800/050/031/0397/front_en.303.200.jpg",
  },
  "alpro oat": {
    gtin: "5411188123132",
    frontUrl: "https://images.openfoodfacts.org/images/products/541/118/812/3132/front_en.66.200.jpg",
  },
  "alpro soya original": {
    gtin: "5411188121923",
    frontUrl: "https://images.openfoodfacts.org/images/products/541/118/812/1923/front_en.23.200.jpg",
  },
  "amy's lentil soup": {
    gtin: "042272005024",
    frontUrl: "https://images.openfoodfacts.org/images/products/004/227/200/5024/front_en.35.200.jpg",
  },
  "annie's cheddar bunnies": {
    gtin: "013562494019",
    frontUrl: "https://images.openfoodfacts.org/images/products/001/356/249/4019/front_en.13.200.jpg",
  },
  "annie's organic bunny grahams honey": {
    gtin: "013562000159",
    frontUrl: "https://images.openfoodfacts.org/images/products/001/356/200/0159/front_en.31.200.jpg",
  },
  "annie's organic macaroni & cheese": {
    gtin: "013562000043",
    frontUrl: "https://images.openfoodfacts.org/images/products/001/356/200/0043/front_en.58.200.jpg",
  },
  "applegate naturals uncured ham": {
    gtin: "025317005906",
    frontUrl: "https://images.openfoodfacts.org/images/products/002/531/700/5906/front_en.27.200.jpg",
  },
  "365 organic black beans": {
    gtin: "099482452704",
    frontUrl: "https://images.openfoodfacts.org/images/products/009/948/245/2704/front_en.8.200.jpg",
  },
  "365 organic rolled oats": {
    gtin: "099482479732",
    frontUrl: "https://images.openfoodfacts.org/images/products/009/948/247/9732/front_en.35.200.jpg",
  },
  "365 spring water": {
    gtin: "099482514389",
    frontUrl: "https://images.openfoodfacts.org/images/products/009/948/251/4389/front_en.10.200.jpg",
  },
  "activia nature": {
    gtin: "3033491147067",
    frontUrl: "https://images.openfoodfacts.org/images/products/303/349/114/7067/front_fr.121.200.jpg",
  },
  "arizona green tea with ginseng and honey": {
    gtin: "0613008724221",
    frontUrl: "https://images.openfoodfacts.org/images/products/061/300/872/4221/front_en.47.200.jpg",
  },
  "aveeno daily moisturizing lotion": {
    gtin: "0381370038443",
    frontUrl: "https://images.openbeautyfacts.org/images/products/038/137/003/8443/front_en.16.200.jpg",
  },
  "almond butter & berries protein ancient grain granola": {
    gtin: "0810589032312",
    frontUrl: "https://images.openfoodfacts.org/images/products/081/058/903/2312/front_en.220.200.jpg",
  },
  "athletic brewing run wild ipa": {
    gtin: "0855352008057",
    frontUrl: "https://images.openfoodfacts.org/images/products/085/535/200/8057/front_en.6.200.jpg",
  },
  "airheads white mystery": {
    gtin: "0073390002213",
    frontUrl: "https://images.openfoodfacts.org/images/products/007/339/000/2213/front_en.30.200.jpg",
  },
};

function key(title?: string | null): string {
  return `${title || ""}`.trim().toLowerCase().replace(/\s+/g, " ");
}

export function packFrontFor(title?: string | null, _brand?: string | null): PackFront | null {
  return FRONT_BY_KEY[key(title)] ?? null;
}

export function realGtinFor(title?: string | null, brand?: string | null): string | null {
  return packFrontFor(title, brand)?.gtin ?? null;
}

export function frontUrlFor(title?: string | null, brand?: string | null): string | null {
  return packFrontFor(title, brand)?.frontUrl ?? null;
}

export const HERO_FRONTS = {
  coke: FRONT_BY_KEY["coca-cola classic"]!.frontUrl,
  evian: FRONT_BY_KEY.evian!.frontUrl,
} as const;
