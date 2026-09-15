# Security

This repo is a portfolio prototype. It should contain no production secrets and no personal machine paths.

## What belongs here

- `.env.example` with empty placeholders
- Public demo URL
- Scoring and scan source

## What does not

- `.env`, API keys, database URLs
- Photos from a personal camera roll
- Local paths (`/Users/…`, desktop, downloads)
- Patient or shopper accounts

`.gitignore` already blocks `.env`, `artifacts/`, `attachments/`, `screenshots/`, `.grok/`.

If you find a live key in git history, rotate it and open an issue on the owner account only.
