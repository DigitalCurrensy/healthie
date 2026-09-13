# Open Graph and share cards

Healthie unfurls with one card: the H on cream paper, “Scan a pack. See the score.”

## What the validators actually are

| Tool | What it does | What we use |
| --- | --- | --- |
| `node scripts/og-validate.mjs` | Offline checklist: JPEG, size, tags, crawler regex | **Run this.** 26/26 is the gate. |
| [Apple TN3156](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages) | iMessage rules | Same HTML for every UA. `og:title` + `og:image` ≥ 900 px wide. No JS. Page < 1 MB. |
| X Card Validator | Retired preview. Draft composer recaches. | Paste into a **new X draft**. Needs a public HTTPS host. |
| Meta Sharing Debugger | Recaches Facebook/Instagram | Public HTTPS host + login. |
| LinkedIn Post Inspector | Recaches LinkedIn | Public HTTPS host + login. |

There is no public Healthie domain yet. External debuggers cannot bless a sandbox host. Do not use `*.workers.dev` as a stand-in — Messages draws a grey chip and caches the miss.

## Required tags (injector)

Identity: `src/lib/og/site.json`. Emitter: `scripts/grok-pwa-shared.mjs`. Do not hand-author `og:*` in `__root.tsx` (the injector overwrites them).

- `og:title`, `og:description`, `og:image` (absolute HTTPS, 1200×630 JPEG)
- `og:image:width` 1200, `og:image:height` 630, `og:type` website
- `twitter:card` = `summary_large_image`
- `twitter:title` ≤ 70, `twitter:description` ≤ 200, `twitter:image` same as `og:image`
- `twitter:site` handle when we have one

## Vary caching (why we killed it)

`Cache-Control` + `Vary: User-Agent` means a CDN may store **two bodies** for `/`: a 2 KB bot stub and the real shop. The next visitor can get the wrong one. Apple also requires identical metadata for every client. So: one HTML, tags in `<head>`, no bot-only stub.

## Image rules we learned

- JFIF JPEG (`FF D8 FF E0 … JFIF`). ffmpeg COM (`FF D8 FF FE`) is a crawler lottery.
- 1200×630, ~1.91:1, under ~150 KB here (X max 5 MB, Apple associated assets 10 MB).
- Absolute `https://host/og.jpg`. Relative `/og.jpg` unfurls nowhere.

## Proof

```bash
node scripts/og-validate.mjs
```
