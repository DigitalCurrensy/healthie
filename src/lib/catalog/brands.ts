import { PRODUCTS } from "./products";
import { slugify } from "@/lib/utils";

export type BrandCard = {
  slug: string;
  name: string;
  count: number;
  types: string[];
};

export function brandSlug(name: string): string {
  return slugify(name) || "brand";
}

export function allBrands(): BrandCard[] {
  const map = new Map<string, BrandCard>();
  for (const p of PRODUCTS) {
    const slug = brandSlug(p.brand);
    const cur = map.get(slug);
    if (!cur) {
      map.set(slug, { slug, name: p.brand, count: 1, types: [p.type] });
    } else {
      cur.count += 1;
      if (!cur.types.includes(p.type)) cur.types.push(p.type);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function brandBySlug(slug: string): BrandCard | undefined {
  return allBrands().find((b) => b.slug === slug);
}

export function productsForBrand(slug: string) {
  return PRODUCTS.filter((p) => brandSlug(p.brand) === slug);
}
