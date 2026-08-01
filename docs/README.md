# StudyMate Engineering Documentation Center

Welcome to the **StudyMate Engineering Documentation Center**. This directory serves as the permanent, single source of truth for StudyMate's architecture, APIs, database designs, security policies, and deployment configurations.

---

## 👁️ Project Vision & Mission

### Vision
To build an intelligent, universal learning personalization engine that turns passive reading into active, lifelong comprehension. StudyMate aims to dismantle traditional "rote learning" barriers by synthesizing personalized revision guides, custom multiple-choice quizzes, dynamic flashcards, and interactive chat tutors on-the-fly.

### Mission
Empower students, educators, and working professionals to achieve mastery in any academic or specialized discipline by providing:
1. **Adaptive Personalization**: AI-tailored academic welcome packets and learning paths unique to each user's background, role, and learning style.
2. **Instant Active Recall**: Automation of revision suites (summaries, quizzes, and flashcards) derived directly from uploaded learning materials.
3. **Immersive AI Instruction**: Context-grounded chat and research tools to answer advanced domain questions without leaving the workspace.

---

## 🛠️ Technology Stack

StudyMate is a modern full-stack application leveraging high-performance, developer-friendly technologies:

| Layer | Technology | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ (with Vite) | Client-side reactive interface and Single Page Application (SPA) routing. |
| **Backend Framework** | Node.js with Express | API routing, file extraction pipelines, and security controls. |
| **Language** | TypeScript | Strong typing across client and server boundaries to prevent runtime issues. |
| **Styling** | Tailwind CSS | Utility-first responsive design, theme tokenization, and rapid UI development. |
| **Animations** | Framer Motion (`motion/react`) | Fluid visual transitions, layout morphing, and interactive micro-animations. |
| **AI Integration** | `@google/genai` (TypeScript SDK) | Accessing Gemini models (`gemini-2.5-flash` or `gemini-3.5-flash`) with structured JSON schema responses. |
| **File Extraction** | `pdf-parse` & `mammoth` | Extraction of plain text from PDFs and Microsoft Word (.docx) documents. |

---

## 🏗️ Architecture Overview

StudyMate operates as a **unified, full-stack Monolith** in its current development phase:

1. **Client (SPA)**: Serves a high-fidelity dashboard enabling file uploads, interactive revision cards, quiz dashboards, and real-time chat.
2. **API Proxy Layer (Express)**: Exposes endpoints for authentication, file parsing, and AI synthesis. It holds the private `GEMINI_API_KEY` on the server-side to ensure api-key security.
3. **Local volatile cache**: Uses localized JSON files stored in `/tmp` to mock storage for user profiles, synced metadata, parsed documents, and analytics.

---

## 📂 Project Folder Structure

```bash
studymate/
├── docs/                     # 📂 Engineering Documentation Center (This folder)
│   ├── README.md             # Main overview & quick start
│   ├── TECHNICAL_BLUEPRINT.md# Master architectural specification & audit
│   ├── PRODUCT_ROADMAP.md    # Milestones & features progression
│   ├── DATABASE_DESIGN.md    # Schema definitions & migrations guide
│   ├── API_SPECIFICATION.md  # Request/Response contracts & API specs
│   ├── SECURITY_POLICY.md    # Identity, encryption, & defensive guidelines
│   ├── DEPLOYMENT_GUIDE.md   # Deployment, CI/CD, & env blueprints
│   ├── CHANGELOG.md          # Semantic versioning history
│   ├── CONTRIBUTING.md       # Naming, PR, & styling guidelines
│   └── AI_GUIDELINES.md      # Rules for AI Studio assisting agents
├── src/                      # 📂 Frontend React Application
│   ├── components/           # UI Views (AuthPortal, Dashboard, WelcomeScreen, etc.)
│   ├── types.ts              # Shared TypeScript definitions
│   ├── main.tsx              # React bootstrap entry point
│   └── index.css             # Tailwind imports & theme tokens
├── server.ts                 # 📂 Express API Backend & Vite dev server
├── package.json              # App scripts and package dependencies
├── vite.config.ts            # Vite bundler configuration
└── tsconfig.json             # TypeScript compiler rules
```

---

## ⚡ Development Setup & Workflow

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **NPM**: `v9.x` or higher

### 2. Environment Variables
Create a `.env` file at the root of the project:
```env
# Server Configuration
PORT=3000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Quick Start Commands
```bash
# Install dependencies
npm install

# Run application in active development mode (Vite dev + Express server)
npm run dev

# Run TypeScript type compiler validation & linting
npm run lint

# Build production assets
npm run build

# Start production server
npm run start
```

---

## 🚀 Deployment Overview
Currently, StudyMate is structured to compile client-side bundles into static assets inside `dist/`, which are then served as static files by Express in production mode. The entire system is packaged as a lightweight Docker container, ideal for serverless containers such as **Google Cloud Run**.

---

*This directory serves as a living, breathing documentation hub. Every major architectural decision, API schema change, or security measure must be updated here before merging into main.*
