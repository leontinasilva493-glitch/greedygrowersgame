# Greedy Growers Single-Game SERP Content Design

## Outcome

Improve the existing Greedy Growers acquisition pages and add a Miracle Grow guide using only patterns observed on dedicated Greedy Growers sites. Preserve the product's evidence boundary: search demand can justify a route, but only reviewed current-version evidence can make unsupported mechanics indexable.

## Route ownership

| Route | Primary intent | Target title | Indexing decision |
| --- | --- | --- | --- |
| `/guides/miracle-grow` | `greedy growers miracle grow` | `Greedy Growers Miracle Grow: Uses & How to Get` | `noindex, follow` until current item identity, acquisition, use, effect, duration/consumption, and version evidence are reviewed |
| `/codes` | `greedy growers codes` | `Greedy Growers Codes (Sep 2026): Reported` while no redemption succeeds | Remains `noindex, follow` until the existing Codes gate passes |
| `/pets` | `greedy growers pets` | `Greedy Growers Pets: Eggs, Passives & Best Uses` | Remains `noindex, follow` until the existing Pets gate passes; do not say `All` until the current roster is complete |
| `/guides/worms` | `greedy growers worms` | `Greedy Growers Worms: What They Do & How to Get` | Remains `noindex, follow` until the existing Worms gate passes |
| `/seeds` | `greedy growers seeds` | `Greedy Growers Seeds: Prices, Rarity & Spawns` | Remains governed by the existing Phase 0 and seed-count gate |
| `/guides` | `greedy growers wiki` | `Greedy Growers Wiki: Codes, Seeds, Pets & Guides` | Indexable hub; keep `/guides` canonical and do not add a duplicate `/wiki` |
| `/official-links` | `greedy growers roblox` | `Greedy Growers Roblox: Official Game & Link Status` | Indexable trust/navigation page |

## Content principles

- Keep one primary search intent per route, with unique Title, description, H1, and canonical.
- Put a direct answer and the player's next action before research methodology.
- Reuse the current dark-green editorial/tool visual system and existing `ContentPage`, `ContentSection`, `EvidenceNote`, `InlineCta`, table, and card patterns.
- Borrow dedicated-site strengths: topic silos, concise quick answers, usable tables, role-based choices, contextual internal links, current checked dates, and source status.
- Do not copy unsupported values, probabilities, timers, rankings, code status, or item effects.
- Words such as `Working`, `All`, `Best`, and exact counts are conditional on the evidence actually shown.
- Research/noindex pages stay out of the sitemap; the indexable Wiki/Guides hub must label research routes clearly.
- No new dependency, framework change, analytics change, commit, push, PR, merge, or deployment.

## Page requirements

### Miracle Grow

Create an answer-first guide with a compact status panel, a verification table for identity/acquisition/target/effect/duration/consumption/version, a complete-use capture checklist, a section distinguishing Miracle Grow from generic fertilizer, failure questions, and contextual links to Fertilizer, Pets, Weather Events, Submit Data, and Guides. Do not state what the item does without reviewed evidence.

### Codes

Retain the reported/working/expired distinction. Add a more scannable current-status summary, explain what must be observed before a report becomes working, keep copy actions unavailable for unverified codes, and strengthen links to Tickets, Updates, Official Links, and Guides. The current title must say `Reported Codes`, not `Working Codes`.

### Pets

Turn the page into a database-ready and goal-oriented hub without publishing a fabricated roster. Keep the empty verified table, add acquisition/egg/equip/passive fields, group player goals such as growth, seeds, mutations, eggs, lightning, and XP, and explain that role recommendations appear only after comparable evidence exists.

### Worms

Keep the existing reported-name ledger, but lead with the real player questions: what worms do, how they are obtained, how they are used, what they target, and whether they are consumed. Provide a one-use capture sequence and links to Pets, Mutations, Weather Events, and Submit Data.

### Seeds

Keep the source-labelled table and existing interactions. Improve the first-screen answer, checked/version context, quick lookup paths, and links to Calculator, Money, Pets, Fertilizer, and Guides. Do not publish growth time, payout, profit, or permanent best-seed claims.

### Wiki/Guides hub

Retitle and reframe `/guides` as the Wiki and Guide Hub. Organize links by player task: Start, Codes & Rewards, Seeds & Economy, Pets & Items, Weather & Mutations, Harvest & Calculator, and Updates & Official Links. Preserve visible index/noindex status labels.

### Official Links

Retitle for the `greedy growers roblox` navigational intent. Keep only the Roblox experience and creator group as verified destinations, retain explicit not-listed states for Discord/Trello/official wiki, and add a safe next-step path to Beginner, Guides, Codes, and Updates.

## Acceptance criteria

- New route `/guides/miracle-grow` returns 200, has the approved TDH and canonical, is `noindex, follow`, and is absent from the generated sitemap.
- All seven target routes have the approved unique Titles and one H1.
- Codes never call an unverified report working; Pets never claim a complete roster; Seeds never upgrade reported values; Miracle Grow and Worms never invent effects.
- Each page has useful contextual links and no horizontal overflow at desktop and 375px mobile.
- Focused unit/E2E tests pass, then `npm.cmd run check` passes.
- A local production server is started on a verified free loopback port and all review routes return 200 with correct canonical/robots.
