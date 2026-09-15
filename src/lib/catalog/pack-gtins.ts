/** Proven Open Food Facts fronts only. Status=1 and image_front_small_url present. */

export type PackFront = { gtin: string; frontUrl: string };

const FRONT_BY_KEY: Record<string, PackFront> = {
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
  "coca-cola classic": {
    gtin: "5449000000996",
    frontUrl: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.200.jpg",
  },
  "coca-cola": {
    gtin: "5449000000996",
    frontUrl: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.200.jpg",
  },
  "evian natural mineral water": {
    gtin: "3274080005003",
    frontUrl: "https://images.openfoodfacts.org/images/products/327/408/000/5003/front_en.797.200.jpg",
  },
  "nutella": {
    gtin: "3017620422003",
    frontUrl: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.200.jpg",
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
