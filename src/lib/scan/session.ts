/** Last pack photo and last GS1 extras from the live camera. */

type PackMemory = {
  file: File;
  barcode?: string;
  at: number;
};

export type Gs1Memory = {
  gtin: string;
  lot?: string;
  expiry?: string;
  serial?: string;
  at: number;
};

const TTL_MS = 3 * 60 * 1000;
let memory: PackMemory | null = null;
let gs1Memory: Gs1Memory | null = null;

export function rememberPack(file: File, barcode?: string) {
  memory = { file, barcode, at: Date.now() };
}

export function peekLastPackRecord(): PackMemory | null {
  if (!memory) return null;
  if (Date.now() - memory.at > TTL_MS) {
    memory = null;
    return null;
  }
  return memory;
}

export function peekLastPack(): File | null {
  return peekLastPackRecord()?.file ?? null;
}

export function takeLastPack(): File | null {
  const file = peekLastPack();
  memory = null;
  return file;
}

export function rememberGs1(scan: Omit<Gs1Memory, "at">) {
  gs1Memory = { ...scan, at: Date.now() };
}

export function peekLastGs1(barcode?: string): Gs1Memory | null {
  if (!gs1Memory) return null;
  if (Date.now() - gs1Memory.at > TTL_MS) {
    gs1Memory = null;
    return null;
  }
  if (barcode && gs1Memory.gtin !== barcode && !barcode.endsWith(gs1Memory.gtin) && !gs1Memory.gtin.endsWith(barcode)) {
    return null;
  }
  return gs1Memory;
}
