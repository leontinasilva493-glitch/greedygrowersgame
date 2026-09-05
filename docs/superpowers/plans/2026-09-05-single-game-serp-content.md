# Greedy Growers Single-Game SERP Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved single-game SERP content expansion, preserve evidence gates, and provide a locally built review surface.

**Architecture:** Route pages remain Next.js App Router server components that reuse the current content-layout primitives. Route-specific page files own copy and internal links; shared indexability and sitemap files remain controlled by the main agent to avoid concurrent edits.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-05-single-game-serp-content-design.md`

## Global Constraints

- Preserve all pre-existing dirty-worktree changes and never revert another worker's edits.
- No unsupported game facts, values, probabilities, code status, pet roster, item effect, or ranking.
- No new dependency, framework migration, commit, push, PR, merge, or deployment.
- Main agent owns `features/seo/*`, `app/sitemap.ts`, shared tests, and final verification.
- All content must remain readable at 375px without horizontal page overflow.

---

### Task 1: RED acceptance tests

**Files:**
- Modify: `features/seo/indexability.test.ts`
- Modify: `tests/e2e/priority-content-pages.spec.ts`

**Interfaces:**
- Produces: failing contracts for the new Miracle Grow route, revised TDH, robots, sitemap exclusion, intent sections, and contextual links.

- [ ] Add a unit assertion that `/guides/miracle-grow` is `noindex, follow` and excluded from the sitemap while evidence is absent.
- [ ] Add E2E route contracts for every approved Title/H1/canonical/robots value.
- [ ] Add behavior assertions for direct-answer sections and required contextual links.
- [ ] Run `npm.cmd run test -- features/seo/indexability.test.ts` and record the expected failure for the missing route policy.
- [ ] Run the focused Playwright test after production pages exist; until then, the new route/title contracts must fail for the intended missing behavior.

### Task 2: Miracle Grow and Worms pages

**Files:**
- Create: `app/guides/miracle-grow/page.tsx`
- Modify: `app/guides/worms/page.tsx`

**Interfaces:**
- Consumes: existing content primitives and gated metadata helpers.
- Produces: two evidence-safe, answer-first item pages satisfying the Task 1 contracts.

- [ ] Implement the Miracle Grow page with approved TDH, direct answer, verification table, capture sequence, fertilizer distinction, FAQs, and contextual links.
- [ ] Revise Worms TDH and reorganize content around acquisition, use, target, effect, duration, consumption, and capture steps.
- [ ] Keep both pages free of unsupported mechanics and exact effects.
- [ ] Run `npm.cmd run lint -- app/guides/miracle-grow/page.tsx app/guides/worms/page.tsx`.

### Task 3: Codes and Pets pages

**Files:**
- Modify: `app/codes/page.tsx`
- Modify: `app/pets/page.tsx`

**Interfaces:**
- Consumes: current repository data, SourceLedger, and gated metadata.
- Produces: a current-status Codes page and database-ready, goal-oriented Pets hub.

- [ ] Change Codes TDH to the approved September 2026 reported-status wording.
- [ ] Add a visible verification path and strengthen contextual links without adding unverified active codes or copy controls.
- [ ] Change Pets TDH to the approved intent wording without `All`.
- [ ] Add goal-based role placeholders and a clear acquisition-to-passive data model while retaining the empty verified catalog.
- [ ] Run `npm.cmd run lint -- app/codes/page.tsx app/pets/page.tsx`.

### Task 4: Seeds, Wiki/Guides, and Official Links

**Files:**
- Modify: `app/seeds/page.tsx`
- Modify: `app/guides/page.tsx`
- Modify: `app/official-links/page.tsx`

**Interfaces:**
- Consumes: existing seed table, content primitives, and current verified official URLs.
- Produces: improved Seeds acquisition page, task-oriented Wiki Hub, and Roblox navigation/trust page.

- [ ] Revise Seeds TDH and first-screen lookup guidance while preserving source labels and current interactions.
- [ ] Retitle `/guides` as the Wiki Hub and group routes by player task with visible research status.
- [ ] Retitle `/official-links` for Roblox navigation intent and add safe next steps.
- [ ] Keep `/guides` canonical; do not add `/wiki`.
- [ ] Run `npm.cmd run lint -- app/seeds/page.tsx app/guides/page.tsx app/official-links/page.tsx`.

### Task 5: Shared SEO integration

**Files:**
- Modify: `features/seo/indexability.ts`
- Modify: `app/sitemap.ts`
- Modify only if required: `features/seo/snapshot.ts`

**Interfaces:**
- Produces: explicit noindex policy for `/guides/miracle-grow`, route inventory inclusion for review/build, and sitemap exclusion through the common gate.

- [ ] Add `/guides/miracle-grow` to the indexability switch as always noindex until a future explicit evidence field exists.
- [ ] Add the route and real content date to the sitemap inventory; rely on `includeInSitemap` filtering to omit it.
- [ ] Run `npm.cmd run test -- features/seo/indexability.test.ts features/seo/snapshot.test.ts features/seo/metadata.test.ts` and confirm GREEN.

### Task 6: Integrated verification and local review

**Files:**
- Modify only for task-related failures: relevant page/test files.

**Interfaces:**
- Produces: fresh verification evidence and durable loopback review URLs.

- [ ] Run the focused priority Playwright suite on desktop and 375px mobile.
- [ ] Run `npm.cmd run check` and read the complete output.
- [ ] Run `git diff --check`.
- [ ] Start a production server on a verified free `127.0.0.1` port without stopping unknown listeners.
- [ ] Verify every target route returns 200 and inspect Title, H1, canonical, robots, links, overflow, and console errors.
- [ ] List all review URLs with index/noindex status and keep the local server available for user review.
