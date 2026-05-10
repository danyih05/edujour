# Frontend App, State, Map, And Integration Contracts

Frontend-focused prompts for Vue state, routing, map behavior, storage/backend merging, role routing, teacher UI, i18n, shop UI, sandbox UI, media, and API integration.

---

### E01. Frontend State, API, And Route Guard Design

Component goal:

Create a reliable frontend state model that coordinates auth, progress, shop, inventory, language, and routing.

Context passed to AI:

- Auth state is stored in session storage.
- Game UI selections and local game results are stored in local storage.
- Backend response envelopes must be unwrapped consistently.
- Student and teacher routes should redirect correctly.

Primary prompt:

```text
Implement the Vue frontend foundation.

Create:
- Axios API utility with bearer token support.
- Backend service wrapper functions for auth, progress, shop, inventory, teacher dashboard, student detail, and sandbox messages.
- Auth store with hydrate, login, register, logout, applySession, persistSession, and clearSession.
- Game store with hydrate, ensureLoaded, loadStudentData, applyProgress, saveGameResult, completeNode, skipLevel, resetStore, purchasePrize, refreshCommerce, switchYear, and clearState.
- Language store and i18n helper.
- Router guards that hydrate auth first, redirect unauthenticated users, enforce role-specific route access, and load student data before student routes.

The game store should merge backend progress with locally stored game result payloads. Backend progress remains authoritative for coins and unlocking, while local results preserve replay summaries.
```

Expected output:

- `utils/api.js`
- `services/backend.js`
- Pinia auth/game/language stores.
- Router guard behavior.

Acceptance criteria:

- Refreshing the page keeps a valid login session.
- Invalid sessions are cleared.
- Teacher users land on teacher dashboard.
- Student users land on the map and data loads before play.

### E02. Student Map And Level Launcher

Component goal:

Build the main student experience around a two-year interactive map.

Context passed to AI:

- The map is the student's primary screen.
- Each level is a separate Vue component loaded dynamically.
- Mobile usability matters.
- Completed nodes can be reopened for review.

Primary prompt:

```text
Build the student map view and level launcher.

Map requirements:
- Show Year 2 and Year 3 as switchable map boards.
- Render Year 2 as a fantasy path with 7 SVG nodes.
- Render Year 3 as a star-shaped sprint path with 8 SVG nodes.
- Show node states for locked, unlocked, completed, skipped, and final.
- Display global progress across all 15 nodes.
- Display coins, avatar/session chip, shop, reflection nook, reset, help, and logout.
- Provide a mobile drawer containing the same important actions.

Traveler requirements:
- Derive the traveler image and held tool from the game store profile.
- Move the traveler to the active/current node.
- Show a small tool-skill bubble when the tool is tapped.

Level launcher requirements:
- Block locked nodes with a localized message.
- Lazy-load the matching game component from `src/views/games`.
- Show pre-play onboarding before the game starts.
- Show saved completion result if the level was already completed locally.
- On game completion, save local result, call backend completion, refresh progress, and return to map.
- Support retry by clearing the local result.
- Support skip/unlock where appropriate.
```

Expected output:

- `MapView.vue`
- `GameContainer.vue`
- Level config integration.
- Responsive map and modal behavior.

Acceptance criteria:

- Nodes open the correct mini-game.
- Locked nodes are not playable.
- Completed nodes show prior result.
- Mobile controls remain reachable.

### E03. Teacher Dashboard Detail Prompt

Component goal:

Create teacher monitoring that is useful for scanning class progress.

Context passed to AI:

- Teachers should not edit student data.
- The dashboard should be dense enough for repeated use.
- Student rows need search and quick progress comparison.

Primary prompt:

```text
Implement the teacher dashboard frontend and backend integration.

Backend should return:
- summary totals,
- student rows with id, email, display name, avatar/traveler profile, coins, completed count, skipped count, unlocked count, locked count, completion rate, created/updated fields, last login, and latest progress,
- detailed student progress grouped by year,
- inventory items.

Frontend should:
- load summary and student rows on mount,
- allow searching by display name or email,
- select a student and load detail,
- render Year 2 and Year 3 progress tags,
- render inventory cards,
- format percentages and last activity values,
- highlight fully complete students,
- provide refresh and logout.

Protect teacher routes in both frontend router guards and backend security config.
```

Expected output:

- Teacher backend service/controller.
- Teacher Vue page.
- API client methods.

Acceptance criteria:

- Teacher sees all student accounts.
- Selecting a student shows detailed progress.
- Student users cannot access the dashboard.

### E04. Bilingual UX, Accessibility, And Mobile Refinement Prompt

Component goal:

Make the project usable and readable across languages and screen sizes.

Context passed to AI:

- The project has many user-facing strings.
- Controls appear in maps, modals, dashboards, and mini-games.
- Some game mechanics use drag/drop and require touch alternatives.

Primary prompt:

```text
Perform a frontend UX refinement pass.

Internationalization:
- move visible labels into English/Chinese locale files,
- provide interpolation for counts, names, scores, progress, and coin values,
- keep fallback behavior if a key is missing,
- expose a global language toggle.

Mobile:
- add responsive layouts for login, map, teacher dashboard, modals, shop, sandbox, and game levels,
- ensure primary buttons remain reachable,
- make modal content scrollable,
- use viewport-safe sizing,
- add tap/click alternatives for drag-and-drop games,
- avoid horizontal overflow.

Usability:
- add help guide and pre-play onboarding,
- show clear error/status messages,
- provide replay result screens,
- keep shop and reflection nook available from the map,
- avoid blocking the core path with optional media features.
```

Expected output:

- i18n files and helper.
- Language toggle.
- Responsive CSS updates.
- Touch fallback logic in drag/drop components.
- Help and onboarding components.

Acceptance criteria:

- App remains usable on desktop and mobile.
- Core workflows are available in both languages.
- Drag/drop games are playable on touch devices.

### E05. Map Completion Contract And Game Result Flow

Component goal:

Define the contract between each converted Vue game node, the map modal, the Pinia game store, and the Spring Boot progress API.

Context passed to AI:

- Game nodes originated from standalone HTML prototypes and therefore did not naturally know about backend progress.
- The map needs a consistent way to receive completion from all 15 nodes.
- Some nodes produce rich review data, while the backend only needs authoritative level status and coin/profile updates.
- Completed levels should be replayable or reviewable without accidentally granting repeated rewards.

Primary prompt:

```text
Create a completion contract for all converted game-node Vue components.

Every game component should emit `complete` with a payload. The map/game container should normalize that payload into a local game result and then call the backend progress API.

Required behavior:
- Build a stable game id from year and level id, such as `year2_1` or `year3_6`.
- Store rich result data locally for replay/review:
  - completed,
  - passed,
  - completedAt,
  - resultType,
  - resultData,
  - language.
- Send only backend-relevant data to `/api/progress/complete`:
  - year,
  - levelId,
  - rewardCoins,
  - profile when a node updates traveler profile.
- Prevent duplicate backend coin grants by relying on backend level status.
- Allow retry to clear local result display without resetting backend progress.
- After completion, refresh progress and return to the map.
- If a backend save fails, preserve enough local state to avoid losing the user's immediate result, but log the failure.
```

Expected output:

- Normalization helpers in the game store/container.
- Consistent handling of `complete` events in `MapView.vue` and `GameContainer.vue`.
- Backend progress calls from `useGameStore`.

Acceptance criteria:

- Any node can finish using the same completion contract.
- Rich local result review works.
- Coins are not repeatedly awarded.
- Profile updates from Identity Forge reach the backend.

### E06. Local Storage, Session Storage, And Backend State Merge

Component goal:

Explain and implement how frontend local/session state coexists with backend persistence.

Context passed to AI:

- Auth session should persist only for the browser session.
- UI preferences and replay results can live in local storage.
- Backend progress is authoritative for unlocking, coins, shop items, and inventory.
- Local game results contain richer per-game review data than the backend schema.

Primary prompt:

```text
Implement a careful frontend state-hydration strategy.

Auth store:
- keep token and user in sessionStorage,
- hydrate by reading sessionStorage and validating through `/api/auth/me`,
- clear invalid sessions,
- remove old localStorage auth data if present,
- expose `isAuthenticated`, `isStudent`, and `isTeacher` getters.

Game store:
- keep selected year in localStorage,
- keep rich game result summaries in localStorage,
- load backend progress, shop items, and inventory when a student route is entered,
- merge backend level status with local completed-result data,
- derive current node from completed/skipped/unlocked levels,
- keep backend coins as authoritative,
- keep local replay data as non-authoritative UI detail.

Merging rules:
- if backend says a level is completed or skipped, show that status on the map,
- if local result says a game is completed, allow the result review screen,
- if local result exists but backend progress is missing after reset, clear or ignore stale local result as part of reset,
- if traveler profile exists in both auth session and progress payload, merge without dropping avatar preset or map avatar data.
```

Expected output:

- `stores/auth.js`
- `stores/game.js`
- robust hydrate/clear/reset behavior.

Acceptance criteria:

- Refreshing the page keeps valid session and map state.
- Logging out clears session and game state.
- Reset clears local results and backend progress together.
- Local replay results do not corrupt backend status.

### E07. Role-Based Routing And Access Contract

Component goal:

Keep frontend navigation and backend authorization aligned.

Context passed to AI:

- The app has student-only and teacher-only surfaces.
- A teacher should not see the student map.
- A student should not see the teacher dashboard.
- Backend security must enforce the same boundary even if frontend routing is bypassed.

Primary prompt:

```text
Implement role-aware routing and API protection.

Frontend:
- `/login` is public.
- `/` is the student map and requires student authentication.
- `/game/:id` requires student authentication.
- `/teacher` requires teacher authentication.
- On every route change, hydrate auth first.
- If a logged-in teacher visits login, redirect to teacher dashboard.
- If a logged-in student visits login, redirect to map.
- If a teacher tries to enter a student route, redirect to teacher dashboard.
- If a student tries to enter teacher route, redirect to map.
- For student routes, load game data before allowing interaction.

Backend:
- permit health check and auth login/register.
- allow `/api/auth/me` and `/api/auth/logout` for authenticated users.
- require `ROLE_STUDENT` for progress, shop, and inventory APIs.
- require `ROLE_TEACHER` for teacher APIs.
- return consistent JSON for unauthorized and forbidden requests.
```

Expected output:

- Vue Router guard.
- Spring Security route rules.
- consistent role payloads from auth APIs.

Acceptance criteria:

- Role mismatch redirects are deterministic.
- API role bypass attempts fail.
- Student and teacher sessions can use the same email value under different roles.

## 8. Frontend App Shell, Routing, Auth Store, And API Client

Core files:

- `frontend/src/main.js`
- `frontend/src/App.vue`
- `frontend/src/router/index.js`
- `frontend/src/utils/api.js`
- `frontend/src/services/backend.js`
- `frontend/src/stores/auth.js`
- `frontend/src/stores/game.js`
- `frontend/src/stores/language.js`
- `frontend/src/composables/useAppI18n.js`

Primary prompt:

```text
Build the Vue 3 frontend shell for the GradQuest/EduJourney SPA.

Requirements:
- Use Vite, Vue Router, Pinia, Axios, and composition API.
- Create route guards that:
  - redirect unauthenticated users to login,
  - route teachers to `/teacher`,
  - route students to the map,
  - prevent teachers from entering student routes and students from entering teacher routes.
- Create an auth store that stores JWT session data in sessionStorage, hydrates with `/api/auth/me`, supports login/register/logout, and clears invalid sessions.
- Create a game store that loads progress, shop items, and inventory from backend; merges remote progress with local game result records; supports completion, skip, reset, year switching, shop purchases, and traveler avatar/profile state.
- Create a backend service layer that unwraps the backend JSON envelope and centralizes API error messages.
- Mount global UI controls such as language toggle, welcome music control, and XJTLU bird helper in the app shell.
```

Implementation intent:

- Keep frontend state predictable and centralized.
- Keep API calls out of components where possible.
- Make route access match backend role access.

---

## 9. Login / Registration Experience

Core files:

- `frontend/src/views/LoginView.vue`
- `frontend/src/components/AvatarBadge.vue`
- `frontend/src/assets/avatars/*.jpg`
- `frontend/public/xjtlu-shield.png`
- `frontend/public/xjtlu-station-building.jpg`

Primary prompt:

```text
Design and implement a polished login/register page for an XJTLU-themed gamified application portal.

Requirements:
- Support login and registration in one view.
- Support student/teacher role selection.
- For registration, collect display name, email, password, role, and avatar choice.
- Show four avatar choices with reusable avatar badge rendering.
- Use a real XJTLU visual identity signal: shield image and station building hero background.
- On successful teacher login/register, route to the teacher dashboard.
- On successful student login/register, clear stale game state, load student data, and route to map or redirect target.
- Show role mismatch and backend error messages clearly.
- Make the form responsive and touch-friendly.
- Keep the first screen as the actual authentication workflow, not a marketing landing page.
```

Implementation intent:

- Make account creation simple for coursework demos.
- Save avatar choice into backend traveler profile.
- Immediately lead each role to the correct functional surface.

---

## 10. Student Map, Year Switching, Mobile Navigation, And Game Modal

Core files:

- `frontend/src/views/MapView.vue`
- `frontend/src/views/GameContainer.vue`
- `frontend/src/config/levels.js`
- `frontend/src/components/PrePlayOnboarding.vue`
- `frontend/src/components/GameCompletedView.vue`
- `frontend/src/components/HelpGuide.vue`
- `frontend/src/components/PrizeShop.vue`
- `frontend/src/components/HealingSandbox.vue`
- `frontend/src/components/TravelerStatusCard.vue`
- `frontend/src/components/LearningDashboardDrawer.vue`

Primary prompt:

```text
Create the main student game map and level launcher.

Requirements:
- Display two map modes: Year 2 exploration and Year 3 sprint.
- Year 2 has 7 nodes along a magical path; Year 3 has 8 nodes on a star-shaped path.
- Use progress data to render locked, unlocked, completed, skipped, and final states.
- Show total completion progress across all 15 nodes.
- Allow switching between years and persist selected year locally.
- Show student identity chip, coins, shop, reflection nook, help guide, reset progress, and logout.
- On mobile, provide a hamburger drawer with the same key actions.
- Animate or position the traveler avatar on the current node, using the chosen map avatar and tool from the stored traveler profile.
- On node click, block locked levels, open available levels in an in-page modal, lazy-load the matching game Vue component, and show pre-play onboarding instructions.
- After level completion, save local result, call backend complete API, award coins, unlock next level, and return to map.
- Allow replay review through a completed-result view.
- Support skip/unlock next where appropriate.
```

Implementation intent:

- Make the game map the student home screen.
- Keep each level modular through async components.
- Provide clear onboarding so mini-games are understandable without external instructions.

---

## 11. Level Definitions And Onboarding Guide Data

Core files:

- `frontend/src/config/levels.js`
- `frontend/src/i18n/locales/en.js`
- `frontend/src/i18n/locales/zh.js`

Primary prompt:

```text
Create a central level configuration file for all game nodes.

Requirements:
- Define Year 2 and Year 3 level metadata with id, map node, i18n key, Vue component filename, and onboarding guide.
- Include onboarding instructions for each level:
  - title,
  - summary,
  - ordered control steps,
  - action type labels such as click, select, drag, drop, submit, and scroll,
  - drag fallback notes for touch devices.
- Export `LEVEL_DEFINITIONS`, `createInitialLevels(year)`, and `getLevelDefinition(year, levelId)`.
- Keep all user-facing labels translatable through the i18n files.
- Make the config usable by both MapView and GameContainer.
```

Implementation intent:

- Keep level routing, map labels, and onboarding in one source of truth.
- Reduce duplicated per-level control instructions.

---

## 12. Internationalization And Language Toggle

Core files:

- `frontend/src/i18n/index.js`
- `frontend/src/i18n/locales/en.js`
- `frontend/src/i18n/locales/zh.js`
- `frontend/src/stores/language.js`
- `frontend/src/composables/useAppI18n.js`
- `frontend/src/components/LanguageToggle.vue`
- `frontend/src/components/LanguageToggle.test.js`

Primary prompt:

```text
Add bilingual English/Chinese interface support to the Vue application.

Requirements:
- Store the current language in Pinia and localStorage.
- Provide a `t(key, params)` helper for nested translation keys and interpolation.
- Provide a language toggle component available globally.
- Translate navigation, map labels, help text, game result fields, shop, healing sandbox, teacher dashboard, and all 15 level titles/guides.
- Ensure tests cover the language store and toggle behavior.
- Keep fallback behavior stable when translation keys are missing.
```

Implementation intent:

- Make the app usable in English and Chinese.
- Keep translation lookup simple and testable.

---

## 13. Reward Shop Frontend

Core files:

- `frontend/src/components/PrizeShop.vue`
- `frontend/src/stores/game.js`
- `frontend/src/services/backend.js`

Primary prompt:

```text
Build the reward exchange modal for the student map.

Requirements:
- Show current balance using coins for Year 2 and gems label for Year 3 UI context.
- Load backend shop items when available; otherwise show local fallback prize definitions.
- Translate known seeded prize slugs on the frontend.
- Disable items already owned or unaffordable.
- Emit redeem events to the game store, call backend purchase API, refresh shop/inventory, and show a localized success or failure message.
- Explain that the shop is milestone feedback rather than the main learning goal.
- Make the grid responsive for mobile.
```

Implementation intent:

- Connect backend rewards to visible student motivation.
- Keep the shop modal compact and simple.

---

## 14. Healing Sandbox Frontend

Core files:

- `frontend/src/components/HealingSandbox.vue`
- `frontend/src/services/backend.js`
- `backend/src/main/java/com/gradquest/web/SandboxMessageController.java`

Primary prompt:

```text
Create a low-pressure reflection nook modal.

Requirements:
- Display a sand tray and a shelf of symbolic items.
- Allow desktop drag-and-drop placement of items into the tray.
- Add pointer-based touch dragging for mobile devices.
- Show comforting localized messages when placed items are clicked.
- Let users click the tray to add a short emoji + text message.
- Persist shared messages through the sandbox message API and render them as positioned dots.
- Show message bubbles when shared dots are clicked.
- Clean up timers and pointer listeners on close/unmount.
- Keep the feature non-scored and framed as emotional recovery during a long application process.
```

Implementation intent:

- Provide a reflective support mechanic alongside application planning.
- Make desktop and mobile interactions both viable.

---

## 15. Teacher Dashboard Frontend

Core files:

- `frontend/src/views/TeacherDashboardView.vue`
- `frontend/src/services/backend.js`
- `frontend/src/stores/auth.js`
- `frontend/src/stores/game.js`

Primary prompt:

```text
Build a teacher dashboard page that consumes the teacher backend APIs.

Requirements:
- Show summary metrics: total students, active students, and total levels.
- Show searchable student list with avatar, email, coins, completion rate, completed count, and skipped count.
- Highlight students with 100% completion.
- Load selected student detail including Year 2 and Year 3 progress tags and inventory.
- Show last login and latest progress timestamps formatted by current language.
- Provide refresh and logout actions.
- Clear student game state on teacher logout.
- Make layout responsive, with student list prioritized on mobile.
```

Implementation intent:

- Give teachers a practical monitoring surface.
- Keep the dashboard read-only and data-dense.

---

## 16. Visual Assets, Audio, And Theming

Core files:

- `frontend/src/assets/main.css`
- `frontend/public/favicon.png`
- `frontend/public/xjtlu-shield.png`
- `frontend/public/xjtlu-station-building.jpg`
- `frontend/public/audio/*.mp3`
- `frontend/src/components/WelcomeMusicControl.vue`
- `frontend/src/composables/useWelcomeMusic.js`
- `frontend/src/components/XJTLUBird.vue`
- `frontend/XJTLU_BIRD_SETUP.md`

Primary prompt:

```text
Add project theming and media support.

Requirements:
- Use real visual assets for the XJTLU portal identity and login background.
- Provide avatar and map character assets for the student traveler.
- Add optional welcome/background music with a global control component.
- Initialize music safely from the app shell and allow route-specific track activation.
- Add a small XJTLU bird helper component that can be shown globally.
- Keep visual styling responsive and avoid blocking core workflows if audio cannot autoplay.
```

Implementation intent:

- Make the coursework feel like a complete application, not just forms.
- Keep media optional and non-breaking.

---

## 17. Frontend API Integration And Error Handling

Core files:

- `frontend/src/utils/api.js`
- `frontend/src/services/backend.js`
- `frontend/src/services/backend.test.js`
- `frontend/src/stores/auth.js`
- `frontend/src/stores/game.js`

Primary prompt:

```text
Create a frontend API integration layer for the Spring Boot backend.

Requirements:
- Configure Axios base URL for `/api` through Vite proxy/local target.
- Attach JWT bearer tokens from the auth store/session storage.
- Unwrap backend response envelopes so components receive `data` directly.
- Provide `getApiErrorMessage(error, fallback)` helper.
- Expose typed-by-convention functions for auth, progress, shop, inventory, teacher dashboard, student detail, and sandbox messages.
- Test API helpers and stores where practical.
- Keep components focused on UI behavior rather than raw HTTP handling.
```

Implementation intent:

- Keep backend contract changes isolated.
- Make error display consistent across views.

---

## 18. Frontend Build, Environment, Proxy, And Test Harness

Core files:

- `frontend/vite.config.js`
- `frontend/package.json`
- `frontend/playwright.config.js`
- `frontend/src/test/setup.js`
- `frontend/.env.example`
- `frontend/.env.development`
- `frontend/.env.production`
- `frontend/vercel.json`

Primary prompt:

```text
Complete the frontend build and development tooling for the Edujour/GradQuest Vue app.

Requirements:
- Use Vite with Vue plugin and `@` alias pointing to `src`.
- Configure the dev server on port 5173.
- Proxy `/api` calls to a backend target from `VITE_API_TARGET`, defaulting to `http://localhost:18080`.
- Load environment variables from both the frontend folder and repo root so local coursework setup is flexible.
- Expose `VITE_API_TARGET` and `VITE_DEEPSEEK_API_KEY` through Vite define values.
- Add npm scripts for dev, production build, preview, unit tests, coverage, Playwright e2e, and a combined check.
- Configure Vitest with jsdom, global test APIs, setup file, coverage include/exclude rules, and stable browser mocks.
- Mock `ResizeObserver`, `matchMedia`, and media play/pause in the test setup.
- Keep Vercel/static deployment config minimal and compatible with SPA routing.
```

Implementation intent:

- Make local frontend/backend integration work without hard-coded URLs.
- Keep unit tests stable despite browser-only APIs.
- Let graders run build/test/e2e from package scripts.

---

## 19. Reusable Level Shell, Knowledge Guide, And Result Dialog Components

Core files:

- `frontend/src/components/GameLevelScaffold.vue`
- `frontend/src/components/LevelGuideCard.vue`
- `frontend/src/components/KnowledgeGuidePanel.vue`
- `frontend/src/components/LevelResultDialog.vue`
- `frontend/src/composables/useLevelGuide.js`

Primary prompt:

```text
Create reusable frontend components for converted game nodes.

Requirements:
- Build a `GameLevelScaffold` wrapper with:
  - localized eyebrow/title/subtitle,
  - tone variants,
  - optional status card,
  - slot-based game body.
- Build a `LevelGuideCard` that renders bilingual learning intent, real-world task connection, mechanics, help text, and context tags.
- Build a compact `KnowledgeGuidePanel` for game nodes that need a collapsible top-right guide overlay.
- Build a `LevelResultDialog` for success/warning/error endings with primary and optional secondary actions.
- Add `useLevelGuide(year, levelId)` to retrieve the central level definition, guide metadata, and reward coins.
- Keep these components responsive so they can sit inside the map/game modal without horizontal overflow.
```

Implementation intent:

- Avoid each converted HTML-to-Vue node reinventing its own wrapper, guide UI, and completion dialog.
- Make educational guidance visible without turning every node into a static tutorial page.
- Keep node-specific game logic separate from shared shell and feedback UI.

---

## 20. AI Helper / DeepSeek Chat Frontend Boundary

Core files:

- `frontend/src/composables/useDeepSeekChat.js`
- `frontend/vite.config.js`
- `frontend/.env.example`

Primary prompt:

```text
Add an optional frontend AI helper composable for high-level study guidance.

Requirements:
- Use the DeepSeek chat completion endpoint only when an API key is configured.
- Load the API key from `VITE_DEEPSEEK_API_KEY` first, then allow a locally stored browser key as fallback.
- Keep the AI assistant limited to public game-map guidance and general application support.
- Do not send teacher-provided game content, exact questions, options, clauses, answer keys, drafts, screenshots, or copied node text to the model.
- Detect and block sensitive content such as API keys, JWTs, bearer tokens, email addresses, phone numbers, student IDs, passwords, and verification codes.
- Redact sensitive content from returned text if needed.
- Limit message length and conversation history size.
- Provide localized error messages for missing key, invalid key, rate limit, network failure, and generic request failure.
- Support history translation by asking the model for a JSON array and validating the parsed output before applying it.
```

Implementation intent:

- Offer lightweight guidance without exposing protected curriculum material or personal data.
- Keep AI chat as an optional enhancement, not a required backend dependency.
- Preserve the line between public navigation help and hidden game assessment content.

---

## 21. Frontend Data Config For School Matching And Recommendation Routes

Core files:

- `frontend/src/config/year2CountrySchools.js`
- `frontend/src/config/year3RecommendationQuestions.js`
- `frontend/src/views/games/year2_3.vue`
- `frontend/src/views/games/year3_5.vue`

Primary prompt:

```text
Move large node data sets out of Vue component bodies and into frontend config modules.

Year 2 school matching requirements:
- Define country/region aliases and normalize user/profile country choices.
- Persist the matched country key for cross-node continuity.
- Provide school cards by country, score band, and recommended tier.
- Support Reach / Match / Safety bucket generation.
- Localize school names where English display names are available.
- Use profile GPA/score data to derive a score band and recommend appropriate school cards.
- Include safe fallback behavior for niche regions that should redirect students to teacher consultation.

Year 3 recommendation route requirements:
- Define separate recommendation-letter practice routes such as in-person and email scenarios.
- Store route titles, subtitles, question ids, prompts, options, correct choices, and explanations in a config file.
- Keep the Vue node focused on rendering, selection state, feedback, scoring, and completion.
- Preserve bilingual data shape so the language helper can localize prompts and explanations.
```

Implementation intent:

- Keep large educational data sets maintainable and reusable.
- Prevent game Vue files from becoming unreviewable data dumps.
- Make node conversion from HTML prototypes easier to refine after the first Vue pass.

---

## 22. Frontend Unit And Integration Test Coverage

Core files:

- `frontend/src/services/backend.test.js`
- `frontend/src/stores/game.test.js`
- `frontend/src/stores/language.test.js`
- `frontend/src/components/LanguageToggle.test.js`
- `frontend/src/i18n/index.test.js`
- `frontend/src/config/levels.test.js`
- `frontend/src/test/setup.js`

Primary prompt:

```text
Add focused frontend tests for the shared systems that could break many screens.

Requirements:
- Test backend service helpers:
  - unwrap successful response envelopes,
  - return the current user from `/auth/me`,
  - build teacher detail endpoints,
  - prefer backend error messages before local fallback messages.
- Test the game store:
  - initial year/node unlock state,
  - local result save and next-node unlock,
  - UI year and game result hydration,
  - remote progress merge,
  - shared coin synchronization,
  - traveler avatar/profile preservation.
- Test the language store, i18n helper, and language toggle.
- Test level configuration helpers so map/game modal routing does not silently break.
- Use jsdom and browser API mocks for stable component tests.
```

Implementation intent:

- Cover shared state and integration contracts rather than every visual detail.
- Catch regressions in routing/config/store behavior before manual game testing.
- Keep the test suite practical for a coursework project.

---
