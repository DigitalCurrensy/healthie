<p align="center">
  <img src="docs/media/logo.png" alt="Honest Aisle" width="220" />
</p>

<h1 align="center">Honest Aisle</h1>

<p align="center">
  <strong>Scan a pack. Know immediately.</strong><br />
  Portfolio prototype — independent 0–100 scores for food, beauty, and pet.<br />
  Public name: <strong>Honest Aisle</strong> &nbsp;·&nbsp; Repo folder: <code>healthie</code><br />
  Not a store app. Not a diagnosis. Not the Healthie EHR.
</p>

<p align="center">
  <a href="https://healthie-hazel.vercel.app">Live demo</a>
  &nbsp;·&nbsp;
  <a href="docs/PORTFOLIO.md">Resume line</a>
  &nbsp;·&nbsp;
  <a href="LICENSE">All rights reserved</a>
</p>

<p align="center">
  <img src="docs/media/share-card.jpg" alt="Share card — scan a pack, see the score" width="640" />
</p>

Honest Aisle is a reading aid you can walk. Point at a barcode or photograph the front. You get a number you can say out loud, teaspoons of sugar, extras worth watching, and a better neighbour in the same aisle. No brand pays for a better number.

Built by Digital Currensy Inc. as a **case study**. The GitHub repository is named `healthie` so existing Vercel / git remotes do not break. The product you show people is **Honest Aisle**.

This is **not** [gethealthie.com](https://www.gethealthie.com).

---

## Walk it

<p align="center">
  <img src="docs/media/home.jpg" alt="Home" width="260" />
  <img src="docs/media/aisles.jpg" alt="Aisles" width="260" />
  <img src="docs/media/scan.jpg" alt="Scan" width="260" />
</p>

<p align="center">
  <img src="docs/media/coke.jpg" alt="Coca-Cola Classic — 35 Poor" width="260" />
  <img src="docs/media/evian.jpg" alt="Evian — 95 Excellent" width="260" />
  <img src="docs/media/insights.jpg" alt="Insights" width="260" />
</p>

<p align="center">
  <img src="docs/media/home-desktop.jpg" alt="Desktop" width="720" />
</p>

**Presenter path (3 minutes, warm):**

1. [Demo](https://healthie-hazel.vercel.app) → Home  
2. Coca-Cola Classic **35 Poor** — `5449000000996`  
3. Evian **95 Excellent** — `3274080005003`  
4. One why  
5. Camera: Add to Home Screen, then open the icon  

Nutella sample: `3017620422003`.

---

## What you can inspect in the code

| Piece | Where |
| --- | --- |
| 0–100 mixer, Nutri-Score 2023 tables, NOVA cap | `src/lib/scoring` |
| GS1 check digit + Digital Link | `src/lib/scan` |
| ZXing / BarcodeDetector lens + PWA install gate | `src/lib/scan`, `/scan`, `/install` |
| Open Food Facts fronts | `src/lib/server/off.ts` |
| USDA FDC branded search (page 1, size 25) | `src/lib/server/fdc.ts` |
| OpenFDA Ongoing recalls | `src/lib/server/fda.ts` |
| Weekly FDA zip (offline only) | `scripts/download-fda-zip.mjs` |

**Honesty lock:** ultra-processed cannot be Good.

---

## Stack

TanStack Start · React 19 · Vite · TypeScript · Tailwind v4 · PWA · Vercel

```bash
npm install
npm run dev
```

Lens needs HTTPS or localhost **and** a top-level tab. An iframe cannot hold `getUserMedia`.

---

## Status

Walkable prototype. Demo shelf + live lookups. Not a national inventory. Not App Store ready.

---

## License

All rights reserved © 2026 Digital Currensy Inc. You may read the source. You may not ship it as a product, sell rankings, or drop this mixer behind a brand-paid score. See [LICENSE](LICENSE).
