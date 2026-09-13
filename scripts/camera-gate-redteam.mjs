import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8080";
const BARCODE = "5449000000996";
const IMAGE = "/workspace/artifacts/barcode-5449000000996.jpg";

function waitProduct(page, expectName = /coca-cola|coke/i) {
  return (async () => {
    await page.waitForURL(/\/product\//, { timeout: 25000 });
    await page.waitForFunction(
      () => {
        const t = document.body?.innerText || "";
        return /\/100/.test(t) && !/Looking that up|Reading the pack|Searching the world|Opening camera/i.test(t);
      },
      null,
      { timeout: 20000 },
    );
    const body = await page.locator("body").innerText();
    return { ok: expectName.test(body) && /\/100/.test(body), url: page.url(), body: body.slice(0, 180) };
  })();
}

async function installFakeCamera(context) {
  const b64 = readFileSync(IMAGE).toString("base64");
  await context.addInitScript(
    ({ b64: data, mime }) => {
      const proto = navigator.mediaDevices;
      if (!proto) return;
      proto.getUserMedia = async () => {
        const blob = await fetch(`data:${mime};base64,${data}`).then((r) => r.blob());
        const bmp = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(640, bmp.width);
        canvas.height = Math.max(360, bmp.height);
        const ctx = canvas.getContext("2d");
        const draw = () => {
          if (!ctx) return;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(bmp, (canvas.width - bmp.width) / 2, (canvas.height - bmp.height) / 2);
          requestAnimationFrame(draw);
        };
        draw();
        return canvas.captureStream(24);
      };
    },
    { b64, mime: "image/jpeg" },
  );
}

async function denyCamera(context) {
  await context.addInitScript(() => {
    const proto = navigator.mediaDevices;
    if (!proto) return;
    proto.getUserMedia = async () => {
      const err = new Error("Permission denied");
      err.name = "NotAllowedError";
      throw err;
    };
  });
}

async function iframeApp(page) {
  await page.setContent(
    `<!doctype html><iframe src="${BASE}/" style="border:0;width:390px;height:844px"></iframe>`,
    { waitUntil: "domcontentloaded" },
  );
  const frame = page.frameLocator("iframe");
  await frame.getByRole("button", { name: /scan barcode/i }).waitFor({ timeout: 20000 });
  const child = page.frames().find((f) => /8080/.test(f.url()));
  if (child) await child.waitForLoadState("networkidle").catch(() => null);
  await page.waitForTimeout(400);
  return frame;
}

function iframeSheet(frame) {
  return frame.locator("div.fixed.inset-0.z-50").or(frame.getByRole("dialog"));
}

const results = [];

async function run(name, fn) {
  const started = Date.now();
  try {
    const extra = await fn();
    const ok = extra?.ok !== false;
    results.push({ name, ok, ms: Date.now() - started, ...extra });
  } catch (err) {
    results.push({ name, ok: false, ms: Date.now() - started, error: String(err).slice(0, 280) });
  }
}

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const mobile = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, permissions: ["camera"] };
const desktop = { viewport: { width: 1280, height: 800 } };

await run("01-home-scan-is-button", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: /scan barcode/i });
  const tag = await btn.evaluate((el) => el.tagName);
  const isFile = await btn.evaluate((el) => Boolean(el.closest("label")?.querySelector("input[type=file]")));
  await ctx.close();
  return { ok: tag === "BUTTON" && !isFile, tag, isFile };
});

await run("02-take-photo-is-button-not-file", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: /^take photo$/i });
  await btn.waitFor({ state: "visible" });
  const count = await btn.count();
  const isFile = await btn.evaluate((el) => Boolean(el.closest("label")?.querySelector("input[type=file]")));
  await ctx.close();
  return { ok: count === 1 && !isFile, isFile, count };
});

await run("03-camera-roll-is-file-input", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const n = await page.locator('input[aria-label="Choose a pack photo from your camera roll"]').count();
  await ctx.close();
  return { ok: n >= 1, n };
});

await run("04-home-scan-opens-overlay", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog", { name: /scan barcode/i }).waitFor({ state: "visible", timeout: 8000 });
  await ctx.close();
  return { ok: true };
});

await run("05-overlay-stays-no-fake-barcode", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(1600);
  const still = await sheet.isVisible();
  const text = await sheet.innerText();
  await ctx.close();
  return { ok: still && !/LIVE DEMO|5 449000 000996/i.test(text), still };
});

await run("06-overlay-has-samples-and-type", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible" });
  const coke = await sheet.getByRole("button", { name: /coca-cola/i }).count();
  const type = await sheet.getByLabel("Enter barcode").count();
  await ctx.close();
  return { ok: coke >= 1 && type >= 1, coke, type };
});

await run("07-overlay-type-barcode", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Enter barcode").fill(BARCODE);
  await sheet.getByRole("button", { name: /look up/i }).click();
  const out = await waitProduct(page);
  await ctx.close();
  return out;
});

await run("08-overlay-sample-coke", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog").getByRole("button", { name: /coca-cola/i }).first().click();
  const out = await waitProduct(page);
  await ctx.close();
  return out;
});

await run("09-overlay-escape-closes", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await sheet.waitFor({ state: "hidden", timeout: 4000 });
  await ctx.close();
  return { ok: true };
});

await run("10-overlay-x-closes", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog").getByRole("button", { name: /close scanner/i }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 4000 });
  await ctx.close();
  return { ok: true };
});

await run("11-reopen-after-close", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog").getByRole("button", { name: /close scanner/i }).click();
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 8000 });
  await ctx.close();
  return { ok: true };
});

await run("12-take-photo-opens-overlay", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^take photo$/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  const text = await sheet.innerText();
  await ctx.close();
  return { ok: /take a photo|photograph|pick a pack photo|scan barcode/i.test(text) };
});

await run("13-scan-page-opens-overlay", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/scan`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 8000 });
  await ctx.close();
  return { ok: true };
});

await run("14-scan-page-type", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/scan`, { waitUntil: "networkidle" });
  await page.getByLabel("Enter barcode").fill(BARCODE);
  await page.getByRole("button", { name: /look up/i }).click();
  const out = await waitProduct(page);
  await ctx.close();
  return out;
});

await run("15-scan-page-sample-nutella", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/scan`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^nutella$/i }).click();
  const out = await waitProduct(page, /nutella/i);
  await ctx.close();
  return out;
});

await run("16-product-scan-next-opens-overlay", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/product/${BARCODE}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan next pack/i }).click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 8000 });
  await ctx.close();
  return { ok: true };
});

await run("17-iframe-scan-opens-overlay", async () => {
  const ctx = await browser.newContext(mobile);
  await denyCamera(ctx);
  const page = await ctx.newPage();
  const frame = await iframeApp(page);
  await frame.getByRole("button", { name: /scan barcode/i }).click({ force: true });
  await iframeSheet(frame).waitFor({ state: "visible", timeout: 8000 });
  await ctx.close();
  return { ok: true };
});

await run("18-iframe-no-fake-barcode", async () => {
  const ctx = await browser.newContext(mobile);
  await denyCamera(ctx);
  const page = await ctx.newPage();
  const frame = await iframeApp(page);
  await frame.getByRole("button", { name: /scan barcode/i }).click({ force: true });
  const sheet = iframeSheet(frame);
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(1500);
  const text = await sheet.innerText();
  await ctx.close();
  return { ok: !/LIVE DEMO|5 449000 000996/i.test(text) && /coca-cola|photograph|open live camera/i.test(text), snippet: text.slice(0, 160) };
});

await run("19-iframe-open-live-camera-link", async () => {
  const ctx = await browser.newContext(mobile);
  await denyCamera(ctx);
  const page = await ctx.newPage();
  const frame = await iframeApp(page);
  await frame.getByRole("button", { name: /scan barcode/i }).click({ force: true });
  const sheet = iframeSheet(frame);
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  const link = sheet.getByRole("link", { name: /open live camera/i });
  const href = await link.getAttribute("href");
  const target = await link.getAttribute("target");
  await ctx.close();
  return { ok: /\/lens/.test(href || "") && target === "_blank", href, target };
});

await run("20-iframe-sample-completes", async () => {
  const ctx = await browser.newContext(mobile);
  await denyCamera(ctx);
  const page = await ctx.newPage();
  const frame = await iframeApp(page);
  await frame.getByRole("button", { name: /scan barcode/i }).click({ force: true });
  const sheet = iframeSheet(frame);
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  await sheet.getByRole("button", { name: /^coca-cola$/i }).first().click();
  const child = page.frames().find((f) => /8080/.test(f.url()));
  await child.waitForURL(/\/product\//, { timeout: 20000 });
  await child.waitForFunction(() => /\/100/.test(document.body?.innerText || ""), null, { timeout: 20000 });
  const text = await child.locator("body").innerText();
  await ctx.close();
  return { ok: /coca-cola/i.test(text) && /\/100/.test(text) };
});

await run("21-lens-page-sheet", async () => {
  const ctx = await browser.newContext(desktop);
  await denyCamera(ctx);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/lens?autostart=1&mode=barcode`, { waitUntil: "networkidle" });
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(1200);
  const text = await sheet.innerText();
  await ctx.close();
  return { ok: /coca-cola|photograph|turn camera|pick a pack photo/i.test(text) && !/LIVE DEMO/i.test(text) };
});

await run("22-desktop-gate-no-capture-attr", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible" });
  const captureN = await sheet.locator("input[capture]").count();
  const phoneCam = await sheet.getByText("Phone camera", { exact: true }).count();
  await ctx.close();
  return { ok: captureN === 0 && phoneCam === 0, captureN, phoneCam };
});

await run("23-mobile-gate-has-capture", async () => {
  const ctx = await browser.newContext({
    ...mobile,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible" });
  const captureN = await sheet.locator('input[capture="environment"]').count();
  await ctx.close();
  return { ok: captureN >= 1, captureN };
});

await run("24-double-click-scan-no-crash", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: /scan barcode/i });
  await btn.click();
  await btn.click({ force: true }).catch(() => null);
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await ctx.close();
  return { ok: errors.length === 0, errors };
});

await run("25-short-code-stays-on-sheet", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Enter barcode").fill("123");
  await sheet.getByRole("button", { name: /look up/i }).click();
  await page.waitForTimeout(400);
  const still = await sheet.isVisible();
  await ctx.close();
  return { ok: still && !/\/product\//.test(page.url()), url: page.url() };
});

await run("26-live-fake-camera-decode", async () => {
  const ctx = await browser.newContext(mobile);
  await installFakeCamera(ctx);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan barcode/i }).click();
  const out = await waitProduct(page);
  await ctx.close();
  return out;
});

await run("27-camera-roll-decode", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator('input[aria-label="Choose a pack photo from your camera roll"]').first().setInputFiles(IMAGE);
  const out = await waitProduct(page);
  await ctx.close();
  return out;
});

await run("28-scan-next-sample-from-product", async () => {
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/product/${BARCODE}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /scan next pack/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  await sheet.getByRole("button", { name: /^nutella$/i }).click();
  const out = await waitProduct(page, /nutella/i);
  await ctx.close();
  return out;
});

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ ok: failed.length === 0, passed: results.filter((r) => r.ok).length, failed: failed.length, results }, null, 2));
process.exit(failed.length ? 1 : 0);
