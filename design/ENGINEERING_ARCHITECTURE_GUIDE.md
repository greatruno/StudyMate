# StudyMate Master Engineering Architecture & Project Structure Guide
**Version**: 2.0.0-C  
**Phase**: v0.5.0-C (Approved for Development)  
**Author**: Principal Software Architect & Core Engineering Review Board  
**Status**: APPROVED & SIGNED  

---

## 📖 1. Introduction & Executive Summary

This handbook establishes the permanent engineering architecture, directory layout, coding standards, and deployment designs for **StudyMate**. Following a rigorous senior-level architectural review, StudyMate is structured as a highly maintainable, scalable, and resilient educational ecosystem. 

Rather than adopting standard, high-coupling patterns common in prototypes, StudyMate isolates its core business logic into a **decoupled Domain Layer**, orchestrates its generative workflows through an **AI Orchestrator Engine**, offloads complex computations to an **Asynchronous Background Processing Layer**, and controls release toggles through an enterprise-grade **Feature Flag System**.

This document serves as the absolute standard of development. All automated systems, AI coding agents, and human engineers must adhere strictly to these patterns.

---

## 📁 2. Unified Enterprise Directory Structure

Below is the directory schema for StudyMate. This structure accommodates our new architectural layers, including the backend domain modules, background queues, and AI agent registry.

```bash
studymate/
├── docs/                           # 📂 Engineering Documentation Center
│   ├── README.md                   # System onboarding & local setup guide
│   ├── TECHNICAL_BLUEPRINT.md      # Master technical blueprints & security specs
│   ├── PRODUCT_ROADMAP.md          # Multi-year evolutionary product milestones
│   ├── DATABASE_DESIGN.md          # PostgreSQL schemas, constraints, & triggers
│   ├── API_SPECIFICATION.md        # RESTful contract definitions (Swagger/OpenAPI)
│   ├── CHANGELOG.md                # Conventional commits & version tracking
│   ├── CONTRIBUTING.md             # Code contribution & PR guidelines
│   └── AI_GUIDELINES.md            # LLM code-generation boundaries
│
├── design/                         # 📂 Product, Brand & UX Specifications
│   ├── BRAND_GUIDELINES.md         # Typographic scales, assets, and vector guides
│   ├── PRODUCT_REQUIREMENTS_DOCUMENT.md # Product features & scope definitions
│   ├── USER_FLOWS.md               # Visual mapping of core interaction states
│   ├── WIREFRAMES_AND_MOCKUPS.md   # Structural layouts & responsive rules
│   └── ENGINEERING_ARCHITECTURE_GUIDE.md # This guide (Master Architectural Spec)
│
├── src/                            # 📂 Client-Side Single Page Application (React)
│   ├── assets/                     # Static media & vector illustrations
│   │   └── images/                 # SVG icons & branded logos
│   ├── components/                 # Reusable React components
│   │   ├── common/                 # Inputs, buttons, skeletons, toast notifications
│   │   ├── layout/                 # Sidebars, bottom navigation, workspaces
│   │   └── features/               # High-cohesion business modules
│   │       ├── auth/               # Access forms & MFA triggers
│   │       ├── workspace/          # The StudyMate interactive workspace
│   │       ├── library/            # Syllabus and document ingestion interfaces
│   │       ├── tutor/              # Split-screen grounded chat & annotation bars
│   │       ├── quiz/               # Testing suites, timers, explanation cards
│   │       ├── flashcard/          # Spaced repetition flipping cards
│   │       ├── hub/                # GPA/CGPA calculations & records
│   │       └── stats/              # Weekly performance graphs & badges
│   ├── context/                    # Shared client state containers
│   │   ├── AuthContext.tsx         # OAuth sessions & identity tokens
│   │   ├── WorkspaceContext.tsx    # Active document, highlights, & notes state
│   │   └── FeatureFlagContext.tsx  # Frontend runtime feature flag mappings
│   ├── hooks/                      # Custom hooks
│   │   ├── useAudioSynth.ts        # Synthesized sound wave loops
│   │   ├── useSpacedRepetition.ts  # Client-side SM-2 priority sorting
│   │   └── useGroundedStream.ts    # Server-sent event (SSE) stream decoder
│   ├── services/                   # Client-side API gateways
│   │   ├── api.client.ts           # Centralized Axios wrapper
│   │   ├── auth.service.ts         # User session API requests
│   │   ├── ai.service.ts           # Generation endpoints (summaries, quizzes)
│   │   └── hub.service.ts          # Academic record uploads & predictions
│   ├── styles/                     # Visual design files
│   │   └── index.css               # Tailwind standard directives
│   ├── types/                      # Comprehensive typescript definitions
│   │   ├── auth.types.ts           # User schemas, security roles
│   │   ├── library.types.ts        # Ingested documents & annotations
│   │   └── performance.types.ts    # GPA, transcript metrics, courses
│   ├── utils/                      # Helper libraries
│   │   └── helpers.ts              # Formatting, validators, debouncers
│   ├── App.tsx                     # Main Router & view hub
│   └── main.tsx                    # DOM rendering bootstrap
│
├── server/                         # 📂 Server-Side API Engine (Node + Express)
│   ├── config/                     # Core server infrastructure configs
│   │   ├── db.ts                   # Supabase PostgreSQL client (Drizzle config)
│   │   ├── redis.ts                # Cache & background worker queue connections
│   │   └── environment.ts          # Strictly validated environment schema
│   ├── routes/                     # HTTP Endpoint Routing Declarations
│   │   ├── auth.routes.ts          # Route mapping (/api/v1/auth)
│   │   ├── library.routes.ts       # Document management (/api/v1/library)
│   │   ├── workspace.routes.ts     # Workspace annotations (/api/v1/workspace)
│   │   ├── ai.routes.ts            # Orchestrated generation (/api/v1/generate)
│   │   └── hub.routes.ts           # GPA tracking & records (/api/v1/hub)
│   ├── controllers/                # HTTP request validators & controllers
│   │   ├── auth.controller.ts      # Handles login, registration, password resets
│   │   ├── library.controller.ts   # Intercepts files, delegates to parsing queues
│   │   ├── ai.controller.ts        # Routes requests to the AI Orchestrator
│   │   └── hub.controller.ts       # Manages GPA entries & analytics
│   ├── middleware/                 # Request filtration pipelines
│   │   ├── auth.middleware.ts      # Bearer token decoding & RBAC checks
│   │   ├── limit.middleware.ts     # Rate-limit bounds per tier/IP
│   │   ├── flag.middleware.ts      # Feature-flag route interceptors
│   │   └── error.middleware.ts     # Global catch-all handler for JSON outputs
│   ├── services/                   # Business process coordinators
│   │   ├── auth.service.ts         # Handles session setups & verification tokens
│   │   ├── queue.service.ts        # Pushes asynchronous jobs to the task runner
│   │   └── ai-orchestrator.ts      # Routes tasks to specialized AI agents
│   ├── domain/                     # ⚙️ PURE DOMAIN LAYER (Zero Framework Coupling)
│   │   ├── index.ts                # Exports all domain functions
│   │   ├── gpa-calculator.ts       # Core logic for GPA, CGPA, and classifications
│   │   ├── repetition-engine.ts    # SuperMemo-2 (SM-2) spaced repetition logic
│   │   ├── xp-rewards.ts           # Gamification metrics & level triggers
│   │   ├── scheduler.ts            # Study session planner calculations
│   │   └── advisor-logic.ts        # Career recommendations decision matrices
│   ├── repositories/               # SQL Query & Mutation Interfaces (DAL)
│   │   ├── user.repository.ts      # Database operations on academic profiles
│   │   ├── document.repository.ts  # Database operations on chunks & files
│   │   └── stats.repository.ts     # Database operations on scores & metrics
│   ├── workers/                    # ⚙️ BACKGROUND JOB RUNNERS (BullMQ / Pg-Net)
│   │   ├── index.ts                # Orchestrator for all queue workers
│   │   ├── ocr.worker.ts           # Processes images and scans text
│   │   ├── parser.worker.ts        # Converts PDF/DOCX into semantic chunks
│   │   └── ai.worker.ts            # Executes prolonged Gemini generation requests
│   └── index.ts                    # Backend server entry point
│
├── scripts/                        # 📂 Pipeline scripts & seeders
├── package.json                    # Monorepo dependencies and build scripts
├── tsconfig.json                   # Strict TypeScript compiler rules
└── vite.config.ts                  # Vite compilation rules
```

---

## ⚙️ 3. Enhancement 1: Decoupled Domain Layer

To ensure long-term maintainability and bulletproof testability, StudyMate isolates all logical algorithms, business computations, and grading systems into a **Pure Domain Layer**.

```
[Routes] ──► [Controllers] ──► [Services] ──► [Domain Layer] ──► [Repositories]
                                                    │
                                           (Pure Business Logic)
                                           - No Express dependencies
                                           - No database clients
                                           - Highly Unit-Testable
```

### Responsibility of the Domain Layer:
The Domain Layer is the **conceptual heart** of the platform. It is strictly forbidden from importing packages like `express`, databases like `drizzle`, or libraries like `react`. It deals exclusively in plain, native TypeScript inputs and outputs. 

By separating business rules from infrastructure, we achieve several critical engineering benefits:
1. **Isolated Testing**: Writing unit tests for complex algorithms (like spaced repetition or CGPA computation) becomes trivial. There is no need to write mock databases, construct Express request objects, or spin up network test servers.
2. **Framework Agnosticism**: If StudyMate migrates from Express to NestJS, Fastify, or Serverless functions, the entire Domain Layer is copied over directly without rewriting a single calculation.
3. **Immutability & Determinism**: Inputs map directly to outputs. Given the same academic records, the GPA calculation returns the exact same score, guaranteed.

### Core Domain Modules & Algorithmic Rules:

#### A. Spaced Repetition Engine (`repetition-engine.ts`)
Implements the **SuperMemo-2 (SM-2) Spaced Repetition Algorithm** to schedule flashcard reviews:
- Calculates intervals (`interval`), repetition numbers (`reps`), and ease-factors (`efactor`) based on user-reported score (0 to 5):
  ```typescript
  export interface SpacedRepetitionItem {
    interval: number; // Days until next review
    reps: number;     // Consecutive successful reviews
    efactor: number;  // Ease factor (determines interval multiplier)
  }

  export function calculateSM2(
    quality: number, // User score: 0 (forgot) to 5 (perfect recall)
    prevReps: number,
    prevInterval: number,
    prevEfactor: number
  ): SpacedRepetitionItem {
    let reps = prevReps;
    let interval = prevInterval;
    let efactor = prevEfactor;

    if (quality >= 3) {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(prevInterval * efactor);
      }
      reps += 1;
    } else {
      reps = 0;
      interval = 1;
    }

    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (efactor < 1.3) efactor = 1.3;

    return { interval, reps, efactor };
  }
  ```

#### B. Academic GPA & CGPA Engine (`gpa-calculator.ts`)
Maintains unified rules for grade parsing, weight assignments, and credit calculations across multiple grading scales (e.g., US 4.0, UK Classifications, Nigeria 5.0):
- **GPA Calculation**: Multiplies grade points by credit units, divided by total credit units.
- **Academic Classification Rules**: Maps CGPA limits to honors:
  - US: `CGPA >= 3.8` (Summa Cum Laude), `CGPA >= 3.5` (Magna Cum Laude), etc.
  - UK: `CGPA >= 3.7` (First Class Honours), `CGPA >= 3.3` (Upper Second Class), etc.

#### C. Gamification & Progression Engine (`xp-rewards.ts`)
Decides exactly when a user levels up and when achievements unlock:
- **XP Calculation Rules**: Establishes point allocations:
  - Document upload and extraction: `15 XP`
  - High-score on a Quiz (>= 80%): `50 XP`
  - Daily active streak maintained: `20 XP`
- **Achievement Unlocking**: Matches user telemetry data (e.g., total study minutes, quiz scores) against achievement schemas to determine unlocks.

---

## 🤖 4. Enhancement 2: AI Orchestrator Subsystem

Rather than relying on a generic service that interacts randomly with LLM models, StudyMate deploys a structured **AI Orchestrator Engine**. This layer decouples the application from specific AI providers, transforming incoming educational tasks into specialized agent payloads.

```
                                  ┌──► [Chat Agent] (Conversational, Text Grounded)
                                  ├──► [Summary Agent] (Markdown Structured Notes)
                                  ├──► [Quiz Agent] (Multiple Choice Questions)
[Controllers] ──► [AI Orchestrator] ──► [Flashcard Agent] (Active Recall Decks)
                                  ├──► [Roadmap Agent] (Modular Career Milestones)
                                  └──► [Citation Agent] (Source Chunk Grounding)
```

### The AI Orchestrator Pattern:
The AI Orchestrator acts as a **smart gateway**. Controllers submit standard execution envelopes (e.g., "Generate a study guide for this parsed document"). The Orchestrator intercepts the request, selects the appropriate prompt templates, allocates the model (e.g., `gemini-2.5-pro` for deep analysis, or `gemini-2.5-flash` for high-speed streaming chat), and maps the output back to a uniform schema.

### Core Modular Agents:
1. **Summary Generator**: Extracts core concepts, keywords, and structural hierarchies from parsed chunks. Formats output as readable markdown with structured blocks.
2. **Quiz Generator**: Formats educational testing arrays (questions, choices, explanations) into strict, parseable JSON arrays, eliminating common API trailing-comma errors.
3. **Flashcard Generator**: Parses text blocks and constructs balanced front/back questions targeting high-impact definitions.
4. **Chat Agent**: A conversational bot with localized memory, handling grounded question-answering with safety guardrails.
5. **Citation Generator**: Cross-references user queries with specific index ranges in document chunks, generating bracketed inline citations (e.g., `[Page 4, Chunk 12]`).
6. **Roadmap Generator**: Takes selected careers or academic outcomes and structures step-by-step learning nodes, complete with recommended resource lists.

### Extensibility benefits of the AI Orchestrator:
- **Zero-Downtime Provider Swaps**: If we decide to migrate from the `@google/genai` SDK to an internal self-hosted LLM or other provider in the future, we only update the orchestrator adapter. The Express controllers, frontend services, and workspace tabs remain untouched.
- **Adaptive Slicing**: The orchestrator can dynamically slice large documents. If a PDF is too dense, it splits the document, triggers parallel summary agents, and coordinates a final summarization pass.

---

## ⚡ 5. Enhancement 3: Asynchronous Background Job System

Heavy operations like text extraction from large PDFs, vector embedding computations, or bulk quiz generation are too heavy to run synchronously within an HTTP request lifecycle. Doing so risks triggering server timeouts (e.g., Cloud Run's 60s/300s gateways) and creates a sluggish user experience.

StudyMate introduces a robust, non-blocking **Background Job Queue System** built on **Redis & BullMQ** (or Supabase’s PostgreSQL-native `pg_net` workers).

```
[Client Uploads File] ──► [Controller] ──► [Save DB Status: 'pending']
                                                  │
                                                  ├─► Push Job to Queue
                                                  ▼
[Client Receives HTTP 202 Accepted] ◄──────── [Queue Service]
                                                  │
                      ┌───────────────────────────┴───────────────────────────┐
                      ▼                                                       ▼
               [Parser Worker]                                          [AI Worker]
         (Converts PDF/DOCX to text)                             (Generates summaries)
                      │                                                       │
                      ▼                                                       ▼
         [Save Chunks to DB & Embed]                            [Save JSON & Emit SSE Notify]
```

### Queue Pipeline Mechanics:
1. **Immediate Ack**: When a user drags in a 200-page syllabus, the controller records a database record with a status of `processing` and immediately returns a `202 Accepted` response with a unique document ID. The UI remains fully interactive, showing a subtle progress card in the sidebar.
2. **Queue Offloading**: The document parsing job is pushed into the `document-processing-queue`.
3. **Worker Processing**: Background workers (running on separate container threads or serverless micro-instances) pick up the job, run the OCR or DOCX parsing libraries, split text into semantic chunks, and write them to the database.
4. **Active Notification**: Once completed, the worker updates the status in the database to `ready` and pushes a job to the `ai-generation-queue` to compile initial welcome packages (summaries and starters) asynchronously.
5. **SSE Push**: The backend emits a real-time Server-Sent Event (SSE) to the frontend workspace to transition the user's interface to "Compilation Complete".

---

## 🚩 6. Enhancement 4: Enterprise Feature Flag System

To enable safe trunk-based development and secure releases of advanced features, StudyMate integrates a strict **Feature Flag System**.

```
[Incoming Request] ──► [flag.middleware('voice-tutor')] ──► (Flag Enabled?)
                                                                  │
                                         ┌────────────────────────┴────────────────────────┐
                                         ▼ YES                                             ▼ NO
                               [Process Request]                             [HTTP 403 Forbidden]
                                                                             "Feature under development"
```

### Why Feature Flags Matter:
Feature flags separate code deployment from feature release. Incomplete or experimental modules (such as the *Academic Performance Hub* or the *Voice Tutor*) can be safely merged into `main` and compiled into production builds without exposing them to end-users.

### Implementation Matrix:
- **Database Schema**: A centralized `feature_flags` table is audited by the system admin:
  ```sql
  CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    rollout_percentage INT DEFAULT 0 NOT NULL, -- Supports Canary rollouts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  ```
- **Backend Protection Middleware**: Route decorators intercept requests targeting disabled features:
  ```typescript
  export function requireFeature(flagKey: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const isEnabled = await FeatureFlagService.check(flagKey, req.user?.id);
      if (!isEnabled) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FEATURE_DISABLED",
            message: "This feature is currently disabled or under development."
          }
        });
      }
      next();
    };
  }
  ```
- **Frontend Toggle Controls**: Custom React hooks conditionally render interactive elements:
  ```tsx
  const { isFeatureEnabled } = useFeatureFlags();

  return (
    <div>
      <Sidebar />
      {isFeatureEnabled("ai-chat") && <AIChatWidget />}
    </div>
  );
  ```

---

## 🎓 7. Enhancement 5: Unified StudyMate Workspace Philosophy

StudyMate represents a paradigm shift away from generic, message-box "AI wrappers". In traditional chatbots, learning is disorganized, requiring users to repeatedly copy-paste content into a prompt. 

The **StudyMate Workspace** is a unified, highly integrated educational environment designed specifically for the learning lifecycle.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               STUDYMATE WORKSPACE                               │
├───────────────────────────────────────┬─────────────────────────────────────────┤
│                                       │                                         │
│          A. LEARNING LIBRARY          │            B. ACTIVE WORKSPACE          │
│   ┌───────────────────────────────┐   │   ┌─────────────────────────────────┐   │
│   │ [Intro_To_Algorithms.pdf]     │   │   │       DOCUMENT READER / PDF     │   │
│   │ [Principles_Of_Marketing.docx]│   │   │ "Dynamic Programming is a method│   │
│   └───────────────────────────────┘   │   │  for solving complex problems..."│   │
│                                       │   │  [Highlight: Dynamic Program]   │   │
│          C. INTERACTIVE HUB           │   └─────────────────────────────────┘   │
│   ┌───────────────┬───────────────┐   │   ┌─────────────────────────────────┐   │
│   │   Flashcards  │    Quizzes    │   │   │          AI GROUNDED TUTOR      │   │
│   │   (SM-2 Deck) │   (Practice)  │   │   │ "Dynamic Programming breaks..." │   │
│   └───────────────┴───────────────┘   │   │ [Generate Quiz from Selection]  │   │
│                                       │   └─────────────────────────────────┘   │
└───────────────────────────────────────┴─────────────────────────────────────────┘
```

### Core Architecture of the Workspace:
The interface is split into a **Side-by-Side Unified Canvas**:
1. **Left Canvas (Ingested Sources)**: Hosts a rich document reader rendering PDFs, Markdown, and parsed syllabi. 
2. **Right Canvas (AI Tutor & Revision Studio)**: Contains three synchronized tabs:
   - **Grounded Chat**: Users query the document directly. Highlighting text in the Left Canvas auto-populates prompt inputs on the right (e.g., "Explain *Dynamic Programming* from this page").
   - **Flashcards Engine**: Active-recall flashcards generated directly from annotations or uploaded documents, tracked by the SM-2 algorithm.
   - **Quiz Engine**: Real-time evaluation tools with detailed answer explanations.
3. **Workspace Context**: Shared state coordinates user interactions. Highlighting a sentence in the PDF reader lets the user click `Create Flashcard` or `Save Annotation`, updating the document database with corresponding metadata.

This integrated workspace allows learners to interact with and absorb dense academic materials in an structured, active, and highly organized environment.

---

## 🚀 8. Enhancement 6: Updated Master Engineering Roadmap

The StudyMate release cycle is organized into **eight distinct phases**, allowing for thorough quality testing and architecture validation at every step.

```
[Phase 0] Planning ──► [Phase 1] Foundation ──► [Phase 2] Learning Engine ──► [Phase 3] Academic Hub
                                                                                   │
[Phase 7] Release ◄── [Phase 6] Business ◄── [Phase 5] Institutions ◄── [Phase 4] Collaboration
```

### Phase 0: Planning & Product Architecture (Completed)
- Create `/docs` directory layout and outline code and contribution guidelines.
- Design database architectures and establish the decoupled Domain Layer interface.
- Complete visual identity systems, wireframes, mockups, and layout guidelines.

### Phase 1: Foundation (In Progress / Next)
- **Supabase Core Integration**: Spin up development instances and establish database rules.
- **Relational Schemas**: Deploy migrations for schemas, including User Profiles, Settings, and Roles.
- **Identity & Access Management**: Secure registration paths with password cryptography and JWT setups.
- **Secure Storage**: Configure buckets with restricted row-level read permissions.

### Phase 2: Learning Engine
- **Document Processing**: Build the BullMQ / Queue background worker systems to handle DOCX/PDF text extractions.
- **AI Orchestrator**: Implement the Gemini SDK adapters and configure structured prompts.
- **Study Materials Compilation**: Build the SM-2 flashcard deck modules, quiz generators, and summaries.
- **Grounded Chat**: Deploy the citation parser and implement Server-Sent Events (SSE) for streaming assistant replies.

### Phase 3: Academic Hub
- **GPA / CGPA Calculators**: Integrate the core calculation engines and academic classification rules.
- **Student Records System**: Build the record schemas, sessions, semesters, and course metrics.
- **Academic Predictors**: Implement progress trackers and grade predictors based on current averages.
- **Data Portability**: Implement standard CSV, PDF, and transcript exports.

### Phase 4: Collaboration
- **Study Groups**: Create private and public revision workspaces.
- **Shared Libraries**: Enable study groups to share syllabus repositories, mock quiz sets, and flashcard decks.
- **Peer Grading**: Build feedback modules and discussion panels for custom quizzes.

### Phase 5: Institutions
- **Multi-Tenant Setup**: Create support for Universities, faculties, and academic departments.
- **Lecturer Portals**: Implement administration dashboards to let professors upload official syllabi, track student engagement, and distribute homework assignments.
- **Integration Layer**: Configure external SSO and LMS hooks (Canvas, Blackboard).

### Phase 6: Business
- **Billing Engine**: Integrate Stripe checkout workflows.
- **Licensing Core**: Build enterprise access managers for university-wide subscriptions and volume discounts.
- **Billing Middleware**: Set up billing walls to manage premium access plans.

### Phase 7: Public Release (StudyMate v1.0)
- **Edge Performance Optimization**: Configure global CDN caches and implement load-balancing configurations.
- **Comprehensive Audit**: Run security tests, verify data isolation policies, and perform scaling dry-runs.
- **v1.0.0 Production Release**: Direct public DNS traffic to production servers.

---

## 🏆 9. Architecture Approval Summary & Next Steps

This complete v2.0.0 architecture has been audited and approved. The engineering specifications provide the strict structure required for StudyMate to scale from a single-user prototype into a highly performant, multi-tenant academic platform.

### Next Step Priorities (Phase 1: Foundation):
To kick off Phase 1 development safely, engineers should implement the following steps:
1. **Initialize Supabase Schemas**: Write the corresponding PostgreSQL DDL files inside migrations directories.
2. **Setup DB Rules & Policies**: Apply active Row-Level Security (RLS) rules to secure all tables.
3. **Register Auth Handlers**: Implement standard user schemas, password hashing services, and verification flows in `/server`.
4. **Deploy Secure Media Storage Buckets**: Configure storage bucket access profiles to protect uploaded files.
