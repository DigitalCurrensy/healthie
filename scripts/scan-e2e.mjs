import { chromium } from "playwright";

const base = "http://127.0.0.1:8080";
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const errors = [];

async function waitForProduct(page, expectName) {
  await page.waitForURL(/\/product\//, { timeout: 25000 });
  await page.waitForFunction(
    () => {
      const t = document.body?.innerText || "";
      return /\/100/.test(t) && !/Looking that up|Reading the pack|Searching the world/i.test(t);
    },
    null,
    { timeout: 20000 },
  );
  const body = await page.locator("body").innerText();
  const nameOk = expectName ? expectName.test(body) : true;
  return { ok: nameOk && /\/100/.test(body), url: page.url(), body: body.slice(0, 220) };
}

async function run(name, viewport, fn) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: viewport.width < 500 ? 2 : 1,
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
  });
  const page = await context.newPage();
  const local = [];
  page.on("pageerror", (e) => local.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") local.push(m.text());
  });
  try {
    const result = await fn(page);
    return { name, ok: result.ok !== false, ...result, errors: local };
  } catch (err) {
    return { name, ok: false, error: String(err), url: page.url(), errors: local };
  } finally {
    errors.push(...local.map((e) => ({ name, e })));
    await context.close();
  }
}

const mobile = { width: 390, height: 844 };
const desktop = { width: 1280, height: 800 };

const results = [];

results.push(
  await run("home-logo", desktop, async (page) => {
    await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 25000 });
    const logo = page.locator('img[alt="Healthie — wellness and vitality platform"]');
    await logo.waitFor({ timeout: 8000 });
    const box = await logo.boundingBox();
    await page.screenshot({ path: "/workspace/screenshots/qa-home-logo.png" });
    const body = await page.locator("body").innerText();
    return {
      ok: Boolean(box && box.width >= 160 && /Scan it/i.test(body)),
      logoWidth: box?.width,
      hasScan: /Scan barcode/i.test(body),
      hasSamples: /Coca-Cola/i.test(body),
    };
  }),
);

results.push(
  await run("home-sample-coke", mobile, async (page) => {
    await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByRole("button", { name: "Coca-Cola" }).first().click();
    const out = await waitForProduct(page, /coca-cola|coke/i);
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-sample-coke.png" });
    return out;
  }),
);

results.push(
  await run("scan-type-barcode", mobile, async (page) => {
    await page.goto(`${base}/scan`, { waitUntil: "networkidle", timeout: 25000 });
    const input = page.getByLabel("Enter barcode").first();
    await input.waitFor({ timeout: 8000 });
    await input.fill("5449000000996");
    await page.getByRole("button", { name: "Look up" }).first().click();
    const out = await waitForProduct(page, /coca-cola|coke/i);
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-typed.png" });
    return out;
  }),
);

results.push(
  await run("scan-sample-nutella", mobile, async (page) => {
    await page.goto(`${base}/scan`, { waitUntil: "networkidle", timeout: 25000 });
    const nutella = page.getByRole("button", { name: "Nutella" }).first();
    await nutella.waitFor({ timeout: 8000 });
    await nutella.click();
    const out = await waitForProduct(page, /nutella/i);
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-sample-nutella.png" });
    return out;
  }),
);

results.push(
  await run("scan-pack-photo", mobile, async (page) => {
    await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 25000 });
    const input = page.locator('input[aria-label="Choose a pack photo from your camera roll"]').first();
    await input.setInputFiles("/workspace/artifacts/barcode-5449000000996.jpg");
    const out = await waitForProduct(page, /coca-cola|coke/i);
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-pack-photo.png" });
    return out;
  }),
);

results.push(
  await run("live-camera-sheet", mobile, async (page) => {
    await page.goto(`${base}/scan`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByText("Scan barcode", { exact: true }).first().click();
    const sheet = page.locator("div.fixed.inset-0.z-50");
    await sheet.getByLabel("Enter barcode").waitFor({ timeout: 8000 });
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-live-sheet.png" });
    await sheet.getByRole("button", { name: "Coca-Cola" }).first().click();
    return waitForProduct(page, /coca-cola|coke/i);
  }),
);

results.push(
  await run("guides-new", desktop, async (page) => {
    await page.goto(`${base}/guides`, { waitUntil: "networkidle", timeout: 25000 });
    const body = await page.locator("body").innerText();
    const count = await page.locator('a[href*="/guides/"]').count();
    await page.getByRole("button", { name: "Parents" }).click();
    const parentBody = await page.locator("body").innerText();
    await page.goto(`${base}/guides/ultraprocessed`, { waitUntil: "networkidle", timeout: 20000 });
    const article = await page.locator("body").innerText();
    await page.screenshot({ path: "/workspace/screenshots/qa-guide-ultraprocessed.png" });
    return {
      ok: /ultraprocessed|guides/i.test(body) && /NOVA|factory/i.test(article) && count >= 10,
      guideCount: count,
      parentHasLunch: /lunchbox|first spoon|toddler/i.test(parentBody),
    };
  }),
);

results.push(
  await run("ingredient-gluten", desktop, async (page) => {
    await page.goto(`${base}/ingredient/gluten`, { waitUntil: "networkidle", timeout: 20000 });
    const body = await page.locator("body").innerText();
    await page.screenshot({ path: "/workspace/screenshots/qa-ingredient-gluten.png" });
    return { ok: /gluten/i.test(body) && !/unknown ingredient/i.test(body), body: body.slice(0, 160) };
  }),
);

console.log(JSON.stringify({ results, leftoverErrors: errors.slice(0, 12) }, null, 2));
const failed = results.filter((r) => !r.ok);
await browser.close();
process.exit(failed.length ? 1 : 0);
