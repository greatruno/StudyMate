# StudyMate Product Roadmap

This document outlines the evolutionary milestones of StudyMate, charting our progress from a rapid AI Studio prototype to a mature, scalable, production-grade academic ecosystem.

---

## 🗺️ Milestone Summary

```
   🏆 Phase 1 [COMPLETED]      ⚡ Phase 2 [ACTIVE]         🛡️ Phase 3 [UPCOMING]       🌐 Phase 4 [FUTURE]
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  • Core UI Layout      │  │  • Academic Profile    │  │  • Firestore/SQL Migr. │  │  • Collaborative Deck  │
│  • AI Revision Suite   │  │  • Adaptive Onboarding │  │  • Firebase Auth       │  │  • Offline Mobile App  │
│  • File Text Parsers   │  │  • Workspace Welcomes  │  │  • Cloud File Storage  │  │  • LMS Sync (Canvas)   │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

## ✅ Phase 1: Interactive Prototype (Completed)
*Goal: Establish baseline study workspace capabilities and demonstrate generative active-recall structures.*

- **Interactive Core Dashboard**: Implemented standard layout with home, upload, chat, and telemetry statistics trackers.
- **Active Recall Generator**: Connected Gemini AI pipeline to synthesize comprehensive study notes, structured 4-option multiple choice tests, and electronic review flashcards.
- **Document Extractors**: Integrated backend PDF and Microsoft Word file-parsers to ingest learning notes.
- **Volatile Mock Backend**: Constructed local `/tmp` file-system storage mock to support prototype testing of registration, logins, and settings.

---

## ⚡ Phase 2: Adaptive Onboarding & Personalization (Active)
*Goal: Dynamically tailor the learning experience based on user discipline, learning style, and academic profiles.*

- **Multi-Discipline Profile Builder**: Created an exhaustive academic picker grouping 90+ subjects across 15 high-level academic fields during user onboarding.
- **Custom Discipline Fallbacks**: Implemented specify-fields (`Other`) input to support rare fields of study (e.g., Space Medicine, Astrobiology).
- **Discipline-Specific Welcome Packets**: Wired Express API with specialized Gemini prompt templates to structure personalized greetings, starter modules, target objectives, and step-by-step pathways tailored to the user's specific discipline.
- **Instant Study Starters**: Formed clickable mock revision decks allowing users to explore the study ecosystem immediately without manual document uploads.
- **Engineering Documentation Center**: Established a rigorous, standardized documentation directory (`/docs`) to guide production scaling and preserve core architectural decisions.

---

## 🛡️ Phase 3: Production Hardening & Cloud Persistence (Upcoming)
*Goal: Migrate StudyMate to serverless cloud infrastructure to handle high concurrent user traffic.*

- **Durable Database Transition**: Replace file-system JSON writes in `/tmp` with persistent Google Cloud Firestore or Cloud SQL (PostgreSQL).
- **Secure Password Hashing**: Integrate industry-standard Firebase Authentication or Node-bcrypt to safely encrypt user passwords.
- **Stateless Authentication**: Implement secure JWT bearer verification, eliminating local profile storage risks.
- **Cloud Blob Storage**: Redirect document file uploads to Google Cloud Storage (GCS) buckets with structured URL references.
- **Partial Synchronization**: Deprecate monolithic sync payloads, implementing specific RESTful micro-endpoints for chats, stats, and documents.

---

## 🌐 Phase 4: Collaborative Ecosystem & LMS Integration (Long-term Vision)
*Goal: Transition StudyMate from a single-user companion into a collaborative educational community.*

- **Collaborative Decks**: Allow peers, study groups, and instructors to publish, comment on, and share custom flashcard decks and quiz banks.
- **Learning Management System (LMS) Integration**: Implement LTI (Learning Tools Interoperability) integration to sync StudyMate grades, achievements, and statistics directly with Canvas, Blackboard, and Google Classroom.
- **Offline Workspace Sync**: Publish progressive web app (PWA) and offline-first mobile clients utilizing client-side SQLite/IndexedDB syncing for active recall on-the-go.
- **Enterprise Cohort Portals**: Provide administrators and institutions with advanced analytics to monitor student engagement and identify struggling cohorts.
