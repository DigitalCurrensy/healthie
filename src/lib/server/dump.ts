import { getSql } from "@/lib/db";
import { readWorldIndex, setWorldMeta, getWorldMeta } from "./world-meta";
import type { WorldIndex } from "@/lib/world";
import {
  HARVEST_IF_BELOW,
  INGEST_CAP,
  LINE_CAP,
  PANTRY_WORLD_CAP,
  RUN_MS,
  nextDeltaToIngest,
  parseDeltaIndex,
  shouldRefreshCounts,
  shouldRefreshDump,
} from "./dump-logic";

const UA = "Healthie/1.0 (https://grok.com; product-scanner)";
const DELTA_INDEX = "https://static.openfoodfacts.org/data/delta/index.txt";
const DELTA_BASE = "https://static.openfoodfacts.org/data/delta/";

const globalRef = globalThis as typeof globalThis & {
  __healthieDump__?: Promise<WorldIndex>;
};

async function ingestDeltaFile(file: string): Promise<number> {
  const dump = await fetch(`${DELTA_BASE}${file}`, {
    headers: { "User-Agent": UA, Accept: "application/gzip" },
    signal: AbortSignal.timeout(28000),
  });
  if (!dump.ok || !dump.body) return 0;

  const { upsertEvaluated } = await import("./catalog");
  const { offProductToEvaluated } = await import("./off");
  const stream =
    typeof DecompressionStream === "function"
      ? dump.body.pipeThrough(new DecompressionStream("gzip"))
      : dump.body;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let ingested = 0;
  let lines = 0;
  const deadline = Date.now() + RUN_MS;
  try {
    while (ingested < INGEST_CAP && lines < LINE_CAP && Date.now() < deadline) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n");
      buf = parts.pop() ?? "";
      for (const line of parts) {
        if (ingested >= INGEST_CAP || lines >= LINE_CAP || Date.now() >= deadline) break;
        if (!line || line.length < 40) continue;
        lines += 1;
        let raw: Record<string, unknown>;
        try {
          raw = JSON.parse(line) as Record<string, unknown>;
        } catch {
          continue;
        }
        const ev = offProductToEvaluated(raw as never, "openfoodfacts");
        if (!ev) continue;
        await upsertEvaluated(ev, { protectCatalog: true });
        ingested += 1;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return ingested;
}

async function worldSourceCount(): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from products where source <> 'catalog'`;
  return rows[0]?.n ?? 0;
}

async function pruneWorldPantry(): Promise<void> {
  const sql = await getSql();
  const n = await worldSourceCount();
  const extra = n - PANTRY_WORLD_CAP;
  if (extra <= 0) return;
  const ids = await sql<{ id: string }>`
    select id from products where source <> 'catalog'
    order by updated_at asc
    limit ${extra}`;
  for (const row of ids) {
    await sql.query(`delete from product_ingredients where product_id = $1`, [row.id]);
    await sql.query(`delete from products where id = $1`, [row.id]);
  }
}

async function runRefresh(): Promise<WorldIndex> {
  const sql = await getSql();
  const started = new Date().toISOString();
  const now = Date.now();
  let ingested = 0;
  let file = "";
  let food = 4_707_634;
  let beauty = 73_850;
  let pet = 15_067;

  const lastDumpAt = await getWorldMeta("last_dump_at");
  const lastCountAt = await getWorldMeta("last_count_at");
  const lastFile = await getWorldMeta("last_dump_file");
  const lastHarvestAt = await getWorldMeta("last_harvest_at");

  try {
    if (shouldRefreshCounts(lastCountAt, now)) {
      const { worldCounts } = await import("./off");
      const counts = await worldCounts();
      food = counts.food || food;
      beauty = counts.beauty || beauty;
      pet = counts.pet || pet;
      await setWorldMeta("food_count", String(food));
      await setWorldMeta("beauty_count", String(beauty));
      await setWorldMeta("pet_count", String(pet));
      await setWorldMeta("last_count_at", started);
    } else {
      food = Number(await getWorldMeta("food_count")) || food;
      beauty = Number(await getWorldMeta("beauty_count")) || beauty;
      pet = Number(await getWorldMeta("pet_count")) || pet;
    }
  } catch {
    /* keep fallback — live lookup still works */
  }

  try {
    const thin = (await worldSourceCount()) < HARVEST_IF_BELOW;
    const harvestDue = shouldRefreshDump(lastHarvestAt, now);
    if (thin || harvestDue) {
      const { harvestPopular, isOffCooling } = await import("./off");
      if (!isOffCooling()) {
        const { upsertEvaluated } = await import("./catalog");
        const batch = await harvestPopular();
        for (const p of batch) {
          await upsertEvaluated(p, { protectCatalog: true });
          ingested += 1;
        }
        await setWorldMeta("last_harvest_at", started);
      }
    }
  } catch {
    /* harvest is best-effort */
  }

  try {
    if (shouldRefreshDump(lastDumpAt, now)) {
      const res = await fetch(DELTA_INDEX, {
        headers: { "User-Agent": UA, Accept: "text/plain" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const files = parseDeltaIndex(await res.text());
        const next = nextDeltaToIngest(files, lastFile);
        if (next) {
          file = next;
          ingested += await ingestDeltaFile(next);
          await setWorldMeta("last_dump_file", next);
        }
        await setWorldMeta("last_dump_at", started);
        await setWorldMeta("last_dump_ingested", String(ingested));
      }
    }
  } catch {
    /* delta is best-effort; live barcode lookup covers the rest */
  }

  try {
    await pruneWorldPantry();
  } catch {
    /* cap is best-effort */
  }

  await sql.query(
    `insert into dump_runs (started_at, finished_at, source, ingested, world_food, world_beauty, world_pet, note)
     values ($1, now(), $2, $3, $4, $5, $6, $7)`,
    [
      started,
      file || "harvest+live",
      ingested,
      food,
      beauty,
      pet,
      "Nightly OFF dump (newest delta). Live barcode lookup covers the long tail.",
    ],
  );
  return readWorldIndex();
}

export async function refreshWorldIndex(): Promise<WorldIndex> {
  if (globalRef.__healthieDump__) return globalRef.__healthieDump__;
  globalRef.__healthieDump__ = runRefresh()
    .catch(async () => readWorldIndex())
    .finally(() => {
      setTimeout(() => {
        globalRef.__healthieDump__ = undefined;
      }, 30_000);
    });
  return globalRef.__healthieDump__;
}
