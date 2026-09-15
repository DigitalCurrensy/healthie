# Honest Aisle

Scan a pack. Get an independent 0–100 score in plain English.

**Live demo:** [healthie-hazel.vercel.app](https://healthie-hazel.vercel.app)  
Case study · Digital Currensy Inc. · Not a medical device · Not the [Healthie EHR](https://www.gethealthie.com)

<p align="center">
  <img src="docs/media/coke.jpg" width="280" alt="Coca-Cola Classic — 35 Poor" />
  <img src="docs/media/evian.jpg" width="280" alt="Evian — 95 Excellent" />
</p>

<p align="center">
  <img src="docs/media/scan.jpg" width="280" alt="Scan desk" />
  <img src="docs/media/insights.jpg" width="280" alt="Insights" />
</p>

## 90-second walk

1. Open the [demo](https://healthie-hazel.vercel.app)
2. Coca-Cola Classic — **35 Poor** — `5449000000996`
3. Evian — **95 Excellent** — `3274080005003`
4. Read the why
5. Camera: Add to Home Screen, then open the icon

Nutella: `3017620422003`

## What I built

| Piece | Where |
| --- | --- |
| 0–100 mixer, Nutri-Score 2023 tables, NOVA cap (ultra-processed cannot be Good) | `src/lib/scoring` |
| GS1 check digit + Digital Link | `src/lib/scan` |
| PWA lens (ZXing + BarcodeDetector) | `/scan`, `/install` |
| Open Food Facts pack fronts | `src/lib/server/off.ts` |
| USDA FDC branded search — page 1, size 25 | `src/lib/server/fdc.ts` |
| OpenFDA Ongoing recalls | `src/lib/server/fda.ts` |

TanStack Start · React 19 · TypeScript · Tailwind v4 · Vercel

```bash
npm install && npm run dev
```

## Status

Walkable prototype. Not App Store ready. All rights reserved — [LICENSE](LICENSE).
