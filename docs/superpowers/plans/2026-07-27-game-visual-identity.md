# Greedy Growers Game Visual Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add original, performant Greedy Growers-inspired visual scenes to the homepage, Seeds, Lightning, and Beginner Guide pages while preserving evidence and fan-site boundaries.

**Architecture:** A typed visual asset registry supplies metadata to one reusable `GameScene` server component. `ContentPage` accepts an optional scene slot, while the calculator places the same component inside its existing hero. Static WebP files live under `public/media/greedy-growers/scenes/` and are never fetched from competitor or temporary Roblox CDN URLs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/image`, Vitest, Playwright.

## Global Constraints

- Do not add dependencies or change framework architecture.
- Do not ship Roblox logos, copied characters, copied game UI, competitor files, or temporary `tr.rbxcdn.com/180DAY-*` URLs.
- Label every generated scene `Fan-made illustration`; do not imply official affiliation.
- Preserve existing evidence gates, routes, calculator behavior, and mobile navigation.
- Homepage visual is the only preloaded image; all other scenes lazy-load.
- Keep 390px layouts free of horizontal overflow and keep the calculator accessible without a long decorative preamble.

---

### Task 1: Visual asset contract and scene component

**Files:**
- Create: `features/visuals/assets.ts`
- Create: `components/game/GameScene.tsx`
- Create: `components/game/GameScene.test.tsx`

**Interfaces:**
- Produces: `GameSceneAsset`, `gameSceneAssets`, and `GameScene({ asset, preload?, compact?, className? })`.
- `GameSceneAsset` contains `id`, `src`, `width`, `height`, `alt`, `caption`, `route`, `sourceType`, `createdAt`, `rightsNote`, and `focalPoint`.

- [ ] **Step 1: Write the failing component test**

Render `GameScene` with the homepage registry entry and assert that the real markup contains the descriptive alt text, `Fan-made illustration`, the caption, `width="1536"`, `height="1024"`, and no `rbxcdn` or competitor domain.

- [ ] **Step 2: Verify RED**

Run: `npm test -- components/game/GameScene.test.tsx`

Expected: FAIL because `GameScene` and the visual asset registry do not exist.

- [ ] **Step 3: Implement the registry and component**

Use `next/image` with the registry's explicit dimensions, `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 680px"`, `preload` only when requested, and a visible source label/caption below the image.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- components/game/GameScene.test.tsx`

Expected: PASS.

### Task 2: Generate and import the four original scenes

**Files:**
- Create: `public/media/greedy-growers/scenes/growth-vs-lightning.webp`
- Create: `public/media/greedy-growers/scenes/river-seed-plots.webp`
- Create: `public/media/greedy-growers/scenes/lightning-cycle.webp`
- Create: `public/media/greedy-growers/scenes/beginner-loop.webp`
- Create: `public/media/greedy-growers/og/home.png`
- Create: `public/media/greedy-growers/og/seeds.png`
- Create: `public/media/greedy-growers/og/lightning.png`
- Create: `public/media/greedy-growers/og/beginner-guide.png`

**Interfaces:**
- Consumed by: `gameSceneAssets` paths from Task 1.

- [ ] **Step 1: Generate four distinct landscape illustrations**

Use the built-in image generator. Require stylized low-poly farming scenes, no words, no numbers, no logos, no UI, no watermarks, no copied characters, and generous safe crops.

- [ ] **Step 2: Inspect every source image**

Check scene subject, visual consistency, missing/extra objects, accidental text, copied branding, and mobile crop viability.

- [ ] **Step 3: Copy assets into the workspace and convert to WebP**

Use the bundled workspace Python/Pillow runtime for format conversion only. Preserve the generated master outside `public`; ship compressed WebP files with exact dimensions recorded in `assets.ts`, plus centered 1200×630 PNG crops for route metadata.

- [ ] **Step 4: Validate shipped files**

Confirm every WebP opens, has expected dimensions, and is smaller than its source PNG.

### Task 3: Shared content-page visual slot

**Files:**
- Modify: `components/layout/ContentPage.tsx`
- Create: `components/layout/ContentPage.test.tsx`

**Interfaces:**
- `ContentPageProps` gains `visual?: ReactNode`.

- [ ] **Step 1: Write the failing slot test**

Render a real `ContentPage` with a labelled visual node and assert it appears inside the header after the description/status while the page still renders one `main` and one `h1`.

- [ ] **Step 2: Verify RED**

Run: `npm test -- components/layout/ContentPage.test.tsx`

Expected: FAIL because `ContentPage` does not accept or render `visual`.

- [ ] **Step 3: Implement the optional visual slot**

Add the prop and responsive wrapper without changing callers that omit it.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- components/layout/ContentPage.test.tsx`

Expected: PASS.

### Task 4: Wire scenes into the four target pages

**Files:**
- Modify: `components/calculator/CalculatorExperience.tsx`
- Modify: `app/seeds/page.tsx`
- Modify: `app/lightning/page.tsx`
- Modify: `app/guides/beginner-guide/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `features/seo/metadata.ts`
- Modify: `features/seo/metadata.test.ts`
- Modify: `tests/e2e/data-pages.spec.ts`
- Modify: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `GameScene`, `gameSceneAssets`, and `ContentPage.visual`.

- [ ] **Step 1: Write failing route expectations**

For `/`, `/seeds`, `/lightning`, and `/guides/beginner-guide`, assert one `[data-game-scene]` is visible and its image alt contains a route-relevant object/action. Extend the 390px overflow test to all four routes.

- [ ] **Step 2: Verify RED**

Run: `npm run test:e2e -- tests/e2e/data-pages.spec.ts tests/e2e/seo.spec.ts`

Expected: FAIL because the pages do not render game scenes.

- [ ] **Step 3: Add scenes and visual tokens**

Add the compact preloaded homepage scene inside the existing calculator hero. Add page-specific scenes through `ContentPage.visual`. Extend gated metadata to accept a page-specific Open Graph image and wire all four routes. Extend CSS variables with sky cyan, electric blue, grass, and bark accents; add restrained scene-frame and risk-divider styling with reduced-motion safeguards.

- [ ] **Step 4: Verify route behavior**

Run: `npm run test:e2e -- tests/e2e/data-pages.spec.ts tests/e2e/seo.spec.ts`

Expected: PASS with no horizontal overflow or console errors.

### Task 5: Final verification and visual QA

**Files:**
- Modify only if verification identifies an in-scope defect.

- [ ] **Step 1: Run targeted unit tests**

Run: `npm test -- components/game/GameScene.test.tsx components/layout/ContentPage.test.tsx`

- [ ] **Step 2: Run the full project check**

Run: `npm run check`

- [ ] **Step 3: Capture desktop and mobile screenshots**

Run the production build locally, capture `/`, `/seeds`, `/lightning`, and `/guides/beginner-guide` at 1440×1000 and 390×844, and inspect crop, text contrast, scene labelling, calculator position, and overflow.

- [ ] **Step 4: Review the diff and asset provenance**

Run `git diff --check`, review `git status --short`, and confirm no competitor URL, Roblox logo, or `180DAY` URL ships in app/components/config/data/public.
