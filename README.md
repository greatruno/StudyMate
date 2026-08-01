# StudyMate v1.0 — Intelligent Academic & Institutional Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/studymate/studymate)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/studymate/studymate/actions)
[![Coverage](https://img.shields.io/badge/coverage-94.18%25-success.svg)](docs/PERFORMANCE_REPORT.md)

StudyMate is an all-in-one academic intelligence, learning personalization, and institutional management platform built with React 18, Express, TypeScript, and Google Gemini 3.5 Flash.

---

## 🌟 Key Features

- 🎓 **Academic Infrastructure**: University catalog, Faculties, Schools, Departments, Programmes, Semesters, Course Registration, Transcripts, and Weighted GPA/CGPA Engine.
- 👨‍🏫 **Lecturer & Admin Portals**: Course creation, digital attendance registers, online examination engine, grade curves, and diagnostic at-risk student alerting.
- 🧠 **AI Learning Engine**: RAG document parser (.pdf, .docx, .pptx, .txt), AI Summaries, Adaptive Quizzes, Active Recall Flashcards, and Research Integrity Check.
- 🤝 **Real-Time Collaboration**: Collaborative Study Groups, Live Whiteboard, Shared Note Pads, Discussion Boards, and Classroom Hub.
- 🛡️ **Production Engineering**: Sliding-window Rate Limiting, Security Headers, Structured Logging, Correlation Tracing, OpenAPI 3.0 Docs, and Automated Test Suite.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Execution
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Environment Setup
cp .env.example .env

# 3. Start Development Server (Express + Vite)
npm run dev
# Access preview at http://localhost:3000

# 4. Run Automated Test Suite
npm run test

# 5. Run Pre-Release Check & Production Build
npm run verify:all
```

---

## 📚 API & Engineering Documentation

- [OpenAPI Specification](docs/openapi.json) — Full API Schema
- [Interactive Swagger UI](http://localhost:3000/api/docs) — Accessible when server is running
- [Architecture Blueprint](docs/TECHNICAL_BLUEPRINT.md) — Architectural Specifications
- [Performance Engineering Report](docs/PERFORMANCE_REPORT.md) — Benchmarks & Indexing
- [Security Checklist](docs/SECURITY_CHECKLIST.md) — Hardening & Controls
- [Deployment Workflow](docs/DEPLOYMENT_WORKFLOW.md) — Cloud Run & Container Pipeline
- [v1.0 Release Sign-Off](docs/V1_RELEASE_CHECKLIST.md) — Production Release Status

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for details.
