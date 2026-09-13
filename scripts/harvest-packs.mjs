#!/usr/bin/env node
import { mkdir, writeFile, access } from "node:fs/promises";
import { createWriteStream, statSync, renameSync, unlinkSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";

const ROOT = "/workspace/public/packs";
const UA = "Healthie/1.0 (https://healthie.app; pack-image harvest)";

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function json(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text[0] !== "{") return null;
  return JSON.parse(text);
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/jpeg,image/*" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok || !res.body) return false;
  const type = res.headers.get("content-type") || "";
  if (type.includes("html") || type.includes("json")) return false;
  const tmp = dest + ".part";
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
  const size = statSync(tmp).size;
  if (size < 2000) {
    unlinkSync(tmp);
    return false;
  }
  renameSync(tmp, dest);
  return true;
}

function hostsFor(type) {
  if (type === "cosmetic") return ["https://world.openbeautyfacts.org", "https://world.openfoodfacts.org"];
  if (type === "pet") return ["https://world.openpetfoodfacts.org", "https://world.openfoodfacts.org"];
  return ["https://world.openfoodfacts.org", "https://world.openbeautyfacts.org"];
}

async function one(product) {
  const code = product.barcode;
  const dest = path.join(ROOT, `${code}.jpg`);
  if (await exists(dest)) return "have";
  for (const host of hostsFor(product.type)) {
    const data = await json(`${host}/api/v2/product/${code}.json?fields=image_front_small_url,image_front_url,image_url,status`);
    const p = data?.product;
    const url = p?.image_front_small_url || p?.image_front_url || p?.image_url;
    if (!url) continue;
    try {
      if (await download(url, dest)) return "got";
    } catch {
      /* next host */
    }
  }
  return "miss";
}

async function main() {
  await mkdir(ROOT, { recursive: true });
  const { PRODUCTS } = await import("../src/lib/catalog/products.ts");
  const list = PRODUCTS.filter((p) => p.barcode && p.barcode.length >= 8);
  console.log("harvest", list.length);
  let got = 0;
  let have = 0;
  let miss = 0;
  const conc = 4;
  for (let i = 0; i < list.length; i += conc) {
    const slice = list.slice(i, i + conc);
    const results = await Promise.all(slice.map((p) => one(p).catch(() => "miss")));
    for (const r of results) {
      if (r === "got") got += 1;
      else if (r === "have") have += 1;
      else miss += 1;
    }
    if (i === 0 || (i / conc) % 5 === 0) {
      console.log("progress", Math.min(i + conc, list.length), "got", got, "have", have, "miss", miss);
    }
  }
  console.log("done got", got, "have", have, "miss", miss);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
