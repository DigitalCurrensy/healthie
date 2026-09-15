#!/usr/bin/env node
/** Nightly RES harvest. Not imported by product loaders.
 *  node scripts/harvest-fda.mjs
 */
const START = "https://api.fda.gov/food/enforcement.json?limit=1000&sort=report_date:desc";
const MAX_PAGES = Number(process.env.FDA_HARVEST_PAGES || 40);

function nextFromLink(header) {
  if (!header) return null;
  const m = String(header).match(/<([^>]+)>;\s*rel="next"/i);
  return m?.[1] ?? null;
}

const rows = [];
const seen = new Set();
let url = START;
let pages = 0;
while (url && pages < MAX_PAGES) {
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) {
    console.error("page fail", res.status, url);
    break;
  }
  const json = await res.json();
  for (const r of json.results || []) {
    const id = r.recall_number || r.event_id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    rows.push({
      recallNumber: r.recall_number,
      status: r.status,
      classification: r.classification,
      firm: r.recalling_firm,
      product: r.product_description,
    });
  }
  pages += 1;
  url = nextFromLink(res.headers.get("link") || res.headers.get("Link"));
  process.stdout.write(`page ${pages} rows ${rows.length}\n`);
}
console.log(JSON.stringify({ pages, rows: rows.length, sample: rows.slice(0, 3) }, null, 2));
