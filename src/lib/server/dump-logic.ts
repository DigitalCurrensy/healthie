/** Pure helpers for the nightly Open Food Facts ingest. No I/O. */

export const DUMP_INTERVAL_MS = 20 * 60 * 60 * 1000;
export const COUNT_INTERVAL_MS = 6 * 60 * 60 * 1000;
export const INGEST_CAP = 280;
export const LINE_CAP = 4500;
export const RUN_MS = 9_000;
export const PANTRY_WORLD_CAP = 2_200;
export const HARVEST_IF_BELOW = 160;

export function parseDeltaFilename(name: string): { start: number; end: number } | null {
  const m = name.match(/openfoodfacts_products_(\d+)_(\d+)\.json\.gz$/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = Number(m[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return { start, end };
}

/** Oldest → newest. The published index is newest-first; we never take line -1. */
export function parseDeltaIndex(text: string): string[] {
  const files = text
    .trim()
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => parseDeltaFilename(s));
  const unique = [...new Set(files)];
  unique.sort((a, b) => (parseDeltaFilename(a)?.start ?? 0) - (parseDeltaFilename(b)?.start ?? 0));
  return unique;
}

export function newestDelta(files: string[]): string | null {
  return files[files.length - 1] ?? null;
}

/**
 * First boot: only the newest file (one night). Later: files strictly newer
 * than the last one we finished. Newest pending is what we ingest this run.
 */
export function unprocessedDeltas(files: string[], lastProcessed: string | null): string[] {
  if (!lastProcessed) {
    const newest = newestDelta(files);
    return newest ? [newest] : [];
  }
  const last = parseDeltaFilename(lastProcessed)?.start ?? 0;
  return files.filter((f) => (parseDeltaFilename(f)?.start ?? 0) > last);
}

export function nextDeltaToIngest(files: string[], lastProcessed: string | null): string | null {
  const pending = unprocessedDeltas(files, lastProcessed);
  return pending[pending.length - 1] ?? null;
}

export function shouldRefreshAt(lastAt: string | null, now: number, intervalMs: number): boolean {
  if (!lastAt) return true;
  const t = new Date(lastAt).getTime();
  if (!Number.isFinite(t)) return true;
  return now - t >= intervalMs;
}

export function shouldRefreshDump(lastDumpAt: string | null, now: number): boolean {
  return shouldRefreshAt(lastDumpAt, now, DUMP_INTERVAL_MS);
}

export function shouldRefreshCounts(lastCountAt: string | null, now: number): boolean {
  return shouldRefreshAt(lastCountAt, now, COUNT_INTERVAL_MS);
}

export function dumpRecordCode(raw: Record<string, unknown>): string {
  const code = raw.code ?? raw._id;
  return String(code ?? "").replace(/\D/g, "");
}
