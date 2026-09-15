/** Last pack photos stay on this device so an unmatched shot is not lost. */

export type PackShot = {
  id: string;
  dataUrl: string;
  barcode?: string;
  title?: string;
  note?: string;
  at: number;
};

const KEY = "healthie-pack-shots";
const MAX = 16;

function read(): PackShot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as PackShot[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function write(rows: PackShot[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows.slice(0, MAX)));
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 6)));
    } catch {
      /* quota */
    }
  }
}

export function listPackShots(): PackShot[] {
  if (typeof window === "undefined") return [];
  return read();
}

export async function savePackShot(file: File, meta?: { barcode?: string; title?: string; note?: string }): Promise<PackShot | null> {
  if (typeof window === "undefined") return null;
  const dataUrl = await fileToDataUrl(file);
  if (!dataUrl) return null;
  const shot: PackShot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    barcode: meta?.barcode,
    title: meta?.title,
    note: meta?.note,
    at: Date.now(),
  };
  write([shot, ...read().filter((s) => s.dataUrl !== dataUrl)]);
  return shot;
}

export function clearPackShots() {
  if (typeof window === "undefined") return;
  write([]);
}

function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
