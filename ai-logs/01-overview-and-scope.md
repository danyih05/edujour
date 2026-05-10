# Overview, Scope, And Product Definition

High-level AI usage scope, prompt record format, and the product-level prompt. This file also explains that game nodes began as manually designed HTML prototypes and were only lightly assisted by AI/Gemini during conversion/refinement.

---

# EduJourney / GradQuest AI Coding Prompts Log

Repository scope: full-stack coursework project in `frontend/` and `backend/`  
Purpose: satisfy the Vibe Coding Logs requirement by documenting the primary prompts used or reconstructed for the core AI-assisted implementation work.

## Notes

- This log is organized by core component rather than by every small edit.
- Prompts are written as the main instructions that drove each implementation area.
- No secrets, real credentials, or private user data are included.
- The codebase uses both names: the public project name is EduJourney, while package/build identifiers use GradQuest.

---

## AI Assistance Scope

This log does not claim that every component was generated from scratch by AI.

The actual game-node workflow was:

1. The game concepts, interaction flows, visual layout, and standalone HTML/CSS/JavaScript prototypes were primarily designed and debugged manually.
2. A small amount of Gemini assistance was used during parts of the game-node work, mainly for translation from existing HTML prototype logic into Vue-friendly structure, wording refinement, or targeted implementation help.
3. The final Vue game components were integrated into the project by adapting those manually designed prototypes into Vue single-file components, adding `emit('complete')` payloads, connecting i18n, responsive behavior, map onboarding, and backend progress sync.
4. AI assistance was more substantial for scaffolding and integration prompts around the Spring Boot backend, Vue state management, API wiring, route guards, documentation structure, and test planning.

Therefore, the node-related prompts below are written as "conversion / integration / refinement" prompts, not as claims that AI authored the original game designs.

---

## Prompt Record Format

Each prompt record in this log describes the AI-assisted coding work at component level.

- Component goal: what the final component needed to achieve.
- Context passed to AI: project constraints, existing files, data shapes, or UI expectations.
- Primary prompt: the main instruction used to generate or refine the component.
- Expected output: files, functions, API routes, UI surfaces, or tests the prompt was meant to produce.
- Acceptance criteria: practical checks used to judge whether the implemented or refined component fit the project.

This format avoids logging small incidental edits and focuses on the prompts that produced core functionality.

---

## Expanded Core Prompt Records

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

