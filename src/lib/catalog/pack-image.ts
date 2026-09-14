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

export function packFaceStyle(barcode?: string | null): { hue: number; background: string; color: string } {
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

function spriteKind(title: string, brand: string, type?: ProductType): SpriteKind {
  const blob = `${title} ${brand}`.toLowerCase();
  if (type === "cosmetic") {
    if (/spf|sun|lotion|cream|balm/.test(blob)) return "tube";
    if (/shampoo|wash|oil/.test(blob)) return "bottle";
    return "tube";
  }
  if (/water|evian|perrier|pellegrino|juice|tropicana|ketchup|sauce/.test(blob)) return "bottle";
  if (/cola|pepsi|sprite|fanta|red bull|energy|soda|coke|gatorade|bodyarmor/.test(blob)) return "can";
  if (/nutella|butter|spread|jam|honey/.test(blob)) return "jar";
  if (/yogurt|yoghurt|activia|chobani|cup/.test(blob)) return "cup";
  if (/chip|dorito|lays|walkers|crisp|haribo|gummy|candy/.test(blob)) return "bag";
  if (/tuna|salmon|tin|sardine/.test(blob)) return "tin";
  if (/ham|bacon|deli|meat/.test(blob)) return "tin";
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

export function generatedPackSvg(title: string, brand: string, barcode?: string | null, type?: ProductType): string {
  const face = packFaceStyle(barcode);
  const kind = spriteKind(title, brand, type);
  const label = (title || "Pack").slice(0, 18);
  const house = (brand || "").slice(0, 16);
  const code = rawDigits(barcode).slice(-6);
  const paper = `hsl(${face.hue} 10% 91%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
    <rect width="320" height="400" fill="${paper}"/>
    ${packShape(kind, face.background, face.color)}
    <text x="160" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#F7F4EE">${escapeXml(label)}</text>
    <text x="160" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#F7F4EE">${escapeXml(house)}</text>
    <text x="160" y="372" text-anchor="middle" font-family="ui-monospace, monospace" font-size="9" fill="${face.color}">${escapeXml(kind)} · ${escapeXml(code)}</text>
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
): string[] {
  return [...packCandidates(imageUrl, barcode, type), generatedPackSvg(title, brand, barcode, type)];
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
