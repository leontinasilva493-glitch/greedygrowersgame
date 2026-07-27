# Gameplay Recording Register

Audit date: 2026-07-27 (Asia/Shanghai)  
Complete recordings received: `0 / 10`  
Minimum Phase 0 gate: `REC-01` through `REC-05`  
Gate status: **not met**

No gameplay recording is represented as reviewed or approved below. Every row is an explicit evidence gap.

## Required recording gaps

| Recording ID | Required complete scenario | Questions it must answer | Priority | Current status |
|---|---|---|---|---|
| REC-01 | PC, new server session: river purchase → planting → voluntary harvest → balance/inventory check | Visible seed name, cost, currency, current value, and actual harvest credit. | Required | Missing; no file or URL supplied. |
| REC-02 | PC, new server session: planting → uninterrupted wait to lightning → at least 20 seconds after strike | Lightning target, event time, whether the tree disappears or remains harvestable, and balance/inventory/residual change. | Required | Missing; no file or URL supplied. |
| REC-03 | PC, new server session: early harvest of one identifiable seed | Plant-to-harvest seconds, harvest value, and whether tree age or height is displayed. | Required | Missing; no file or URL supplied. |
| REC-04 | PC, new server session: later harvest of the same visible seed type used in REC-03 | Incremental waiting and return change; whether any future value can be estimated from repeatable observations. | Required | Missing; no file or URL supplied. |
| REC-05 | PC, new server session: a visibly different seed followed to harvest or lightning | Whether seeds show distinguishable cost, growth, and value behavior. | Required | Missing; no file or URL supplied. |
| REC-06 | Another independent server session: a second complete lightning result | Whether loss/residual behavior repeats instead of being inferred from one event. | High | Missing; no file or URL supplied. |
| REC-07 | Mobile, new server session: complete purchase-to-terminal loop | Whether Mobile exposes the same value, age, height, and timing fields and whether they are readable within 30 seconds. | High | Missing; no file or URL supplied. |
| REC-08 | New server session: plant at least two trees and continue until one terminates | Whether lightning behaves globally, per tree, or across multiple trees and whether same-session observations are correlated. | High | Missing; no file or URL supplied. |
| REC-09 | New server session: complete one loop, then inspect Settings, inventory, shop, and every visible menu | Whether Codes, fertilizer, mutations, Rebirth, market, trading, or a visible version label exist. | High | Missing; no file or URL supplied. |
| REC-10 | Age-eligible Roblox account: continuous official Social Links navigation followed by one gameplay loop | Authenticated Discord/creator-channel ownership and any visible current update/version entry. | High | Missing; no file or URL supplied. |

## Required protocol for every recording

- Start before purchase or at entry to a new server and continue until at least 20 seconds after harvest, lightning, or another terminal outcome.
- Do not cut, speed up, or omit frames.
- Keep the experience name, HUD, purchase UI, planting moment, tree interaction UI, balance/inventory, and terminal outcome readable.
- Retain original audio and local time metadata; record capture date, device/platform, duration, and an anonymous server-session ID.
- Assign a separate tree-instance ID to every observed tree.
- Record planting, any precommitted planned-stop time, every measurement time/unit, and terminal time.
- Mark the terminal record as lightning or an explicit censor reason; do not infer tree age from a partial recording.
- Do not use scripts, plugins, modified clients, administrator powers, or exploits.
- Treat multiple trees in one server session as correlated observations, not independent sessions.
- Redact usernames, chat, and unrelated player personal data before public sharing without obscuring relevant HUD evidence.

## Intake template

```text
recordingId:
fileOrUrl:
capturedAtUtc:
deviceAndPlatform:
robloxPlaceUrl: https://www.roblox.com/games/74102906764176/Greedy-Growers
anonymousServerSessionId:
treeInstanceIds:
seedVisibleName:
purchaseTimestamp:
plantTimestamp:
plannedStopTimestamp:
plannedStopPrecommitted: yes | no
measurementTimestampsAndUnits:
terminalTimestamp:
terminalOutcome: harvested | lightning | other
censorReason:
allVisibleFields:
postOutcomeBalanceOrInventoryChange:
readableWithin30Seconds: yes | no | unknown
cutsOrMissingFrames: none | describe
notes:
```

## Next review gate

After REC-01 through REC-05 arrive, reassess field readability, lightning residual value, planting-based exposure timing, right-censoring fields, and whether every calculator input is visible, player-timed, derivable, or explicitly a user estimate. Until that review passes, the game version remains `unverified` and the Community Risk Model, growth curves, seed details, and comparisons remain unavailable.
