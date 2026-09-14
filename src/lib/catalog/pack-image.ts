import type { ProductType } from "@/lib/scoring/types";
import { normalizeBarcode } from "@/lib/utils";
import { isDemoBarcode } from "./quality";

export function isGenericStill(url?: string | null): boolean {
  if (!url) return true;
  return url.startsWith("/images/");
}

export function realPackUrl(url?: string | null): string | null {
  if (!url || isGenericStill(url)) return null;
  return url;
}

function rawDigits(barcode?: string | null): string {
  return (barcode || "").replace(/\D/g, "");
}

function isSyntheticBarcode(digits: string): boolean {
  return digits.startsWith("2092");
}

export function localPackUrl(barcode?: string | null): string | null {
  const d = rawDigits(barcode);
  if (!d || isDemoBarcode(d) || isSyntheticBarcode(d) || d.length < 8 || d.length > 14) return null;
  return `/packs/${d}.jpg`;
}

const BRAND_PAINT: Array<{ test: RegExp; fill: string; ink: string }> = [
  { test: /diet coke|coca-cola zero|coke zero/, fill: "#C5C7C9", ink: "#1A1A1A" },
  { test: /coca-cola|coke/, fill: "#E41C23", ink: "#1A0A0A" },
  { test: /pepsi/, fill: "#004B93", ink: "#0A1628" },
  { test: /sprite/, fill: "#00A651", ink: "#063318" },
  { test: /fanta/, fill: "#FF8A00", ink: "#4A2200" },
  { test: /red bull/, fill: "#0033A0", ink: "#C5A059" },
  { test: /gatorade/, fill: "#FF6A00", ink: "#2A1200" },
  { test: /evian/, fill: "#8FD0E8", ink: "#16324A" },
  { test: /perrier/, fill: "#1B7A3A", ink: "#06180C" },
  { test: /pellegrino/, fill: "#1E4D8C", ink: "#F2E6C9" },
  { test: /tropicana/, fill: "#F27D00", ink: "#3A1C00" },
  { test: /heinz/, fill: "#B0102E", ink: "#2A0008" },
  { test: /nutella|ferrero/, fill: "#4A2A14", ink: "#E8C36A" },
  { test: /oreo/, fill: "#1A1A1A", ink: "#F4F0E6" },
  { test: /dorito/, fill: "#E35205", ink: "#2A1000" },
  { test: /walkers|lay's|lays/, fill: "#E10613", ink: "#2A0406" },
  { test: /haribo/, fill: "#E10613", ink: "#FFD200" },
  { test: /barilla/, fill: "#003DA5", ink: "#F4F0E6" },
  { test: /lindt/, fill: "#6B0F1A", ink: "#E8C36A" },
  { test: /activia|danone/, fill: "#5EAF3A", ink: "#14300C" },
  { test: /coco pops|kellogg/, fill: "#6B3A14", ink: "#F4E2C4" },
  { test: /herta/, fill: "#C8102E", ink: "#F4F0E6" },
];

export function packFaceStyle(
  barcode?: string | null,
  title?: string,
  brand?: string,
): { hue: number; background: string; color: string } {
  const blob = `${title || ""} ${brand || ""}`.toLowerCase();
  const painted = BRAND_PAINT.find((row) => row.test.test(blob));
  if (painted) return { hue: 0, background: painted.fill, color: painted.ink };
  const d = rawDigits(barcode) || "0";
  let h = 0;
  for (let i = 0; i < d.length; i += 1) h = (h * 33 + Number(d[i])) % 360;
  return {
    hue: h,
    background: `hsl(${h} 28% 62%)`,
    color: `hsl(${h} 30% 16%)`,
  };
}

export function packToneClass(categoryPath?: string, type?: ProductType): string {
  if (type === "cosmetic") return "pack-skincare";
  if (type === "pet") return "pack-pet";
  if (categoryPath) return `pack-${categoryPath}`;
  return "pack-default";
}

function offHost(type?: ProductType): string {
  if (type === "cosmetic") return "images.openbeautyfacts.org";
  if (type === "pet") return "images.openpetfoodfacts.org";
  return "images.openfoodfacts.org";
}

function offPath(digits: string): string | null {
  const padded = digits.padStart(13, "0");
  if (padded.length !== 13) return null;
  return `${padded.slice(0, 3)}/${padded.slice(3, 6)}/${padded.slice(6, 9)}/${padded.slice(9)}`;
}

export function offPackUrl(barcode?: string | null, type?: ProductType): string | null {
  const d = rawDigits(barcode);
  if (!d || isDemoBarcode(d) || isSyntheticBarcode(d) || d.length < 8 || d.length > 14) return null;
  const path = offPath(d);
  if (!path) return null;
  return `https://${offHost(type)}/images/products/${path}/front_small.jpg`;
}

export function offPackUrls(barcode?: string | null, type?: ProductType): string[] {
  const one = offPackUrl(barcode, type);
  return one ? [one] : [];
}

type SpriteKind = "can" | "bottle" | "jar" | "box" | "bag" | "cup" | "tube" | "tin";

function spriteKind(title: string, brand: string, type?: ProductType, categoryPath?: string): SpriteKind {
  const blob = `${title} ${brand} ${categoryPath || ""}`.toLowerCase();
  if (type === "cosmetic" || /skincare|hair|sun|body|oral|makeup/.test(blob)) {
    if (/shampoo|wash|oil|serum/.test(blob)) return "bottle";
    return "tube";
  }
  if (/water|evian|perrier|pellegrino|juice|tropicana|ketchup|sauce/.test(blob)) return "bottle";
  if (/cola|pepsi|sprite|fanta|red bull|energy|soda|coke|gatorade|bodyarmor|beverage/.test(blob)) return "can";
  if (/nutella|butter|spread|jam|honey/.test(blob)) return "jar";
  if (/yogurt|yoghurt|activia|chobani/.test(blob)) return "cup";
  if (/chip|dorito|lays|walkers|crisp|haribo|gummy|candy|snack/.test(blob)) return "bag";
  if (/tuna|salmon|tin|sardine|ham|bacon|deli|meat/.test(blob)) return "tin";
  return "box";
}

function packShape(kind: SpriteKind, fill: string, ink: string): string {
  if (kind === "can") {
    return `<rect x="96" y="56" width="128" height="288" rx="18" fill="${fill}"/>
      <rect x="96" y="56" width="128" height="22" fill="${ink}"/>
      <rect x="96" y="322" width="128" height="22" fill="${ink}"/>`;
  }
  if (kind === "bottle") {
    return `<rect x="136" y="40" width="48" height="48" fill="${ink}"/>
      <path d="M112 88 L208 88 L220 360 L100 360 Z" fill="${fill}"/>
      <rect x="136" y="40" width="48" height="16" fill="${ink}"/>`;
  }
  if (kind === "jar") {
    return `<rect x="108" y="64" width="104" height="28" fill="${ink}"/>
      <rect x="96" y="92" width="128" height="236" rx="16" fill="${fill}"/>`;
  }
  if (kind === "bag") {
    return `<path d="M84 72 L236 72 L248 340 L72 340 Z" fill="${fill}"/>
      <path d="M84 72 L236 72 L220 108 L100 108 Z" fill="${ink}"/>`;
  }
  if (kind === "cup") {
    return `<path d="M108 96 L212 96 L200 340 L120 340 Z" fill="${fill}"/>
      <ellipse cx="160" cy="96" rx="52" ry="16" fill="${ink}"/>`;
  }
  if (kind === "tube") {
    return `<rect x="124" y="48" width="72" height="28" fill="${ink}"/>
      <rect x="116" y="76" width="88" height="260" rx="8" fill="${fill}"/>`;
  }
  if (kind === "tin") {
    return `<ellipse cx="160" cy="88" rx="92" ry="28" fill="${ink}"/>
      <rect x="68" y="88" width="184" height="220" fill="${fill}"/>
      <ellipse cx="160" cy="308" rx="92" ry="28" fill="${ink}"/>`;
  }
  return `<rect x="72" y="56" width="176" height="288" fill="${fill}"/>
    <rect x="72" y="56" width="176" height="36" fill="${ink}"/>`;
}

export function generatedPackSvg(
  title: string,
  brand: string,
  barcode?: string | null,
  type?: ProductType,
  categoryPath?: string,
): string {
  const face = packFaceStyle(barcode, title, brand);
  const kind = spriteKind(title, brand, type, categoryPath);
  const label = (title || "Pack").slice(0, 18);
  const house = (brand || "").slice(0, 16);
  const paper = face.hue ? `hsl(${face.hue} 10% 91%)` : "#ECE8DF";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
    <rect width="320" height="400" fill="${paper}"/>
    ${packShape(kind, face.background, face.color)}
    <text x="160" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#F7F4EE">${escapeXml(label)}</text>
    <text x="160" y="218" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#F7F4EE">${escapeXml(house)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function packCandidates(
  imageUrl?: string | null,
  barcode?: string | null,
  type?: ProductType,
): string[] {
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u) && !u.startsWith("/images/")) out.push(u);
  };
  add(realPackUrl(imageUrl));
  if (imageUrl?.startsWith("/packs/")) add(imageUrl);
  add(localPackUrl(barcode));
  add(offPackUrl(barcode, type));
  return out.slice(0, 2);
}

export function uniquePackSrc(
  title: string,
  brand: string,
  barcode?: string | null,
  imageUrl?: string | null,
  type?: ProductType,
  categoryPath?: string,
): string[] {
  return [...packCandidates(imageUrl, barcode, type), generatedPackSvg(title, brand, barcode, type, categoryPath)];
}

export function offProductUrl(barcode: string, type: ProductType): string {
  const host =
    type === "cosmetic"
      ? "world.openbeautyfacts.org"
      : type === "pet"
        ? "world.openpetfoodfacts.org"
        : "world.openfoodfacts.org";
  return `https://${host}/product/${normalizeBarcode(barcode)}`;
}

export function packInitial(title: string): string {
  const t = title.trim();
  if (!t) return "H";
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}
