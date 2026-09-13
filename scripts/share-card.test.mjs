import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  grokOgHeadTags,
  injectGrokPwaHead,
  isShareCrawler,
  renderCrawlerShareHtml,
} from "./grok-pwa-shared.mjs";

const site = JSON.parse(readFileSync(join(process.cwd(), "src/lib/og/site.json"), "utf8"));
const host = "healthie.example";

function attr(html, key) {
  const property = html.match(new RegExp(`(?:property|name)="${key}" content="([^"]*)"`, "i"));
  return property ? property[1] : "";
}

test("Healthie identity passes the X summary_large_image checklist", () => {
  const tags = grokOgHeadTags({ host, site, appName: "Healthie" }).join("\n");
  assert.equal(attr(tags, "twitter:card"), "summary_large_image");
  assert.equal(attr(tags, "twitter:title"), "Healthie");
  assert.ok(attr(tags, "twitter:title").length <= 70);
  assert.ok(attr(tags, "twitter:description").length > 0);
  assert.ok(attr(tags, "twitter:description").length <= 200);
  assert.match(attr(tags, "twitter:image"), new RegExp(`^https://${host}/og\\.jpg`));
  assert.match(attr(tags, "twitter:image"), /^https:\/\//);
  assert.equal(attr(tags, "twitter:site"), "@IAmAdrianSwish");
  assert.equal(attr(tags, "twitter:creator"), "@IAmAdrianSwish");
  assert.equal(attr(tags, "og:title"), "Healthie");
  assert.ok(attr(tags, "og:description").length > 0);
  assert.match(attr(tags, "og:image"), new RegExp(`^https://${host}/og\\.jpg`));
  assert.equal(attr(tags, "og:image:width"), "1200");
  assert.equal(attr(tags, "og:image:height"), "630");
  assert.equal(attr(tags, "og:image:type"), "image/jpeg");
  assert.equal(attr(tags, "og:url"), `https://${host}/`);
  assert.equal(attr(tags, "og:type"), "website");
  assert.equal(attr(tags, "og:logo"), `https://${host}/brand/og-logo.png`);
  assert.doesNotMatch(tags, /og\.grok\.me/);
});

test("Twitterbot and iMessage user-agents get the crawler share card", () => {
  assert.equal(isShareCrawler("Twitterbot/1.0"), true);
  assert.equal(isShareCrawler("facebookexternalhit/1.1"), true);
  assert.equal(
    isShareCrawler(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0",
    ),
    true,
  );
  assert.equal(isShareCrawler("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"), false);
  assert.equal(isShareCrawler("Grok-Preview/1.0"), false);
  assert.equal(isShareCrawler("Mozilla/5.0 (Linux) AppleWebKit/537.36 Chrome/120.0.0.0"), false);

  const html = renderCrawlerShareHtml({ host, site });
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="https:\/\/healthie\.example\/og\.jpg/);
  assert.match(html, /name="twitter:site" content="@IAmAdrianSwish"/);
  assert.match(html, /property="og:url"/);
  assert.ok(html.length < 4000);
});

test("injector overwrites a summary card into summary_large_image with twitter:image", () => {
  const html =
    '<html><head><title>Healthie</title><meta name="twitter:card" content="summary"></head></html>';
  const out = injectGrokPwaHead(html, { host, site, cwd: process.cwd() });
  assert.match(out, /name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(out, /content="summary"/);
  assert.match(out, /name="twitter:image" content="https:\/\//);
  assert.equal(out.split('name="twitter:card"').length - 1, 1);
});
