# Backend, Data, Security, And Server Contracts

Backend-focused prompts for persistence, authentication, progress, rewards, teacher data, and sandbox messages.

---

### E01. Backend Domain And Persistence Design

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

### E02. Backend Authentication And Authorization

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

### E03. Progress, Unlocking, Coins, And Profile Sync

Component goal:

Create the main progression engine that ties mini-game completion to map state, rewards, and traveler profile updates.

Context passed to AI:

- The frontend has 15 game nodes that were converted from manually designed HTML prototypes into Vue components.
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

### E04. Reward Shop And Inventory Flow

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

### E05. Shop And Inventory Transaction Detail

Component goal:

Define the exact reward redemption behavior across backend and frontend.

Context passed to AI:

- Shop rewards are a support mechanic, not the learning objective.
- Coin balance lives on the backend.
- The frontend needs to disable impossible purchases before submission but backend must still validate.

Primary prompt:

```text
Implement transactional reward redemption.

Backend behavior:
- load the current student account,
- reject non-student access,
- load active shop item by id,
- reject inactive or missing item,
- reject already owned item,
- reject insufficient balance,
- deduct item cost from user coins,
- create inventory row,
- return purchased item and coinsRemaining.

Frontend behavior:
- display active shop items with translated known slugs,
- show owned state from backend,
- disable owned or unaffordable items,
- call purchase API on redeem,
- update both Year 2 and Year 3 displayed balance because coins are shared,
- refresh shop and inventory after purchase,
- show a localized redemption message.
```

Expected output:

- backend shop/inventory service logic,
- frontend `PrizeShop` props/events,
- game store `purchasePrize` action.

Acceptance criteria:

- Duplicate purchases are impossible.
- Balance never goes negative.
- UI updates after purchase without page reload.

### E06. Teacher Dashboard Data Contract

Component goal:

Define how teacher monitoring data is aggregated and rendered.

Context passed to AI:

- Teachers need a quick overview and detailed per-student inspection.
- Dashboard should be read-only.
- The frontend should not compute raw SQL-like aggregates; backend should return clean summary data.

Primary prompt:

```text
Create a teacher dashboard data contract.

Dashboard endpoint:
- return summary with totalStudents, totalLevels, and studentsWithAnyProgress,
- return student rows with id, email, displayName, coins, avatar/traveler profile, last login, latest progress, completed/skipped/unlocked/locked counts, total levels, and completion rate.

Student detail endpoint:
- validate that the requested id belongs to a student,
- return user payload,
- return progress grouped by Year 2 and Year 3,
- return inventory items.

Frontend dashboard:
- load dashboard on mount,
- select the first student by default when available,
- support search by name or email,
- load detail when a student row is selected,
- render progress tags using status classes,
- localize dates and status labels,
- show empty states for no students, no search results, no selected detail, and no inventory.
```

Expected output:

- `TeacherService`
- `TeacherController`
- `TeacherDashboardView.vue`
- backend service methods in `services/backend.js`.

Acceptance criteria:

- Teacher can scan all students.
- Student detail updates without a full page reload.
- Completion rates and status tags match backend progress rows.

### E07. Runtime Configuration, Health Checks, And Deployment Hooks

Component goal:

Make the backend runnable in local H2 mode, optional MySQL mode, and simple containerized deployment while keeping runtime settings environment-driven.

Context passed to AI:

- The project must be easy for graders to run locally.
- The frontend needs a stable health endpoint before attempting authenticated API calls.
- MySQL support exists for persistent deployment, but H2 should remain the default low-friction local mode.
- Secrets and origins should not be hard-coded into service classes.

Primary prompt:

```text
Complete the Spring Boot runtime configuration layer for GradQuest.

Requirements:
- Use Java 17, Spring Boot 3.5, and Maven.
- Default the server to `${PORT:18080}`.
- Provide a default H2 profile using a file-backed database so local data can survive restarts.
- Provide a MySQL profile using environment variables for host, port, database name, username, and password.
- Keep configurable app properties for:
  - allowed frontend origins,
  - JWT secret,
  - JWT expiration days,
  - initial student coin balance.
- Add `/api/health` as a public readiness endpoint returning a small wrapped JSON payload.
- Add `/` as a public root endpoint that confirms the backend is running and points to `/api/health`.
- Keep Jackson output frontend-friendly by omitting null fields where appropriate.
- Include a Dockerfile, `.env.example`, and PowerShell helper scripts for local MySQL startup, backend stop, and database export.
- Do not expose real secrets in checked-in configuration.
```

Expected output:

- `application.yml`, `application-dev.yml`, `application-prod.yml`.
- `AppProperties`.
- `HealthController`.
- `RootController`.
- `Dockerfile`.
- `.env.example`.
- backend helper scripts.

Acceptance criteria:

- Backend starts without MySQL using the H2 default profile.
- Backend can be switched to MySQL through profile/environment settings.
- `/api/health` returns a consistent success envelope.
- Frontend origin, JWT, and gameplay settings are centrally configurable.

### E08. Unified API Envelope, Validation, And Error Semantics

Component goal:

Keep every backend endpoint predictable for the Vue API client and avoid leaking raw framework errors.

Context passed to AI:

- The frontend service layer expects the same response shape for success and failure.
- Validation errors should be understandable to students and teachers.
- Security failures must return JSON, not default HTML error pages.
- Backend services should throw domain errors without duplicating response formatting logic.

Primary prompt:

```text
Create a shared API response and error-handling layer.

Requirements:
- Return successful responses as:
  `{ "success": true, "data": ... }`
- Return failures as:
  `{ "success": false, "error": { "message": "..." } }`
- Provide helpers for normal `200 OK`, `201 Created`, and error responses.
- Add an `ApiException` type carrying HTTP status and user-safe message.
- Add a global exception handler for:
  - domain API exceptions,
  - DTO validation failures,
  - constraint violations,
  - malformed JSON request bodies,
  - access denied errors,
  - missing static/API resources,
  - unexpected server errors.
- Log unexpected exceptions server-side but return a safe generic message to the browser.
- Make Spring Security authentication and authorization failures use the same JSON envelope.
```

Expected output:

- `ApiResponses`.
- `ApiException`.
- `GlobalExceptionHandler`.
- JSON 401 and 403 handling inside security configuration.
- DTO validation annotations on request records.

Acceptance criteria:

- Frontend code can unwrap success and error responses uniformly.
- Validation errors do not crash the API client.
- Unauthorized and forbidden responses are JSON.
- Stack traces are not exposed to the browser.

### E09. Traveler Profile, Avatar Presets, And Payload Normalization

Component goal:

Persist the player's identity/profile state cleanly across authentication, progress completion, map rendering, and teacher dashboard views.

Context passed to AI:

- Y2-1 collects identity/avatar information that later UI components reuse.
- Students and teachers can both have profile payloads, but only students have game progress.
- Older saved profiles may only include an `avatarPreset`; newer frontend components expect a normalized `avatar` object.
- Profile updates from mini-games should merge into existing data instead of wiping avatar details.

Primary prompt:

```text
Build backend support for traveler profile and avatar presets.

Requirements:
- Store traveler profile as JSON on the user account.
- Provide a service with named avatar presets such as:
  - north-star,
  - sunrise-note,
  - forest-spark,
  - midnight-wave.
- Resolve invalid or missing avatar keys to a role-appropriate default.
- During registration, create an initial traveler profile with display name, avatar preset key, and avatar style fields.
- When building user payloads, parse traveler profile JSON into structured data.
- Normalize older payloads by deriving an `avatar` object when only `avatarPreset` exists.
- During progress completion, merge incoming profile fields into the existing traveler profile instead of replacing the whole object.
- Ensure teacher dashboard and `/api/auth/me` return the same normalized user payload shape.
```

Expected output:

- `AvatarPresetService`.
- `PayloadBuilder` user profile parsing/serialization helpers.
- `traveler_profile_json` column support.
- Profile merge behavior inside progress completion.

Acceptance criteria:

- Registering a user returns a usable avatar/profile payload.
- Completing profile-bearing levels does not erase avatar styling.
- Existing profile JSON remains forward-compatible with newer frontend expectations.
- Teacher dashboard can display student avatar/profile data without extra client parsing.

### E10. Repository Query Contracts And Data Access Strategy

Component goal:

Make the data access layer explicit enough to explain how backend state is actually read, written, and aggregated.

Context passed to AI:

- Most core tables use Spring JDBC repositories for predictable SQL and easy schema compatibility.
- Sandbox messages use a JPA repository because the entity is simple and benefits from pageable queries.
- Teacher dashboard requires aggregate counts that should be calculated server-side.
- H2 compatibility requires care around generated ids and reserved column names.

Primary prompt:

```text
Implement repository contracts for GradQuest using explicit SQL where the domain needs precise control.

Requirements:
- Use JDBC repositories for users, progress, shop items, and inventory.
- Use typed domain records/models instead of passing raw maps through service logic.
- Support generated key extraction across H2 and MySQL.
- Query users by id, email, username, and email+role.
- Allow duplicate emails only when roles differ.
- Store level progress with year, level id, status, reward coins, and timestamps.
- Order progress by Year 2, Year 3, then level id.
- Use quoted/backtick-safe handling for the `year` column where needed.
- Join inventory rows to shop item metadata so frontend responses contain item display data.
- Aggregate teacher dashboard rows in SQL:
  - completed count,
  - skipped count,
  - unlocked count,
  - locked count,
  - latest progress timestamp.
- Use pageable JPA queries for sandbox messages ordered by created time.
```

Expected output:

- `UserRepository`.
- `ProgressRepository`.
- `ShopRepository`.
- `InventoryRepository`.
- `SandboxMessageRepository`.
- typed row models for users, progress, shop, and inventory.

Acceptance criteria:

- Service classes do not need to know raw SQL column details.
- Dashboard counts match stored progress rows.
- Inventory payloads include shop metadata without extra frontend requests.
- H2 and MySQL both support generated ids and progress ordering.

### E11. Mini-Game Result Boundary And No Per-Node Backend Tables

Component goal:

Clarify the final backend architecture after the manually designed HTML nodes were converted into Vue components.

Context passed to AI:

- Early node prompts sometimes proposed node-specific backend APIs, narrative graph tables, or generated-output tables.
- The final implementation uses Vue game nodes as rich client-side experiences.
- The shared backend persists canonical account, progress, reward, profile, inventory, teacher, and sandbox state.
- Detailed per-node puzzle choices can remain local unless they are needed for shared reporting or account state.

Primary prompt:

```text
Define the backend boundary for converted HTML-to-Vue game nodes.

Architecture decision:
- Do not create a separate database table or API for every game node.
- Use `/api/progress/complete` as the common completion contract for all nodes.
- Persist only canonical shared state on the backend:
  - level completion/skipped/locked status,
  - reward coins,
  - unlock progression,
  - traveler profile updates when a node intentionally changes profile state.
- Keep rich node-specific results in the frontend store/local result payload unless teachers or future sessions need them.
- If a node prompt contains advanced backend concepts, translate them into frontend scoring/state first, then submit only the final progress/profile summary to the backend.
- Teacher dashboard should report progress status and profile/inventory state, not every transient mini-game interaction.
```

Expected output:

- One shared progress completion API instead of per-node completion endpoints.
- No extra backend tables for Y2/Y3 node internals unless a feature explicitly requires cross-session reporting.
- Clear documentation that early HTML-generation prompts were narrowed during Vue conversion.

Acceptance criteria:

- New Vue nodes can plug into the existing progress API.
- Backend schema stays compact and reviewable.
- Initial prompts that mention node-specific databases are explained as design exploration, not final architecture.
- The prompt log does not falsely imply that every fantasy system received its own server-side table.

---

## 12. Backend Foundation, Configuration, And API Shape

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

## 13. Authentication, Roles, JWT, And Security

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

## 14. Database Initialization, Schema Migration, And Seed Data

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

## 15. Level Catalog And Progress System

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

## 16. Shop, Coins, And Inventory

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

## 17. Teacher Dashboard Backend

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

## 18. Anonymous Reflection / Sandbox Message Backend

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

