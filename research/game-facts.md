# Greedy Growers Fact Registry

Audit date: 2026-07-27 (Asia/Shanghai)  
Current game version: `unverified`

This registry separates creator-controlled Roblox evidence from community leads. A third-party guide, wiki, server name, or invitation label is not treated as official evidence.

## Official source registry

| Source ID | Source | Captured | What it verifies |
|---|---|---|---|
| OFF-ROBLOX-GAME | [Greedy Growers Roblox experience](https://www.roblox.com/games/74102906764176/Greedy-Growers) | 2026-07-27 | Experience name, creator link, public description, and the minimal gameplay loop. |
| OFF-PLACE-MAP | [Roblox Place to Universe API](https://apis.roblox.com/universes/v1/places/74102906764176/universe) | 2026-07-27 | Place `74102906764176` maps to Universe `10440833423`. |
| OFF-GAME-API | [Roblox experience metadata API](https://games.roblox.com/v1/games?universeIds=10440833423) | 2026-07-27 | Name, description, root place, and creator Group `830072163`. |
| OFF-GROUP | [Creator group page](https://www.roblox.com/communities/830072163/banjo-greedy-lady) | 2026-07-27 | The game page links to the creator group. It does not expose a readable Discord link in the audited anonymous view. |
| OFF-GROUP-API | [Roblox group metadata API](https://groups.roblox.com/v1/groups/830072163) | 2026-07-27 | Group name and owner. `hasSocialModules` does not identify or authenticate a Discord server. |
| OFF-GROUP-GAMES | [Roblox group experiences API](https://games.roblox.com/v2/groups/830072163/gamesV2?accessFilter=2&limit=10&sortOrder=Asc) | 2026-07-27 | The creator group publishes Universe `10440833423`. |

## Confirmed official claims

| ID | Claim | Status | Source ID | Captured at | Game version | Product impact |
|---|---|---|---|---|---|---|
| GG-CORE-001 | The public description says players buy a seed from the river. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | The beginner guide may describe this one step, but not seed names, costs, rarity, currency, or refresh rules. |
| GG-CORE-002 | The public description says players plant the seed in their own plot. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | Supports the minimal beginner loop; plot count, capacity, and upgrades remain unknown. |
| GG-CORE-003 | The public description says the tree grows. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | Supports the calculator premise only. It does not verify a growth function, tree-age display, height display, or value curve. |
| GG-CORE-004 | The public description says lightning may strike at any time and tells players to harvest before it strikes. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | Supports explaining harvest risk. It does not verify probability, frequency, targeting, independence, a countdown, or total loss. |
| GG-CORE-005 | The public description identifies harvesting as a player action. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | Supports a harvest decision calculator. Harvest rewards, reversibility, and repeatability remain unknown. |
| GG-CORE-006 | The public description claims support for PC, Mobile, and Tablet. | Confirmed official description | OFF-ROBLOX-GAME | 2026-07-27 | unverified | The site may mention the developer's platform claim, but equivalent HUD field availability has not been tested. |

## Unverified or unsupported claims

The evidence above does **not** confirm any of the following:

- current harvest value visibility, future value, tree age, height, growth curves, or value formulas;
- lightning probability, frequency, timing distribution, target selection, or independence;
- whether lightning removes a tree or leaves any residual value;
- seed names, rarity, acquisition details, cost, currency, or stock behavior;
- Codes or a redemption interface;
- fertilizer, mutations, Rebirth, trading, pets, or a Farmer's Market;
- a game version or patch identifier;
- an official Discord server.

The candidate Discord invitation found during the evidence audit remains an unauthenticated community lead. It must not be linked or labeled official until REC-10 establishes a continuous Roblox Social Links to Discord ownership chain.

## Current product decision

- Keep the game version `unverified`.
- Enable only a transparent Quick Calculator based on user-provided scenarios.
- Label `futureValue`, interval-specific lightning probability, residual value, and wait cost as `Your estimate`.
- Do not describe a zero residual value as a game fact; it is an editable total-loss assumption.
- Keep the Community Risk Model disabled.
- Do not publish seed detail pages, growth curves, seed comparisons, probabilities, code redemption instructions, or unsupported mechanic guides.

