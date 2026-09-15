# Live demo

**Only host:** https://healthie-hazel.vercel.app

GitHub `main` deploys here. Do not open `*.workers.dev`, `*.pages.dev`, or any Cloudflare preview. Those hosts are dead.

## What is on the aisle

`/catalog` is a demo shelf of at most 24 packs with a photographed front. Empty cells are hidden. The rest of the pantry is still being photographed.

## 10-minute pre-flight

```
node scripts/gtm-preflight.mjs
```

Expect PASS on Home, Coke, Evian, Nutella, Catalog, Scan, Install. If any FAIL, do not start the room.

1. Open https://healthie-hazel.vercel.app in Safari or Chrome — not inside Grok.
2. Add to Home Screen. Open the icon.
3. Confirm Coke and Evian packs on Home — not a blank can or Cristaline.
4. Coke → ~35. Evian → 95.
5. Scan only from the home-screen icon.

| Pack | Code | What you should see |
| --- | --- | --- |
| Coca-Cola Classic | 5449000000996 | Poor. A can is a dessert. |
| Evian | 3274080005003 | Excellent. Water. |
| Nutella | 3017620422003 | Poor. A dessert spread. |

If the window is an iframe, Scan sends you to `/install`.
