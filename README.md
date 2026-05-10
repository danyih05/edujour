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

The login page supports both student and teacher registration.  
For coursework demonstration purposes:

- Registration fields accept arbitrary values; no real personal data is required.
- No email verification is needed.
- Users can freely create new accounts for testing.

*Note: The original system enforced email format validation and duplicate‑account checks between student and teacher roles. These restrictions have been temporarily disabled to allow the account `CPT208` to be used for evaluation.*

---

# Features

## Student Features

- User registration and login with role selection
- JWT-based authentication
- Personalised game path recommendation based on user profile
- Progress tracking through **15 game nodes** that unlock step‑by‑step
- **9 game mechanics**: quest completion, timed challenges, hidden achievements, leaderboard, daily sign‑in, knowledge quiz (RAG), in‑app shop, anonymous tree‑hole, and lucky draw
- Task completion and skipping
- Reward and coin system linked to real‑prize exchange
- Inventory management for virtual items
- In‑app shop and item purchasing
- AI chat (Retrieval‑Augmented Generation) for study‑abroad knowledge
- Anonymous tree‑hole message board for peer support
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

