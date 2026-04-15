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

## Run with MySQL

If you want to run the backend against MySQL instead of H2:

1. Start MySQL 8
2. From `backend`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-backend-with-mysql.ps1
```

This script sets `SPRING_PROFILES_ACTIVE=mysql` and uses the environment variables defined in .env.example.

---

## Project Overview

This repository contains a full-stack learning game application:

- `frontend`: Vue 3 application for student and teacher UI
- `backend`: Spring Boot API server for authentication, progress, shop, and teacher reports

The system supports student/teacher accounts, JWT authentication, lesson progress tracking, shop purchases, and teacher monitoring.

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
- H2 (default development database)
- MySQL (optional runtime database)
- JWT via `jjwt`
- Vue 3
- Vite
- Vue Router
- Pinia
- Axios

---

## Project Structure

### Root

- README.md — developer onboarding
- `frontend/` — Vue app
- `backend/` — Spring Boot service

### `backend/`

- pom.xml — Maven build file
- `src/main/java/com/gradquest/` — backend source code
  - `config/` — application configuration classes
  - `dto/` — request/response payload objects
  - `exception/` — API error handling
  - `model/` — domain models
  - `repository/` — data access implementations
  - `security/` — JWT and security filters
  - `service/` — business logic
  - `web/` — REST controllers
- `src/main/resources/application.yml` — environment profile configuration
- `scripts/` — local backend helpers (run-backend-with-mysql.ps1, stop-backend.ps1, `export-db-dump.ps1`)
- `sql/` — schema and SQL helper scripts

### `frontend/`

- package.json — npm scripts and dependencies
- vite.config.js — dev server and proxy config
- `src/main.js` — frontend app bootstrap
- `src/App.vue` — root component
- `src/router/` — route definitions
- `src/stores/` — application state with Pinia
- `src/services/backend.js` — API client
- `src/views/` — page views
- `src/components/` — reusable UI components
- `src/i18n/` — localization support
- `src/config/levels.js` — level definitions

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

---

## Environment Configuration

### Backend environment variables

The backend reads these values from environment variables and .env.example:

```bash
PORT=18080
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change-this-in-real-use
JWT_EXPIRES_IN_DAYS=7
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gradquest
DB_USERNAME=gradquest
DB_PASSWORD=GradQuest123!
INITIAL_COINS=140
```

### Profiles

- Default: `h2`
- MySQL runtime: set `SPRING_PROFILES_ACTIVE=mysql`

### Frontend API target

The frontend proxy uses `VITE_API_TARGET` if set:

```bash
VITE_API_TARGET=http://localhost:18080
```

If unset, it defaults to `http://localhost:18080`.

---

## Development Workflow

- Create feature branches from `main`
- Keep changes scoped and commit atomic
- Open pull requests for review
- Use `mvn -q -DskipTests compile` in backend and `npm run build` in frontend to verify local changes

If the repository has an established branch naming convention, follow that convention.

---

## Debugging & Notes

### Backend debugging

- Run `GradQuestApplication.main()` from your IDE
- Check `backend/src/main/resources/application.yml` for current profile and datasource settings
- Default H2 data file is stored under `backend/data/gradquest.*`

### Frontend debugging

- Use browser dev tools for network/API requests
- `frontend/vite.config.js` configures local API proxy to backend
- `frontend/src/services/backend.js` contains client-side API interaction

### Common pitfalls

- `frontend` expects backend on `http://localhost:18080`
- `backend` defaults to H2 unless `SPRING_PROFILES_ACTIVE=mysql` is set
- If port `18080` is occupied, use `backend/scripts/stop-backend.ps1` first

---

## Useful Scripts

- `backend/scripts/run-backend-with-mysql.ps1`
- `backend/scripts/stop-backend.ps1`
- `backend/scripts/export-db-dump.ps1`

---

## Verification

This repository has been verified with:

```bash
cd backend && mvn -q -DskipTests compile
cd frontend && npm run build
```