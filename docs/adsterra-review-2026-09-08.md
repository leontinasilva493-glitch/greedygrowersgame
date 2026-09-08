# Adsterra integration check — 2026-09-08

## Code identity

Verified in the signed-in Adsterra Websites UI for greedygrowersgame.com (website 6031416):

- Popunder_1, placement 31098701, Active: `https://pl31199200.profitableratecpmnetwork.com/5a/57/ca/5a57ca988bdaec73c17f829159e9fab5.js`.
- NativeBanner_1, placement 31098702, Active: `https://pl31199201.profitableratecpmnetwork.com/2322cb92ec86eb448481967a11b7d7d6/invoke.js`, container `container-2322cb92ec86eb448481967a11b7d7d6`.
- Use plain URLs in HTML, not Markdown link syntax or escaped HTML tags.

## Local changes

- Replaced the outdated native banner URL and matching container ID.
- Added a consent-gated Popunder loader in the shared layout; its script goes into head once per document.
- Shared the existing ad-free route list between both formats.
- Reload after withdrawal of consent or navigation into an ad-free route when Popunder was loaded, because deleting a script tag alone does not clear vendor event handlers. Reload resets unsaved in-memory page inputs.
- Updated consent and privacy descriptions to disclose Popunder behavior. Privacy remains `noindex, follow`; public content SEO is unchanged.

## Verification

- Targeted Vitest: 3 files, 8 tests passed (consent gating, approved Popunder URL, deduplication, legal routes, withdrawal cleanup, existing consent and content-page rendering).
- Targeted ESLint passed; `git diff --check` passed (line-ending warnings only).
- Fresh Next.js production build passed, including TypeScript and 38 generated pages. Existing middleware deprecation warning remains.
- Production preview: http://127.0.0.1:3318/ and http://127.0.0.1:3318/seeds .
- Chrome: before consent, zero vendor scripts; after consent, one script per format, Popunder in head, Native Banner beside its matching container.
- Navigating to Seeds did not duplicate Popunder. Revocation left zero vendor scripts and zero native slots after reload.
- Navigating from an enabled page to Privacy left zero vendor scripts; robots metadata remained `noindex, follow`.
- Browser console capture returned no errors/warnings during the check.

## Delivery limitation

No real creative or Popunder window appeared in this local run. Native Banner became empty and collapsed. Independent HTTP GET probes from this machine returned HTTP 200 with zero-byte bodies for both new URLs; a further native-script request with a Chrome-style User-Agent returned HTTP 403 with a zero-byte body. These probes are not a browser network trace. They show that this environment did not obtain usable script content, but do not establish whether the cause is traffic filtering, network conditions, domain restrictions, or another provider-side condition.

Code installation and lifecycle checks passed. Actual ad delivery and Statistics attribution remain unverified and require the deployed domain with eligible real traffic. No ad creatives were clicked, no impressions were fabricated, and no ad account configuration was changed.

At the time of this local verification, no commit, push, or deployment had been performed. Pre-existing unrelated working-tree changes were preserved.
