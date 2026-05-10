You are a senior full-stack game-system architect.

Your task is to design the COMPLETE SYSTEM ARCHITECTURE for a gamified postgraduate study-abroad planning platform called:

"EduJourney"

This is NOT a traditional education website.

It is a hybrid between:
- RPG progression system
- fantasy exploration game
- study-abroad planning assistant
- task management system
- narrative-driven interactive experience

The visual style is:
“Western fantasy + magical academy + cool mysterious atmosphere + Moland-inspired exploration world”

The platform transforms stressful postgraduate application preparation into a rewarding progression-based adventure.

====================================================
CORE PRODUCT PHILOSOPHY
====================================================

The system has TWO MAJOR JOURNEY LINES:

1. Year 2 — Exploration & Self-Discovery Line
Theme:
- map exploration
- portals
- hidden paths
- identity discovery
- uncertainty and curiosity

Goal:
Help users answer:
- Who am I?
- What are my options?
- Which countries fit me?
- What schools are realistic?
- How should I improve my profile?

Emotional transition:
confusion → curiosity → direction

2. Year 3 — Execution & Application Line
Theme:
- mission execution
- strategic planning
- preparation
- deadlines
- tactical progression

Goal:
Help users answer:
- What should I do now?
- How do I prepare materials?
- How do I avoid mistakes?
- How do I execute efficiently?

Emotional transition:
anxiety → structure → control

====================================================
IMPORTANT DESIGN REQUIREMENTS
====================================================

The platform MUST feel like:
- a game world
- an explorable magical map
- an evolving personal journey

NOT:
- a dashboard-heavy admin website
- a boring LMS
- a static questionnaire

The architecture MUST support:
- branching paths
- unlockable nodes
- progression states
- achievement systems
- hidden rewards
- inventory/reward systems
- dynamic recommendations
- animated transitions
- AI-generated guidance
- teacher monitoring
- future scalability

====================================================
TECH STACK REQUIREMENTS
====================================================

Frontend:
- Vue 3
- Vite
- Vue Router
- Pinia
- TailwindCSS
- Framer Motion equivalent for Vue
- component-driven architecture

Backend:
- Spring Boot
- JWT authentication
- MySQL
- RESTful APIs
- layered architecture

Architecture style:
- scalable
- modular
- future-proof
- highly maintainable

====================================================
YOUR TASK
====================================================

Generate a COMPLETE HIGH-LEVEL SYSTEM DESIGN DOCUMENT.

The output MUST include:

====================================================
1. SYSTEM ARCHITECTURE OVERVIEW
====================================================

Explain:
- frontend architecture
- backend architecture
- state management strategy
- communication flow
- authentication flow
- game progression flow

Provide:
- clear architecture explanation
- module relationships
- scalability considerations

====================================================
2. FRONTEND ARCHITECTURE
====================================================

Design the frontend structure in detail.

Include:
- folder structure
- reusable component system
- scene system
- map rendering system
- animation layer
- game UI layer
- dashboard system
- progression tracking system
- reward popup system
- dialogue system
- modal system

Design reusable systems for:
- drag-and-drop games
- timeline puzzles
- dialogue simulators
- branching choices
- achievement popups
- inventory UI
- reward animations
- loading transitions
- node unlocking animations

Separate:
- game engine layer
- business logic layer
- visual layer

====================================================
3. BACKEND ARCHITECTURE
====================================================

Design the Spring Boot backend architecture.

Include:
- controller layer
- service layer
- repository layer
- security layer
- recommendation engine layer
- game progression engine
- reward engine
- AI integration layer
- analytics layer

Design:
- scalable REST APIs
- JWT auth system
- progression persistence
- reward distribution system
- teacher monitoring APIs

====================================================
4. DATABASE DESIGN
====================================================

Design core database schema.

Include tables/entities for:
- users
- roles
- student profiles
- progression states
- node completion
- game choices
- rewards
- inventory
- achievements
- recommendations
- AI conversations
- teacher monitoring
- gameplay analytics

Explain relationships clearly.

====================================================
5. GAME PROGRESSION SYSTEM
====================================================

Design a universal progression engine.

The system must support:
- mandatory nodes
- branching nodes
- hidden nodes
- reward nodes
- prerequisite logic
- conditional unlocking
- score-based unlocking
- exploration-based unlocking

Explain:
- node state lifecycle
- progression calculation
- unlock logic
- future expansion strategy

====================================================
6. WORLD MAP SYSTEM
====================================================

Design the magical world-map architecture.

The map must support:
- Year 2 exploration world
- Year 3 mission world
- unlockable routes
- animated portals
- glowing nodes
- region transitions
- path highlighting
- fog-of-war exploration

Explain:
- rendering strategy
- state synchronization
- responsive adaptation
- mobile compatibility

====================================================
7. GAME STATE MANAGEMENT
====================================================

Design a scalable Pinia state architecture.

Include:
- auth store
- game progression store
- node state store
- reward store
- animation state store
- inventory store
- AI assistant store
- settings store

Explain:
- persistent state strategy
- optimistic updates
- cache strategy
- API synchronization

====================================================
8. UI/UX SYSTEM
====================================================

Design the visual interaction framework.

Include:
- fantasy visual language
- magical academy UI
- glowing effects
- particle systems
- progression feedback
- achievement celebration
- emotional reinforcement design

Explain:
- user emotional journey
- dopamine feedback loops
- anti-fatigue interaction strategy
- onboarding strategy

====================================================
9. AI SYSTEM INTEGRATION
====================================================

Design AI integration architecture.

The AI should support:
- personalized recommendations
- study-abroad Q&A
- narrative guidance
- progression hints
- emotional encouragement
- smart roadmap generation

Explain:
- RAG architecture possibility
- AI service abstraction layer
- future LLM integration
- prompt orchestration strategy

====================================================
10. TEACHER DASHBOARD SYSTEM
====================================================

Design teacher-side architecture.

Include:
- student monitoring
- progression visualization
- risk detection
- engagement analytics
- recommendation insights
- intervention tools

====================================================
11. SCALABILITY & FUTURE EXPANSION
====================================================

Explain how the architecture can later support:
- multiplayer features
- guilds/groups
- co-op missions
- seasonal events
- AI NPCs
- dynamic world events
- mobile app deployment
- WebSocket real-time interactions

====================================================
12. DELIVERABLE FORMAT
====================================================

The output MUST be:
- highly structured
- deeply technical
- implementation-oriented
- visually organized
- professional software-architecture quality

Use:
- headings
- diagrams (ASCII allowed)
- tables
- folder trees
- flow explanations

DO NOT:
- generate placeholder fluff
- give generic explanations
- simplify the architecture

The result should feel like:
a real production-grade game platform architecture document prepared by a senior system architect.

Focus on:
- scalability
- modularity
- maintainability
- immersive game experience
- future expansion capability
