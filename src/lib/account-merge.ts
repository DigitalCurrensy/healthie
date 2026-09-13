import type { HistoryItem } from "@/lib/history";
import type { ListItem } from "@/lib/prefs";

export function mergeHistory(local: HistoryItem[], remote: HistoryItem[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const item of [...remote, ...local]) {
    const prev = map.get(item.barcode);
    if (!prev || item.scannedAt > prev.scannedAt) map.set(item.barcode, item);
  }
  return [...map.values()].sort((a, b) => b.scannedAt - a.scannedAt).slice(0, 80);
}

export function mergeList(local: ListItem[], remote: ListItem[]): ListItem[] {
  const map = new Map<string, ListItem>();
  for (const item of [...remote, ...local]) {
    if (!map.has(item.barcode)) map.set(item.barcode, item);
  }
  return [...map.values()].slice(0, 80);
}

export function snapshotIsBlank(s: { scans: unknown[]; saved: unknown[]; list: unknown[] }): boolean {
  return s.scans.length === 0 && s.saved.length === 0 && s.list.length === 0;
}

/** A blank phone must not overwrite the account that already holds history. */
export function shouldSkipCloudPush(opts: {
  paused: boolean;
  snapshot: { scans: unknown[]; saved: unknown[]; list: unknown[] };
}): boolean {
  if (opts.paused) return true;
  return false;
}
