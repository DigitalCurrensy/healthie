import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://127.0.0.1:8080";
mkdirSync("/workspace/screenshots", { recursive: true });

const PAGES = [
  { name: "home", path: "/" },
  { name: "catalog", path: "/catalog" },
  { name: "guides", path: "/guides" },
  { name: "insights", path: "/insights" },
  { name: "you", path: "/you" },
  { name: "coke", path: "/product/5449000000996" },
  { name: "oats", path: "/product/8500108320195" },
  { name: "cosmetic", path: "/product/8500108320300" },
  { name: "pet", path: "/product/8500108320409" },
  { name: "biscuits", path: "/product/009800830039" },
  { name: "granola", path: "/product/0810589032602" },
  { name: "water365", path: "/product/099482513931" },
  { name: "missing", path: "/product/0000000000000" },
  { name: "aisle", path: "/aisle/drinks" },
  { name: "method", path: "/method" },
  { name: "ingredients", path: "/ingredients" },
  { name: "history", path: "/history" },
  { name: "saved", path: "/saved" },
  { name: "lists", path: "/lists" },
  { name: "compare", path: "/compare" },
  { name: "guide", path: "/guides/how-to-read-a-score" },
  { name: "ingredient", path: "/ingredient/e951" },
];

function auditScript() {
  return () => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
    const issues = [];
    if (overflowX > 2) issues.push({ kind: "overflowX", extra: overflowX });

    const interactive = [...document.querySelectorAll("a, button, [role=button], input, select, textarea")];
    const small = [];
    for (const el of interactive) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.getAttribute("type") === "file") continue;
      if (el.classList.contains("file-ghost")) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (r.height < 40 || r.width < 40) {
        small.push({
          tag: el.tagName,
          text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").slice(0, 60),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }

    const nav = document.querySelector("nav[aria-label=Primary]");
    let navOverlap = [];
    if (nav) {
      const nr = nav.getBoundingClientRect();
      const last = [...document.querySelectorAll("main a, main button")].slice(-3);
      for (const el of last) {
        const r = el.getBoundingClientRect();
        if (r.bottom > nr.top + 4 && r.top < nr.bottom) {
          navOverlap.push((el.innerText || "").slice(0, 40));
        }
      }
    }

    return {
      overflowX,
      title: document.title,
      smallTaps: small.slice(0, 25),
      smallTapCount: small.length,
      navOverlap,
      bodyLen: (document.body.innerText || "").length,
    };
  };
}

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const results = [];

async function runViewport(width, height, suffix) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      "healthie-prefs",
      JSON.stringify({
        state: {
          diet: "none",
          lifeStage: "none",
          allergens: ["milk"],
          avoidPalm: true,
          avoidFragrance: false,
          avoidNitrites: true,
          avoidUpf: false,
          sensitiveSkin: false,
          onboardingDone: true,
          favorites: ["5449000000996", "3274080005003"],
          compare: ["5449000000996", "3274080005003"],
          list: [
            {
              barcode: "5449000000996",
              title: "Coca-Cola Classic",
              brand: "Coca-Cola",
              score: 35,
              checked: false,
            },
            {
              barcode: "8500108320195",
              title: "Organic Rolled Oats",
              brand: "Healthie Pantry",
              score: 96,
              checked: true,
            },
          ],
        },
        version: 0,
      }),
    );
    localStorage.setItem(
      "healthie-history",
      JSON.stringify({
        state: {
          items: [
            {
              barcode: "5449000000996",
              title: "Coca-Cola Classic",
              brand: "Coca-Cola",
              type: "food",
              score: 35,
              scannedAt: Date.now(),
            },
            {
              barcode: "3274080005003",
              title: "Evian",
              brand: "Evian",
              type: "food",
              score: 95,
              scannedAt: Date.now() - 3600000,
            },
          ],
        },
        version: 0,
      }),
    );
  });

  for (const p of PAGES) {
    const consoleBefore = errors.length;
    try {
      const resp = await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 25000 });
      await page.waitForTimeout(350);
      const audit = await page.evaluate(auditScript());
      const shot = `/workspace/screenshots/m-${p.name}${suffix}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      results.push({
        vp: `${width}x${height}`,
        name: p.name,
        path: p.path,
        status: resp?.status() ?? 0,
        ...audit,
        errors: errors.slice(consoleBefore),
        shot,
      });
    } catch (err) {
      results.push({
        vp: `${width}x${height}`,
        name: p.name,
        path: p.path,
        error: String(err),
      });
    }
  }

  // scanner overlay
  try {
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 20000 });
    await page.getByRole("button", { name: /scan barcode/i }).click();
    await page.waitForTimeout(800);
    const shot = `/workspace/screenshots/m-scanner${suffix}.png`;
    await page.screenshot({ path: shot, fullPage: false });
    const audit = await page.evaluate(auditScript());
    const roll = await page.getByRole("button", { name: /camera roll/i }).count();
    const take = await page.getByRole("button", { name: /take (a )?photo/i }).count();
    const lookup = await page.getByRole("button", { name: /look up/i }).count();
    results.push({
      vp: `${width}x${height}`,
      name: "scanner",
      path: "/scanner",
      ...audit,
      shot,
      extra: { cameraRoll: roll, takePhoto: take, lookUp: lookup },
    });
    await page.getByRole("button", { name: /close scanner/i }).click().catch(() => {});
  } catch (err) {
    results.push({ vp: `${width}x${height}`, name: "scanner", error: String(err) });
  }

  // product full page
  await page.goto(BASE + "/product/5449000000996", { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(200);
  await page.screenshot({
    path: `/workspace/screenshots/m-coke-full${suffix}.png`,
    fullPage: true,
  });

  await context.close();
}

await runViewport(390, 844, "");
await runViewport(320, 568, "-se");

await browser.close();

const summary = results.map((r) => ({
  vp: r.vp,
  name: r.name,
  overflowX: r.overflowX,
  smallTapCount: r.smallTapCount,
  smallTaps: (r.smallTaps || []).slice(0, 8),
  navOverlap: r.navOverlap,
  errors: r.errors,
  error: r.error,
  status: r.status,
  extra: r.extra,
}));
writeFileSync("/tmp/mobile-e2e.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
