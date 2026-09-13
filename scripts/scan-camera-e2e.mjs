import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8080";

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

async function run(name, contextOptions, fn) {
  const browser = await chromium.launch({
    args: ["--disable-dev-shm-usage", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    permissions: ["camera"],
    ...contextOptions,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    const result = await fn(page);
    return { name, ...result, errors };
  } catch (err) {
    await page.screenshot({ path: `/workspace/screenshots/qa-cam-${name}.png` }).catch(() => null);
    return { name, ok: false, error: String(err), url: page.url(), errors };
  } finally {
    await browser.close();
  }
}

const results = [];

results.push(
  await run("take-photo-is-button", {}, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 25000 });
    const take = page.getByRole("button", { name: "Take photo" }).or(page.getByLabel("Take a photo of the pack"));
    await take.first().waitFor({ state: "visible", timeout: 8000 });
    const captureHome = await page.locator('input[aria-label="Take a photo of the pack"]').count();
    return { ok: true, captureHome };
  }),
);

results.push(
  await run("scan-opens-live-camera", {}, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByText("Scan barcode", { exact: true }).first().click();
    const sheet = page.locator(".fixed.inset-0.z-50");
    await sheet.waitFor({ state: "visible", timeout: 8000 });
    const video = sheet.locator("video");
    await video.waitFor({ state: "attached", timeout: 8000 });
    await page.waitForFunction(
      () => {
        const v = document.querySelector(".fixed.inset-0.z-50 video");
        return v instanceof HTMLVideoElement && v.videoWidth > 0 && !v.classList.contains("invisible");
      },
      null,
      { timeout: 12000 },
    );
    const heading = await sheet.locator("p").first().innerText();
    await page.screenshot({ path: "/workspace/screenshots/qa-scan-live-camera.png" });
    return { ok: /barcode|point/i.test(heading), heading };
  }),
);

results.push(
  await run("take-photo-opens-shutter", {}, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByRole("button", { name: "Take photo" }).click();
    const sheet = page.locator(".fixed.inset-0.z-50");
    await sheet.waitFor({ state: "visible", timeout: 8000 });
    await page.waitForFunction(
      () => {
        const v = document.querySelector(".fixed.inset-0.z-50 video");
        return v instanceof HTMLVideoElement && v.videoWidth > 0 && !v.classList.contains("invisible");
      },
      null,
      { timeout: 12000 },
    );
    const shutter = sheet.getByRole("button", { name: "Take photo" });
    await shutter.waitFor({ state: "visible", timeout: 8000 });
    await page.screenshot({ path: "/workspace/screenshots/qa-take-photo-shutter.png" });
    const captureInputs = await sheet.locator("input[capture]").count();
    return { ok: captureInputs === 0, captureInputs };
  }),
);

results.push(
  await run("take-photo-shutter-snaps", {}, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByRole("button", { name: "Take photo" }).click();
    const sheet = page.locator(".fixed.inset-0.z-50");
    await sheet.getByRole("button", { name: "Take photo" }).waitFor({ state: "visible", timeout: 15000 });
    await sheet.getByRole("button", { name: "Take photo" }).click();
    const overlay = await page.waitForFunction(
      () => /Reading the pack|Could not|Looking that up|Try a sharper/i.test(document.body.innerText),
      null,
      { timeout: 15000 },
    );
    return { ok: Boolean(overlay), body: (await page.locator("body").innerText()).slice(0, 180) };
  }),
);

results.push(
  await run("scan-type-still-works", {}, async (page) => {
    await page.goto(`${BASE}/scan`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByLabel("Enter barcode").first().fill("5449000000996");
    await page.getByRole("button", { name: "Look up" }).first().click();
    return waitForProduct(page, /coca-cola|coke/i);
  }),
);

results.push(
  await run("fallback-photograph-shutter", { permissions: [] }, async (page) => {
    await page.addInitScript(() => {
      const proto = navigator.mediaDevices;
      if (!proto) return;
      proto.getUserMedia = async () => {
        const err = new Error("Permission denied");
        err.name = "NotAllowedError";
        throw err;
      };
    });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 25000 });
    await page.getByText("Scan barcode", { exact: true }).first().click();
    const sheet = page.locator(".fixed.inset-0.z-50");
    await sheet.waitFor({ state: "visible", timeout: 8000 });
    const shutter = sheet.locator('input[aria-label="Photograph the pack with your camera"]');
    await shutter.waitFor({ state: "attached", timeout: 8000 });
    await page.screenshot({ path: "/workspace/screenshots/qa-scanner-fallback.png" });
    await shutter.setInputFiles("/workspace/artifacts/barcode-5449000000996.jpg");
    const out = await waitForProduct(page, /coca-cola|coke/i);
    return { ok: out.ok, heading: "Photograph the pack", url: out.url };
  }),
);

console.log(JSON.stringify({ ok: results.every((r) => r.ok), results }, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
