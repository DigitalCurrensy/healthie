# Honest Aisle

**Scan a pack. Know immediately.**

Portfolio prototype — independent 0–100 scores for food, beauty, and pet.

Public name: **Honest Aisle** · Repo folder: `healthie` · Live: [healthie-hazel.vercel.app](https://healthie-hazel.vercel.app)

Not a store app. Not a diagnosis. Not the [Healthie EHR](https://www.gethealthie.com).

[Live demo](https://healthie-hazel.vercel.app) · [Resume line](docs/PORTFOLIO.md) · [License](LICENSE)

<p align="center">
  <img src="docs/media/home.jpg" alt="Home" width="240" />
  <img src="docs/media/coke.jpg" alt="Coca-Cola Classic — Poor" width="240" />
  <img src="docs/media/evian.jpg" alt="Evian — Excellent" width="240" />
</p>

<p align="center">
  <img src="docs/media/scan.jpg" alt="Scan" width="240" />
  <img src="docs/media/aisles.jpg" alt="Aisles" width="240" />
  <img src="docs/media/insights.jpg" alt="Insights" width="240" />
</p>

A reading aid you can walk. Barcode or photo. A number you can say out loud, teaspoons of sugar, extras worth watching, a better neighbour in the same aisle. No brand pays for a better number.

Built by Digital Currensy Inc. as a **case study**. The GitHub folder stays `healthie` so Vercel remotes do not break. What you show people is Honest Aisle.

---

## Presenter path (3 minutes, warm)

1. [Demo](https://healthie-hazel.vercel.app) → Home
2. Coca-Cola Classic **35 Poor** — `5449000000996`
3. Evian **95 Excellent** — `3274080005003`
4. One why
5. Camera: Add to Home Screen, then open the icon

Nutella sample: `3017620422003`.

---

## What you can inspect

| Piece | Where |
| --- | --- |
| 0–100 mixer, Nutri-Score 2023, NOVA cap | `src/lib/scoring` |
| GS1 check digit + Digital Link | `src/lib/scan` |
| ZXing / BarcodeDetector + PWA gate | `src/lib/scan`, `/scan`, `/install` |
| Open Food Facts fronts | `src/lib/server/off.ts` |
| USDA FDC branded search (page 1, size 25) | `src/lib/server/fdc.ts` |
| OpenFDA Ongoing recalls | `src/lib/server/fda.ts` |
| Weekly FDA zip (offline only) | `scripts/download-fda-zip.mjs` |

Honesty lock: ultra-processed cannot be Good.

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

## License

All rights reserved © 2026 Digital Currensy Inc. You may read the source. You may not ship it as a product. See [LICENSE](LICENSE).
