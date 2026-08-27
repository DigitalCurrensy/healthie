# Built vs not

Honest inventory so the next agent (or a tired human) does not ship a ghost button.

## Built

- Home scan desk: barcode, take photo, camera roll, type, sample packs
- Live `getUserMedia` lens + ZXing / BarcodeDetector on a **top-level** HTTPS or localhost page
- Photograph-the-pack fallback when the window is an iframe / has no camera
- Product page: 0–100, band word, why, ingredients, swaps, prices when known
- Food, body & beauty, pet catalogs and aisles
- Guides (how to read a score, sugar, palm, fragrance, pet, pregnancy, sun, …)
- Ingredient pages
- Compare, lists, saved, history
- Optional sign-in (Better Auth)
- PWA bits (manifest, icons, service worker)

## Not built / will not fake

- Live camera **inside** an embedded Grok (or any parent) preview that does not `allow="camera"` — the browser forbids it. Fallback is the product, not a demo barcode pretending to be your lens.
- Native App Store / Play binaries
- Paid brand boost
- Diagnosis, prescriptions, “personalized medicine”
- “In stock at the Tesco on your corner” unless we actually know

## Scan contract

1. A tap on **Scan barcode** must open a reader that can finish (lens, photograph, type, or sample).
2. **Take photo** is a shutter or the phone camera, not an unlabeled file picker as the primary CTA.
3. **Camera roll** is the only “I already have a picture” path.
4. If the lens cannot start, say so in one line and show photograph + type + samples immediately.
