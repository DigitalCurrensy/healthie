import { normalizeBarcode } from "@/lib/utils";

export type CachedPack = {
  barcode: string;
  title: string;
  brand: string;
  score: number;
  type: "food" | "cosmetic" | "pet";
  at: number;
};

const KEY = "healthie-pack-cache";
const MAX = 40;
const memory = new Map<string, CachedPack>();

function readAll(): CachedPack[] {
  if (memory.size) return [...memory.values()];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as CachedPack[];
    for (const row of rows) memory.set(normalizeBarcode(row.barcode), row);
    return rows;
  } catch {
    return [];
  }
}

function writeAll(rows: CachedPack[]) {
  memory.clear();
  for (const row of rows) memory.set(normalizeBarcode(row.barcode), row);
  try {
    localStorage.setItem(KEY, JSON.stringify(rows.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function peekPackCache(barcode: string): CachedPack | null {
  const code = normalizeBarcode(barcode);
  if (memory.has(code)) return memory.get(code) ?? null;
  readAll();
  return memory.get(code) ?? null;
}

export function rememberPackCache(row: Omit<CachedPack, "at">) {
  const next: CachedPack = { ...row, barcode: normalizeBarcode(row.barcode), at: Date.now() };
  const rest = readAll().filter((r) => r.barcode !== next.barcode);
  writeAll([next, ...rest]);
}
