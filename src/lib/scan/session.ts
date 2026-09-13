/** Last pack photo from the live camera or camera roll — kept so a miss in the index can still be read. */

type PackMemory = {
  file: File;
  barcode?: string;
  at: number;
};

const TTL_MS = 3 * 60 * 1000;
let memory: PackMemory | null = null;

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
