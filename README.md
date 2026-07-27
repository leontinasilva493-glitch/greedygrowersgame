# Greedy Growers Calculator

English-first, fan-made Greedy Growers harvest calculator and evidence-backed data site. The product works with player-supplied estimates before community data exists; unverified data pages remain transparent and noindex.

## Local setup

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Production-like local run:

```powershell
npm run build
npm start -- --hostname 127.0.0.1 --port 3421
```

## Quality gates

```powershell
npm run check
npm run test:e2e
npm run audit:prod
npm run lhci
```

`npm run check` runs ESLint, TypeScript, unit/integration tests, canonical data validation, brand contamination checks, and the production build.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical production origin; HTTPS is required when `VERCEL_ENV=production`.
- `NEXT_PUBLIC_GA_ID`: optional consent-gated GA property.
- `NEXT_PUBLIC_SUPPORT_EMAIL`: real support/deletion contact; leave unset rather than using a placeholder.
- `DATA_SUBMISSION_WEBHOOK_URL` and `DATA_SUBMISSION_WEBHOOK_TOKEN`: server-only moderation inbox.
- `SUBMISSION_RETENTION_DAYS`: approved pending-submission retention. The form stays disabled when it is absent.
- `GREEDY_DATASET=fixtures`: development/E2E only; production use throws.

Never commit `.env.local` or real secrets.

## Route map and SEO decisions

- `/`: canonical calculator, indexable.
- `/guides/**` and `/about`: verified editorial pages, indexable.
- `/seeds`, `/seeds/[slug]`, `/seeds/compare`, `/lightning`, `/codes`, `/updates`, `/data-status`: evidence-gated; empty production states are noindex or absent from the sitemap.
- `/submit-data`, `/contact`, `/privacy`, `/terms`: useful public utility/legal pages, noindex.
- `/calculator`: exact 301 to `/`.

## Data workflow

Public canonical records live under `data/` and are validated against `features/data/schemas.ts`. Submissions never write to those files. Promotion is manual and receipt-based; see [docs/data-moderation-runbook.md](docs/data-moderation-runbook.md).

Current production data intentionally keeps `gameVersion: unverified` until gameplay/version evidence is supplied. Do not fabricate values, codes, mechanics, probabilities, or detail pages to unlock indexing.

## Analytics and privacy

Analytics consent is denied by default. Events contain event names only, not calculator values, evidence URLs, receipts, or identifiers. The submission form collects pseudonymous tree/session IDs and evidence fields, not names, handles, or email addresses.

## Deployment and rollback

1. Run all quality gates locally.
2. Deploy a preview with production canonicals; previews return `X-Robots-Tag: noindex, nofollow`.
3. Verify HTTPS, canonical, robots, sitemap, JSON-LD, consented analytics and the moderation receipt flow.
4. Enable the submission form only after the hosting firewall proves the 11th controlled request is rate-limited (`429`).
5. Verify Search Console ownership and submit the production sitemap.

Rollback data with `git revert <data-commit>` and rerun the full gate. Roll back deployment to the previous known-good release, then recheck canonical, robots and sitemap. Never rewrite shared history.
