import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BARCODE = "5449000000996";
const IMAGE = "/workspace/artifacts/barcode-5449000000996.jpg";

function waitForProduct(page, expectName) {
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
    const nameOk = expectName ? expectName.test(body) : true;
    return { ok: nameOk && /\/100/.test(body), url: page.url(), body: body.slice(0, 220) };
  })();
}

async function installFakeCamera(context) {
  const b64 = readFileSync(IMAGE).toString("base64");
  await context.addInitScript(({ b64: data, mime }) => {
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
        const x = (canvas.width - bmp.width) / 2;
        const y = (canvas.height - bmp.height) / 2;
        ctx.drawImage(bmp, x, y);
        requestAnimationFrame(draw);
      };
      draw();
      const stream = canvas.captureStream(24);
      if (!stream.getVideoTracks().length) throw new Error("no-media");
      return stream;
    };
  }, { b64, mime: "image/jpeg" });
}

const browser = await chromium.launch({
  args: ["--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  permissions: ["camera"],
});
await installFakeCamera(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const results = [];

try {
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 25000 });
  await page.getByText("Scan barcode", { exact: true }).first().click();
  const live = await waitForProduct(page, /coca-cola|coke/i);
  await page.screenshot({ path: "/workspace/screenshots/qa-camera-live.png" });
  results.push({ name: "live-camera-decode", ...live, errors: [...errors] });
} catch (err) {
  await page.screenshot({ path: "/workspace/screenshots/qa-camera-live.png" });
  results.push({
    name: "live-camera-decode",
    ok: false,
    error: String(err),
    url: page.url(),
    body: (await page.locator("body").innerText().catch(() => "")).slice(0, 400),
    errors: [...errors],
  });
}

errors.length = 0;
try {
  const scanPage = await context.newPage();
  scanPage.on("pageerror", (e) => errors.push(String(e)));
  await scanPage.goto("http://127.0.0.1:8080/scan", { waitUntil: "networkidle", timeout: 25000 });
  const scanBtn = scanPage.getByText("Scan barcode", { exact: true }).first();
  try {
    await scanBtn.click({ timeout: 5000 });
  } catch {
    /* permission already granted — live camera auto-opens */
  }
  const live = await waitForProduct(scanPage, /coca-cola|coke/i);
  await scanPage.screenshot({ path: "/workspace/screenshots/qa-camera-scan-page.png" });
  results.push({ name: "scan-page-live", ...live, errors: [...errors] });
  await scanPage.close();
} catch (err) {
  const body = await page.locator("body").innerText().catch(() => "");
  results.push({
    name: "scan-page-live",
    ok: false,
    error: String(err),
    body: body.slice(0, 400),
    errors: [...errors],
  });
}

errors.length = 0;
try {
  const snapCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const snapPage = await snapCtx.newPage();
  snapPage.on("pageerror", (e) => errors.push(String(e)));
  await snapPage.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 25000 });
  const take = snapPage.getByText("Take photo", { exact: true }).first();
  await take.waitFor({ state: "visible", timeout: 8000 });
  const takeIsFile = await take.evaluate((el) => Boolean(el.closest("label")?.querySelector("input[type=file]")));
  const roll = snapPage.locator('input[aria-label="Choose a pack photo from your camera roll"]').first();
  await roll.setInputFiles(IMAGE);
  const snap = await waitForProduct(snapPage, /coca-cola|coke/i);
  await snapPage.screenshot({ path: "/workspace/screenshots/qa-camera-use-camera.png" });
  results.push({ name: "take-photo-is-not-upload", ok: snap.ok && takeIsFile === false, takeIsFile, ...snap, errors: [...errors] });
  await snapCtx.close();
} catch (err) {
  results.push({
    name: "take-photo-is-not-upload",
    ok: false,
    error: String(err),
    errors: [...errors],
  });
}

errors.length = 0;
try {
  const iframeCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await iframeCtx.addInitScript(() => {
    const proto = navigator.mediaDevices;
    if (!proto) return;
    proto.getUserMedia = async () => {
      const err = new Error("Permission denied");
      err.name = "NotAllowedError";
      throw err;
    };
  });
  const iframePage = await iframeCtx.newPage();
  iframePage.on("pageerror", (e) => errors.push(String(e)));
  await iframePage.setContent(
    `<!doctype html><html><body style="margin:0;background:#111">
      <iframe src="http://127.0.0.1:8080/" title="app" style="border:0;width:390px;height:844px"></iframe>
    </body></html>`,
    { waitUntil: "domcontentloaded", timeout: 25000 },
  );
  const frame = iframePage.frameLocator("iframe");
  await frame.getByText("Scan barcode").first().waitFor({ timeout: 20000 });
  const childWait = iframePage.frames().find((f) => /8080/.test(f.url()));
  if (childWait) await childWait.waitForLoadState("networkidle").catch(() => null);
  await iframePage.waitForTimeout(400);
  const popupPromise = iframePage.context().waitForEvent("page", { timeout: 4000 }).catch(() => null);
  await frame.getByText("Scan barcode", { exact: true }).first().click({ force: true });
  await popupPromise;
  const sheet = frame.locator("div.fixed.inset-0.z-50");
  await sheet.waitFor({ state: "visible", timeout: 8000 });
  const sample = sheet.getByRole("button", { name: /coca-cola/i }).first();
  await sample.waitFor({ state: "visible", timeout: 8000 });
  await iframePage.screenshot({ path: "/workspace/screenshots/qa-camera-iframe-fallback.png" });
  await sample.click();
  const child = iframePage.frames().find((f) => /127\.0\.0\.1:8080/.test(f.url()));
  if (!child) throw new Error("app iframe missing");
  await child.waitForURL(/\/product\//, { timeout: 20000 });
  await child.waitForFunction(
    () => {
      const t = document.body?.innerText || "";
      return /\/100/.test(t) && !/Looking that up|Reading the pack/i.test(t);
    },
    null,
    { timeout: 20000 },
  );
  const text = await child.locator("body").innerText();
  await iframePage.screenshot({ path: "/workspace/screenshots/qa-camera-iframe-result.png" });
  results.push({
    name: "iframe-photo-scan",
    ok: /coca-cola|coke/i.test(text) && /\/100/.test(text),
    url: child.url(),
    body: text.slice(0, 220),
    errors: [...errors],
  });
  await iframeCtx.close();
} catch (err) {
  results.push({
    name: "iframe-photo-scan",
    ok: false,
    error: String(err),
    errors: [...errors],
  });
}

await browser.close();
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ ok, results }, null, 2));
process.exit(ok ? 0 : 1);
