#!/usr/bin/env node
/** Pull the weekly RES dump. Same records as the API. Do not run on a product request.
 *  node scripts/download-fda-zip.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { join } from "node:path";

const CATALOG = "https://api.fda.gov/download.json";
const outDir = process.argv[2] || "artifacts/fda";

const catalogRes = await fetch(CATALOG, { signal: AbortSignal.timeout(15000) });
if (!catalogRes.ok) {
  console.error("catalog fail", catalogRes.status);
  process.exit(1);
}
const catalog = await catalogRes.json();
const part = catalog?.results?.food?.enforcement?.partitions?.[0];
if (!part?.file) {
  console.error("no food/enforcement partition in download.json");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const dest = join(outDir, "food-enforcement-0001-of-0001.json.zip");
const fileRes = await fetch(part.file, { signal: AbortSignal.timeout(60000) });
if (!fileRes.ok || !fileRes.body) {
  console.error("zip fail", fileRes.status, part.file);
  process.exit(1);
}
await pipeline(Readable.fromWeb(fileRes.body), createWriteStream(dest));
await writeFile(
  join(outDir, "manifest.json"),
  JSON.stringify(
    {
      export_date: catalog?.results?.food?.enforcement?.export_date,
      records: part.records,
      size_mb: part.size_mb,
      file: part.file,
      saved: dest,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      saved: dest,
      records: part.records,
      size_mb: part.size_mb,
      export_date: catalog?.results?.food?.enforcement?.export_date,
    },
    null,
    2,
  ),
);
