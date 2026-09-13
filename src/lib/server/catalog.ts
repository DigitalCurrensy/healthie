import { getSql } from "@/lib/db";
import { barcodeVariants } from "@/lib/utils";
import { INGREDIENTS } from "@/lib/catalog/ingredients";
import { PRODUCTS } from "@/lib/catalog/products";
import { evaluateDef, type EvaluatedProduct } from "@/lib/catalog/evaluate";
import { ingredientsByIds, parseIngredients } from "@/lib/catalog/match";
import { matchCatalogName } from "@/lib/catalog/lookup";
import { productAllergens, productConcerns } from "@/lib/catalog/flags";
import { cosineSimilarity, scoreProduct } from "@/lib/scoring";
import type { MatchedIngredient, Nutrition, ProductType } from "@/lib/scoring";
import { recordIsScorable } from "@/lib/catalog/quality";
import { AISLES } from "@/lib/catalog/aisles";
import type { LabCard, LabReport } from "@/lib/catalog/lab-insights";

const SEED_VERSION = 22;

const globalRef = globalThis as typeof globalThis & {
  __healthieSeed__?: Promise<void>;
  __healthieSeedVersion__?: number;
  __healthieHarvest__?: Promise<void>;
};

export async function ensureCatalog(): Promise<void> {
  if (globalRef.__healthieSeedVersion__ !== SEED_VERSION) {
    globalRef.__healthieSeed__ = undefined;
    globalRef.__healthieHarvest__ = undefined;
    globalRef.__healthieSeedVersion__ = SEED_VERSION;
  }
  globalRef.__healthieSeed__ ??= (async () => {
    const sql = await getSql();
    await purgeJunk(sql);
    const [{ n: ingN } = { n: 0 }] = await sql<{ n: number }>`select count(*)::int as n from ingredients`;
    if (ingN < INGREDIENTS.length) {
      for (const ing of INGREDIENTS) {
        await sql.query(
          `insert into ingredients
            (id, name, aliases, inci_code, e_number, hazard_rating, risk_class, kind, is_additive, description)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           on conflict (id) do update set
             name = excluded.name,
             aliases = excluded.aliases,
             hazard_rating = excluded.hazard_rating,
             risk_class = excluded.risk_class,
             description = excluded.description`,
          [
            ing.id,
            ing.name,
            JSON.stringify(ing.aliases),
            ing.inciCode ?? null,
            ing.eNumber ?? null,
            ing.hazard,
            ing.riskClass,
            ing.kind,
            ing.isAdditive,
            ing.description,
          ],
        );
      }
    }
    for (const def of PRODUCTS) {
      await upsertEvaluated(evaluateDef(def));
    }
    kickWorld();
  })().catch((err) => {
    globalRef.__healthieSeed__ = undefined;
    throw err;
  });
  await globalRef.__healthieSeed__;
}

async function purgeJunk(sql: Awaited<ReturnType<typeof getSql>>): Promise<void> {
  await sql.query(
    `delete from product_ingredients where product_id in (
       select id from products
       where gtin_barcode like '85001083%'
          or brand ilike '%grove atelier%'
          or brand ilike '%healthie pantry%'
          or brand ilike '%maison bloom%'
          or lower(title) in (
            'test product','test product product','scanned product','scanned label','scanned pack','unknown'
          )
     )`,
  );
  await sql.query(
    `delete from products
     where gtin_barcode like '85001083%'
        or brand ilike '%grove atelier%'
        or brand ilike '%healthie pantry%'
        or brand ilike '%maison bloom%'
        or lower(title) in (
          'test product','test product product','scanned product','scanned label','scanned pack','unknown'
        )`,
  );
}

function kickWorld() {
  if (globalRef.__healthieHarvest__) return;
  globalRef.__healthieHarvest__ = (async () => {
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const { refreshWorldIndex } = await import("./dump");
    await refreshWorldIndex();
  })().catch(() => {
    globalRef.__healthieHarvest__ = undefined;
  });
}

function pgFloat8Literal(vec: number[]): string {
  return `{${vec.map((n) => (Number.isFinite(n) ? n.toFixed(6) : "0")).join(",")}}`;
}

export async function upsertEvaluated(
  ev: EvaluatedProduct,
  opts?: { protectCatalog?: boolean },
): Promise<void> {
  const sql = await getSql();
  if (opts?.protectCatalog) {
    const existing = await sql<{ source: string }>`
      select source from products where gtin_barcode = ${ev.barcode} limit 1`;
    if (existing[0]?.source === "catalog") return;
  }
  await sql.query(
    `insert into products (
      id, gtin_barcode, title, brand, type, category_path, is_organic,
      overall_score, nutri_raw, nutrition_score, additive_score, additive_count,
      image_url, ingredients_text, nutrition, embedding, embedding_vec, source, nova_group,
      eco_score, flags, updated_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, now())
    on conflict (gtin_barcode) do update set
      title = excluded.title,
      brand = excluded.brand,
      type = excluded.type,
      category_path = excluded.category_path,
      is_organic = excluded.is_organic,
      overall_score = excluded.overall_score,
      nutri_raw = excluded.nutri_raw,
      nutrition_score = excluded.nutrition_score,
      additive_score = excluded.additive_score,
      additive_count = excluded.additive_count,
      image_url = excluded.image_url,
      ingredients_text = excluded.ingredients_text,
      nutrition = excluded.nutrition,
      embedding = excluded.embedding,
      embedding_vec = excluded.embedding_vec,
      source = excluded.source,
      nova_group = excluded.nova_group,
      eco_score = excluded.eco_score,
      flags = excluded.flags,
      updated_at = now()`,
    [
      ev.id,
      ev.barcode,
      ev.title,
      ev.brand,
      ev.type,
      ev.categoryPath,
      ev.isOrganic,
      ev.score.overall,
      ev.score.type === "cosmetic" ? null : ev.score.nutriRaw,
      ev.score.type === "cosmetic" ? ev.score.compositionScore : ev.score.nutritionScore,
      ev.score.type === "cosmetic" ? null : ev.score.additiveScore,
      ev.additiveCount,
      ev.imageUrl,
      ev.ingredientsText,
      ev.nutrition ? JSON.stringify(ev.nutrition) : null,
      JSON.stringify(ev.embedding),
      ev.embedding,
      ev.source,
      ev.novaGroup,
      ev.ecoScore,
      JSON.stringify(ev.flags),
    ],
  );
  await sql.query(`delete from product_ingredients where product_id = $1`, [ev.id]);
  for (let i = 0; i < ev.ingredients.length; i += 1) {
    const ing = ev.ingredients[i]!;
    await sql.query(
      `insert into product_ingredients (product_id, ingredient_id, position)
       values ($1,$2,$3) on conflict do nothing`,
      [ev.id, ing.id, i],
    );
  }
}

type ProductRow = {
  id: string;
  gtin_barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  category_path: string;
  is_organic: boolean;
  overall_score: number;
  nutri_raw: number | null;
  nutrition_score: number | null;
  additive_score: number | null;
  additive_count: number;
  image_url: string | null;
  ingredients_text: string;
  nutrition: Nutrition | string | null;
  embedding: number[] | string | null;
  embedding_vec?: number[] | null;
  source: string;
  nova_group: number | null;
  eco_score?: number | null;
  flags?: string[] | string | null;
  sim?: number;
};

function parseJson<T>(value: T | string | null | undefined): T | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value;
}

async function hydrate(row: ProductRow): Promise<EvaluatedProduct> {
  const sql = await getSql();
  const links = await sql<{ ingredient_id: string }>`
    select ingredient_id from product_ingredients
    where product_id = ${row.id} order by position asc`;
  const ingredients: MatchedIngredient[] = ingredientsByIds(links.map((l) => l.ingredient_id));
  const nutrition = parseJson<Nutrition>(row.nutrition);
  const embedding = parseJson<number[]>(row.embedding) ?? row.embedding_vec ?? [];
  const flags = parseJson<string[]>(row.flags) ?? [];
  const isBeverage = row.category_path.includes("beverage") || /drink|soda|juice|tea|water/i.test(row.title);
  const isWater = /\bwater\b/i.test(row.title) && !/flavour|flavor|juice|tea/i.test(row.title);
  const score = scoreProduct({
    type: row.type,
    nutrition,
    ingredients,
    ingredientsText: row.ingredients_text,
    isOrganic: Boolean(row.is_organic),
    isBeverage,
    isWater,
    categoryPath: row.category_path,
    title: row.title,
    novaGroup: row.nova_group,
  });
  return {
    id: row.id,
    barcode: row.gtin_barcode,
    title: row.title,
    brand: row.brand,
    type: row.type,
    categoryPath: row.category_path,
    category: row.category_path,
    isOrganic: Boolean(row.is_organic),
    isBeverage,
    isWater,
    ingredientsText: row.ingredients_text,
    ingredients,
    unmatched: parseIngredients(row.ingredients_text || "").unmatched,
    nutrition,
    imageUrl: row.image_url,
    novaGroup: score.type === "cosmetic" ? row.nova_group : score.novaGroup,
    source: row.source,
    score,
    embedding,
    additiveCount:
      row.type === "cosmetic"
        ? ingredients.filter((i) => i.hazard !== "green").length
        : ingredients.filter((i) => i.isAdditive).length,
    allergens: productAllergens(ingredients),
    ecoScore: score.type === "cosmetic" ? (row.eco_score ?? 50) : score.ecoScore,
    flags,
    concerns: productConcerns(ingredients),
  };
}

export async function findByBarcode(barcode: string): Promise<EvaluatedProduct | null> {
  const sql = await getSql();
  for (const code of barcodeVariants(barcode)) {
    const rows = await sql<ProductRow>`select * from products where gtin_barcode = ${code} limit 1`;
    if (!rows[0]) continue;
    const product = await hydrate(rows[0]);
    if (
      !recordIsScorable({
        title: product.title,
        type: product.type,
        ingredientsText: product.ingredientsText,
        ingredientCount: product.ingredients.length,
        nutrition: product.nutrition,
        isWater: product.isWater,
      })
    ) {
      if (rows[0].source !== "catalog") {
        await sql.query(`delete from product_ingredients where product_id = $1`, [rows[0].id]);
        await sql.query(`delete from products where id = $1`, [rows[0].id]);
      }
      return null;
    }
    return product;
  }
  return null;
}

/** Front-of-pack name match when the barcode never made it into the photo. */
export async function findByName(title: string, brand?: string): Promise<EvaluatedProduct | null> {
  const def = matchCatalogName(title, brand);
  if (!def) return null;
  return (await findByBarcode(def.barcode)) ?? evaluateDef(def, { source: "ocr" });
}

export async function findByBarcodes(barcodes: string[]): Promise<EvaluatedProduct[]> {
  if (barcodes.length === 0) return [];
  const out: EvaluatedProduct[] = [];
  for (const b of barcodes) {
    const p = await findByBarcode(b);
    if (p) out.push(p);
  }
  return out;
}

export async function searchProducts(query: string): Promise<EvaluatedProduct[]> {
  const sql = await getSql();
  const needle = query.trim().toLowerCase();
  const q = `%${needle}%`;
  const rows = await sql<ProductRow>`
    select * from products
    where lower(title) like ${q} or lower(brand) like ${q} or gtin_barcode like ${q}
    limit 40`;
  const hydrated = await Promise.all(rows.map(hydrate));
  const rank = (p: EvaluatedProduct) => {
    const title = p.title.toLowerCase();
    const brand = p.brand.toLowerCase();
    if (title === needle || brand === needle) return 0;
    if (title.startsWith(needle) || brand.startsWith(needle)) return 1;
    if (title.includes(needle)) return 2;
    if (brand.includes(needle)) return 3;
    return 4;
  };
  return hydrated.sort((a, b) => rank(a) - rank(b) || b.score.overall - a.score.overall).slice(0, 24);
}

export async function listCatalog(filter?: {
  type?: ProductType;
}): Promise<EvaluatedProduct[]> {
  const sql = await getSql();
  const rows = filter?.type
    ? await sql<ProductRow>`
        select * from products where type = ${filter.type}
        order by overall_score desc`
    : await sql<ProductRow>`select * from products order by overall_score desc`;
  return Promise.all(rows.map(hydrate));
}

export async function recommendFor(product: EvaluatedProduct): Promise<EvaluatedProduct[]> {
  const sql = await getSql();
  const literal = pgFloat8Literal(product.embedding);

  const rank = (rows: EvaluatedProduct[]) =>
    rows
      .map((c) => ({
        product: c,
        sim: cosineSimilarity(product.embedding, c.embedding),
        sameCat: c.categoryPath === product.categoryPath ? 1 : 0,
        lift: c.score.overall - product.score.overall,
      }))
      .sort((a, b) => b.sameCat - a.sameCat || b.lift - a.lift || b.sim - a.sim)
      .slice(0, 3)
      .map((r) => r.product);

  try {
    const rows = await sql.query<ProductRow>(
      `select *, cosine_similarity(embedding_vec, $1::float8[]) as sim
       from products
       where type = $2
         and category_path = $3
         and gtin_barcode <> $4
       order by overall_score desc
       limit 8`,
      [literal, product.type, product.categoryPath, product.barcode],
    );
    if (rows.length > 0) return rank(await Promise.all(rows.map(hydrate)));
  } catch {
    /* missing fn — fall through */
  }

  const rows = await sql<ProductRow>`
    select * from products
    where type = ${product.type}
      and gtin_barcode <> ${product.barcode}
    order by overall_score desc
    limit 16`;
  return rank(await Promise.all(rows.map(hydrate)));
}

export type CatalogCard = {
  barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  categoryPath: string;
  isOrganic: boolean;
  overallScore: number;
  imageUrl: string | null;
  additiveCount: number;
};

type CardRow = {
  gtin_barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  category_path: string;
  is_organic: boolean;
  overall_score: number;
  image_url: string | null;
  additive_count: number;
};

function toCard(r: CardRow): CatalogCard {
  return {
    barcode: r.gtin_barcode,
    title: r.title,
    brand: r.brand,
    type: r.type,
    categoryPath: r.category_path,
    isOrganic: Boolean(r.is_organic),
    overallScore: r.overall_score,
    imageUrl: r.image_url,
    additiveCount: r.additive_count,
  };
}

export async function listCards(): Promise<CatalogCard[]> {
  const sql = await getSql();
  const rows = await sql<CardRow>`
    select gtin_barcode, title, brand, type, category_path, is_organic, overall_score, image_url, additive_count
    from products order by brand, title`;
  return rows.map(toCard);
}

export async function listCardsByAisle(path: string, limit = 60): Promise<CatalogCard[]> {
  const sql = await getSql();
  const rows = await sql<CardRow>`
    select gtin_barcode, title, brand, type, category_path, is_organic, overall_score, image_url, additive_count
    from products
    where category_path = ${path}
    order by overall_score desc
    limit ${limit}`;
  return rows.map(toCard);
}

export async function barcodesInAisle(path: string): Promise<Set<string>> {
  const sql = await getSql();
  const rows = await sql<{ gtin_barcode: string }>`
    select gtin_barcode from products where category_path = ${path}`;
  return new Set(rows.map((r) => r.gtin_barcode));
}

export async function listCardsForBrand(name: string, limit = 60): Promise<CatalogCard[]> {
  const sql = await getSql();
  const rows = await sql<CardRow>`
    select gtin_barcode, title, brand, type, category_path, is_organic, overall_score, image_url, additive_count
    from products
    where lower(brand) = ${name.toLowerCase()}
    order by overall_score desc
    limit ${limit}`;
  return rows.map(toCard);
}

export async function getIngredient(id: string) {
  const ing = INGREDIENTS.find((i) => i.id === id);
  if (!ing) return null;
  const sql = await getSql();
  const rows = await sql<{ gtin_barcode: string; title: string; overall_score: number; type: ProductType }>`
    select p.gtin_barcode, p.title, p.overall_score, p.type
    from products p
    join product_ingredients pi on pi.product_id = p.id
    where pi.ingredient_id = ${id}
    order by p.overall_score asc
    limit 12`;
  return { ingredient: ing, products: rows };
}

const FEATURED_CODES = [
  "009800830039",
  "0810589032602",
  "099482513931",
  "5449000000996",
  "3017620422003",
  "3274080005003",
  "012000001258",
  "028400064057",
];

export async function listFeaturedCards(): Promise<CatalogCard[]> {
  const sql = await getSql();
  const rows = await sql<{
    gtin_barcode: string;
    title: string;
    brand: string;
    type: ProductType;
    category_path: string;
    is_organic: boolean;
    overall_score: number;
    image_url: string | null;
    additive_count: number;
  }>`select gtin_barcode, title, brand, type, category_path, is_organic, overall_score, image_url, additive_count
     from products
     order by overall_score desc`;
  const wanted = new Set(FEATURED_CODES);
  const picked: typeof rows = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (wanted.has(r.gtin_barcode) && !seen.has(r.gtin_barcode)) {
      picked.push(r);
      seen.add(r.gtin_barcode);
    }
  }
  for (const r of rows) {
    if (picked.length >= 18) break;
    if (seen.has(r.gtin_barcode)) continue;
    seen.add(r.gtin_barcode);
    picked.push(r);
  }
  return picked.map((r) => ({
    barcode: r.gtin_barcode,
    title: r.title,
    brand: r.brand,
    type: r.type,
    categoryPath: r.category_path,
    isOrganic: Boolean(r.is_organic),
    overallScore: r.overall_score,
    imageUrl: r.image_url,
    additiveCount: r.additive_count,
  }));
}

export async function shelfInsights(): Promise<LabReport> {
  const sql = await getSql();
  const totals = await sql<{ n: number; brands: number; avg: number }>`
    select count(*)::int as n,
           count(distinct brand)::int as brands,
           coalesce(round(avg(overall_score))::int, 0) as avg
    from products`;
  const n = totals[0]?.n ?? 0;
  const brandCount = totals[0]?.brands ?? 0;
  const avgScore = totals[0]?.avg ?? 0;

  const bandRows = await sql<{ band: string; n: number }>`
    select case
             when overall_score >= 75 then 'excellent'
             when overall_score >= 50 then 'good'
             when overall_score >= 25 then 'poor'
             else 'bad'
           end as band,
           count(*)::int as n
    from products group by 1`;
  const bandMap = new Map(bandRows.map((b) => [b.band, b.n]));
  const bands = [
    { key: "excellent", label: "Excellent", n: bandMap.get("excellent") ?? 0 },
    { key: "good", label: "Good", n: bandMap.get("good") ?? 0 },
    { key: "poor", label: "Poor", n: bandMap.get("poor") ?? 0 },
    { key: "bad", label: "Avoid", n: bandMap.get("bad") ?? 0 },
  ];

  const typeRows = await sql<{ type: ProductType; avg: number; n: number }>`
    select type, coalesce(round(avg(overall_score))::int, 0) as avg, count(*)::int as n
    from products group by type`;
  const typeMap = new Map(typeRows.map((t) => [t.type, t]));

  const nova = await sql<{ nova4: number; food: number }>`
    select
      count(*) filter (where type = 'food' and nova_group = 4)::int as nova4,
      count(*) filter (where type = 'food')::int as food
    from products`;
  const nova4Pct = nova[0]?.food ? Math.round((nova[0].nova4 / nova[0].food) * 100) : 0;

  const org = await sql<{ organic: number | null; conventional: number | null }>`
    select
      round(avg(overall_score) filter (where is_organic))::int as organic,
      round(avg(overall_score) filter (where not is_organic))::int as conventional
    from products`;
  const organicAvg = org[0]?.organic ?? null;
  const conventionalAvg = org[0]?.conventional ?? null;

  const aisleAgg = await sql<{
    category_path: string;
    n: number;
    avg: number;
  }>`
    select category_path, count(*)::int as n, coalesce(round(avg(overall_score))::int, 0) as avg
    from products group by category_path`;
  const bestRows = await sql<{
    category_path: string;
    gtin_barcode: string;
    title: string;
    brand: string;
    overall_score: number;
    type: ProductType;
    is_organic: boolean;
  }>`
    select distinct on (category_path)
      category_path, gtin_barcode, title, brand, overall_score, type, is_organic
    from products
    order by category_path, overall_score desc`;
  const worstRows = await sql<{
    category_path: string;
    gtin_barcode: string;
    title: string;
    brand: string;
    overall_score: number;
    type: ProductType;
    is_organic: boolean;
  }>`
    select distinct on (category_path)
      category_path, gtin_barcode, title, brand, overall_score, type, is_organic
    from products
    order by category_path, overall_score asc`;

  const toCard = (r: (typeof bestRows)[number]): LabCard => ({
    barcode: r.gtin_barcode,
    title: r.title,
    brand: r.brand,
    score: r.overall_score,
    categoryPath: r.category_path,
    type: r.type,
    isOrganic: Boolean(r.is_organic),
  });
  const bestMap = new Map(bestRows.map((r) => [r.category_path, toCard(r)]));
  const worstMap = new Map(worstRows.map((r) => [r.category_path, toCard(r)]));
  const countMap = new Map(aisleAgg.map((a) => [a.category_path, a]));

  const aisles = AISLES.map((a) => {
    const agg = countMap.get(a.path);
    const best = bestMap.get(a.path);
    const worst = worstMap.get(a.path);
    if (!agg || !best || !worst) return null;
    return {
      slug: a.slug,
      path: a.path,
      title: a.title,
      n: agg.n,
      avg: agg.avg,
      best,
      worst,
    };
  }).filter((x): x is NonNullable<typeof x> => Boolean(x));
  aisles.sort((a, b) => a.avg - b.avg);

  const extraRows = await sql<{ id: string; n: number }>`
    select i.id, count(*)::int as n
    from product_ingredients pi
    join ingredients i on i.id = pi.ingredient_id
    where i.is_additive and i.risk_class <> 'none'
    group by i.id
    order by n desc
    limit 8`;
  const extras = extraRows.map((e) => {
    const def = INGREDIENTS.find((i) => i.id === e.id);
    return { id: e.id, name: def?.name ?? e.id, n: e.n, riskClass: def?.riskClass ?? "low" };
  });

  const swaps = aisles
    .filter((a) => a.best.score - a.worst.score >= 25)
    .map((a) => ({ from: a.worst, to: a.best, lift: a.best.score - a.worst.score }))
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 6);

  const high = await sql<{ n: number }>`
    select count(distinct p.id)::int as n
    from products p
    join product_ingredients pi on pi.product_id = p.id
    join ingredients i on i.id = pi.ingredient_id
    where i.risk_class = 'high'`;
  const highRiskPct = n ? Math.round(((high[0]?.n ?? 0) / n) * 100) : 0;

  return {
    productCount: n,
    brandCount,
    aisleCount: aisles.length,
    avgScore,
    nova4Pct,
    highRiskPct,
    organicAvg,
    conventionalAvg,
    organicDelta:
      organicAvg != null && conventionalAvg != null ? organicAvg - conventionalAvg : null,
    bands,
    aisles,
    extras,
    swaps,
    foodAvg: typeMap.get("food")?.avg ?? null,
    cosmeticAvg: typeMap.get("cosmetic")?.avg ?? null,
    petAvg: typeMap.get("pet")?.avg ?? null,
  };
}
