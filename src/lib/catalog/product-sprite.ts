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
  { test: /pure leaf/, fill: "#5C4033", accent: "#F4E2C4" },
  { test: /tropicana/, fill: "#F27D00", accent: "#3A1C00" },
  { test: /heinz/, fill: "#B0102E", accent: "#2A0008" },
  { test: /nutella|ferrero rocher|ferrero/, fill: "#4A2A14", accent: "#E8C36A" },
  { test: /oreo|mondelez/, fill: "#1A1A1A", accent: "#F4F0E6" },
  { test: /dorito/, fill: "#E35205", accent: "#2A1000" },
  { test: /walkers|lay's|lays/, fill: "#E10613", accent: "#FFD200" },
  { test: /pringles/, fill: "#E10613", accent: "#1A1A1A" },
  { test: /haribo/, fill: "#E10613", accent: "#FFD200" },
  { test: /barilla/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /lindt/, fill: "#6B0F1A", accent: "#E8C36A" },
  { test: /kitkat|kit kat/, fill: "#E10613", accent: "#F4F0E6" },
  { test: /mars bar|\bmars\b/, fill: "#1A1A1A", accent: "#C5A059" },
  { test: /magnum/, fill: "#1A1A1A", accent: "#E8C36A" },
  { test: /activia|actimel|danone/, fill: "#5EAF3A", accent: "#14300C" },
  { test: /frosties|coco pops|special k|kellogg/, fill: "#E10613", accent: "#F4E2C4" },
  { test: /weetabix/, fill: "#C4A000", accent: "#2A2200" },
  { test: /cheerios|general mills/, fill: "#F2B200", accent: "#6B3A14" },
  { test: /herta/, fill: "#C8102E", accent: "#F4F0E6" },
  { test: /philadelphia/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /hellmann/, fill: "#003DA5", accent: "#F4E2C4" },
  { test: /marmite/, fill: "#1A1A1A", accent: "#E8C36A" },
  { test: /nesquik/, fill: "#6B3A14", accent: "#F4E2C4" },
  { test: /cerave/, fill: "#1B4F8A", accent: "#E8EEF4" },
  { test: /nivea/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /garnier/, fill: "#5EAF3A", accent: "#14300C" },
  { test: /l'oréal|loreal/, fill: "#1A1A1A", accent: "#E8C36A" },
  { test: /head & shoulders|head and shoulders/, fill: "#003DA5", accent: "#F4F0E6" },
  { test: /colgate/, fill: "#E10613", accent: "#F4F0E6" },
  { test: /dove/, fill: "#1A4A6E", accent: "#E8EEF4" },
];

function formFor(title: string, brand: string, categoryPath?: string, type?: ProductType): PackForm {
  const blob = `${title} ${brand} ${categoryPath ?? ""}`.toLowerCase();
  if (type === "cosmetic" || /skincare|hair|sun|body|oral|makeup/.test(blob)) {
    if (/shampoo|wash|micellar|serum/.test(blob)) return "bottle";
    if (/bar soap|beauty bar/.test(blob)) return "bar";
    return "tube";
  }
  if (type === "pet") return "pouch";
  if (/cola|pepsi|sprite|fanta|soda|energy|red bull|gatorade|coke/.test(blob)) return "can";
  if (/water|evian|perrier|pellegrino|juice|tropicana|ketchup|heinz|tea|pure leaf/.test(blob)) return "bottle";
  if (/nutella|butter|spread|jam|honey|marmite|mayo|hellmann/.test(blob) || categoryPath === "spreads") return "jar";
  if (/chip|dorito|cheeto|lay|walkers|crisp|haribo|pringles/.test(blob) || categoryPath === "snacks") return "pouch";
  if (/yogurt|yoghurt|activia|actimel|chobani|philadelphia/.test(blob) || categoryPath === "dairy") return "cup";
  if (/chocolate|lindt|kitkat|mars|rocher|magnum/.test(blob) || categoryPath === "chocolate") return "bar";
  if (/pasta|barilla|cereal|coco pops|oreo|oat|frosties|weetabix|special k|cheerios|beans/.test(blob)) return "box";
  if (/ham|bacon|meat|herta/.test(blob)) return "tin";
  if (/ice cream/.test(blob)) return "carton";
  if (categoryPath === "beverages") return /cola|soda|coke|pepsi/.test(blob) ? "can" : "bottle";
  if (categoryPath === "alcohol") return "bottle";
  if (categoryPath === "baby") return "jar";
  if (categoryPath === "seafood") return "tin";
  return "box";
}

function paint(title: string, brand: string, barcode?: string | null): { fill: string; accent: string; paper: string } {
  const blob = `${title} ${brand}`.toLowerCase();
  const hit = BRAND_PAINT.find((row) => row.test.test(blob));
  if (hit) return { fill: hit.fill, accent: hit.accent, paper: "#ECE8DF" };
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
      return `<rect x="108" y="72" width="104" height="216" rx="18" fill="${fill}"/><rect x="108" y="72" width="104" height="18" fill="${accent}"/><rect x="108" y="270" width="104" height="18" fill="${accent}"/><ellipse cx="160" cy="72" rx="52" ry="10" fill="#d7dbd4"/>`;
    case "bottle":
      return `<rect x="142" y="56" width="36" height="36" fill="${accent}"/><path d="M118 108 C118 92 202 92 202 108 L196 292 C196 308 124 308 124 292 Z" fill="${fill}"/><rect x="136" y="48" width="48" height="16" rx="3" fill="#2a2a2a"/>`;
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
  const name = escapeXml((title || "Pack").slice(0, 22));
  const house = escapeXml((brand || "").slice(0, 18));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400"><rect width="320" height="400" fill="${paper}"/>${packShape(form, fill, accent)}<text x="160" y="198" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#F7F4EE">${name}</text><text x="160" y="218" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#F7F4EE">${house}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
