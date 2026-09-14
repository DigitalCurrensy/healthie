import type { ProductType } from "@/lib/scoring/types";

export type PackForm = "can" | "bottle" | "jar" | "pouch" | "box" | "tube" | "tin" | "bar" | "cup" | "carton";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
}

function formFor(title: string, categoryPath?: string, type?: ProductType): PackForm {
  const blob = `${title} ${categoryPath ?? ""}`.toLowerCase();
  if (type === "cosmetic") {
    if (/sun|spf|lotion|cream|ointment/.test(blob)) return "tube";
    if (/shampoo|wash|detergent/.test(blob)) return "bottle";
    return "tube";
  }
  if (type === "pet") return "pouch";
  if (/cola|pepsi|sprite|fanta|soda|energy|red bull|bang|rockstar|bodyarmor|gatorade/.test(blob)) return "can";
  if (/water|evian|perrier|sparkling|tea|arizona|juice|tropicana/.test(blob) || categoryPath === "beverages") {
    if (/cola|pepsi|soda|zero/.test(blob)) return "can";
    return "bottle";
  }
  if (/nutella|butter|spread|jam|honey|oil/.test(blob) || categoryPath === "spreads") return "jar";
  if (/chip|dorito|cheeto|lay|crisp|pretzel/.test(blob) || categoryPath === "snacks") return "pouch";
  if (/yogurt|yoghurt|activia|chobani|cottage/.test(blob) || categoryPath === "dairy") return "cup";
  if (/chocolate|lindt|cocoa/.test(blob) || categoryPath === "chocolate") return "bar";
  if (/candy|haribo|gummy|oreo/.test(blob) || categoryPath === "candy") return "box";
  if (/ketchup|sauce|heinz|mustard/.test(blob) || categoryPath === "condiments") return "bottle";
  if (/pasta|barilla|cereal|coco pops|oat/.test(blob) || categoryPath === "staples" || categoryPath === "breakfast") return "box";
  if (/ham|bacon|turkey|meat|deli/.test(blob) || categoryPath === "meat") return "tin";
  if (/ice cream|gelato/.test(blob) || categoryPath === "icecream") return "carton";
  if (/coffee|bean/.test(blob) || categoryPath === "coffee") return "pouch";
  if (/beer|wine|alcohol/.test(blob) || categoryPath === "alcohol") return "bottle";
  if (categoryPath === "frozen") return "box";
  if (categoryPath === "baby") return "jar";
  if (categoryPath === "seafood") return "tin";
  return "box";
}

function brandHue(title: string, brand: string, barcode?: string | null): number {
  return hash(`${brand}|${title}|${barcode ?? ""}`) % 360;
}

function packShape(form: PackForm, fill: string, accent: string): string {
  switch (form) {
    case "can":
      return `<rect x="108" y="72" width="104" height="216" rx="18" fill="${fill}"/><rect x="108" y="72" width="104" height="18" fill="${accent}"/><rect x="108" y="270" width="104" height="18" fill="${accent}"/><ellipse cx="160" cy="72" rx="52" ry="10" fill="#d7dbd4"/>`;
    case "bottle":
      return `<rect x="142" y="56" width="36" height="36" fill="${accent}"/><path d="M118 108 C118 92 202 92 202 108 L196 292 C196 308 124 308 124 292 Z" fill="${fill}"/><rect x="136" y="48" width="48" height="16" rx="3" fill="#2a2a2a"/>`;
    case "jar":
      return `<rect x="112" y="78" width="96" height="22" rx="4" fill="${accent}"/><path d="M118 100 L202 100 L210 292 L110 292 Z" fill="${fill}"/><rect x="124" y="148" width="72" height="88" fill="rgba(255,255,255,0.18)"/>`;
    case "pouch":
      return `<path d="M92 88 L228 88 L244 300 L76 300 Z" fill="${fill}"/><path d="M92 88 L228 88 L220 120 L100 120 Z" fill="${accent}"/>`;
    case "box":
      return `<rect x="84" y="80" width="152" height="220" fill="${fill}"/><rect x="84" y="80" width="152" height="28" fill="${accent}"/><rect x="100" y="140" width="120" height="96" fill="rgba(255,255,255,0.16)"/>`;
    case "tube":
      return `<rect x="132" y="52" width="56" height="24" fill="${accent}"/><path d="M118 76 L202 76 L188 308 L132 308 Z" fill="${fill}"/>`;
    case "tin":
      return `<ellipse cx="160" cy="210" rx="86" ry="86" fill="${fill}"/><ellipse cx="160" cy="210" rx="62" ry="62" fill="${accent}"/>`;
    case "bar":
      return `<rect x="64" y="140" width="192" height="112" rx="8" fill="${fill}"/><rect x="64" y="140" width="192" height="18" fill="${accent}"/>`;
    case "cup":
      return `<path d="M108 120 L212 120 L198 292 L122 292 Z" fill="${fill}"/><ellipse cx="160" cy="120" rx="52" ry="14" fill="${accent}"/>`;
    case "carton":
      return `<path d="M110 70 L210 70 L210 120 L160 148 L110 120 Z" fill="${accent}"/><rect x="110" y="120" width="100" height="188" fill="${fill}"/>`;
  }
}

/** Unique pack sprite per SKU. Shape follows the product. Color follows the GTIN. */
export function productSprite(
  title: string,
  brand: string,
  barcode?: string | null,
  categoryPath?: string,
  type?: ProductType,
): string {
  const form = formFor(title, categoryPath, type);
  const hue = brandHue(title, brand, barcode);
  const fill = `hsl(${hue} 28% 28%)`;
  const accent = `hsl(${(hue + 28) % 360} 22% 18%)`;
  const paper = `hsl(${(hue + 80) % 360} 12% 90%)`;
  const name = escapeXml((title || "Pack").slice(0, 22));
  const house = escapeXml((brand || "").slice(0, 18));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400"><rect width="320" height="400" fill="${paper}"/>${packShape(form, fill, accent)}<text x="160" y="352" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#10231D">${name}</text><text x="160" y="372" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#5C6561">${house}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
