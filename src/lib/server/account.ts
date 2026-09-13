import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { trySql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { HistoryItem } from "@/lib/history";
import type { Diet, LifeStage, ListItem } from "@/lib/prefs";
import type { AllergenId } from "@/lib/scoring/types";

const scanSchema = z.object({
  barcode: z.string().min(4).max(20),
  title: z.string().max(160),
  brand: z.string().max(80),
  type: z.enum(["food", "cosmetic", "pet"]),
  score: z.number().int().min(0).max(100),
  scannedAt: z.number().int().optional(),
});

const listItemSchema = z.object({
  barcode: z.string().min(4).max(20),
  title: z.string().max(160),
  brand: z.string().max(80),
  score: z.number().int().min(0).max(100),
  checked: z.boolean(),
});

const prefsSchema = z.object({
  diet: z.enum(["none", "vegetarian", "vegan"]),
  lifeStage: z.enum(["none", "pregnancy", "child"]),
  allergens: z.array(z.string()).max(20),
  avoidPalm: z.boolean(),
  avoidFragrance: z.boolean(),
  avoidNitrites: z.boolean(),
  avoidUpf: z.boolean(),
  sensitiveSkin: z.boolean(),
  labName: z.string().max(40),
  onboardingDone: z.boolean(),
});

const snapshotSchema = z.object({
  scans: z.array(scanSchema).max(80),
  saved: z.array(z.string().max(20)).max(80),
  list: z.array(listItemSchema).max(80),
  prefs: prefsSchema,
});

export type CloudPrefs = {
  diet: Diet;
  lifeStage: LifeStage;
  allergens: AllergenId[];
  avoidPalm: boolean;
  avoidFragrance: boolean;
  avoidNitrites: boolean;
  avoidUpf: boolean;
  sensitiveSkin: boolean;
  labName: string;
  onboardingDone: boolean;
};

export type AccountSnapshot = {
  scans: HistoryItem[];
  saved: string[];
  list: ListItem[];
  prefs: CloudPrefs | null;
};

export const pullAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccountSnapshot> => {
    const sql = await trySql();
    if (!sql) {
      return { scans: [], saved: [], list: [], prefs: null };
    }
    const uid = context.userId;
    const scans = await sql<{
      barcode: string;
      title: string;
      brand: string;
      type: HistoryItem["type"];
      score: number;
      scanned_at: string;
    }>`
      select barcode, title, brand, type, score, scanned_at::text
      from user_scans where user_id = ${uid}
      order by scanned_at desc limit 80`;
    const saved = await sql<{ barcode: string }>`
      select barcode from user_saved where user_id = ${uid} order by saved_at desc`;
    const list = await sql<{
      barcode: string;
      title: string;
      brand: string;
      score: number;
      checked: boolean;
    }>`
      select barcode, title, brand, score, checked
      from user_list where user_id = ${uid} order by position asc, barcode asc`;
    const prefsRows = await sql<{ payload: CloudPrefs | string }>`
      select payload from user_prefs where user_id = ${uid} limit 1`;
    let prefs: CloudPrefs | null = null;
    const raw = prefsRows[0]?.payload;
    if (raw && typeof raw === "object") prefs = raw;
    else if (typeof raw === "string") {
      try {
        prefs = JSON.parse(raw) as CloudPrefs;
      } catch {
        prefs = null;
      }
    }
    return {
      scans: scans.map((s) => ({
        barcode: s.barcode,
        title: s.title,
        brand: s.brand,
        type: s.type,
        score: s.score,
        scannedAt: new Date(s.scanned_at).getTime() || Date.now(),
      })),
      saved: saved.map((s) => s.barcode),
      list: list.map((l) => ({
        barcode: l.barcode,
        title: l.title,
        brand: l.brand,
        score: l.score,
        checked: Boolean(l.checked),
      })),
      prefs,
    };
  });

export const pushAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => snapshotSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await trySql();
    if (!sql) return { ok: true as const };
    const uid = context.userId;
    for (const s of data.scans) {
      const at = new Date(s.scannedAt ?? Date.now()).toISOString();
      await sql.query(
        `insert into user_scans (user_id, barcode, title, brand, type, score, scanned_at)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (user_id, barcode) do update set
           title = excluded.title,
           brand = excluded.brand,
           type = excluded.type,
           score = excluded.score,
           scanned_at = greatest(user_scans.scanned_at, excluded.scanned_at)`,
        [uid, s.barcode, s.title, s.brand, s.type, s.score, at],
      );
    }
    await sql.query(`delete from user_saved where user_id = $1`, [uid]);
    for (const code of data.saved) {
      await sql.query(
        `insert into user_saved (user_id, barcode) values ($1,$2) on conflict do nothing`,
        [uid, code],
      );
    }
    await sql.query(`delete from user_list where user_id = $1`, [uid]);
    for (let i = 0; i < data.list.length; i += 1) {
      const item = data.list[i]!;
      await sql.query(
        `insert into user_list (user_id, barcode, title, brand, score, checked, position)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (user_id, barcode) do update set
           title = excluded.title, brand = excluded.brand, score = excluded.score,
           checked = excluded.checked, position = excluded.position`,
        [uid, item.barcode, item.title, item.brand, item.score, item.checked, i],
      );
    }
    await sql.query(
      `insert into user_prefs (user_id, payload, updated_at) values ($1,$2::jsonb, now())
       on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`,
      [uid, JSON.stringify(data.prefs)],
    );
    return { ok: true as const };
  });

export const pushScan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => scanSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await trySql();
    if (!sql) return { ok: true as const };
    const at = new Date(data.scannedAt ?? Date.now()).toISOString();
    await sql.query(
      `insert into user_scans (user_id, barcode, title, brand, type, score, scanned_at)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (user_id, barcode) do update set
         title = excluded.title, brand = excluded.brand, type = excluded.type,
         score = excluded.score, scanned_at = excluded.scanned_at`,
      [context.userId, data.barcode, data.title, data.brand, data.type, data.score, at],
    );
    return { ok: true as const };
  });
