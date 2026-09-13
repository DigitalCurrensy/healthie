import { chromium } from "playwright";

const FILES = [
  { file: "/workspace/attachments/IMG_0493.HEIC", expect: /nutella biscuits/i },
  { file: "/workspace/attachments/IMG_0495.HEIC", expect: /almond butter|granola|purely elizabeth/i },
  { file: "/workspace/attachments/IMG_0494.HEIC", expect: /alkaline|electrolyte|365/i },
];

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
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

const results = [];
for (const item of FILES) {
  const before = errors.length;
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 25000 });
  const input = page.locator('input[aria-label="Upload a pack photo from your camera roll"]').first();
  await input.setInputFiles(item.file);
  let navigated = false;
  try {
    await page.waitForURL(/\/product\//, { timeout: 55000 });
    navigated = true;
  } catch {
    /* stay */
  }
  const body = (await page.locator("body").innerText()).slice(0, 500);
  const name = item.file.split("/").pop();
  const shot = `/workspace/screenshots/m-upload-${name?.replace(/\W+/g, "-")}.png`;
  await page.screenshot({ path: shot });
  results.push({
    file: name,
    url: page.url(),
    navigated,
    matched: item.expect.test(body),
    overlayOrProduct: /reading the pack|opening the photo|\/100|poor|good|excellent/i.test(body),
    body: body.slice(0, 220),
    errors: errors.slice(before),
    shot,
  });
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
