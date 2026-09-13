# Memory loops

These are the loops this build earned. Run them before claiming a desk is done. Do not skip because the last rewrite “looked” fine.

## 1. Scan finishes

**Fail mode:** Scan opens for half a second, take-photo is a file picker, QR marketing flashes, iframe has no camera.

**Loop**

1. Tap Scan on home, scan, aisles, product.
2. If the window is top-level HTTPS → live back camera, 720p, continuous focus, ROI crop, 120ms decode.
3. If the window is an iframe / no camera → one sentence, then photograph + type + samples. Never a fake viewfinder.
4. GTIN only: UPC-A/E, EAN-8/13, Code 128. Check digit. GS1 Digital Link `/01/{gtin}`. Reject URL QR.
5. Proof: keypad fallback at 5s, haptic/beep on a valid code, history appends.

See [CAMERA.md](CAMERA.md).

## 2. Mixer honesty

**Fail mode:** Doritos 54 Good. Missing salt parsed as 0 → fake B. Nutri-Score letter wearing the disc.

**Loop**

1. Ultra-processed cannot be Good (cap < 50).
2. Thin nutrition box (salt unknown) cannot pretend to be complete.
3. Flavour-enhancer stack penalises; it does not rescue chips.
4. Shop headline is the 0–100 word, not the Nutri-Score letter.
5. Proof: `npx tsx --test src/lib/scoring/scoring.test.ts` — Doritos Poor, Coke Poor, Evian Excellent.

## 3. Share card (Open Graph)

**Fail mode:** Grok X placeholder, ffmpeg COM JPEG, crawler stub served to the preview, iMessage grey chip on a sandbox host.

**Loop**

1. `node scripts/og-validate.mjs` — 26 checks, all green.
2. Same tags for every user-agent (Apple TN3156). Do not fork HTML on `User-Agent`.
3. Card is JFIF 1200×630 `/og.jpg` with the Healthie H. Absolute `https://` URLs only once a real host exists.
4. Never paste `*.workers.dev` / `*.pages.dev` as the product link. iMessage will not unfurl it.
5. Crawler regex must not match `preview` (that is the Grok live window).

See [OG.md](OG.md).

## 4. Catalog density

**Fail mode:** 18 products, five world-pantry SKUs sharing one aisle photo.

**Loop**

1. Aisles walkable: drinks through household.
2. Each GTIN has its own front if we have one; never reuse a neighbour’s pack shot.
3. World pantry can be thin — say so. Do not fake a photo.

## 5. Voice

**Fail mode:** Lab as headline. “Good” on a factory chip. Dev notes on Insights.

**Loop**

1. One sentence a shopper can say at the shelf.
2. Teaspoons, not only g/100 ml.
3. Independent line on the pack page.
4. Insights is the shop letter, not a changelog.

See [MESSAGING.md](MESSAGING.md).

## 6. GTM demo

**Fail mode:** Demo inside the Grok iframe, camera hangs, score you cannot defend.

**Loop**

1. Phone browser or home-screen icon, not the chat preview.
2. Three packs: Coke (Poor), Evian (Excellent), a bathroom SKU (same 0–100 disc).
3. Share from the in-app Share button (current origin), never a disposable hostname.

See [GTM.md](GTM.md).
