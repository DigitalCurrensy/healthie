<p align="center">
  <img src="docs/media/logo.png" alt="Healthie Scorer" width="280" />
</p>

<h1 align="center">Healthie Scorer</h1>

<p align="center">
  <strong>Scan a pack. Know immediately.</strong><br />
  Working prototype — independent 0–100 scores for food, beauty, and pet.<br />
  Not a store app. Not a diagnosis. Not the Healthie EHR.
</p>

<p align="center">
  <img src="docs/media/share-card.jpg" alt="Healthie share card — scan a pack, see the score" width="640" />
</p>

A reading aid you can walk. Point at a barcode or photograph the front. You get a number you can say out loud, the teaspoons of sugar, the extras worth watching, and a better neighbour in the same aisle.

**Status:** private demo, Digital Currensy Inc. Live: [healthie-hazel.vercel.app](https://healthie-hazel.vercel.app)

This repository is **not** [gethealthie.com](https://www.gethealthie.com) (ONC-certified EHR). Same word, different product. Do not confuse the two.

---

## The shop

<p align="center">
  <img src="docs/media/home.jpg" alt="Home — scan it, know immediately" width="280" />
  <img src="docs/media/aisles.jpg" alt="Aisles" width="280" />
  <img src="docs/media/scan.jpg" alt="Scan desk" width="280" />
</p>

<p align="center">
  <img src="docs/media/coke.jpg" alt="Coca-Cola Classic — 35 Poor" width="280" />
  <img src="docs/media/evian.jpg" alt="Evian — 95 Excellent" width="280" />
  <img src="docs/media/insights.jpg" alt="Insights" width="280" />
</p>

<p align="center">
  <img src="docs/media/home-desktop.jpg" alt="Desktop" width="720" />
</p>

Presenter path (warm): Home → Coca-Cola `5449000000996` → Evian `3274080005003` → the why. Nutella `3017620422003`. Camera: Add to Home Screen, then open the icon.

---

## The number

| Score | Word | Meaning |
| --- | --- | --- |
| 75–100 | Excellent | A keep. |
| 50–74 | Good | Fine sometimes. Ultra-processed cannot land here. |
| 25–49 | Poor | A treat at best. |
| 0–24 | Avoid | Hard pass for a regular shop. |

**Honesty lock:** ultra-processed cannot be Good. A missing salt line is not zero. The 0–100 disc is the headline, not the Nutri-Score letter.

---

## What talks to the pack

| Source | Live rule | Not for |
| --- | --- | --- |
| Open Food Facts | Front photo + ingredients when the world API is up | Scoring religion |
| USDA FDC | Branded search, page 1, size 25 | Foundation foods as pack shots |
| OpenFDA RES | Ongoing recalls, two pages of 1,000 | Nutrition |
| Weekly FDA zip | Offline harvest only (`scripts/download-fda-zip.mjs`) | Product request path |

---

## Docs

| File | What |
| --- | --- |
| [DESCRIPTION.md](DESCRIPTION.md) | About blurb |
| [docs/PORTFOLIO.md](docs/PORTFOLIO.md) | Resume line |
| [docs/RELEASE.md](docs/RELEASE.md) | How to show this without lying |
| [ROADMAP.md](ROADMAP.md) | Now / next / later |
| [BUILT-VS-NOT.md](BUILT-VS-NOT.md) | Honest inventory |
| [docs/MESSAGING.md](docs/MESSAGING.md) | Voice |
| [docs/CAMERA.md](docs/CAMERA.md) | Lens vs iframe |
| [docs/GTM.md](docs/GTM.md) | Phone demo |

---

## Run it

```bash
npm install
npm run dev
```

Camera needs HTTPS or localhost **and** a top-level page. An embedded preview cannot hold a live lens.

---

## Stack

TanStack Start, React 19, Vite, TypeScript, Tailwind v4. Scores in `src/lib/scoring`. Scan in `src/lib/scan`. Catalog in `src/lib/catalog` + `src/lib/server/{off,fdc,fda}.ts`.

---

## License

Proprietary. All rights reserved. Digital Currensy Inc. See [LICENSE](LICENSE). No permission to fork, clone for production, or reuse the mixer as a paid ranking.
