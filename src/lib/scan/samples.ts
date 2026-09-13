/** Packs we can open without a camera — preview, desktop, and permission-off phones. */
export const SAMPLE_PACKS = [
  { barcode: "5449000000996", title: "Coca-Cola", image: "/packs/5449000000996.jpg" },
  { barcode: "3274080005003", title: "Evian", image: "/packs/3274080005003.jpg" },
  { barcode: "3337875598071", title: "CeraVe Cleanser", image: "/packs/3337875598071.jpg" },
  { barcode: "3017620422003", title: "Nutella", image: "/packs/3017620422003.jpg" },
  { barcode: "009800830039", title: "Nutella Biscuits", image: "/packs/009800830039.jpg" },
  { barcode: "0810589032602", title: "Granola", image: "/packs/0810589032602.jpg" },
] as const;

/** Three physical packs for a live presenter. Print these codes. */
export const DEMO_SCRIPT = [
  {
    barcode: "5449000000996",
    title: "Coca-Cola Classic",
    role: "The treat",
    expect: "Poor. Ultra-processed. A can is a dessert, not a pour.",
  },
  {
    barcode: "3274080005003",
    title: "Evian",
    role: "The keep",
    expect: "Excellent. Water. Neighbour to the cola.",
  },
  {
    barcode: "3337875598071",
    title: "CeraVe Foaming Cleanser",
    role: "The bathroom",
    expect: "A cream with a short-enough list. Beauty uses the same 0–100 disc.",
  },
] as const;
