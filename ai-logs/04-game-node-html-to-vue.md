# Game Node HTML-To-Vue Conversion Prompts

Prompts documenting the actual game-node workflow: human-designed HTML/CSS/JavaScript prototypes, limited Gemini/AI assistance, and Vue integration/refinement.

---

### E01. HTML Prototype To Vue Game-Node Conversion Template

Component goal:

Convert manually designed and debugged standalone HTML/CSS/JavaScript game prototypes into native Vue game-node components while preserving the original gameplay, visual intent, and interaction flow.

Context passed to AI:

- The original game-node mechanics and visual layouts were primarily created and tested manually as HTML prototypes.
- AI was not asked to invent most node concepts from scratch.
- A small amount of Gemini assistance was used for some node-level conversion/refinement tasks.
- Every final Vue game component must emit `complete`.
- Some games emit profile data, summary data, or reward coins.
- Final UI text should connect to the app i18n system where practical.
- Onboarding instructions are defined centrally in `frontend/src/config/levels.js`.

Primary prompt template:

```text
Convert this existing manually designed HTML/CSS/JavaScript game prototype into a Vue 3 single-file component for one GradQuest map node.

Preserve the original prototype's gameplay, layout structure, visual rhythm, and educational intent. Do not redesign the game concept unless the conversion requires a small compatibility adjustment.

Use `<script setup>` and scoped styles. The component must not depend on iframe loading. It must emit:
- `complete` when the student finishes,
- `close` only if the level needs its own close control.

During conversion:
- move prototype DOM state into Vue refs, reactive objects, computed values, and methods,
- replace direct DOM mutation with Vue bindings where practical,
- preserve manually tested game rules and scoring logic,
- convert inline event handlers to Vue event bindings,
- keep the original CSS feel but scope selectors to the component,
- add mobile/touch fallback behavior when the original prototype used drag-and-drop,
- connect visible copy to `useAppI18n()` when the surrounding project already has translation keys,
- emit a result payload that can be stored by the map's game-result review flow.

The completion payload should include useful review data:
- completed/passed status when relevant,
- rewardCoins when the game awards a custom amount,
- resultType such as `result` or `summary`,
- resultData containing the student's choices, score, route, order, feedback, or unlocked artifacts,
- language where needed.

The UI should:
- match the fantasy application-planning theme,
- use the app i18n helper for visible text,
- provide feedback after meaningful choices,
- avoid dead ends,
- work on desktop and mobile,
- support click/tap alternatives when drag-and-drop is used.

The educational content and node mechanic are already defined by the manual prototype. Keep that intent intact while making the component work inside the Vue map, backend progress, i18n, and replay-result architecture.
```

Expected output:

- One Vue component per level.
- Completion payload compatible with map/game store.
- Responsive styles.
- i18n keys and guide content.
- No loss of original manually tested gameplay behavior.

Acceptance criteria:

- Component can be opened from the map.
- Completion unlocks the next node.
- Prior result can be shown by `GameCompletedView`.
- The mechanic teaches a clear planning concept.
- The final Vue component behaves like the approved HTML prototype.

### E02. Year 2 Learning Path Detail Prompt

Component goal:

Integrate the manually designed Year 2 HTML game prototypes into the Vue student map and connect them to profile, progress, reward, replay, and onboarding flows.

Context passed to AI:

- Year 2 is the exploration phase.
- It should help students understand themselves, destinations, school lists, agency/contract risks, and action priorities before the intense application phase.
- The Year 2 node concepts, game flow, visual style, and prototype interaction rules were already designed manually in HTML/CSS/JavaScript.
- AI assistance was limited to conversion, cleanup, Vue integration, payload design, responsive fixes, and i18n/onboarding alignment.

Primary prompt:

```text
Convert and integrate the seven existing Year 2 HTML prototypes as a coherent Vue exploration path.

Shared conversion requirements:
- preserve the manually designed gameplay and UI structure,
- convert prototype state and event handling into Vue composition API,
- emit map-compatible completion payloads,
- add rewardCoins and resultData where useful,
- connect node completion to backend progress through the existing map/game store,
- add i18n keys or use existing translations for visible interface text,
- keep mobile layouts usable,
- add click/tap fallbacks for drag-based prototypes.

Y2-1 Identity Forge:
- collect application baseline and traveler appearance,
- save GPA, experience, language, GRE, character, and tool data,
- emit profile data for backend merge.

Y2-2 Region Choice:
- ask weighted destination preference questions,
- score regions including UK, Europe, US, Singapore, Australia, Hong Kong, Sino-foreign cooperative pathways, and niche options,
- allow manual override,
- emit recommended region and scores.

Y2-3 Tier Mapping:
- use previous profile/region context,
- let students tier schools into Reach, Match, and Safety,
- support drag/drop and click fallback,
- evaluate whether the list is balanced.

Y2-4 Senior Case Archives:
- provide EE and ICS case tracks,
- ask students to judge realistic admission cases,
- give truth/explanation after each answer,
- summarize accuracy and mistake style.

Y2-5 Action Plan:
- let students allocate limited action points,
- generate contextual planning advice,
- emphasize GPA, language, projects, research, school research, recommendation, and timeline priorities.

Y2-6 Contract Guardian:
- teach agency contract risk control,
- match safety shields to risky clauses,
- require all clauses protected before completion.

Y2-7 Final Trial:
- provide a short capstone review and reward moment,
- mark Year 2 complete and prepare transition to Year 3.
```

Expected output:

- `year2_1.vue` through `year2_7.vue`.
- Supporting i18n keys.
- Completion payloads with meaningful result data.

Acceptance criteria:

- Year 2 path can be completed sequentially.
- Each game maps to a real application-planning skill.
- The student's profile choices affect later UI or result context.
- The converted Vue nodes retain the behavior of the original HTML prototypes.

### E03. Year 3 Learning Path Detail Prompt

Component goal:

Integrate the manually designed Year 3 HTML game prototypes into the Vue application sprint path.

Context passed to AI:

- Year 3 is the execution phase.
- Games should feel more urgent and material-focused than Year 2.
- The finale should reinforce ownership of the application process.
- The Year 3 node concepts, interactions, visual states, and prototype game rules were primarily produced and debugged manually in HTML/CSS/JavaScript.
- AI help was used only in targeted ways, such as Vue conversion, state cleanup, completion payload shaping, mobile compatibility, and text/i18n integration.

Primary prompt:

```text
Convert and integrate the eight existing Year 3 HTML prototypes as a Vue application sprint.

Shared conversion requirements:
- preserve the manually designed prototype rules and screen flow,
- use Vue refs/reactive/computed instead of direct DOM mutation,
- scope styles without changing the approved visual identity unnecessarily,
- connect each node to the shared map completion contract,
- produce replayable result data for completed levels,
- preserve or improve mobile usability,
- use the central onboarding and i18n systems where applicable.

Y3-1 Timeline Crucible:
- create a material fusion/alchemy game,
- combine base artifacts into application-ready outputs,
- use hints and recipe feedback.

Y3-2 Bureau of Magic:
- classify application fragments as CV, PS, or recommendation letter,
- use stamp-based interaction and immediate feedback.

Y3-3 CV Surgery:
- display a CV draft with hidden issues,
- let students click problematic areas,
- track fixed core issues and explain why each matters.

Y3-4 PS Weaving:
- represent narrative ingredients as stars,
- let students build a personal statement sequence,
- evaluate structure and show feedback.

Y3-5 Recommendation Mentor:
- create a branching conversation about requesting recommendation letters,
- reward polite, specific, prepared communication,
- emit route and answer history.

Y3-6 Dark Citadel:
- create staged application/exam combat,
- include tool-based bonuses from the student's chosen familiar tool,
- track cleared stages and settlement result.

Y3-7 DIY Bog Sweeper:
- classify application risks by severity,
- cover deadlines, language thresholds, official documents, account ownership, agency claims, PS/CV quality, and follow-up.

Y3-8 Astral Coronation:
- present a final certificate and reward list,
- remind students to keep records, material versions, recommendation status, portal checks, and follow-up actions under their own control.
```

Expected output:

- `year3_1.vue` through `year3_8.vue`.
- Full-screen capable finale.
- Result payloads for replay and review.

Acceptance criteria:

- Year 3 path can be completed sequentially.
- Each game reinforces a concrete application execution skill.
- The final level completes the whole map journey.
- The converted Vue nodes match the intended behavior of the original HTML prototypes.

### E04. Shared Node Runtime And Conversion Contract

Component goal:

Define the common runtime contract used by all converted game nodes after the standalone HTML prototypes were moved into the Vue map.

Context passed to AI:

- The final app does not open the prototype HTML files directly.
- `MapView.vue` and `GameContainer.vue` dynamically load Vue game components and normalize each node's completion payload.
- `frontend/src/config/levels.js` owns node metadata and onboarding guide content.
- Most node components use `KnowledgeGuidePanel` for an in-level collapsible guide.
- Backend progress is shared across all nodes; node-specific interactions usually stay in local Vue state and local replay payloads.

Primary prompt:

```text
Create a shared runtime contract for converted HTML-to-Vue game nodes.

Requirements:
- Every node must be a Vue single-file component under `frontend/src/views/games/`.
- Components must be loadable from `MapView.vue` and `GameContainer.vue` through the central level config.
- Components should emit `complete` when finished. `close` is optional and only needed when the node has its own close control.
- Completion payloads may be rich or compact:
  - rich payloads can include `completed`, `passed`, `resultType`, `resultData`, `language`, `rewardCoins`, and `profile`;
  - compact payloads can be as small as `{ game: "..." }`, `{ profile: ... }`, `{ order: ... }`, or `{ hpLeft: ... }` when the local game does not need a detailed replay summary.
- The map/container layer should normalize completion into the local replay result format.
- The backend should receive only shared progress fields: year, level id, optional reward coins, and optional profile merge data.
- Use `KnowledgeGuidePanel` or central onboarding guides to explain controls without turning the game into a static tutorial.
- Use `useAppI18n()` for visible app copy where the final component has translation keys.
- Move large node data into config modules when it would make a Vue file difficult to review.
- Clean up timers, document title overrides, music hooks, and resize listeners during unmount.
```

Expected output:

- Consistent `complete` event behavior across all 15 nodes.
- Central onboarding data in `levels.js`.
- Reusable guide display through `KnowledgeGuidePanel`.
- Local replay compatibility through map/container payload normalization.
- No per-node backend completion endpoints.

Acceptance criteria:

- Locked/unlocked/completed state remains backend-authoritative.
- Replay data remains local and does not require a node-specific database table.
- Converted nodes can be opened from both the map modal and the route-based game container.
- Compact payloads are documented as intentional, not missing implementation.

### E05. Initial HTML Prompt To Final Vue Scope Reconciliation

Component goal:

Explain how the large early `v1_*` gameplay prompts were narrowed during final Vue implementation.

Context passed to AI:

- Many initial `v1_*` prompt files asked for full "AAA-style" node specifications, including backend APIs, database tables, scoring engines, and persistent world systems.
- Those prompts were primarily used to shape standalone HTML gameplay concepts and interaction design.
- The final app architecture centralizes persistence in shared auth, progress, profile, shop, teacher, and sandbox systems.
- The final Vue nodes are compact educational games, not separate backend products.

Primary prompt:

```text
Document the relationship between early node prompts and final Vue implementation.

Rules for the log:
- Keep every `v1_*` prompt file as a record of the early design or HTML-prototype prompt.
- Do not imply that every backend API, database table, or persistent simulation system requested in the early node prompts was implemented.
- Explain that final Vue conversion used a shared architecture:
  - node state lives in the Vue component during play,
  - replay summaries are normalized by the map/container and stored locally,
  - backend progress uses the shared `/api/progress/complete` endpoint,
  - profile updates are merged only when a node intentionally changes traveler/profile data,
  - teacher reporting reads shared progress/profile/inventory state rather than every transient node interaction.
- Note node-number changes explicitly when an early prompt's Node ID does not match the final Vue slot.
- Preserve the distinction between:
  - manually designed and debugged HTML prototype,
  - limited Gemini/AI conversion help,
  - final Vue integration into map, i18n, onboarding, and progress systems.
```

Expected output:

- A prompt log that links all early node prompts while explaining final scope decisions.
- Clear handling of Y2-4, Y2-6, and other renamed/narrowed nodes.
- No false claim that early per-node backend/database sections were implemented as separate server modules.

Acceptance criteria:

- A reviewer can see why `v1_*` prompts are more ambitious than the final Vue components.
- The final architecture is represented accurately.
- Node prompt records explain plan changes without rewriting the historical prompt files.

## 6. Game Level HTML-To-Vue Conversion Prompts

The 15 game nodes in `frontend/src/views/games/` were not primarily AI-generated from scratch. The workflow was:

- Human work: design the game concept, UI layout, interaction flow, educational content, and standalone HTML/CSS/JavaScript prototype; manually test and tune the prototype.
- Limited AI/Gemini assistance: help with conversion patterns, Vue state restructuring, small logic cleanup, wording/copy refinement, and targeted bug-fix suggestions.
- Final integration work: convert the approved prototype into a Vue single-file component, connect it to map completion events, local replay results, i18n, responsive behavior, and backend progress.

The `v1_*` files in this folder are the earlier prompts used to produce or guide the standalone HTML prototypes. Some of those early prompts do not match the final Vue node numbering or mechanics exactly. During Vue conversion, the plan was adjusted to fit the final map structure, backend progress model, existing components, available data, and mobile/i18n requirements.

Important scope reconciliation:

- Early `v1_*` prompts often requested backend APIs, database entities, scoring engines, or persistent node-specific systems.
- Final Vue implementation does not create a separate backend table/API for each game node.
- Shared backend progress handles completion, rewards, unlocking, and optional traveler-profile merge.
- Rich, transient node decisions are kept inside the component during play and may be normalized into local replay data by `MapView.vue` or `GameContainer.vue`.
- The notes below describe both the early source prompt and the final Vue scope so the log does not overclaim backend/database implementation.

## Initial HTML Prompt Links

| Final Vue Node | Final Vue File | Initial HTML Prompt | v1 Source ID / Name | Final Scope Adjustment |
|---|---|---|---|---|
| Y2-1 Identity Forge | `frontend/src/views/games/year2_1.vue` | [v1_year2-1.md](v1_year2-1.md) | Y2-1 / Academic Identity Card | Narrowed broad RPG profile design into application baseline, avatar/map character, tool selection, and traveler-profile merge. |
| Y2-2 Region Choice | `frontend/src/views/games/year2_2.vue` | [v1_year2-2.md](v1_year2-2.md) | Y2-2 / Region Cognition / World Route Discovery | Kept weighted destination matching and manual override; map-wide route effects moved into shared map/profile state. |
| Y2-3 Tier Mapping | `frontend/src/views/games/year2_3.vue` | [v1_year2_3.md](v1_year2_3.md) | Y2-3 / Score Utilization / School Tier Strategy | Implemented practical Reach / Match / Safety tiering with `year2CountrySchools.js` data support. |
| Y2-4 Senior Case Archives | `frontend/src/views/games/year2_4.vue` | [v1_year2_4_2.md](v1_year2_4_2.md); related earlier but not final: [v1_year2_4.md](v1_year2_4.md) | Source prompt labeled Y2-6 / Senior Case Archives; earlier Y2-4 was Major Cognition / Application Formula Laboratory | Case-archive prompt was moved into final Y2-4; the earlier major-cognition lab did not carry one-to-one into the final map. |
| Y2-5 Action Plan | `frontend/src/views/games/year2_5.vue` | [v1_year2_5.md](v1_year2_5.md) | Y2-5 / Background Enhancement / Limited Action Point Strategy | Kept action-point allocation and profile-aware advice; no separate planning backend. |
| Y2-6 Contract Guardian | `frontend/src/views/games/year2_6.vue` | [v1_year2_6.md](v1_year2_6.md) | Hidden Y2-H1 / Contract Trap Observatory / Covenant Risk Trial | Hidden-node design became visible Y2-6; hidden unlock conditions were removed. |
| Y2-7 Final Trial | `frontend/src/views/games/year2_7.vue` | [v1_year2_7.md](v1_year2_7.md) | Y2-7 / Reward Festival / Grand Exchange & Destiny Gacha | Reduced broad reward festival into concise capstone/reward moment; global shop/inventory handles economy. |
| Y3-1 Timeline Crucible | `frontend/src/views/games/year3_1.vue` | [v1_year3_1.md](v1_year3_1.md) | Y3-1 / Application Timeline Overview / Chrono-Alchemy Forge | Implemented local material fusion/alchemy; no persistent recipe graph backend. |
| Y3-2 Bureau of Magic | `frontend/src/views/games/year3_2.vue` | [v1_year3_2.md](v1_year3_2.md) | Y3-2 / Application Material Cognition / Archive of Narrative Roles | Narrowed into stamp-based CV/PS/recommendation classification loop. |
| Y3-3 CV Surgery | `frontend/src/views/games/year3_3.vue` | [v1_year3_3.md](v1_year3_3.md) | Y3-3 / CV Emergency Clinic / Resume Diagnostic Ward | Focused on clickable CV issue detection and compact fixed-count completion payload. |
| Y3-4 PS Weaving | `frontend/src/views/games/year3_4.vue` | [v1_year3_4.md](v1_year3_4.md) | Y3-4 / Personal Statement Node / Cathedral of Story Forging | Narrowed large narrative-forging system into star-ordering PS structure puzzle with no new backend tables. |
| Y3-5 Recommendation Mentor | `frontend/src/views/games/year3_5.vue` | [v1_year3_5.md](v1_year3_5.md) | Y3-5 / Recommendation Letter Node / Hall of Academic Bonds | Implemented route-based recommendation request dialogue using `year3RecommendationQuestions.js`. |
| Y3-6 Dark Citadel | `frontend/src/views/games/year3_6.vue` | [v1_year3_6.md](v1_year3_6.md) | Y3-6 / Language Exam Node / Temporal Resource Command Center | Converted resource/timeline concept into staged battle level with local state, tool bonus, and music hook. |
| Y3-7 DIY Bog Sweeper | `frontend/src/views/games/year3_7.vue` | [v1_year3_7.md](v1_year3_7.md) | Y3-7 / DIY Application Node / The Dungeon of Hidden Application Traps | Implemented compact severity-classification spell loop; no separate risk database. |
| Y3-8 Astral Coronation | `frontend/src/views/games/year3_8.vue` | [v1_year3_8.md](v1_year3_8.md) | Y3-8 / Final Reward Node / The Ascension Hall of Futures | Reduced endgame/reward-system prompt into certificate finale with confetti and standard completion. |

### 6.1 Year 2 Level 1: Identity Forge

Core file: `frontend/src/views/games/year2_1.vue`

Initial HTML prompt: [v1_year2-1.md](v1_year2-1.md)

Source workflow:

- The profile-building flow and identity-card style interaction were designed and tested as an HTML prototype.
- AI/Gemini assistance was used only as a conversion/refinement aid, not as the origin of the node concept.
- Conversion plan change: the early prompt described a broad RPG onboarding/specification system. The Vue version narrowed it to the data needed by the final app: application baseline, avatar/map character, tool selection, validation, and traveler-profile persistence.

Primary prompt:

```text
Convert the existing manually authored HTML/CSS/JavaScript prototype for Y2-1 "Identity Forge" into a Vue 3 single-file component.

Preserve the original flow where the student builds a traveler identity and application baseline. Keep the live identity card preview, choice-card interactions, progress/charge feedback, and final seal/confirmation behavior.

Vue integration tasks:
- move prototype state into refs/reactive objects,
- keep selections for codename, GPA band, map character, familiar tool, internship, research, competition, project, language status/score, and GRE status/score,
- preserve validation for required fields,
- emit a completion payload containing rewardCoins, language, result data, and profile data for backend traveler-profile merge,
- connect visible labels and guide text to the i18n system where possible,
- keep the responsive layout close to the approved HTML version.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, `useAppI18n()`, and imported map character/tool assets.
- Actual final payload is intentionally compact: `{ profile: forgedProfile.value }`.
- The map/container layer normalizes completion; the backend receives traveler profile merge data through the shared progress completion flow.
- The node does not create a separate identity-card backend table; profile JSON on the user account is the persistence boundary.

### 6.2 Year 2 Level 2: Region Choice

Core file: `frontend/src/views/games/year2_2.vue`

Initial HTML prompt: [v1_year2-2.md](v1_year2-2.md)

Source workflow:

- The region-selection questions, scoring idea, tarot/card-like result display, and manual override flow came from the manually designed HTML prototype.
- AI/Gemini assistance was used for Vue conversion and organizing scoring/result state.
- Conversion plan change: the early route-discovery prompt was broader than the final Vue node. The implemented version keeps the weighted destination recommendation and manual override, but trims any map-wide dynamic reactions that belong in `MapView.vue`.

Primary prompt:

```text
Convert the existing Y2-2 destination recommendation HTML prototype into a Vue component.

Keep the original questionnaire flow, destination overview, weighted region scoring, result card, and manual region override. Do not replace the manually tuned decision model with a new recommendation system.

Vue integration tasks:
- represent region scores and question progress with Vue state,
- preserve destination options such as UK, Europe, US, Singapore, Australia, Hong Kong, Sino-foreign cooperative pathways, and niche options,
- calculate and display the recommended region from the prototype scoring rules,
- allow manual override before completion,
- emit resultData containing selected region, recommended region, and score breakdown,
- award coins through the standard complete event,
- keep the guide/onboarding text aligned with the map-level controls.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, `useAppI18n()`, and `year2CountrySchools.js` helpers for country config, country-key normalization, and matched-country persistence.
- Emits a richer completion payload with `rewardCoins: 30`, `resultType: "result"`, `resultData` containing country scores, answer history, explanation, and a `profile` update containing matched-country data.
- The matched country is stored for later node context, especially Y2-3 tier mapping.
- There is no destination-recommendation backend table; the backend only receives shared progress and optional profile merge.

### 6.3 Year 2 Level 3: Tier Mapping

Core file: `frontend/src/views/games/year2_3.vue`

Initial HTML prompt: [v1_year2_3.md](v1_year2_3.md)

Source workflow:

- The school-list tiering mechanic, card placement model, and feedback categories were first built and adjusted manually in HTML.
- AI/Gemini help was used mainly to translate drag/drop and fallback interactions into Vue.
- Conversion plan change: the early tactical-expedition specification was adapted into a practical Reach / Match / Safety tiering UI that works inside the final modal and can consume existing region/profile state.

Primary prompt:

```text
Convert the existing Y2-3 school-tier mapping HTML prototype into a Vue component.

Preserve the Reach / Match / Safety placement mechanic and the prototype's feedback logic. Keep the ability to work from the student's previous region/profile context where available.

Vue integration tasks:
- render school cards and tier buckets from reactive state,
- support drag-and-drop on desktop,
- add click-to-select and click-to-place fallback for touch devices,
- preserve feedback categories for missing tiers, too-safe lists, too-high lists, and balanced tiering,
- emit a summary result with selected tiers, matched country/region, and feedback,
- keep layout and feedback panels responsive inside the map modal.
```

Final Vue integration notes:

- Uses `useGameStore()` to read traveler/profile context and `year2CountrySchools.js` for country, score-band, school-card, and tier-bucket helpers.
- Supports both standard school tiering and special-region completion paths for cases where a teacher consultation message is more appropriate than school-card placement.
- Standard completion emits `resultType: "summary"` with matched country, tier buckets, score, feedback, and language; special-region completion emits a compact summary message.
- The actual school data is a frontend config module, not a backend school database.

### 6.4 Year 2 Level 4: Senior Case Archives

Core file: `frontend/src/views/games/year2_4.vue`

Initial HTML prompts:

- Final implemented case-archive direction: [v1_year2_4_2.md](v1_year2_4_2.md)
- Earlier Y2-4 direction not carried one-to-one into final Vue structure: [v1_year2_4.md](v1_year2_4.md)

Source workflow:

- The case archive concept, EE/ICS track split, case database style, and answer feedback loop were manually designed and debugged before Vue integration.
- AI/Gemini assistance was limited to structuring case state, answer history, and completion payload output.
- Conversion plan change: `v1_year2_4.md` originally described a "Major Cognition / Application Formula Laboratory" node. The final project structure did not use that plan directly. The implemented Y2-4 instead follows the case-archive concept from `v1_year2_4_2.md`, whose original prompt label said Y2-6. During Vue integration, that case-archive plan was moved into the final Y2-4 slot to match the actual map sequence.

Primary prompt:

```text
Convert the existing Y2-4 senior-case archive prototype into a Vue component.

Keep the manually designed case-judgment flow: choose track, read each case, make a judgment, show the truth/explanation, track mistakes, then produce a final report.

Vue integration tasks:
- keep the EE and ICS track data structure readable,
- store current case index, answer history, correct count, and mistake categories in Vue state,
- preserve the prototype's explanation/truth panel behavior,
- show a completion screen with accuracy and report-style feedback,
- emit resultData containing selected track, correct count, total cases, accuracy, and mistakes,
- keep reward claiming explicit rather than auto-completing.
```

Final Vue integration notes:

- Uses an internal EE/ICS case database inside the Vue node rather than a backend case API.
- Completion is explicit through the claim button and returns `rewardCoins: 30`, `resultType: "result"`, selected track, correct/wrong counts, total case count, accuracy, and localized analysis text.
- The earlier major-cognition Y2-4 prompt is documented as related background only; the final implementation is the case-archive flow.

### 6.5 Year 2 Level 5: Action Plan

Core file: `frontend/src/views/games/year2_5.vue`

Initial HTML prompt: [v1_year2_5.md](v1_year2_5.md)

Source workflow:

- The action-point allocation interface and planning interpretation were manually designed as an HTML planning game.
- AI/Gemini assistance was used for Vue state conversion and for organizing generated summary text paths.
- Conversion plan change: the early resource-allocation prompt was kept conceptually, but the final Vue node reduced the scope to action-point allocation, profile-aware advice, and a completion summary that can be stored by the map result system.

Primary prompt:

```text
Convert the existing Y2-5 action-point allocation prototype into a Vue component.

Preserve the limited-points mechanic, plus/minus allocation controls, planning categories, and final prophecy/plan output from the approved prototype.

Vue integration tasks:
- store task allocations and remaining points in reactive state,
- keep task categories for GPA, language, research, internship, school research, recommendation planning, and networking,
- use the student's saved profile when available to adjust contextual advice,
- preserve the generated plan/prophecy summary,
- emit resultData containing allocations, remaining points, planning level, and recommendation text,
- keep controls touch-friendly.
```

Final Vue integration notes:

- Uses `useGameStore()` to read existing academic/traveler profile context for personalized analysis.
- Actual completion payload is compact: `resultType: "result"` plus `resultData` containing allocation values and top-priority task ids.
- The detailed generated advice remains UI-local/replay-oriented; no separate action-plan backend table is created.

### 6.6 Year 2 Level 6: Contract Guardian

Core file: `frontend/src/views/games/year2_6.vue`

Initial HTML prompt: [v1_year2_6.md](v1_year2_6.md)

Source workflow:

- The contract-risk shield matching game was manually prototyped with clause cards, safety shields, and protected states.
- AI/Gemini assistance was used for Vue drag/drop conversion and mobile interaction fallback.
- Conversion plan change: the initial prompt described this as a hidden Year 2 contract-risk node (`Y2-H1`). In the final Vue map, the mechanic became the visible Y2-6 Contract Guardian level, with hidden-node unlock requirements removed and the interaction simplified into shield-to-clause matching.

Primary prompt:

```text
Convert the existing Y2-6 contract-guardian HTML prototype into a Vue component.

Preserve the agency-contract risk learning goal: students must match safety shields to risky clauses until all clauses are protected.

Vue integration tasks:
- represent clauses, shields, selected shield, and protected status in Vue state,
- support desktop drag/drop matching,
- add touch-friendly click/tap matching,
- validate shield-to-clause matches using the prototype rules,
- show feedback for correct and incorrect matches,
- enable completion only after all clauses are protected,
- emit protected count and reward coins.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, desktop drag/drop, and touch-friendly click/tap shield matching.
- Actual completion payload is compact: `{ game: "contract-guardian", protected: totalClauses, rewardCoins: 30 }`.
- Error/feedback timers are cleared on unmount.
- This final visible Y2-6 version does not preserve the early hidden-node unlock structure.

### 6.7 Year 2 Level 7: Final Trial

Core file: `frontend/src/views/games/year2_7.vue`

Initial HTML prompt: [v1_year2_7.md](v1_year2_7.md)

Source workflow:

- The Year 2 capstone/reward moment was manually designed as a lightweight final HTML interaction.
- AI/Gemini assistance was minor and focused on Vue component wrapping and completion emission.
- Conversion plan change: the early reward-systems prompt was broader. The final component keeps the capstone/reward moment and avoids extra live-ops or economy complexity because the shared map and backend already handle rewards/progress.

Primary prompt:

```text
Convert the existing Y2-7 final-trial prototype into a Vue component.

Keep the short capstone review, success state, and reward-ticket presentation. Do not expand it into a complex new game; it should remain a concise transition out of Year 2.

Vue integration tasks:
- preserve the original success/reward screen,
- expose a complete action that returns control to the map,
- emit a completion payload identifying the final-trial reward,
- keep styles scoped and responsive.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel` and timer-based reward reveal/spin behavior with cleanup on unmount.
- Actual completion payload is compact: `{ game: "golden-ticket", reward: "prophecy-consultation" }`.
- The broad early gacha/reward festival concept is not implemented as a separate economy; the shared shop/inventory system remains the reward backend.

### 6.8 Year 3 Level 1: Timeline Crucible

Core file: `frontend/src/views/games/year3_1.vue`

Initial HTML prompt: [v1_year3_1.md](v1_year3_1.md)

Source workflow:

- The material fusion/alchemy interaction, inventory slots, recipe idea, and hint notes were manually prototyped in HTML.
- AI/Gemini assistance was used for Vue state conversion and result payload shaping.
- Conversion plan change: the early cinematic quest prompt was converted into a contained material-fusion level, with artifact state and recipes stored locally in the Vue component rather than as a separate global system.

Primary prompt:

```text
Convert the existing Y3-1 Timeline Crucible HTML prototype into a Vue component.

Preserve the material-combination gameplay: select two materials, place them into slots, fuse them, unlock new application artifacts, and use hint notes to guide the next combination.

Vue integration tasks:
- store inventory, selected slots, unlocked artifacts, active hints, and feedback in Vue state,
- preserve recipe matching from the prototype,
- preserve special failure messages and success unlock behavior,
- show completion only after required artifacts are unlocked,
- emit resultData containing unlocked artifacts and completion state,
- keep the visual style close to the prototype.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, localized toast/feedback text, local inventory/recipe state, and timer cleanup on unmount.
- Actual completion payload is compact: `{ game: "application-alchemy", rewardCoins: 20 }`.
- Artifact unlock state exists inside the component during play; the backend only stores shared level completion and reward state.

### 6.9 Year 3 Level 2: Bureau Of Magic

Core file: `frontend/src/views/games/year3_2.vue`

Initial HTML prompt: [v1_year3_2.md](v1_year3_2.md)

Source workflow:

- The parchment/stamp classification mechanic was manually designed and tested as an HTML interaction.
- AI/Gemini assistance was used to convert fragment sequencing and feedback state into Vue.
- Conversion plan change: the early document-system prompt was adapted into a focused classification loop so the node remains short enough for the final map modal.

Primary prompt:

```text
Convert the existing Y3-2 Bureau of Magic prototype into a Vue component.

Keep the document-fragment classification mechanic. Students should read a fragment and stamp it as CV, personal statement, or recommendation letter, then receive immediate feedback.

Vue integration tasks:
- store fragment list, current fragment, selected stamp, progress, and feedback state,
- preserve correct/wrong feedback content,
- advance through fragments until the prototype's completion condition is reached,
- emit completion when all fragments are classified,
- keep the parchment/stamp visual styling and mobile spacing.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, `useAppI18n()`, language-aware feedback refresh, and timer cleanup on unmount.
- Actual completion payload is compact: `{ game: "artifact-appraisal" }`.
- Fragment sequence and stamp feedback are local component state; no material-classification backend table was created.

### 6.10 Year 3 Level 3: CV Surgery

Core file: `frontend/src/views/games/year3_3.vue`

Initial HTML prompt: [v1_year3_3.md](v1_year3_3.md)

Source workflow:

- The CV debugging screen, clickable issue regions, and checklist feedback were manually built and tuned in HTML.
- AI/Gemini assistance was used for Vue conversion and clearer state naming.
- Conversion plan change: the early prompt included a wider recruitment/admissions-document framing. The Vue version concentrates on clickable CV issue detection and result payload output.

Primary prompt:

```text
Convert the existing Y3-3 CV Surgery prototype into a Vue component.

Preserve the clickable CV debugging mechanic. Students should inspect a CV draft, click suspicious areas, mark core issues as found, and read feedback explaining the issue.

Vue integration tasks:
- store found issue ids and active feedback in Vue state,
- preserve core issue categories such as GPA expression, vague descriptions, ordering, score wording, irrelevant hobbies, and passive phrasing,
- render checklist status from state,
- show success only when all core issues are found,
- emit resultData with fixed issue count and issue ids,
- preserve the original document/clinic visual style.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel` and click-based issue detection inside a styled CV clinic surface.
- Actual completion payload is compact: `{ game: "cv-surgery", fixed: foundCoreCount.value }`.
- The richer issue list/checklist is UI state; the shared progress system records completion rather than every clicked CV issue.

### 6.11 Year 3 Level 4: PS Weaving

Core file: `frontend/src/views/games/year3_4.vue`

Initial HTML prompt: [v1_year3_4.md](v1_year3_4.md)

Source workflow:

- The star-map narrative ordering game was manually designed as an HTML prototype.
- AI/Gemini assistance was used for converting selected-order logic and feedback branches into Vue.
- Conversion plan change: the initial Cathedral of Story Forging prompt described a much larger narrative-forging system with memory fragments, resonance scoring, advisors, output blueprints, backend APIs, and database entities. The final Vue node keeps the core PS storytelling lesson but narrows implementation to a star-ordering narrative puzzle that fits the existing map modal, local result payload, and no-new-backend-table architecture.

Primary prompt:

```text
Convert the existing Y3-4 PS Weaving prototype into a Vue component.

Preserve the star-node ordering mechanic. Students should click narrative ingredients to form a personal-statement sequence and receive feedback on whether the structure is logical, risky, template-like, or successful.

Vue integration tasks:
- store selected order and result state in Vue,
- preserve the manually defined narrative ingredients and successful order patterns,
- keep reset/retry behavior,
- show feedback cards from the prototype rules,
- emit resultData with selected order and outcome,
- keep the constellation visual design responsive.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, local selected-order state, delayed validation after star selection, and compact completion.
- Actual completion payload is `{ game: "ps-story-weaving", order: selectedOrder.value }`.
- The early prompt's narrative graph, resonance scoring backend, advisor engine, and database tables were narrowed into a frontend star-ordering puzzle.

### 6.12 Year 3 Level 5: Recommendation Mentor

Core file: `frontend/src/views/games/year3_5.vue`

Initial HTML prompt: [v1_year3_5.md](v1_year3_5.md)

Source workflow:

- The recommendation-letter dialogue flow and scenario routes were manually designed as a branching HTML interaction.
- AI/Gemini assistance was used for Vue component conversion, modal completion handling, and result summary shaping.
- Conversion plan change: the early social-systems prompt was narrowed into a branching recommendation-request dialogue that fits one modal-based level and emits a concise summary.

Primary prompt:

```text
Convert the existing Y3-5 recommendation mentor dialogue prototype into a Vue component.

Preserve the manually designed branching conversation. Students should choose a route/scenario, answer dialogue choices, and learn that polite, specific, prepared communication works better for recommendation-letter requests.

Vue integration tasks:
- store selected route, current question, answer history, reward/progress, and completion modal state,
- replace browser alert with an in-app modal,
- emit resultData containing route, selected answers, and reward summary,
- preserve document-title behavior only if it does not interfere with app navigation,
- keep the dialogue UI responsive.
```

Final Vue integration notes:

- Uses `YEAR3_RECOMMENDATION_ROUTES` from `year3RecommendationQuestions.js` so the large question/route data is outside the component.
- Overrides `document.title` while mounted and restores it on unmount.
- Emits `rewardCoins`, `resultType: "summary"`, route id/title, correct count, total count, answer history, and language.
- Route/question data is frontend config; no recommendation-dialogue backend table is created.

### 6.13 Year 3 Level 6: Dark Citadel

Core file: `frontend/src/views/games/year3_6.vue`

Initial HTML prompt: [v1_year3_6.md](v1_year3_6.md)

Source workflow:

- The staged battle concept, monthly gates, combat states, and settlement screen were manually designed and debugged in an HTML game prototype.
- AI/Gemini assistance was used for Vue state organization, tool-bonus integration, and completion payload structure.
- Conversion plan change: the early systems prompt was adapted into a self-contained staged battle component. Persistent global combat progression was not added; only the final node result is stored through the shared game-result/progress flow.

Primary prompt:

```text
Convert the existing Y3-6 Dark Citadel battle prototype into a Vue component.

Preserve the staged application/exam combat flow. Students should enter monthly gates, choose skills, clear stages, and reach a final settlement screen.

Vue integration tasks:
- store stage list, current stage, player/enemy status, cleared stages, battle logs, modal state, and settlement state,
- preserve the prototype's skill/action rules,
- integrate tool-based bonuses using the student's selected familiar tool from the game store,
- show tool bonus modal content without blocking progression,
- emit resultData with cleared stages, title/settlement, and reward coins,
- keep the component full-screen friendly and mobile scrollable.
```

Final Vue integration notes:

- Uses `useGameStore()` for the selected familiar tool, `useWelcomeMusic()` for fight-success audio, and localized document-title changes.
- Cleans up timers/watchdog state, document title, and the resize listener on unmount.
- Emits `resultType: "summary"` with cleared stage ids/names, gems, level, potions, selected tool, and language.
- Combat progression is not persisted as a separate backend system; only final progress/result summary flows through the shared map contract.

### 6.14 Year 3 Level 7: DIY Bog Sweeper

Core file: `frontend/src/views/games/year3_7.vue`

Initial HTML prompt: [v1_year3_7.md](v1_year3_7.md)

Source workflow:

- The risk classification/spell-button mechanic and risk item set were manually designed in HTML.
- AI/Gemini assistance was used for Vue conversion and cleaner dialog/toast state.
- Conversion plan change: the early risk-analysis prompt was preserved in concept but implemented as a compact classify-and-feedback loop, suitable for the existing Vue modal and final completion contract.

Primary prompt:

```text
Convert the existing Y3-7 DIY Bog Sweeper prototype into a Vue component.

Preserve the application-risk classification mechanic. Students should read a risk statement and choose whether it is fatal, severe, or minor/impression-level risk.

Vue integration tasks:
- store risk list, current risk, spell selection, feedback dialog, failures, and final state,
- preserve the manually written risk statements covering deadlines, official requirements, language thresholds, agency promises, document control, accounts, recommendation letters, PS/CV quality, and post-submission follow-up,
- preserve spell-button feedback and final win behavior,
- emit resultData with classified count, mistakes/failures, and completion outcome,
- keep the game usable on small screens.
```

Final Vue integration notes:

- Uses `KnowledgeGuidePanel`, local risk/hp state, scheduled feedback timers, and unmount cleanup.
- Actual completion payload is compact: `{ year: "y3", nodeId: 7, game: "bog-sweeper-casting", hpLeft: hp.value }`.
- Risk statements and spell feedback remain frontend game data; the backend stores only shared progress completion.

### 6.15 Year 3 Level 8: Astral Coronation

Core file: `frontend/src/views/games/year3_8.vue`

Initial HTML prompt: [v1_year3_8.md](v1_year3_8.md)

Source workflow:

- The certificate/finale presentation was manually designed as the final HTML display node.
- AI/Gemini assistance was minor and focused on Vue wrapping, styling compatibility, and final completion emission.
- Conversion plan change: the early endgame/reward-system prompt was reduced to the final certificate and completion screen. Extra reward-system mechanics were not added because the main project already has shop/inventory and global progress.

Primary prompt:

```text
Convert the existing Y3-8 Astral Coronation finale prototype into a Vue component.

Preserve the ceremonial certificate layout, final title, seal, blessing, and reward list. This node is a finale display and should not be redesigned into another quiz or battle.

Vue integration tasks:
- render the certificate using the student's traveler/profile name when available,
- preserve the final reward list and guide reminders,
- keep the component chrome-free/full-screen friendly when opened from the map,
- emit the final completion event when the user clicks complete,
- keep responsive styles for desktop and mobile.
```

Final Vue integration notes:

- Uses `canvas-confetti`, `useGameStore()` for traveler/profile name, `KnowledgeGuidePanel`, and localized reward labels.
- Starts a confetti burst on mount and cancels the animation frame on unmount.
- Actual completion payload is compact: `{ game: "astral-coronation" }`.
- The early endgame reward-system scope is represented as a finale certificate and reminder screen; global rewards remain handled by shared progress/shop systems.

---

