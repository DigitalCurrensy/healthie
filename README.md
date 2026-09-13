# Healthie

Scan a pack. Know immediately.

Healthie is an independent score for **food**, **body & beauty**, and **pet food**. Point at a barcode or photograph the front. You get a 0–100 number, a plain-English reason, and a better neighbour in the same aisle.

No brand pays for a better score. Healthie is a reading aid, not a diagnosis. If you have an allergy, always check the pack.

Private house. Digital Currensy Inc. Not EventFix. Not AutoShield. Houses do not merge.

## What you get in one look

| Number | Word | Meaning |
| --- | --- | --- |
| 80–100 | Excellent | A keep. Short list, honest recipe. |
| 60–79 | Good | Fine sometimes. Not the best in the aisle. |
| 40–59 | Poor | A treat at best. Look one shelf over. |
| 0–39 | Avoid | Hard pass for a regular shop. |

Sugars in teaspoons. Salt in a day’s worth. Additives by name, not E-code soup. Beauty and pet food use the same voice — calm, not lab-coat.

## What’s live

| Desk | What it does |
| --- | --- |
| **Scan** `/` `/scan` | Barcode lens, take a photo of the pack, camera roll, or type the numbers |
| **Product** `/product/:barcode` | 0–100 score, why, ingredients, Nutri-Score / NOVA in human words, prices, swaps |
| **Aisles** `/aisles` | Food, body & beauty, pet — walk the store |
| **Catalog** `/catalog` | Search by name or barcode |
| **Guides** `/guides` | How to read a score, sugar, palm, fragrance, pet bowls, pregnancy, sun |
| **Ingredients** `/ingredients` | One page per additive / allergen — worth watching, not a scare poster |
| **Compare** `/compare` | Two packs, side by side |
| **Insights** `/insights` | Your aisle over time (signed-in) |
| **You** `/you` | Lists, saved, history, sign-in |

Try without a camera: Coca-Cola `5449000000996`, Nutella `3017620422003`.

## How this is different

Yuka, EWG, Fooducate, and Open Food Facts exist. Healthie is not a clone of any of them.

1. **Independent** — no brand pays for a better number. Say it on every product page.
2. **Digestible** — teaspoons of sugar, not 37 g/100 ml. “Ultra-processed,” not “NOVA 4” as the headline.
3. **Three aisles, one voice** — food, lotion, and kibble share the same score ring.
4. **Scan that finishes** — live lens on a real phone; photograph / type / sample packs when a preview or desktop has no camera.
5. **A reading aid** — never a diagnosis, never a medical claim.

## Docs

| File | What’s in it |
| --- | --- |
| [DESCRIPTION.md](DESCRIPTION.md) | One-pager for stores, press, and the GitHub about |
| [ROADMAP.md](ROADMAP.md) | Now / next / later — nothing shipped as a dead button |
| [docs/MESSAGING.md](docs/MESSAGING.md) | Voice, lines you can say out loud, words we refuse |
| [docs/BRAND.md](docs/BRAND.md) | Lockup, cream paper, independence line |
| [BUILT-VS-NOT.md](BUILT-VS-NOT.md) | Honest inventory |

This repository holds the product source (TanStack Start app) plus the house docs.

## Run it

```bash
npm install
npm run dev
```

Then open the app in a browser. Type a barcode or tap a sample pack.

```bash
npm run typecheck
npm test
npm run build
```

### Environment

Copy secrets only if you are wiring a live database or OAuth. Without them, the catalog, scores, guides, and scan path still run (PGLite fallback).

Do not commit `.env`. Camera needs a **secure context** (HTTPS or localhost) and a **top-level page**. An embedded preview cannot hold a live lens — Scan barcode opens `/lens` in a new tab, and the overlay stays open for photograph / type / sample packs. There is no fake barcode in the viewfinder.

## Architecture

- TanStack Start, React 19, Vite, TypeScript, Tailwind v4
- Scores in `src/lib/scoring` — 0–100, bands, Nutri-Score / NOVA translated in `src/lib/copy.ts`
- Scan in `src/lib/scan` — ZXing-WASM + `BarcodeDetector`, pack-photo OCR / barcode from a still
- Catalog in `src/lib/catalog` — food, beauty, pet; Open Food Facts dump + live fallback
- Auth (optional) — Better Auth; notes stay on-device until you sign in
- Deploy target: Vercel (`npm run build`)

## License

Proprietary. All rights reserved. Digital Currensy Inc. See [LICENSE](LICENSE).
