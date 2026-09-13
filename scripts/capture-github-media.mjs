#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { checkedUrl } from "./browser-guard.mjs";

const origin = checkedUrl(process.argv[2] || "http://127.0.0.1:8080/");
const outDir = join(process.cwd(), "docs/media");
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "home", path: "/", width: 390, height: 844 },
  { name: "home-desktop", path: "/", width: 1280, height: 800 },
  { name: "scan", path: "/scan", width: 390, height: 844 },
  { name: "aisles", path: "/catalog", width: 390, height: 844 },
  { name: "coke", path: "/product/5449000000996", width: 390, height: 844 },
  { name: "evian", path: "/product/3274080005003", width: 390, height: 844 },
  { name: "insights", path: "/insights", width: 390, height: 844 },
  { name: "guides", path: "/guides", width: 390, height: 844 },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
    });
    const url = new URL(shot.path, origin).href;
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1400);
    const file = join(outDir, `${shot.name}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 78, fullPage: false });
    const status = resp?.status() ?? 0;
    results.push({ name: shot.name, status, file, title: await page.title() });
    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync(join(outDir, "index.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ ok: true, results }, null, 2));
