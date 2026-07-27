# Calculator Field Availability

Audit date: 2026-07-27 (Asia/Shanghai)  
Current game version: `unverified`  
Eligible gameplay recordings reviewed: `0`

Availability labels have a strict meaning:

- `visible`: readable in an eligible current-version recording;
- `player-timed`: reproducibly measured from a verified start point;
- `derivable`: calculated from verified visible fields with a published formula;
- `unavailable`: none of the above has been demonstrated.

No eligible screenshot or complete recording was supplied. Consequently, no game field can currently be marked visible, player-timed, or derivable.

| Field | Availability | Evidence or gap | Screenshot timestamp | Current UI disposition |
|---|---|---|---|---|
| `currentValue` | unavailable | The official description does not establish a readable current harvest value or a post-harvest reconciliation. | None supplied | Permit manual entry only as `Your estimate`; do not say the value is shown in game. |
| `futureValue` | unavailable | No official prediction field or repeated same-tree value measurements exist. | None supplied | Manual scenario input labeled `Your estimate after waiting`. |
| `waitSeconds` | unavailable as a game field | A planned site interval is possible, but no game timer or verified planting-to-stop timing protocol has been recorded. | None supplied | Accept a user-planned interval and state that the entered risk applies only to it. |
| `currentTreeAgeSeconds` | unavailable | No tree-age HUD and no complete planting timestamp recording have been verified. | None supplied | Hide from the initial calculator and keep the Community Model disabled. |
| `height` | unavailable | No readable height field has been verified. | None supplied | Do not render a height control. |
| `seedCost` | unavailable | No river purchase UI and pre/post balance evidence have been supplied. | None supplied | Do not render seed presets or cost claims. |
| `lightningOutcome` | unavailable as an observed field | The description confirms lightning risk but no continuous strike recording establishes the target or terminal result. | None supplied | Do not publish event counts or probabilities. |
| `lightningProbability` | unavailable | No official chance and no eligible same-version observations exist. | None supplied | Manual interval probability labeled `Your estimate for this wait`; no presets. |
| `residualValue` | unavailable | Total loss after lightning has not been demonstrated. | None supplied | Optional advanced estimate; a zero default must visibly say it assumes total loss and remains editable. |
| `waitCost` | unavailable as a game field | Opportunity cost is a user decision input, not a confirmed mechanic. | None supplied | Optional estimate using the same unit as value. |
| `seedId` | unavailable | Only generic seed existence is confirmed; no seed list or identifier is verified. | None supplied | Do not expose Seed Mode. |

## Fact-to-field acceptance result

The audit does not yet prove that any calculator value can be read from the game within 30 seconds. The initial product may still accept explicit user estimates, but unsupported controls must remain absent and user estimates must not be presented as observed, official, or community-modeled data.

Reassess this table after REC-01 through REC-05 are supplied. A field can be promoted only with an evidence handle, capture date, current-version basis, and exact screenshot or recording timestamp.

