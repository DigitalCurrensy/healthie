import { parseIngredients } from "@/lib/catalog/match";
import { evaluateDef, type EvaluatedProduct } from "@/lib/catalog/evaluate";
import { matchCatalogName } from "@/lib/catalog/lookup";
import type { ProductDef } from "@/lib/catalog/products";
import { recordIsScorable, titleLooksLikeWater } from "@/lib/catalog/quality";
import { categoryBucket, type Nutrition } from "@/lib/scoring";
import { findByBarcode } from "./catalog";
import { lookupOpenFacts, searchOpenWorld } from "./off";

const SYSTEM = `You extract structured product-label data from a photo of a food, drink, beauty, or pet pack.
The photo is often the FRONT of the pack: a big brand, a flavour line, a net weight. There may be no barcode and no nutrition table. Still read the largest words.
Return JSON only, no markdown. Schema:
{
  "title": string,
  "brand": string,
  "type": "food" | "cosmetic" | "pet",
  "category": string,
  "isOrganic": boolean,
  "isBeverage": boolean,
  "isWater": boolean,
  "barcode": string | null,
  "ingredientsText": string,
  "nutrition": {
    "energyKj": number,
    "sugars": number,
    "saturatedFat": number,
    "salt": number,
    "fiber": number,
    "protein": number,
    "fruitsVegetables": number
  } | null
}
Nutrition values are per 100g/100ml. If a field is unknown use 0 or null. Prefer English INCI / E-numbers in ingredientsText.
Title should be the product name as printed (e.g. "Nutella Biscuits", "Almond Butter & Berries Protein Ancient Grain Granola", "Alkaline & Electrolyte Water"), not a marketing slogan.`;

const FRONT_PROMPT =
  "Read this pack. It may be the front only — no barcode, no nutrition box. Extract the brand and the product name from the largest type. If a barcode is visible, include the digits. If an ingredient list or nutrition table is visible, extract those. JSON only.";

type Extracted = {
  title?: string;
  brand?: string;
  type?: "food" | "cosmetic" | "pet";
  category?: string;
  isOrganic?: boolean;
  isBeverage?: boolean;
  isWater?: boolean;
  barcode?: string | null;
  ingredientsText?: string;
  nutrition?: Nutrition | null;
};

export async function extractLabel(imageBase64: string, mimeType: string): Promise<
  { ok: true; product: EvaluatedProduct } | { ok: false; error: string }
> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Vision analysis is not available in this environment." };
  }

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 900,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: FRONT_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `Vision API returned ${res.status}` };
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  let parsed: Extracted;
  try {
    parsed = JSON.parse(text) as Extracted;
  } catch {
    return { ok: false, error: "Could not parse the label." };
  }

  const title = parsed.title?.trim() || "";
  const brand = parsed.brand?.trim() || "";
  const rawCode = (parsed.barcode || "").replace(/\D/g, "");

  if (rawCode.length >= 8) {
    const known = await findByBarcode(rawCode);
    if (known) return { ok: true, product: known };
    try {
      const remote = await lookupOpenFacts(rawCode);
      if (remote) return { ok: true, product: remote };
    } catch {
      /* world pantry missed — fall through to the name */
    }
  }

  const named = matchCatalogName(title || `${brand} pack`, brand || undefined);
  if (named) {
    const known = await findByBarcode(named.barcode);
    if (known) return { ok: true, product: known };
    return { ok: true, product: evaluateDef(named, { source: "ocr" }) };
  }

  if (title.length >= 4) {
    try {
      const world = await searchOpenWorld([brand, title].filter(Boolean).join(" "));
      const hit = world[0];
      if (hit && nameLooksLike(hit.title, title)) {
        return { ok: true, product: hit };
      }
    } catch {
      /* keep the synthetic pack */
    }
  }

  const ingredientsText = parsed.ingredientsText ?? "";
  const matched = parseIngredients(ingredientsText);
  const type = parsed.type === "cosmetic" ? "cosmetic" : parsed.type === "pet" ? "pet" : "food";
  const isWater = Boolean(parsed.isWater) || titleLooksLikeWater(title);
  if (
    !recordIsScorable({
      title: title || brand,
      type,
      ingredientsText,
      ingredientCount: matched.matched.length,
      nutrition: type === "cosmetic" ? null : parsed.nutrition,
      isWater,
    })
  ) {
    return {
      ok: false,
      error: "We need the ingredient list or the nutrition box — try the back of the pack, well lit.",
    };
  }
  const barcode = rawCode.length >= 8 ? rawCode : `ocr${Date.now().toString().slice(-10)}`;

  const def: ProductDef = {
    barcode,
    title: title || brand,
    brand,
    type,
    categoryPath:
      type === "cosmetic"
        ? parsed.category || "skincare"
        : categoryBucket(parsed.category || title || "staples"),
    isOrganic: Boolean(parsed.isOrganic),
    isBeverage: Boolean(parsed.isBeverage) || /\bwater\b|drink|soda|juice|tea/i.test(title),
    isWater: Boolean(parsed.isWater) || titleLooksLikeWater(title),
    ingredientIds: matched.matched.map((m) => m.id),
    ingredientsText,
    nutrition: type === "cosmetic" ? undefined : parsed.nutrition ?? undefined,
  };

  return {
    ok: true,
    product: evaluateDef(def, { unmatched: matched.unmatched, source: "ocr" }),
  };
}

function nameLooksLike(found: string, query: string): boolean {
  const a = found.toLowerCase();
  const b = query.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  const words = b.split(/\s+/).filter((w) => w.length > 3);
  const hits = words.filter((w) => a.includes(w)).length;
  return words.length > 0 && hits / words.length >= 0.5;
}
