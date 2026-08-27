# Roadmap

Ship desks that finish. Do not ship a camera button that hangs. Do not ship a score you cannot explain in one sentence.

## Now (in the app)

- Scan a barcode on a real phone (live lens)
- Photograph the pack when the lens cannot open
- Type the numbers / sample packs (Coca-Cola, Nutella, …)
- 0–100 score in food, body & beauty, pet
- Ingredients, why, swaps, prices where we have them
- Guides and ingredient pages in the same voice
- Compare, lists, saved, history
- Optional account so notes follow you

## Next

- Nightly Open Food Facts dump + live lookup for long-tail barcodes (already sketched; keep it honest when a pack is missing)
- Better pack-photo reading on beauty and pet (front of tin, not just EAN)
- Retailer prices that say “we searched,” never “in stock at your store” unless we know
- Household aisle (cleaners) with the same score ring — only when the method is ready
- Share a product as a still card, not a dump of lab names
- iOS / Android wrap (PWA is first; native shell later)

## Later (not buttons today)

- Allergen profiles that change the score (must be opt-in and reversible)
- Wearable / grocery-list sync
- Brand-paid anything — **never**
- Medical claims, “cures,” or doctor-replace copy — **never**
- A fake live camera inside an embedded preview that cannot grant the lens — **never**. Photograph + type is the product there.

## Decision rules

1. If a shopper cannot say the line at the shelf, the copy is wrong. See [docs/MESSAGING.md](docs/MESSAGING.md).
2. If a control does not complete a scan, do not show it as Scan.
3. Missing data is a sentence (“we don’t have this barcode yet”), not a spinner forever.
4. Houses do not merge. Healthie does not grow EventFix desks, AutoShield bays, or a feed.
