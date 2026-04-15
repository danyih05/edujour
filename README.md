# CW_web

`CW_web` is a study-abroad / postgraduate-application planning game app with a Vue 3 frontend and a Spring Boot backend.

## Structure

- `frontend`: Vue 3 + Vite + Vue Router + Pinia
- `backend`: Spring Boot + MySQL + JWT

## Readable SQL Dump

The live backend now uses MySQL at runtime, and you can export the current database into a plain-text `.sql` file whenever you want to inspect it.

```bash
powershell -ExecutionPolicy Bypass -File backend/scripts/export-db-dump.ps1
```

That command writes a readable SQL dump to:

```text
backend/sql/gradquest_mysql_dump.sql
```

You can also inspect the schema reference directly in:

```text
backend/sql/mysql_schema.sql
```

## What Changed

- Added role-based login/logout for `student` and `teacher`
- Added a teacher monitoring dashboard to inspect student progress data
- Moved the active backend runtime path to Spring Boot so the backend can run with `mvn spring-boot:run`
- Synced student progress, rewards, and profile data to MySQL-backed APIs

## Local Startup

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
mvn dependency:resolve
```

### 2. Start the backend

The default local backend profile now uses an embedded H2 database, so no separate database setup is required for local registration/login testing.

```bash
cd backend
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:18080
```

Health check:

```text
http://localhost:18080/api/health
```

To run against MySQL instead, start MySQL 8 and then run:

```bash
powershell -ExecutionPolicy Bypass -File backend/scripts/run-backend-with-mysql.ps1
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

The frontend proxies `/api` requests to `http://localhost:18080` during local development by default.

You can register student or teacher accounts from the login page.

## Optional Backend Environment Variables

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

If a previous backend process still occupies port `18080`, you can stop it with:

```bash
powershell -ExecutionPolicy Bypass -File backend/scripts/stop-backend.ps1
```

## Main API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/progress`
- `POST /api/progress/complete`
- `POST /api/progress/skip`
- `POST /api/progress/reset`
- `GET /api/shop/items`
- `POST /api/shop/purchase`
- `GET /api/inventory`
- `GET /api/teacher/students`
- `GET /api/teacher/students/{studentId}`
- `GET /api/health`

## Verification

The current repository state has been verified with:

- `cd backend && mvn -q -DskipTests compile`
- `cd frontend && npm run build`

The MySQL migration compiles cleanly, but runtime API smoke tests still require valid local MySQL credentials.
