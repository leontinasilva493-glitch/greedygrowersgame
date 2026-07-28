# Greedy Growers Game Visual Identity Design

## Outcome

Make the calculator and its highest-value acquisition pages recognizably related to Greedy Growers within five seconds, without presenting the fan site as official or weakening the evidence-first product position.

The smallest acceptable release adds one coherent visual scene to the calculator, Seeds, Lightning, and Beginner Guide pages. Each scene is original fan-made artwork, is labelled as such, has descriptive alt text, and does not contain Roblox logos, copied characters, copied game UI, unsupported values, or competitor assets.

## Visual direction

The site keeps its dark field-manual foundation. A new game layer adds bright cyan sky, saturated grass, oversized low-poly trees, electric-blue lightning, green gain signals, red loss signals, and strong growth-versus-risk compositions. The editorial serif remains for trustworthy explanation; compact display labels gain heavier, outlined treatment only inside visual scenes and risk badges.

The memorable interaction is a split state: healthy growth on one side and a lightning-struck tree on the other. This relationship is reused across pages while the subject changes by search intent.

## Page treatment

- Home: a compact growth-versus-lightning scene sits above the calculator explanation. It remains short on mobile so the tool is not pushed far below the fold.
- Seeds: a river-side seed stall, planting plots, and varied low-poly saplings establish the acquisition and planting context without inventing seed names or prices.
- Lightning: the visual focuses on one mature tree transitioning from storm warning to strike aftermath. It must not show a probability or countdown.
- Beginner Guide: a four-stage scene shows river purchase, plot planting, growth, and harvest-risk decision as a visual orientation, not a claim about unverified UI.

## Component boundary

`features/visuals/assets.ts` owns immutable asset metadata and provenance. `components/game/GameScene.tsx` owns image rendering, caption, fan-made label, sizing, and accessibility. Pages consume typed asset records and do not duplicate image paths or provenance copy.

`ContentPage` gains an optional `visual` slot so acquisition pages can place a scene inside the shared header without changing their evidence sections. The calculator uses the same `GameScene` directly in its existing hero panel.

## Asset and rights rules

- Generated artwork is stored in `public/media/greedy-growers/scenes/` and referenced locally. This avoids the existing brand guard that reserves `public/game` for prohibited embedded-game payloads.
- Every asset record includes route, source type, creation date, rights note, alt text, and focal point.
- The visible caption says `Fan-made illustration` and avoids implying official collaboration.
- Official Roblox media APIs remain research sources only; temporary `tr.rbxcdn.com/180DAY-*` URLs are never shipped.
- No image may contain Roblox logos, exact creator artwork, exact characters, UI screenshots, watermarks, or fabricated gameplay values.

## Performance and responsive behavior

- Generated source PNGs are converted to WebP before shipping.
- `next/image` receives explicit width/height, responsive `sizes`, and `preload` only for the homepage scene.
- Each target route receives a page-specific 1200×630 Open Graph crop so inner pages do not inherit the homepage social image.
- Page scenes use a fixed aspect ratio and object-position metadata to prevent layout shift.
- On screens below 640px, the homepage scene uses a compact crop; content-page scenes remain 16:9 and never create horizontal overflow.
- Reduced-motion users receive no decorative animation.

## Verification

- Unit tests render the real shared scene and assert its label, alt text, caption, dimensions, and page visual slot.
- Playwright checks all four routes for one visible scene, descriptive alt text, and no 390px horizontal overflow.
- Brand validation confirms no legacy or embedded-game contamination.
- The full lint, typecheck, test, evidence, brand, and build checks run before completion.
- Desktop and mobile screenshots are visually inspected for crop, legibility, hierarchy, and calculator displacement.
