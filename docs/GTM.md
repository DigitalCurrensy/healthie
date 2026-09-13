# Go-live verification — Healthie scanner demo

This app is an independent pack scorer. It is not the Healthie EMR (gethealthie.com). Scans write to **your history and list** on this phone. There is no `createChartingNote` GraphQL to an EMR.

## Presenter packs (print these)

1. **5449000000996** Coca-Cola Classic — Poor. A can is a dessert.
2. **3274080005003** Evian — Excellent. Water.
3. **3337875598071** CeraVe Foaming Cleanser — Bathroom. Same 0–100 disc.

Open `/demo` for the script. Open `/scan` from the **home screen** for the live lens.

## Domain 1 — Camera

| Check | Status |
| --- | --- |
| Iframe `allow=camera` | Attempted from inside. Parent host still wins. Use Open the lens / home screen. |
| 720p, 24–30 fps, rear camera, continuous focus | Yes |
| Worker decode, ROI crop | Yes. 1D only in the worker. |
| QR / 2D | Off in the live lens (stops marketing-QR false locks). Paste a Digital Link if you have one. |
| 5s keypad | Yes |
| Mic | Not requested. We do not listen. |

## Domain 2 — Code + lookup

| Check | Status |
| --- | --- |
| Modulo-10 before lookup | Yes. Junk and Instagram QRs never fire a request. |
| Haptics 100ms + beep, then freeze the stream | Yes |
| Recent packs cached on device | Yes |
| EMR mutations | Not this product. History is the chart. |

## Domain 3 — Edge

| Check | Status |
| --- | --- |
| HTTPS | Required. Camera will not start on http. |
| `Permissions-Policy: camera=(self)` | `/_headers` + Vite dev headers |
| Cloudflare Pages | Drop `public/_headers` on Pages. This sandbox preview is not Pages. |

## Domain 4 — Score

Colour disc, neighbour when below 75, listening pulse on the viewfinder while decoding.

## Domain 5 — Compliance

“Healthie is a reading aid, not a diagnosis.” On pack, method, and demo.
