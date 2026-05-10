# Testing, Documentation, Submission, And Refinement Prompts

Prompts for verification, README/submission materials, iterative fixes, and final coverage checks.

---

### E01. Verification And Submission Prompt

Component goal:

Prepare the repository for evaluation and make the AI-assisted work auditable.

Context passed to AI:

- The repo must be understandable without verbal explanation.
- Build commands should be documented.
- Vibe Coding Logs requirement asks for auditable AI logs. This repository keeps them in `ai-logs/`.

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
- create `ai-logs/`,
- add a prompts log that records the primary AI prompts used to generate core components,
- cover architecture, backend, frontend, all mini-games, tests, and docs,
- avoid secrets and private data.
```

Expected output:

- README files.
- Environment examples.
- `ai-logs/00-prompts-log.md` as the submission-facing prompt index, with detailed numbered logs in the same folder.
- Clear verification instructions.

Acceptance criteria:

- A grader can run the app using README instructions.
- The prompts log covers all core components.
- No credentials or private user data are exposed.

## 2. Project Architecture And Initial Scaffold

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

## 3. Testing And Verification

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

## 4. Documentation, Screenshots, And Submission Polish

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

## 5. Iterative Fix / Refinement Prompts

These prompts represent the major refinement passes visible in the final repository.

### 5.1 Role-Specific Account Demo Compatibility

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

### 5.2 Traveler Profile Preservation

```text
Fix traveler profile merging so completing Identity Forge does not overwrite registration avatar data unnecessarily.

Requirements:
- Preserve avatarPreset/avatar fields from existing profile.
- Allow map-specific avatar data to be stored under `mapAvatar`.
- Merge incoming profile fields carefully instead of replacing the whole JSON object.
- Ensure frontend game store can derive travelerAvatar and travelerLook consistently from backend profile payloads.
```

### 5.3 Local Replay Results Plus Backend Progress

```text
Make completed game result review work even when backend only stores level status.

Requirements:
- Store rich per-game result payloads in localStorage.
- Merge local completed results into level unlocked/completed rendering.
- Keep backend progress authoritative for coins/unlocks.
- Allow retry to clear the local game result for a specific game without resetting backend progress.
```

### 5.4 Mobile Usability Pass

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

### 5.5 Bilingual Content Pass

```text
Move hard-coded user-facing strings into the i18n files and add English/Chinese copy for the full learning journey.

Requirements:
- Translate shared labels, map copy, help, shop, healing sandbox, teacher dashboard, game result fields, and all level guides.
- Use interpolation for dynamic values like counts, coins, region names, and progress.
- Keep fallback behavior if a translation key is missing.
```

### 5.6 Build Verification Pass

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

## 6. Core Component Coverage Checklist

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

## 7. Final Repository Cross-Check Notes

This section records the final consistency pass against the checked-in project structure.

### AI Log Structure

- Submission-facing prompt index and detailed prompt overview: `ai-logs/00-prompts-log.md`.
- Architecture and scope: `ai-logs/01-overview-and-scope.md`.
- Backend, data, and security: `ai-logs/02-backend-data-security.md`.
- Frontend state and integration: `ai-logs/03-frontend-state-integration.md`.
- Game node conversion and implementation: `ai-logs/04-game-node-html-to-vue.md`.
- Testing, documentation, and refinements: `ai-logs/05-testing-docs-refinements.md`.
- Per-game development logs: `ai-logs/v1_year2-1.md`, `ai-logs/v1_year2-2.md`, `ai-logs/v1_year2_3.md`, `ai-logs/v1_year2_4_2.md`, `ai-logs/v1_year2_4.md` as related background, `ai-logs/v1_year2_5.md`, `ai-logs/v1_year2_6.md`, `ai-logs/v1_year2_7.md`, and `ai-logs/v1_year3_1.md` through `ai-logs/v1_year3_8.md`.

### Verification Commands

- Backend compile: `cd backend && mvn -q -DskipTests compile`.
- Backend tests: `cd backend && mvn test`.
- Frontend production build: `cd frontend && npm run build`.
- Frontend unit tests: `cd frontend && npm run test:run`.
- Frontend E2E tests: `cd frontend && npm run e2e`.

### Environment And Runtime Notes

- Local backend defaults to the embedded H2 profile through `spring.profiles.default=h2`.
- MySQL remains optional through `SPRING_PROFILES_ACTIVE=mysql`.
- Backend environment examples are stored in `backend/.env.example`.
- Frontend environment examples are stored in `frontend/.env.example`, with development and production variants in `frontend/.env.development` and `frontend/.env.production`.
- The frontend proxy reads `VITE_API_TARGET`, defaulting to `http://localhost:18080`.

### Mini-Game Coverage Map

| Journey | Component files | AI log files |
| --- | --- | --- |
| Year 2 levels 1-7 | `frontend/src/views/games/year2_1.vue` through `year2_7.vue` | `ai-logs/v1_year2-1.md`, `v1_year2-2.md`, `v1_year2_3.md`, `v1_year2_4_2.md` as final Y2-4 source, `v1_year2_4.md` as earlier related background, `v1_year2_5.md`, `v1_year2_6.md`, `v1_year2_7.md` |
| Year 3 levels 1-8 | `frontend/src/views/games/year3_1.vue` through `year3_8.vue` | `ai-logs/v1_year3_1.md` through `v1_year3_8.md` |

