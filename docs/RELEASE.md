# How to release this (realistic)

## Do not do this week

- Flip the GitHub repo public
- Enable forks / “good first issue”
- Submit App Store / Play
- Call it a company launch
- Use the name Healthie in paid ads (EHR collision)

## Do this week (exposure that does not lie)

1. Keep the repo **private**. README and DESCRIPTION already exist for people you invite.
2. Share the **live demo**, not the git URL: https://healthie-hazel.vercel.app
3. Presenter script (warm): Home → Coca-Cola Classic 35 → Evian 95 → one why. Scan only after “Add to Home Screen.”
4. One public artifact: a case-study post (X / LinkedIn / personal site) with three screenshots from `docs/media/` and the resume line in PORTFOLIO.md.
5. Invite-only GitHub (collaborators), not the open internet.

## Flip public only when

- README says “prototype / not the Healthie EHR” in the first screen
- LICENSE stays All Rights Reserved (or you pick a real OSS license on purpose)
- Forking disabled if you want look-but-don’t-clone
- Secrets scanned (no Vercel / Better Auth / FDC keys)
- Demo shelf does not show empty cells or shared pack photos on the first 24 SKUs

## If the goal is stars / forks

Wrong goal for this repo. Extract a **small public library** later: GS1 check-digit + Digital Link parser, or the Nutri-Score 2023 tables. That is what people fork. The full app is a product demo, not an ecosystem.
