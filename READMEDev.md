# Getting Started

## Clone and install

```bash
git clone https://github.com/danyih05/edujour.git
cd edujour
```

Install backend dependencies:

```bash
cd backend
mvn dependency:resolve
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Run locally with embedded H2

Start the backend:

```bash
cd ../backend
mvn spring-boot:run
```

Start the frontend:

```bash
cd ../frontend
npm run dev
```

Frontend development server defaults to:

```text
http://localhost:5173
```

Backend defaults to:

```text
http://localhost:18080
```

The frontend proxy sends `/api` requests to the backend.

Optional XJTLU Bird / DeepSeek assistant setup is documented in `frontend/XJTLU_BIRD_SETUP.md`. It is not required for baseline local development.

## Run with MySQL

If you want to run the backend against MySQL instead of H2:

1. Start MySQL 8
2. From `backend`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-backend-with-mysql.ps1
```

This script sets `SPRING_PROFILES_ACTIVE=mysql` and uses the environment variables defined in `backend/.env.example`.

---

## Project Overview

This repository contains a full-stack learning game application:

- `frontend`: Vue 3 application for student and teacher UI
- `backend`: Spring Boot API server for authentication, progress, shop, sandbox messages, and teacher reports

The system supports student/teacher accounts, JWT authentication, 15-node progress tracking, shop purchases, sandbox messaging, and teacher monitoring.

---

## Architecture Overview

- Frontend: Vue 3 + Vite single-page application
- Backend: Spring Boot REST API
- Database: embedded H2 by default, MySQL optional via profile
- Backend security: Spring Security + JWT
- Frontend-to-backend communication over `/api/*` proxied to backend during development

The frontend runs on `5173`, the backend runs on `18080`, and API calls are proxied from the frontend to the backend.

---

## Tech Stack

- Java 17
- Spring Boot 3.5
- Spring Security
- Spring JDBC
- Spring Data JPA
- H2 (default development database)
- MySQL (optional runtime database)
- JWT via `jjwt`
- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Vitest
- Playwright

---

## Project Structure

### Root

- `README.md` - public project overview and evaluator guide
- `READMEDev.md` - developer onboarding
- `ai-logs/` - AI-assisted development logs
- `screenshots/` - README screenshots and verification evidence
- `frontend/` - Vue app
- `backend/` - Spring Boot service

### `backend/`

- `pom.xml` - Maven build file
- `Dockerfile` - backend container build definition
- `.env.example` - backend runtime environment example
- `src/main/java/com/gradquest/` - backend source code
  - `config/` - application configuration classes
  - `data/` - level catalog and database initialization
  - `dto/` - request/response payload objects
  - `exception/` - API error handling
  - `model/` - domain models
  - `repository/` - data access implementations
  - `security/` - JWT and security filters
  - `service/` - business logic
  - `web/` - REST controllers
- `src/main/resources/application.yml` - default profile and datasource configuration
- `src/main/resources/application-dev.yml` - development override example
- `src/main/resources/application-prod.yml` - production override example
- `src/test/java/com/gradquest/` - backend unit tests
- `scripts/` - local backend helpers (`run-backend-with-mysql.ps1`, `stop-backend.ps1`, `export-db-dump.ps1`)
- `sql/` - schema and SQL helper scripts

### `frontend/`

- `package.json` - npm scripts and dependencies
- `vite.config.js` - dev server, proxy, aliases, and Vitest config
- `playwright.config.js` - E2E test config
- `vercel.json` - frontend deployment routing config
- `.env.example` - frontend environment example
- `.env.development` - local development API target
- `.env.production` - production API target placeholder
- `src/main.js` - frontend app bootstrap
- `src/App.vue` - root component
- `src/router/` - route definitions
- `src/stores/` - application state with Pinia
- `src/services/backend.js` - API service wrapper
- `src/utils/api.js` - Axios client setup
- `src/views/` - page views and game nodes
- `src/components/` - reusable UI components
- `src/i18n/` - localization support
- `src/config/levels.js` - level definitions
- `e2e/` - Playwright tests

---

## Entry Points

### Backend

- `backend/src/main/java/com/gradquest/GradQuestApplication.java`
  - Main application entry point
  - Starts Spring Boot

### Frontend

- `frontend/src/main.js`
  - Creates Vue app
  - Registers router and Pinia
  - Mounts app to DOM

---

## Setup & Development

### Backend

```bash
cd backend
mvn dependency:resolve
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Build

Backend compile check:

```bash
cd backend
mvn -q -DskipTests compile
```

Frontend production build:

```bash
cd frontend
npm run build
```

### Tests

Backend tests:

```bash
cd backend
mvn test
```

Frontend unit tests:

```bash
cd frontend
npm run test:run
```

Frontend E2E tests:

```bash
cd frontend
npm run e2e
```

---

## Environment Configuration

### Backend environment variables

The backend reads these values from environment variables and `backend/.env.example`:

```bash
PORT=18080
CLIENT_ORIGINS=http://localhost:5173
JWT_SECRET=change-this-in-real-use
JWT_EXPIRES_IN_DAYS=7
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gradquest
DB_USERNAME=gradquest
DB_PASSWORD=GradQuest123!
INITIAL_COINS=140
```

`application.yml` reads `CLIENT_ORIGINS`, which can contain one origin such as `http://localhost:5173` or a comma-separated list.

### Profiles

- Default: `h2`
- MySQL runtime: set `SPRING_PROFILES_ACTIVE=mysql`
- Optional override examples: `dev` and `prod` YAML files are included for deployment-specific configuration.

### Frontend API target

The frontend proxy uses `VITE_API_TARGET` if set:

```bash
VITE_API_TARGET=http://localhost:18080
```

If unset, it defaults to `http://localhost:18080`.

The optional browser chat key is documented in `frontend/.env.example`:

```bash
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
```

Do not commit real API keys or production secrets.

---

## AI Logs

The AI-assisted development logs are stored in:

```text
ai-logs/
```

Use this file as the main index:

```text
ai-logs/00-prompts-log.md
```

The numbered logs cover architecture, backend/data/security, frontend integration, game-node implementation, testing, documentation, and final refinements.

---

## Development Workflow

- Create feature branches from `main`
- Keep changes scoped and commit atomic
- Open pull requests for review
- Use `mvn -q -DskipTests compile` in backend and `npm run build` in frontend to verify compile/build changes
- Use `mvn test`, `npm run test:run`, and `npm run e2e` when changes touch backend contracts, frontend state, or auth-oriented browser flows

If the repository has an established branch naming convention, follow that convention.

---

## Debugging & Notes

### Backend debugging

- Run `GradQuestApplication.main()` from your IDE
- Check `backend/src/main/resources/application.yml` for the default profile and datasource settings
- Default H2 data file is stored under `backend/data/gradquest.*`
- Use `backend/scripts/stop-backend.ps1` if port `18080` is already occupied on Windows

### Frontend debugging

- Use browser dev tools for network/API requests
- `frontend/vite.config.js` configures the local API proxy to backend
- `frontend/src/services/backend.js` contains client-side API interaction

### Common pitfalls

- `frontend` expects backend on `http://localhost:18080`
- `backend` defaults to H2 unless `SPRING_PROFILES_ACTIVE=mysql` is set
- E2E tests require Playwright browsers to be installed in the local environment
- Real API keys should stay out of committed `.env` files

---

## Useful Scripts

- `backend/scripts/run-backend-with-mysql.ps1`
- `backend/scripts/stop-backend.ps1`
- `backend/scripts/export-db-dump.ps1`

---

## Verification

Core compile/build verification:

```bash
cd backend && mvn -q -DskipTests compile
cd frontend && npm run build
```

Additional test verification:

```bash
cd backend && mvn test
cd frontend && npm run test:run
cd frontend && npm run e2e
```
