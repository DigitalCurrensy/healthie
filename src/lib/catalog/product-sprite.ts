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
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BRAND_PAINT: Array<{ test: RegExp; fill: string; accent: string }> = [
  { test: /aloha/, fill: "#1B3A2A", accent: "#E8C36A" },
  { test: /alpro/, fill: "#5EAF3A", accent: "#F4F0E6" },
  { test: /amy'?s/, fill: "#C45C14", accent: "#F4E2C4" },
  { test: /annie'?s/, fill: "#E35205", accent: "#F4E2C4" },
  { test: /applegate/, fill: "#6B2D14", accent: "#F4E2C4" },
  { test: /aquaphor/, fill: "#C5A059", accent: "#3A2208" },
  { test: /arizona/, fill: "#6B8F3A", accent: "#F4E27A" },
  { test: /athletic brewing/, fill: "#1A1A1A", accent: "#C5A059" },
  { test: /attitude/, fill: "#5EAF3A", accent: "#14300C" },
  { test: /aveda/, fill: "#1B3A2A", accent: "#F4F0E6" },
  { test: /aveeno/, fill: "#C4A36A", accent: "#3A2208" },
  { test: /airborne/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /airheads/, fill: "#E35205", accent: "#F4E2C4" },
  { test: /ajax/, fill: "#E10613", accent: "#F4F0E6" },
  { test: /365|whole foods|whole catch/, fill: "#00704A", accent: "#F4F0E6" },
  { test: /diet coke|coca-cola zero|coke zero/, fill: "#C5C7C9", accent: "#1A1A1A" },
  { test: /coca-cola|coke/, fill: "#E41C23", accent: "#1A0A0A" },
  { test: /pepsi/, fill: "#004B93", accent: "#C8102E" },
  { test: /sprite/, fill: "#00A651", accent: "#063318" },
  { test: /fanta/, fill: "#FF8A00", accent: "#4A2200" },
  { test: /red bull/, fill: "#0033A0", accent: "#C5A059" },
  { test: /gatorade/, fill: "#FF6A00", accent: "#2A1200" },
  { test: /evian/, fill: "#8FD0E8", accent: "#16324A" },
  { test: /perrier/, fill: "#1B7A3A", accent: "#06180C" },
  { test: /pellegrino/, fill: "#1E4D8C", accent: "#F2E6C9" },
  { test: /tropicana/, fill: "#F27D00", accent: "#3A1C00" },
  { test: /pure leaf/, fill: "#5C4033", accent: "#F4E2C4" },
  { test: /heinz/, fill: "#B0102E", accent: "#2A0008" },
  { test: /nutella|ferrero/, fill: "#4A2A14", accent: "#E8C36A" },
  { test: /oreo/, fill: "#1A1A1A", accent: "#F4F0E6" },
  { test: /dorito/, fill: "#E35205", accent: "#2A1000" },
  { test: /walkers|lay's|lays/, fill: "#E10613", accent: "#FFD200" },
  { test: /haribo/, fill: "#E10613", accent: "#FFD200" },
  { test: /barilla/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /lindt/, fill: "#6B0F1A", accent: "#E8C36A" },
  { test: /activia|actimel|danone/, fill: "#5EAF3A", accent: "#14300C" },
  { test: /nivea/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /cerave/, fill: "#1B4F8A", accent: "#E8EEF4" },
  { test: /dove/, fill: "#1A4A6E", accent: "#E8EEF4" },
];

function formFor(title: string, brand: string, categoryPath?: string, type?: ProductType): PackForm {
  const blob = `${title} ${brand} ${categoryPath ?? ""}`.toLowerCase();
  if (type === "cosmetic" || /aquaphor|aveda|aveeno|nivea|cerave/.test(blob)) {
    if (/shampoo|wash|micellar/.test(blob)) return "bottle";
    return "tube";
  }
  if (/detergent|ajax|attitude/.test(blob)) return "bottle";
  if (/cola|pepsi|sprite|fanta|soda|energy|red bull|gatorade|coke/.test(blob)) return "can";
  if (/water|evian|perrier|juice|tea|arizona|alpro|oat|soya/.test(blob)) return "bottle";
  if (/beer|ipa|brewing|alcohol/.test(blob)) return "can";
  if (/nutella|butter|spread|jam|honey|soup/.test(blob)) return "jar";
  if (/yogurt|yoghurt|activia/.test(blob)) return "cup";
  if (/chip|dorito|lay|walkers|crisp|haribo|airheads|bunnies|grahams/.test(blob)) return "pouch";
  if (/chocolate|aloha|lindt/.test(blob)) return "bar";
  if (/ham|turkey|bacon|salmon|meat|applegate/.test(blob)) return "tin";
  if (/pizza|macaroni|beans|oats|cereal/.test(blob)) return "box";
  if (categoryPath === "beverages") return /cola|soda|coke/.test(blob) ? "can" : "bottle";
  return "box";
}

function paint(title: string, brand: string, barcode?: string | null): { fill: string; accent: string; paper: string } {
  const blob = `${title} ${brand}`.toLowerCase();
  const hit = BRAND_PAINT.find((row) => row.test.test(blob));
  if (hit) {
    const shift = hash(title + (barcode || "")) % 24;
    return { fill: hit.fill, accent: hit.accent, paper: `hsl(${shift * 8} 8% 92%)` };
  }
  const hue = hash(`${brand}|${title}|${barcode ?? ""}`) % 360;
  return {
    fill: `hsl(${hue} 32% 38%)`,
    accent: `hsl(${(hue + 28) % 360} 22% 18%)`,
    paper: `hsl(${(hue + 80) % 360} 12% 90%)`,
  };
}

function packShape(form: PackForm, fill: string, accent: string): string {
  switch (form) {
    case "can":
      return `<rect x="108" y="72" width="104" height="216" rx="18" fill="${fill}"/><rect x="108" y="72" width="104" height="18" fill="${accent}"/><rect x="108" y="270" width="104" height="18" fill="${accent}"/>`;
    case "bottle":
      return `<rect x="142" y="56" width="36" height="36" fill="${accent}"/><path d="M118 108 C118 92 202 92 202 108 L196 292 C196 308 124 308 124 292 Z" fill="${fill}"/>`;
    case "jar":
      return `<rect x="112" y="78" width="96" height="22" rx="4" fill="${accent}"/><path d="M118 100 L202 100 L210 292 L110 292 Z" fill="${fill}"/>`;
    case "pouch":
      return `<path d="M92 88 L228 88 L244 300 L76 300 Z" fill="${fill}"/><path d="M92 88 L228 88 L220 120 L100 120 Z" fill="${accent}"/>`;
    case "box":
      return `<rect x="84" y="80" width="152" height="220" fill="${fill}"/><rect x="84" y="80" width="152" height="28" fill="${accent}"/>`;
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

export function productSprite(
  title: string,
  brand: string,
  barcode?: string | null,
  categoryPath?: string,
  type?: ProductType,
): string {
  const form = formFor(title, brand, categoryPath, type);
  const { fill, accent, paper } = paint(title, brand, barcode);
  const name = escapeXml((title || "Pack").slice(0, 20));
  const house = escapeXml((brand || "").slice(0, 16));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400"><rect width="320" height="400" fill="${paper}"/>${packShape(form, fill, accent)}<text x="160" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#F7F4EE">${name}</text><text x="160" y="218" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#F7F4EE">${house}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
