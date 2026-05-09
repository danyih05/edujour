# EduJourney

## Project Overview

EduJourney is a gamified postgraduate application planning platform designed to help students manage study-abroad preparation tasks through progression systems, rewards, and milestone tracking.

The platform supports both student and teacher roles:

- Students can register accounts, complete application-planning tasks, earn rewards, and track progress.
- Teachers can monitor student progress through a dedicated dashboard.

This project was developed as a coursework submission and demonstrates full-stack web application development using Vue 3, Spring Boot, JWT authentication, and relational database persistence.

---

# Running the Project

## Prerequisites

Please ensure the following software is installed:

- Node.js 18+
- Java 17+
- Maven 3.9+
- (Optional) MySQL 8

---

## 1. Start the Backend

The backend can run directly using the embedded H2 database by default, so no separate database setup is required for local testing.

Open a terminal and run:

```bash
cd backend
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:18080
```

Health check endpoint:

```text
http://localhost:18080/api/health
```

---

## 2. Start the Frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

The frontend automatically proxies `/api` requests to the backend during local development.

---

## 3. Register an Account

The login page supports both:

- Student registration
- Teacher registration

For coursework demonstration purposes:

- Registration fields may contain arbitrary values
- No email verification is required
- Users can freely create new accounts for testing

---

# Features

## Student Features

- User registration and login
- JWT-based authentication
- Progress tracking system
- Task completion and skipping
- Reward / coin system
- Inventory management
- In-app shop and item purchasing
- Persistent profile and progress storage

---

## Teacher Features

- Teacher account login
- Student monitoring dashboard
- Student progress inspection
- Progress overview for multiple students

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite + Vue Router + Pinia |
| Backend | Spring Boot |
| Database | MySQL / H2 |
| Authentication | JWT |
| Build Tools | Maven + npm |

---

# Database

The production-style backend supports MySQL persistence.

Schema reference:

```text
backend/sql/mysql_schema.sql
```

Readable SQL dump:

```text
backend/sql/gradquest_mysql_dump.sql
```

To export the latest database state:

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/export-db-dump.ps1
```

---

# Optional MySQL Runtime

The default local setup uses H2 for convenience.

To run the backend using MySQL 8 instead:

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/run-backend-with-mysql.ps1
```

Optional backend environment variables:

```env
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

---

# Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/progress` | Get student progress |
| POST | `/api/progress/complete` | Complete task |
| POST | `/api/shop/purchase` | Purchase item |
| GET | `/api/inventory` | Get inventory |
| GET | `/api/teacher/students` | Teacher dashboard |
| GET | `/api/health` | Backend health check |

---

# Build Verification

The current repository state has been verified successfully using:

Backend compilation:

```bash
cd backend
mvn -q -DskipTests compile
```

Frontend production build:

```bash
cd frontend
npm run build
```

Both frontend and backend compile successfully in the current submission state.

---

# Demo Notes

- Users may freely register new student or teacher accounts
- No email verification is required
- Teacher accounts can immediately access the monitoring dashboard
- The local default runtime uses the embedded H2 database
- MySQL support is included for persistent runtime testing

---

# Screenshots

## Login Page

![Login Page](screenshots/login.jpg)

---

## Student Dashboard

![Student Dashboard](screenshots/student-dashboard.jpg)

---

## Teacher Dashboard

![Teacher Dashboard](screenshots/teacher-dashboard.jpg)

---

