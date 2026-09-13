import { trySql } from "@/lib/db";
import type { WorldIndex } from "@/lib/world";

const FALLBACK = {
  foodCount: 4_707_634,
  beautyCount: 73_850,
  petCount: 15_067,
};

export function fallbackWorldIndex(localCount = 0): WorldIndex {
  return {
    foodCount: FALLBACK.foodCount,
    beautyCount: FALLBACK.beautyCount,
    petCount: FALLBACK.petCount,
    localCount,
    lastDumpAt: null,
    lastDumpIngested: 0,
    lastDumpFile: null,
    source: "openfoodfacts + openbeautyfacts + openpetfoodfacts",
  };
}

export async function setWorldMeta(key: string, value: string) {
  const sql = await trySql();
  if (!sql) return;
  await sql.query(
    `insert into world_meta (key, value, updated_at) values ($1,$2,now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, value],
  );
}

export async function getWorldMeta(key: string): Promise<string | null> {
  const sql = await trySql();
  if (!sql) return null;
  const rows = await sql<{ value: string }>`select value from world_meta where key = ${key} limit 1`;
  return rows[0]?.value ?? null;
}

export async function readWorldIndex(): Promise<WorldIndex> {
  const sql = await trySql();
  if (!sql) return fallbackWorldIndex();
  let n = 0;
  try {
    const rows = await sql<{ n: number }>`select count(*)::int as n from products`;
    n = rows[0]?.n ?? 0;
  } catch {
    n = 0;
  }
  const food = Number(await getWorldMeta("food_count")) || FALLBACK.foodCount;
  const beauty = Number(await getWorldMeta("beauty_count")) || FALLBACK.beautyCount;
  const pet = Number(await getWorldMeta("pet_count")) || FALLBACK.petCount;
  return {
    foodCount: food,
    beautyCount: beauty,
    petCount: pet,
    localCount: n,
    lastDumpAt: await getWorldMeta("last_dump_at"),
    lastDumpIngested: Number(await getWorldMeta("last_dump_ingested")) || 0,
    lastDumpFile: await getWorldMeta("last_dump_file"),
    source: "openfoodfacts + openbeautyfacts + openpetfoodfacts",
  };
}