# EduJourney / GradQuest AI Coding Prompts Log

Repository scope: full-stack coursework project in `frontend/` and `backend/`  
Purpose: satisfy the Vibe Coding Logs requirement by documenting the primary prompts used or reconstructed for the core AI-assisted implementation work.

## Notes

- This log is organized by core component rather than by every small edit.
- Prompts are written as the main instructions that drove each implementation area.
- No secrets, real credentials, or private user data are included.
- The codebase uses both names: the public project name is EduJourney, while package/build identifiers use GradQuest.

---

## Prompt Record Format

Each prompt record in this log describes the AI-assisted coding work at component level.

- Component goal: what the generated code needed to achieve.
- Context passed to AI: project constraints, existing files, data shapes, or UI expectations.
- Primary prompt: the main instruction used to generate or refine the component.
- Expected output: files, functions, API routes, UI surfaces, or tests the prompt was meant to produce.
- Acceptance criteria: practical checks used to judge whether the generated component fit the project.

This format avoids logging small incidental edits and focuses on the prompts that produced core functionality.

---

## Expanded Core Prompt Records

The following records provide the detailed prompt set behind the project-level implementation. More specific component prompts are listed in later sections.

### E01. Full-Stack Product Definition

Component goal:

Create a usable full-stack learning game that helps students prepare for postgraduate applications while giving teachers a way to monitor progress.

Context passed to AI:

- The product is a coursework submission, so it must be easy to run locally.
- The frontend should be an actual application, not a landing page.
- The experience should combine planning education, game progression, rewards, and teacher oversight.
- The local repository should remain understandable for graders and future developers.

Primary prompt:

```text
Design and implement EduJourney / GradQuest as a full-stack gamified postgraduate application planning platform.

Build a student-facing journey that turns study-abroad planning into a sequence of game nodes. Students should register, log in, choose an avatar, complete application-planning mini-games, earn coins, unlock later nodes, redeem small rewards, and review previous results.

Build a teacher-facing dashboard that lets teachers log in separately and inspect student progress, completion rates, coin balances, inventories, and per-year level states.

The project must use:
- Vue 3, Vite, Vue Router, Pinia, Axios, Vitest, and Playwright on the frontend.
- Spring Boot, Java 17, Spring Security, JWT, validation, JDBC/JPA dependencies, H2, and optional MySQL on the backend.
- A clean `frontend/` and `backend/` split.
- Consistent JSON APIs under `/api`.
- Bilingual English/Chinese copy.
- README documentation that explains setup, run commands, build checks, stack, API endpoints, and demo notes.

Prioritize a working coursework demo:
- default local backend uses embedded H2,
- frontend proxies `/api` to the backend,
- registration should not require real email verification,
- teacher and student roles must be distinct,
- all key flows should be accessible after local startup.
```

Expected output:

- Full project scaffold.
- Running backend and frontend entry points.
- README and developer documentation.
- Feature-complete student and teacher flows.

Acceptance criteria:

- A new user can register as student and play the map.
- A teacher can register or log in and view the teacher dashboard.
- Backend compile and frontend build succeed.
- Local setup requires no external database by default.

### E02. Backend Domain And Persistence Design

Component goal:

Create persistent domain storage for users, progress, rewards, inventory, and reflection messages.

Context passed to AI:

- The database must work in H2 locally and MySQL optionally.
- Existing coursework/demo data should survive restarts during local testing.
- Schema creation must be idempotent.
- The same login identifier may be used in demo for both student and teacher roles.

Primary prompt:

```text
Implement the backend persistence layer for GradQuest.

Create database tables and repository classes for:
- users,
- level_progress,
- shop_items,
- user_items,
- sandbox messages.

User records need:
- id,
- email,
- username,
- display name,
- password hash,
- role,
- coins,
- traveler profile JSON,
- last login,
- created/updated fields.

Progress records need:
- user id,
- year,
- level id,
- level name,
- status,
- reward coins,
- created/updated fields.

Shop records need:
- slug,
- name,
- description,
- cost,
- icon,
- category,
- active flag.

Inventory records need:
- user id,
- item id,
- quantity,
- acquisition fields.

Sandbox messages need:
- user id,
- content,
- x/y placement,
- emoji,
- created field.

Use repositories that return typed domain models instead of raw maps where possible. Use payload builders only at service/API boundaries. Add migration-like checks for columns and indexes so the schema remains compatible after iterative development.
```

Expected output:

- Database initializer.
- SQL schema helpers.
- Repository classes for each aggregate.
- Seeded shop items.
- Models/records for domain rows.

Acceptance criteria:

- App starts with an empty H2 database.
- Duplicate account prevention works by role, not by email alone.
- Progress rows are created for student accounts.
- Shop items appear without manual seeding.

### E03. Backend Authentication And Authorization

Component goal:

Protect the app with JWT authentication and role-based API access.

Context passed to AI:

- Frontend stores a token and sends it with each request.
- Backend must remain stateless.
- Students and teachers share auth endpoints but have different protected resources.

Primary prompt:

```text
Implement stateless authentication and role authorization.

Create login/register DTOs, controllers, services, password hashing, JWT issuing/parsing, and a security filter.

The auth service should:
- normalize email input,
- validate role values,
- hash passwords using BCrypt,
- create default student progress rows on student registration,
- issue JWTs with user id, email, role, and display name,
- update last login,
- return a session payload containing token and user.

The security config should:
- disable CSRF for stateless API usage,
- enable CORS for configured frontend origins,
- permit `/api/health`,
- permit auth login/register,
- require teacher role for `/api/teacher/**`,
- require student role for `/api/progress/**`, `/api/shop/**`, and `/api/inventory/**`,
- require authentication for `/api/auth/me` and `/api/auth/logout`,
- return JSON 401 and 403 errors.

Add an `AuthenticatedUser` principal class so services can receive the current user id and role cleanly.
```

Expected output:

- `SecurityConfig`
- `JwtService`
- `JwtAuthenticationFilter`
- `AuthService`
- `AuthController`
- auth DTOs and role model.

Acceptance criteria:

- Invalid tokens are rejected.
- Teachers cannot access student progress APIs.
- Students cannot access teacher dashboard APIs.
- Login returns a token the frontend can use immediately.

### E04. Progress, Unlocking, Coins, And Profile Sync

Component goal:

Create the main progression engine that ties mini-game completion to map state, rewards, and traveler profile updates.

Context passed to AI:

- The frontend has 15 native Vue mini-games.
- The backend should store authoritative level status and coin balance.
- The frontend may also store richer local result details for replay review.
- Y2-1 writes profile/avatar information that later UI uses.

Primary prompt:

```text
Implement the student progress system for a two-year map.

Define a level catalog with:
- Year 2: Identity Forge, Region Choice, Tier Mapping, Senior Case Archives, Action Plan, Contract Guardian, Final Trial.
- Year 3: Timeline Crucible, Material Types, CV Surgery, PS Weaving, Recommendation, Exam Combat, Risk Scan, Coronation.

Implement APIs:
- GET `/api/progress`
- POST `/api/progress/complete`
- POST `/api/progress/skip`
- POST `/api/progress/reset`

Completion behavior:
- reject completion if the requested level is locked,
- award reward coins only once,
- use a custom positive reward from the mini-game when supplied,
- mark the level completed,
- unlock the next level in the same year,
- merge incoming profile data into the existing traveler profile without wiping avatar data.

Skip behavior:
- reject locked levels,
- reject skipping already completed levels,
- mark unlocked/in-progress levels as skipped,
- unlock the next level,
- do not award coins.

Reset behavior:
- delete existing progress and inventory,
- recreate default level rows,
- reset coins and traveler state,
- return the same progress payload shape as normal progress loading.

Return data grouped by year with per-year summaries so the Vue map can render locked, unlocked, skipped, and completed states.
```

Expected output:

- Level catalog.
- Progress service/controller/repository behavior.
- Payload builder for progress grouping.
- DTOs for complete/skip requests.

Acceptance criteria:

- Completing Y2-1 unlocks Y2-2.
- Skipping an unlocked level unlocks the next node without adding coins.
- Reset returns the map to initial state.
- Traveler profile data survives repeated progress updates.

### E05. Reward Shop And Inventory Flow

Component goal:

Connect level rewards to a shop and persistent inventory.

Context passed to AI:

- Coins are a learning reinforcement mechanic, not the main objective.
- The frontend needs ownership and affordability states.
- Inventory should be visible to teachers in student detail.

Primary prompt:

```text
Build a student-only commerce flow for reward exchange.

Backend:
- Seed shop items with slug, display name, description, cost, icon, category, and active flag.
- Provide `GET /api/shop/items` with ownership and quantity information for the current student.
- Provide `POST /api/shop/purchase` that validates item existence, active status, ownership, and balance.
- Deduct coins and create inventory atomically.
- Provide `GET /api/inventory` with current user and owned items.

Frontend:
- Add a reward exchange modal from the map.
- Show current balance.
- Translate known shop item slugs.
- Disable owned and unaffordable rewards.
- On purchase, show success/failure feedback, refresh shop and inventory, and update balance.
```

Expected output:

- Shop and inventory services/controllers.
- Frontend `PrizeShop` component.
- Game store purchase action.

Acceptance criteria:

- Student cannot buy the same item twice.
- Student cannot buy without enough coins.
- Inventory updates after purchase.
- Teacher detail can display a student's inventory.

### E06. Frontend State, API, And Route Guard Design

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

### E07. Student Map And Level Launcher

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

### E08. Detailed Mini-Game Generation Template

Component goal:

Use a consistent prompt pattern for all 15 game levels while allowing unique mechanics.

Context passed to AI:

- Every mini-game should emit `complete`.
- Some games emit profile data or reward coins.
- All games should be bilingual through i18n.
- Onboarding instructions are defined centrally.

Primary prompt template:

```text
Create a native Vue 3 mini-game component for one GradQuest map node.

Use `<script setup>` and scoped styles. Do not build an iframe game. The component must emit:
- `complete` when the student finishes,
- `close` only if the level needs its own close control.

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

The educational content should map directly to postgraduate application planning. Do not make a purely decorative game; each mechanic should teach or reinforce an application decision.
```

Expected output:

- One Vue component per level.
- Completion payload compatible with map/game store.
- Responsive styles.
- i18n keys and guide content.

Acceptance criteria:

- Component can be opened from the map.
- Completion unlocks the next node.
- Prior result can be shown by `GameCompletedView`.
- The mechanic teaches a clear planning concept.

### E09. Year 2 Learning Path Detail Prompt

Component goal:

Generate the complete Year 2 planning path focused on identity, destination choice, school tiers, cases, action planning, contract risk, and final review.

Context passed to AI:

- Year 2 is the exploration phase.
- It should help students understand themselves, destinations, school lists, agency/contract risks, and action priorities before the intense application phase.

Primary prompt:

```text
Implement the seven Year 2 mini-games as a coherent exploration path.

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

### E10. Year 3 Learning Path Detail Prompt

Component goal:

Generate the complete Year 3 application sprint path focused on materials, CV, PS, recommendation, exam/timeline pressure, risk scanning, and final wrap-up.

Context passed to AI:

- Year 3 is the execution phase.
- Games should feel more urgent and material-focused than Year 2.
- The finale should reinforce ownership of the application process.

Primary prompt:

```text
Implement the eight Year 3 mini-games as an application sprint.

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

### E11. Teacher Dashboard Detail Prompt

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

### E12. Bilingual UX, Accessibility, And Mobile Refinement Prompt

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

### E13. Verification And Submission Prompt

Component goal:

Prepare the repository for evaluation and make the AI-assisted work auditable.

Context passed to AI:

- The repo must be understandable without verbal explanation.
- Build commands should be documented.
- Vibe Coding Logs requirement asks for `/ailogs`.

Primary prompt:

```text
Prepare final coursework submission materials.

Documentation:
- write `README.md` for project overview, features, stack, run steps, API endpoints, verification, screenshots, and demo notes,
- write `READMEDev.md` for development setup, structure, entry points, environment variables, profiles, scripts, debugging, and workflow,
- include screenshots for login, student dashboard, and teacher dashboard,
- include environment examples for backend and frontend.

Verification:
- document backend compile command,
- document frontend build command,
- document unit/e2e commands where present,
- ensure H2 local mode works without MySQL.

AI logs:
- create `/ailogs`,
- add a prompts log that records the primary AI prompts used to generate core components,
- cover architecture, backend, frontend, all mini-games, tests, and docs,
- avoid secrets and private data.
```

Expected output:

- README files.
- Environment examples.
- `/ailogs/prompts-log.md`.
- Clear verification instructions.

Acceptance criteria:

- A grader can run the app using README instructions.
- The prompts log covers all core components.
- No credentials or private user data are exposed.

---

## 1. Project Architecture And Initial Scaffold

Core files:

- `README.md`
- `READMEDev.md`
- `frontend/package.json`
- `frontend/vite.config.js`
- `backend/pom.xml`
- `backend/src/main/java/com/gradquest/GradQuestApplication.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml`

Primary prompt:

```text
Build a full-stack gamified postgraduate application planning platform for students and teachers.

Use Vue 3 with Vite, Vue Router, Pinia, Axios, Vitest, and Playwright for the frontend.
Use Spring Boot 3, Java 17, Spring Security, Spring JDBC/JPA dependencies, JWT authentication, H2 for local development, and optional MySQL for deployment/runtime testing.

The application should support:
- student and teacher registration/login,
- a student game map with Year 2 and Year 3 application-planning paths,
- 15 sequential game levels,
- progress persistence,
- coins and reward shop,
- inventory,
- anonymous reflection/sandbox messages,
- teacher monitoring dashboard,
- bilingual English/Chinese interface,
- local development proxy from Vite to the backend,
- build and verification scripts documented in README files.

Create a clean repository structure with separate `frontend` and `backend` folders, clear entry points, environment examples, and concise developer documentation.
```

Implementation intent:

- Establish a conventional full-stack layout.
- Keep backend and frontend independently runnable.
- Make local testing easy with H2 and optional MySQL support.
- Document ports, dependencies, and verification commands.

---

## 2. Backend Foundation, Configuration, And API Shape

Core files:

- `backend/pom.xml`
- `backend/src/main/java/com/gradquest/config/AppProperties.java`
- `backend/src/main/java/com/gradquest/web/ApiResponses.java`
- `backend/src/main/java/com/gradquest/exception/ApiException.java`
- `backend/src/main/java/com/gradquest/exception/GlobalExceptionHandler.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml`

Primary prompt:

```text
Create the Spring Boot backend foundation for GradQuest.

Requirements:
- Java 17 and Spring Boot 3.5.
- Expose REST APIs under `/api`.
- Use a consistent JSON envelope:
  `{ "success": true, "data": ... }` for normal responses and
  `{ "success": false, "error": { "message": ... } }` for failures.
- Centralize application properties for port, client origins, JWT secret/expiry, and gameplay initial coin settings.
- Add global exception handling for validation errors, domain API exceptions, unauthorized access, and unexpected failures.
- Keep the backend stateless and frontend-friendly.
```

Implementation intent:

- Provide a stable response contract for the Vue API client.
- Avoid leaking Java stack traces to the browser.
- Make security, CORS, and gameplay settings environment-driven.

---

## 3. Authentication, Roles, JWT, And Security

Core files:

- `backend/src/main/java/com/gradquest/config/SecurityConfig.java`
- `backend/src/main/java/com/gradquest/security/JwtService.java`
- `backend/src/main/java/com/gradquest/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/com/gradquest/security/AuthenticatedUser.java`
- `backend/src/main/java/com/gradquest/model/UserRole.java`
- `backend/src/main/java/com/gradquest/dto/LoginRequest.java`
- `backend/src/main/java/com/gradquest/dto/RegisterRequest.java`
- `backend/src/main/java/com/gradquest/web/AuthController.java`
- `backend/src/main/java/com/gradquest/service/AuthService.java`

Primary prompt:

```text
Implement role-based authentication for a student/teacher web app.

Backend requirements:
- Support `student` and `teacher` roles.
- Provide `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`.
- Hash passwords with BCrypt.
- Issue HS256 JWTs that include user id, email, display name, and role.
- Add a Spring Security filter that reads `Authorization: Bearer <token>`, validates it, and attaches an authenticated principal.
- Permit health check and auth login/register publicly.
- Restrict `/api/teacher/**` to teachers.
- Restrict `/api/progress/**`, `/api/shop/**`, and `/api/inventory/**` to students.
- Allow `/api/auth/me` and `/api/auth/logout` for authenticated users.
- Return clean JSON errors for 401 and 403.
- Configure CORS using the configured frontend origin list.

Registration requirements:
- Store email in normalized lowercase form.
- Allow the same email to exist separately for student and teacher roles.
- For students, create default progress rows and initial coins.
- For teachers, create an account without student progress.
```

Implementation intent:

- Separate student and teacher experiences at both API and route levels.
- Use stateless JWT auth so the frontend can persist session data locally.
- Preserve demo flexibility for coursework evaluation.

---

## 4. Database Initialization, Schema Migration, And Seed Data

Core files:

- `backend/src/main/java/com/gradquest/data/DatabaseInitializer.java`
- `backend/sql/mysql_schema.sql`
- `backend/sql/setup_gradquest_user.sql`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml`
- `backend/scripts/run-backend-with-mysql.ps1`
- `backend/scripts/stop-backend.ps1`
- `backend/scripts/export-db-dump.ps1`

Primary prompt:

```text
Create database initialization logic for a coursework-friendly Spring Boot project.

Requirements:
- Default local runtime uses embedded H2 and creates required tables automatically.
- Optional MySQL runtime should use equivalent schema.
- Create tables for users, level progress, shop items, user inventory, and sandbox messages.
- Make initialization idempotent so the app can restart without losing schema compatibility.
- Add migration helpers for columns added over time, including role, traveler profile JSON, last login timestamp, and reward coins.
- Relax the original single-column email uniqueness so the same email can be used for both student and teacher demo accounts.
- Enforce uniqueness on `(email, role)`.
- Seed default reward shop items with cost, icon, description, category, and active status.
- Add helper scripts for MySQL launch, backend stop, and database export.
```

Implementation intent:

- Keep the project self-contained for local graders.
- Avoid manual SQL setup for basic H2 testing.
- Still provide MySQL support for persistent deployment scenarios.

---

## 5. Level Catalog And Progress System

Core files:

- `backend/src/main/java/com/gradquest/data/LevelCatalog.java`
- `backend/src/main/java/com/gradquest/model/LevelDefinition.java`
- `backend/src/main/java/com/gradquest/model/LevelProgressRow.java`
- `backend/src/main/java/com/gradquest/dto/CompleteLevelRequest.java`
- `backend/src/main/java/com/gradquest/dto/SkipLevelRequest.java`
- `backend/src/main/java/com/gradquest/repository/ProgressRepository.java`
- `backend/src/main/java/com/gradquest/service/ProgressService.java`
- `backend/src/main/java/com/gradquest/service/PayloadBuilder.java`
- `backend/src/main/java/com/gradquest/web/ProgressController.java`

Primary prompt:

```text
Implement a persistent progress system for a two-year gamified study-abroad planning map.

Requirements:
- Define Year 2 with 7 levels:
  1. Identity Forge
  2. Region Choice
  3. Tier Mapping
  4. Senior Case Archives
  5. Action Plan
  6. Contract Guardian
  7. Final Trial
- Define Year 3 with 8 levels:
  1. Timeline Crucible
  2. Material Types
  3. CV Surgery
  4. PS Weaving
  5. Recommendation
  6. Exam Combat
  7. Risk Scan
  8. Coronation
- Store each level row with year, level id, name, status, reward coins, and timestamps.
- First level should be unlocked by default; later levels are locked until previous completion or skip.
- Implement:
  GET `/api/progress`
  POST `/api/progress/complete`
  POST `/api/progress/skip`
  POST `/api/progress/reset`
- Completing a level should award coins only once and unlock the next level in the same year.
- Skipping should not award coins but should unlock the next level.
- Reset should rebuild progress, inventory, coins, and student state.
- Allow the first identity level to persist a traveler profile/avatar payload into the user profile.
- Return progress grouped by year with level summaries for frontend rendering.
```

Implementation intent:

- Make the map progression server-authoritative.
- Preserve local replay results in frontend while syncing authoritative completion to backend.
- Support teacher reporting using the same progress data.

---

## 6. Shop, Coins, And Inventory

Core files:

- `backend/src/main/java/com/gradquest/model/ShopItem.java`
- `backend/src/main/java/com/gradquest/model/InventoryItem.java`
- `backend/src/main/java/com/gradquest/dto/PurchaseRequest.java`
- `backend/src/main/java/com/gradquest/repository/ShopRepository.java`
- `backend/src/main/java/com/gradquest/repository/InventoryRepository.java`
- `backend/src/main/java/com/gradquest/service/ShopService.java`
- `backend/src/main/java/com/gradquest/service/InventoryService.java`
- `backend/src/main/java/com/gradquest/web/ShopController.java`
- `backend/src/main/java/com/gradquest/web/InventoryController.java`

Primary prompt:

```text
Implement a simple student reward economy.

Requirements:
- Students earn coins by completing levels.
- Shop items are seeded in the database and returned with localized display support on the frontend.
- Provide:
  GET `/api/shop/items`
  POST `/api/shop/purchase`
  GET `/api/inventory`
- Only students can access shop and inventory APIs.
- Reject purchase if item is inactive, missing, already owned, or user lacks coins.
- Deduct coins transactionally and create inventory rows.
- Return remaining balance and purchased item after purchase.
- Include ownership flags when listing shop items so the frontend can disable owned rewards.
```

Implementation intent:

- Turn learning progress into lightweight reinforcement.
- Avoid duplicate purchases and inconsistent balances.
- Keep item definitions flexible enough for both backend seed data and frontend translation.

---

## 7. Teacher Dashboard Backend

Core files:

- `backend/src/main/java/com/gradquest/service/TeacherService.java`
- `backend/src/main/java/com/gradquest/web/TeacherController.java`
- `backend/src/main/java/com/gradquest/repository/UserRepository.java`
- `backend/src/main/java/com/gradquest/repository/ProgressRepository.java`
- `backend/src/main/java/com/gradquest/repository/InventoryRepository.java`

Primary prompt:

```text
Create teacher-only APIs for monitoring student progress.

Requirements:
- Provide `GET /api/teacher/students` for dashboard summary and student rows.
- Provide `GET /api/teacher/students/{studentId}` for detailed student progress and inventory.
- Return total students, total levels, number of students with progress, completed/skipped/unlocked/locked counts, completion rate, coins, traveler profile, last login, and latest progress timestamps.
- Include Year 2 and Year 3 detailed progress in the student detail response.
- Ensure non-student accounts cannot be returned as student detail.
- Rely on Spring Security role rules so only teachers can access these endpoints.
```

Implementation intent:

- Give teachers a read-only operational view.
- Reuse backend payload builders to keep frontend data shapes consistent.

---

## 8. Anonymous Reflection / Sandbox Message Backend

Core files:

- `backend/src/main/java/com/gradquest/model/SandboxMessage.java`
- `backend/src/main/java/com/gradquest/dto/CreateMessageRequest.java`
- `backend/src/main/java/com/gradquest/dto/SandboxMessageDTO.java`
- `backend/src/main/java/com/gradquest/repository/SandboxMessageRepository.java`
- `backend/src/main/java/com/gradquest/service/SandboxMessageService.java`
- `backend/src/main/java/com/gradquest/web/SandboxMessageController.java`

Primary prompt:

```text
Add an anonymous reflection message board for the healing sandbox feature.

Requirements:
- Provide `GET /api/sandbox/messages?page=&size=` to list recent messages.
- Provide `POST /api/sandbox/messages` for authenticated students or teachers.
- Store user id, content, x/y coordinates, emoji, and created timestamp.
- Validate message length and coordinates through DTO constraints.
- Strip HTML from submitted content.
- Default missing emoji to a speech-bubble emoji.
- Apply a daily limit of 20 messages per user.
- Limit page size to a safe maximum.
- Return DTOs that can be rendered as positioned dots in the frontend sandbox.
```

Implementation intent:

- Support low-pressure peer reflection without exposing account identities in the UI.
- Prevent obvious spam and unsafe HTML injection.

---

## 9. Frontend App Shell, Routing, Auth Store, And API Client

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

## 10. Login / Registration Experience

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

## 11. Student Map, Year Switching, Mobile Navigation, And Game Modal

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

## 12. Level Definitions And Onboarding Guide Data

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

## 13. Internationalization And Language Toggle

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

## 14. Reward Shop Frontend

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

## 15. Healing Sandbox Frontend

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

## 16. Teacher Dashboard Frontend

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

## 17. Game Level Prompts

The following prompts generated or guided the 15 native Vue game components in `frontend/src/views/games/`.

### 17.1 Year 2 Level 1: Identity Forge

Core file: `frontend/src/views/games/year2_1.vue`

Primary prompt:

```text
Create Y2-1 "Identity Forge" as the first native Vue mini-game.

Requirements:
- Let the student build a traveler identity and application baseline.
- Collect codename/display identity, GPA band, map character, familiar tool, internship, research, competition, project, language exam status/score, and GRE status/score.
- Show a live student identity card preview.
- Use selected map character and tool to update the traveler profile used on the main map.
- Validate required fields before completion and show missing fields.
- Emit a completion payload with reward coins, language, and profile data.
- Provide bilingual copy and guide text through i18n.
- Make the layout responsive and visually consistent with the fantasy application-planning theme.
```

### 17.2 Year 2 Level 2: Region Choice

Core file: `frontend/src/views/games/year2_2.vue`

Primary prompt:

```text
Create Y2-2 "Region Choice" as a destination recommendation mini-game.

Requirements:
- Present destination regions such as UK, Europe, US, Singapore, Australia, Hong Kong, Sino-foreign cooperative programmes, and niche Japan/Korea options.
- Ask weighted preference questions about study pace, cost, language environment, career goals, visa tolerance, and recognition.
- Calculate scores and show a recommended region with route keywords and explanation.
- Allow the student to manually override the recommended region before claiming the result.
- Save the selected region and scores in the completion result.
- Award coins and unlock the next level.
- Include a guide explaining that there is no universal best destination.
```

### 17.3 Year 2 Level 3: Tier Mapping

Core file: `frontend/src/views/games/year2_3.vue`

Primary prompt:

```text
Create Y2-3 "Tier Mapping" for school list strategy.

Requirements:
- Use the student's previous region preference and profile summary when available.
- Provide school cards by country/region, with fallback guidance when region data is incomplete.
- Let the student place schools into Reach, Match, and Safety tiers.
- Support drag-and-drop and a click-to-select fallback for touch devices.
- Evaluate whether the tier distribution is balanced.
- Show feedback for all-reach, all-safety, missing tiers, correct reach/match/safety placement, and fallback cases.
- Emit a summary result containing selected tiers, matched country, and feedback.
```

### 17.4 Year 2 Level 4: Senior Case Archives

Core file: `frontend/src/views/games/year2_4.vue`

Primary prompt:

```text
Create Y2-4 "Senior Case Archives" as a case-judgment game.

Requirements:
- Let the student choose an EE or ICS track.
- Provide a case database of past admission-style profiles and outcomes.
- Ask the student to judge each case.
- Track correct answers and mistake patterns.
- Show truth/explanation for each case after answering.
- Produce a personality/report style completion summary with accuracy and mistake analysis.
- Require the player to complete the archive before claiming reward coins.
```

### 17.5 Year 2 Level 5: Action Plan

Core file: `frontend/src/views/games/year2_5.vue`

Primary prompt:

```text
Create Y2-5 "Action Plan" as an action-point allocation game.

Requirements:
- Give the student limited action points to allocate across application preparation tasks.
- Tasks should reflect GPA, language test, research, internship, school research, recommendation planning, and networking priorities.
- Use the student's profile to generate contextual advice.
- Let plus/minus controls adjust allocations.
- Generate a prophecy/plan text that summarizes strengths, weak spots, and next actions.
- Emit a result payload with allocation summary and recommendation text.
```

### 17.6 Year 2 Level 6: Contract Guardian

Core file: `frontend/src/views/games/year2_6.vue`

Primary prompt:

```text
Create Y2-6 "Contract Guardian" as an agency-contract risk game.

Requirements:
- Display risky contract clauses.
- Display safety shields that correspond to protections such as account ownership, advisor transparency, school list clarity, refund terms, revision limits, payment milestones, and document ownership.
- Let users drag shields to clauses and also support click/tap matching.
- Validate matches and show feedback.
- Only enable completion once every clause is protected.
- Emit completion with protected count and reward coins.
- Make the interface mobile-friendly and accessible through clear labels.
```

### 17.7 Year 2 Level 7: Final Trial

Core file: `frontend/src/views/games/year2_7.vue`

Primary prompt:

```text
Create Y2-7 "Final Trial" as the end-of-Year-2 challenge.

Requirements:
- Present a concise final review challenge for Year 2 application-planning concepts.
- Use a celebratory fantasy style with a success state and reward ticket.
- Allow the student to claim a final reward and return to the map.
- Emit a completion payload that identifies the final-trial reward.
- Keep the component lightweight compared with earlier strategy levels.
```

### 17.8 Year 3 Level 1: Timeline Crucible

Core file: `frontend/src/views/games/year3_1.vue`

Primary prompt:

```text
Create Y3-1 "Timeline Crucible" as an application-material alchemy game.

Requirements:
- Display an inventory of base materials such as experience, school list, professor, English score, and profile artifacts.
- Let the player select two materials into slots and fuse them.
- Define recipes that unlock new application artifacts.
- Include hint notes that reveal clues.
- Show success and failure feedback, including special failure messages.
- Track unlocked artifacts and completion readiness.
- Emit completion with reward coins after required artifacts are created.
```

### 17.9 Year 3 Level 2: Bureau Of Magic

Core file: `frontend/src/views/games/year3_2.vue`

Primary prompt:

```text
Create Y3-2 "Bureau of Magic" as a document-type classification game.

Requirements:
- Show fragments from application materials.
- Let the player stamp each fragment as CV, personal statement, or recommendation letter.
- Randomize or sequence fragments.
- Give immediate correct/wrong feedback with explanation.
- Progress automatically until all fragments are classified.
- Emit completion when the set is finished.
- Keep visuals in a parchment/stamp fantasy style.
```

### 17.10 Year 3 Level 3: CV Surgery

Core file: `frontend/src/views/games/year3_3.vue`

Primary prompt:

```text
Create Y3-3 "CV Surgery" as an interactive CV debugging game.

Requirements:
- Display a CV draft with hidden/clickable issues.
- Core issues include GPA expression, vague description, ordering, score wording, irrelevant hobbies, and passive phrasing.
- Let students click suspicious regions to mark issues as fixed.
- Show a checklist and explanatory feedback for each found issue.
- Show a success screen once all core issues are found.
- Emit completion with the number of fixed issues.
```

### 17.11 Year 3 Level 4: PS Weaving

Core file: `frontend/src/views/games/year3_4.vue`

Primary prompt:

```text
Create Y3-4 "PS Weaving" as a personal-statement structure game.

Requirements:
- Show star nodes representing narrative ingredients such as motive, incident, action, match, and goal.
- Let the student click stars to build an ordered narrative chain.
- Detect template-like, illogical, risky, and successful orders.
- Provide feedback cards for orthodox structure and suspense-hook structure.
- Allow reset and retry.
- Emit completion with the selected order after a successful chain.
```

### 17.12 Year 3 Level 5: Recommendation Mentor

Core file: `frontend/src/views/games/year3_5.vue`

Primary prompt:

```text
Create Y3-5 "Recommendation Mentor" as a branching dialogue game.

Requirements:
- Simulate a recommendation-letter request conversation.
- Let the student choose a scenario/route and answer dialogue choices.
- Reward polite, specific, prepared communication with higher progress.
- Track selected route and choices.
- Show a completion modal instead of using browser alert.
- Emit a summary result with selected route, answer history, and reward coins.
- Update document title during the game and restore it on unmount.
```

### 17.13 Year 3 Level 6: Dark Citadel

Core file: `frontend/src/views/games/year3_6.vue`

Primary prompt:

```text
Create Y3-6 "Dark Citadel" as a staged exam/application combat game.

Requirements:
- Build multiple monthly battle stages.
- Each stage has title, subtitle, enemy/status, and available skills.
- Let the player choose actions such as attack, defense, or recovery.
- Include tool-based battle bonuses based on the student's selected familiar tool.
- Track cleared stages, player HP, enemy HP, and final settlement state.
- Show tool bonus modal content.
- Provide final settlement with honorary title and cleared-stage summary.
- Emit a summary completion result and reward coins.
- Keep the component full-screen friendly and mobile scrollable.
```

### 17.14 Year 3 Level 7: DIY Bog Sweeper

Core file: `frontend/src/views/games/year3_7.vue`

Primary prompt:

```text
Create Y3-7 "DIY Bog Sweeper" as an application-risk classification game.

Requirements:
- Present risk statements about deadlines, official requirements, language thresholds, agency promises, documents, accounts, recommendation letters, PS/CV quality, and post-submission follow-up.
- Classify risks as fatal, severe, or minor/impression penalty.
- Provide spell buttons for the three risk levels.
- Show toast/dialog feedback after each answer.
- Track failures and final win state.
- Emit completion with risk-scan result data.
```

### 17.15 Year 3 Level 8: Astral Coronation

Core file: `frontend/src/views/games/year3_8.vue`

Primary prompt:

```text
Create Y3-8 "Astral Coronation" as the finale display level.

Requirements:
- Render a ceremonial certificate for the student/traveler.
- Summarize mastery of the complete application journey.
- Show final title, blessing, seal, and reward list.
- Keep the view chrome-free/full-screen friendly when opened from the map.
- Provide guide notes that remind students to keep ownership of application records, school tiers, material versions, recommendation status, email threads, and follow-up actions.
- Emit a final completion event when the user clicks complete.
```

---

## 18. Visual Assets, Audio, And Theming

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

## 19. Frontend API Integration And Error Handling

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

## 20. Testing And Verification

Core files:

- `backend/src/test/java/com/gradquest/data/LevelCatalogTest.java`
- `backend/src/test/java/com/gradquest/model/UserRoleTest.java`
- `backend/src/test/java/com/gradquest/security/JwtServiceTest.java`
- `backend/src/test/java/com/gradquest/service/PayloadBuilderTest.java`
- `frontend/src/components/LanguageToggle.test.js`
- `frontend/src/config/levels.test.js`
- `frontend/src/i18n/index.test.js`
- `frontend/src/services/backend.test.js`
- `frontend/src/stores/game.test.js`
- `frontend/src/stores/language.test.js`
- `frontend/e2e/auth.spec.js`
- `frontend/playwright.config.js`

Primary prompt:

```text
Add focused automated tests for the highest-risk project contracts.

Backend tests:
- Verify the level catalog contains the expected Year 2 and Year 3 levels.
- Verify role normalization and validation.
- Verify JWT issue/parse behavior and claim contents.
- Verify payload builder output for user, progress, inventory, and traveler profile parsing.

Frontend tests:
- Verify language lookup, interpolation, fallback behavior, and language store persistence.
- Verify level config exports expected level counts and definitions.
- Verify backend service unwrapping and error helper behavior.
- Verify game store local result normalization, progression merge, year switching, and state reset behavior.
- Verify language toggle rendering.

E2E:
- Add Playwright coverage for auth-oriented flows where practical.

Document verification commands:
- Backend compile: `mvn -q -DskipTests compile`
- Frontend build: `npm run build`
- Frontend unit tests: `npm run test:run`
- E2E tests: `npm run e2e`
```

Implementation intent:

- Test contracts rather than every visual detail.
- Give graders repeatable verification steps.

---

## 21. Documentation, Screenshots, And Submission Polish

Core files:

- `README.md`
- `READMEDev.md`
- `screenshots/login.jpg`
- `screenshots/student-dashboard.jpg`
- `screenshots/teacher-dashboard.jpg`
- `frontend/vercel.json`
- `backend/Dockerfile`
- `backend/.env.example`
- `frontend/.env.example`
- `frontend/.env.development`
- `frontend/.env.production`

Primary prompt:

```text
Prepare the repository for coursework submission.

Requirements:
- Write a public README that explains project overview, features, stack, run instructions, API endpoints, build verification, demo notes, and screenshots.
- Write a developer README with clone/install/run steps, architecture overview, project structure, entry points, environment variables, profiles, useful scripts, debugging notes, and verification commands.
- Include screenshot references for login, student dashboard, and teacher dashboard.
- Add environment examples for backend and frontend.
- Add backend Dockerfile and frontend Vercel config for deployment readiness.
- Mention that default local backend uses embedded H2 and MySQL is optional.
- Make demo notes clear: no email verification, arbitrary test accounts, teacher accounts can access dashboard immediately.
```

Implementation intent:

- Make the repository understandable without private explanation.
- Reduce setup risk for local evaluation.

---

## 22. Iterative Fix / Refinement Prompts

These prompts represent the major refinement passes visible in the final repository.

### 22.1 Role-Specific Account Demo Compatibility

```text
Adjust registration/login so coursework evaluators can create or use the same email-like account value for both student and teacher roles.

Backend:
- Normalize email but check uniqueness by `(email, role)`.
- Preserve username uniqueness internally by deriving username as `email:role`.
- Update DB initialization to drop or relax old single-column email uniqueness and create a composite unique index.

Frontend:
- Allow arbitrary login/register email text for demo purposes.
- Keep role selection explicit and show helpful role mismatch messages.
```

### 22.2 Traveler Profile Preservation

```text
Fix traveler profile merging so completing Identity Forge does not overwrite registration avatar data unnecessarily.

Requirements:
- Preserve avatarPreset/avatar fields from existing profile.
- Allow map-specific avatar data to be stored under `mapAvatar`.
- Merge incoming profile fields carefully instead of replacing the whole JSON object.
- Ensure frontend game store can derive travelerAvatar and travelerLook consistently from backend profile payloads.
```

### 22.3 Local Replay Results Plus Backend Progress

```text
Make completed game result review work even when backend only stores level status.

Requirements:
- Store rich per-game result payloads in localStorage.
- Merge local completed results into level unlocked/completed rendering.
- Keep backend progress authoritative for coins/unlocks.
- Allow retry to clear the local game result for a specific game without resetting backend progress.
```

### 22.4 Mobile Usability Pass

```text
Improve mobile usability across the student map, game modal, teacher dashboard, shop, healing sandbox, and game levels.

Requirements:
- Add mobile drawer navigation on the map.
- Keep touch targets at least 48px where practical.
- Add touch alternatives for drag/drop games.
- Avoid overflow and hidden controls on small screens.
- Make modals scrollable with safe viewport units.
- Ensure teacher dashboard and login form stack cleanly on narrow widths.
```

### 22.5 Bilingual Content Pass

```text
Move hard-coded user-facing strings into the i18n files and add English/Chinese copy for the full learning journey.

Requirements:
- Translate shared labels, map copy, help, shop, healing sandbox, teacher dashboard, game result fields, and all level guides.
- Use interpolation for dynamic values like counts, coins, region names, and progress.
- Keep fallback behavior if a translation key is missing.
```

### 22.6 Build Verification Pass

```text
Run and fix build issues until both backend and frontend compile.

Verification targets:
- Backend: `mvn -q -DskipTests compile`
- Frontend: `npm run build`
- Unit tests where available.

Fix any type/import/path/runtime issues that block production build.
Update README verification notes after successful checks.
```

---

## 23. Core Component Coverage Checklist

- Backend scaffold and configuration: covered.
- Security/JWT/auth/roles: covered.
- Database schema initialization and seed data: covered.
- Student progress and level unlocking: covered.
- Shop and inventory: covered.
- Teacher dashboard APIs: covered.
- Sandbox message APIs: covered.
- Vue app shell/router/stores/API client: covered.
- Login/register UI: covered.
- Student map and level launcher: covered.
- Level config and onboarding: covered.
- All 15 mini-games: covered.
- i18n/language toggle: covered.
- Reward shop and healing sandbox frontend: covered.
- Teacher dashboard frontend: covered.
- Assets/audio/theming: covered.
- Tests, docs, deployment notes: covered.
