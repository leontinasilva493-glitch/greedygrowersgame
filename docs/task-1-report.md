# Task 1 Baseline Report

Date: 2026-07-27 (Asia/Shanghai)

## Scope

- Created a clean sibling project in `greedygrowerscalculator/`.
- Kept `../crazycattle3d-main/` as a read-only reference.
- Created a root-level App Router project (`app/`); no `src/` directory is used.
- Did not implement calculator, site UI, game data, routes, or other Task 2+ work.

## Runtime and framework

| Item | Verified value |
|---|---|
| Node.js | `v24.12.0` |
| npm | `11.6.2` |
| npm latest Next at scaffold time | `16.2.12` |
| Installed Next | `16.2.12` |
| React / React DOM | `19.2.4` |
| Tailwind CSS | `4.x` |

The scaffold command was:

```powershell
npx create-next-app@16.2.12 greedygrowerscalculator --typescript --tailwind --eslint --app --no-src-dir --no-react-compiler --no-agents-md --use-npm --import-alias "@/*" --yes
```

The wrapper timed out while npm was still installing. The generated source tree was intact, so installation was completed with `npm install`; the generated Git repository and initial Create Next App commit were retained.

## Installed baseline tooling

- Product: Zod, React Hook Form, Hook Form resolvers, Recharts, Lucide React, clsx, tailwind-merge, class-variance-authority, and the planned Radix primitives.
- `@radix-ui/react-label` is included because the planned shared label primitive imports it.
- Test and audit: Vitest, Playwright with Chromium, tsx, and Lighthouse CI.
- Playwright owns its development server through `webServer`; this avoids blocking PowerShell smoke-test commands.
- Lighthouse CI writes local reports to ignored `.lighthouseci/` and does not upload them.

## Commands and results

| Command | Result |
|---|---|
| `npm run lint` | PASS, exit 0 |
| `npm run typecheck` | PASS, exit 0 |
| `npm run test` | PASS, exit 0; no Task 2+ tests exist yet |
| `npm run build` | PASS, exit 0; `/` and `/_not-found` generated |
| `npm run test:e2e` | PASS, exit 0 with `--pass-with-no-tests` |
| `npx lhci healthcheck` | PASS; config, writable output, and Chrome found |
| `npm run lhci` | PASS; homepage scores: Performance 0.98, Accessibility 1.00, Best Practices 1.00, SEO 1.00 |
| `npm audit --omit=dev --audit-level=high` | PASS, `found 0 vulnerabilities` |

The combined `npm run check` command runs lint, typecheck, Vitest, and the production build and passed with exit 0.

## Security decisions and residual risks

Next 16.2.12 currently declares older transitive `postcss` and `sharp` versions that npm flags. Package overrides pin them to `postcss@8.5.23` and `sharp@0.35.3`. The production build and Lighthouse run both passed with those resolved versions, and the production-only audit reports zero vulnerabilities.

A full audit including development tooling still reports 17 findings (14 high), mainly through the current Lighthouse CI and ESLint dependency graphs. They do not enter the production dependency audit. No forced downgrade or breaking `npm audit fix --force` was applied. Re-check both the overrides and development-only advisories whenever Next, ESLint, or Lighthouse CI is upgraded.

The generated homepage remains the default Create Next App page. Its Lighthouse scores validate only the baseline infrastructure, not the future Greedy Growers product experience.

## Rollback boundary

The project is an independent Git repository with the Create Next App initial commit. Removing or reverting work inside this repository does not require modifying the source scaffold. The source scaffold was not used as a command working directory and no file under it was written during Task 1.
