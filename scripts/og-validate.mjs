#!/usr/bin/env node
/**
 * Offline Open Graph / Twitter Card / iMessage checklist.
 * Does not call Facebook or X (those tools require a public HTTPS host
 * and a login). Validates the Healthie identity the injector will emit.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  grokOgHeadTags,
  isShareCrawler,
  renderCrawlerShareHtml,
} from "./grok-pwa-shared.mjs";

const cwd = process.cwd();
const site = JSON.parse(readFileSync(join(cwd, "src/lib/og/site.json"), "utf8"));
const host = process.argv[2] || "healthie.example";

function attr(html, key) {
  const m = html.match(new RegExp(`(?:property|name)="${key}" content="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

const tags = grokOgHeadTags({ host, site, appName: "Healthie", cwd }).join("\n");
const html = renderCrawlerShareHtml({ host, site });

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail || "" });
}

const jpg = join(cwd, "public/og.jpg");
check("public/og.jpg exists", existsSync(jpg), jpg);
if (existsSync(jpg)) {
  const buf = readFileSync(jpg);
  const size = statSync(jpg).size;
  check("JPEG magic / JFIF", buf[0] === 0xff && buf[1] === 0xd8 && buf.includes(Buffer.from("JFIF")), buf.slice(0, 10).toString("hex"));
  check("og.jpg under 5 MB (X)", size < 5_000_000, `${size} bytes`);
  check("og.jpg under 8 MB (Facebook / iMessage)", size < 8_000_000, `${size} bytes`);
  // SOF0 dimensions
  let w = 0;
  let h = 0;
  for (let i = 0; i < buf.length - 9; i++) {
    if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
      h = (buf[i + 5] << 8) | buf[i + 6];
      w = (buf[i + 7] << 8) | buf[i + 8];
      break;
    }
  }
  check("1200×630 card", w === 1200 && h === 630, `${w}×${h}`);
  check("width ≥ 900 (Apple TN3156)", w >= 900, String(w));
  const ratio = w && h ? w / h : 0;
  check("aspect ~1.91:1", ratio > 1.86 && ratio < 1.96, ratio.toFixed(3));
}

check("twitter:card summary_large_image", attr(tags, "twitter:card") === "summary_large_image");
check("twitter:title ≤ 70", attr(tags, "twitter:title").length > 0 && attr(tags, "twitter:title").length <= 70, attr(tags, "twitter:title"));
check("twitter:description ≤ 200", attr(tags, "twitter:description").length <= 200, String(attr(tags, "twitter:description").length));
check("twitter:image is https", /^https:\/\//.test(attr(tags, "twitter:image")), attr(tags, "twitter:image"));
check("og:image is https", /^https:\/\//.test(attr(tags, "og:image")), attr(tags, "og:image"));
check("og:image matches twitter:image", attr(tags, "og:image") === attr(tags, "twitter:image"));
check("og:title present", Boolean(attr(tags, "og:title")), attr(tags, "og:title"));
check("og:description present", Boolean(attr(tags, "og:description")));
check("og:type website (not x:game)", attr(tags, "og:type") === "website");
check("og:url https", /^https:\/\//.test(attr(tags, "og:url")), attr(tags, "og:url"));
check("og:image:width 1200", attr(tags, "og:image:width") === "1200");
check("og:image:height 630", attr(tags, "og:image:height") === "630");
check("twitter:site is a handle", /^@[A-Za-z0-9_]{1,15}$/.test(attr(tags, "twitter:site")), attr(tags, "twitter:site"));
check("no og.grok.me placeholder", !tags.includes("og.grok.me"));
check("Grok-Preview is not a crawler", isShareCrawler("Grok-Preview/1.0") === false);
check("iMessage combo UA is a crawler", isShareCrawler("facebookexternalhit/1.1 Facebot Twitterbot/1.0") === true);
check("Safari iPhone is not a crawler", isShareCrawler("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)") === false);
check("crawler HTML < 4 KB", html.length < 4000, String(html.length));
check("same og:title in crawler HTML", attr(html, "og:title") === attr(tags, "og:title"));

const failed = checks.filter((c) => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;
