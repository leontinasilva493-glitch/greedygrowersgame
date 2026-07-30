# Homepage On-Page SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage a calculator-first, evidence-safe landing page focused on `Greedy Growers Calculator`, with correct protocol normalization and enough server-rendered explanatory content to satisfy the reported on-page gaps.

**Architecture:** Keep `app/page.tsx` as the Server Component composition root. Move static homepage copy into a dedicated Server Component and keep `CalculatorExperience` responsible only for interactive calculator state, analytics, and results. Enforce the production HTTP-to-HTTPS contract at middleware and verify the generated metadata and document outline through component and E2E tests.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Playwright, Cloudflare OpenNext.

## Global Constraints

- Do not publish or imply official lightning probabilities, seed values, or predictions.
- Keep the calculator directly usable in the first viewport.
- Preserve current visual language, accessibility behavior, and responsive layout.
- Keep the complete phrase natural; do not optimize toward a mechanical density percentage.
- Production canonical origin remains `https://greedygrowersgame.com`.

---

### Task 1: Make the test boundary deterministic

**Files:**
- Modify: `vitest.config.ts`
- Modify: `eslint.config.mjs`

**Interfaces:**
- Consumes: repository source tests matching `**/*.test.{ts,tsx}`.
- Produces: test and lint discovery boundaries that exclude generated `.next`, `.open-next`, and Playwright report copies.

- [x] Add `exclude: ["**/.next/**", "**/.open-next/**", "**/node_modules/**"]` to the Vitest test configuration.
- [x] Add `.open-next/**`, `playwright-report/**`, and `test-results/**` to ESLint global ignores.
- [x] Run `npm test` and confirm only source test files are collected.

### Task 2: Lock protocol and metadata contracts with failing tests

**Files:**
- Modify: `middleware.test.ts`
- Modify: `config/site.test.ts`
- Modify: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `middleware(request: NextRequest)`, `siteConfig`, and the rendered homepage.
- Produces: regression coverage for HTTPS redirect, target metadata, canonical URL, word count, and heading order.

- [x] Add a middleware test that sends `http://greedygrowersgame.com/example?mode=test` and expects a permanent redirect to the equivalent HTTPS URL.
- [x] Add site-config expectations for the approved title and description.
- [x] Add an E2E homepage SEO test that expects the approved title, description, canonical, exact H1, target H2, no H1-to-H3 jump, and at least 1,200 visible words.
- [x] Run the targeted unit tests and confirm they fail because the approved behavior is absent.

### Task 3: Implement protocol and metadata normalization

**Files:**
- Modify: `middleware.ts`
- Modify: `config/site.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `NextRequest.nextUrl` and `siteConfig.origin`.
- Produces: a 308 response for production HTTP requests and absolute HTTPS metadata URLs.

- [x] Accept `NextRequest` in middleware and return `NextResponse.redirect(httpsUrl, 308)` for production HTTP requests.
- [x] Replace the site title and description with the approved copy.
- [x] Generate the homepage canonical and Open Graph URL from the configured production origin; retain Next.js root-URL normalization.
- [x] Run the targeted middleware and config tests and confirm they pass.

### Task 4: Implement semantic, server-rendered homepage content

**Files:**
- Create: `components/calculator/CalculatorGuide.tsx`
- Create: `components/calculator/CalculatorIntro.tsx`
- Create: `components/calculator/CalculatorContext.tsx`
- Modify: `components/calculator/CalculatorExperience.tsx`
- Modify: `components/calculator/index.ts`
- Modify: `app/page.tsx`
- Modify: `tests/e2e/calculator.spec.ts`

**Interfaces:**
- Consumes: the existing calculator form, result engine, design tokens, and verified formula behavior.
- Produces: `CalculatorGuide`, a Server Component containing explanatory sections and FAQs, plus a semantic calculator section headed by H2.

- [x] Use the failing homepage E2E contract to cover the rendered H2/H3 outline, evidence disclaimer, formula explanation, and illustrative examples; human-facing prose does not receive source-text change-detector tests.
- [x] Replace the H1 and hero copy with the approved target-focused wording.
- [x] Keep the short intro before the form and move the illustration and evidence reminders after the form so the calculator entry point remains in the first viewport.
- [x] Replace the form card H3 with `Run the Greedy Growers Calculator` as H2 while leaving `Advanced assumptions` as its H3 descendant.
- [x] Pass unique descriptions to every numeric field and remove the repeated default helper sentence.
- [x] Add the server-rendered formula, input, result, example, and FAQ sections below the calculator.
- [x] Update calculator E2E selectors that depend on the old H1 or form heading.
- [x] Run the homepage SEO and calculator E2E contracts until both pass.

### Task 5: Verify the complete change

**Files:**
- Verify all modified files and generated HTML; no new production interface.

**Interfaces:**
- Consumes: complete repository state.
- Produces: fresh evidence for functional, SEO, type, content, and build acceptance.

- [x] Run targeted Vitest files for middleware and site config plus the homepage SEO E2E contract.
- [x] Run `npm run check`.
- [x] Run `npx playwright test tests/e2e/calculator.spec.ts tests/e2e/seo.spec.ts` against a fresh production build and `next start` server with production canonical configuration.
- [x] Inspect the production homepage HTML for metadata, heading order, full server-rendered copy, and word count.
- [x] Review `git diff --check`, `git diff --stat`, and the complete task diff before reporting completion.
