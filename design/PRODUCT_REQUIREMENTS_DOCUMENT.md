# Product Requirements Document (PRD)

## Project Name: StudyMate
**Author**: Product Management Team  
**Status**: Draft  
**Version**: 1.0  

---

## 🎯 Executive Summary & Objectives

### Problem Statement
Students and professionals struggle to convert dense text documents (lecture notes, textbooks, scientific research papers) into active learning resources. Standard reading is passive and inefficient, leading to poor retention. Manually writing summaries, drafting test questions, and building revision cards is time-consuming.

### Product Solution
StudyMate is an interactive AI-powered revision environment. It takes files, extracts their text, and instantly generates structured study guides, customized multiple-choice tests, and active-recall flashcard decks. A context-grounded AI chat tutor is built-in to let users query their documents directly.

---

## 👥 Target Personas

### 1. "Alex the Crammer" (University Student)
- **Background**: Pre-med or Computer Science major with massive reading lists.
- **Pain Points**: Lacks time to make flashcards manually before exams; feels overwhelmed by dense material.
- **Goals**: Instantly upload lecture notes to compile multiple-choice mock exams to identify gaps in understanding.

### 2. "Sarah the Career Pivot" (Working Professional)
- **Background**: Software engineer or financial analyst studying for industry certifications.
- **Pain Points**: Busy schedule leaves limited time for active study; needs to quickly master new definitions.
- **Goals**: Access pre-compiled or custom study decks on mobile during breaks, and use an AI tutor to explain complex topics.

---

## ⚙️ Core Product Features (MVP Scope)

### 1. Document Ingestion & Parsing
- Drag-and-drop support for PDF, DOCX, TXT, and Markdown files.
- Visual extraction feedback and loading indicators.
- Text segmentation (chunking) for handling large files safely.

### 2. Personalized Onboarding
- Select primary academic category and subject (90+ disciplines grouped into 15 categories).
- Adapt the workspace with custom starter topics and recommended learning paths based on chosen subjects.

### 3. AI Study Suite Generation
- **Summary**: Key concepts, terms, definitions, and detailed section bullet points.
- **Quiz**: Multiple-choice testing with real-time feedback, grading, and correct answer explanations.
- **Flashcards**: Interactive front/back review cards with progress tracking and cards-mastered metrics.

### 4. Interactive Chat Tutor
- Text-grounded chatbot anchored on the user's uploaded document context.
- Inline source citations to show exactly where the answers came from.

### 5. Learning Statistics Dashboard
- Track study time, streak counts, quizzes taken, and average score metrics.
- Display weekly progress charts (Mon-Sun active minutes).

---

## ⚠️ Key Non-Functional Requirements & Constraints

1. **Low Latency**: AI generation operations (summaries, quizzes, flashcards) must provide progress indicators to keep the perceived wait under 15 seconds.
2. **Security**: Private keys (such as `GEMINI_API_KEY`) must remain on the server-side. No API keys should be exposed to client inspect tools.
3. **Accessibility (a11y)**: Text contrast must meet WCAG AA standards. The UI must support keyboard navigation and include descriptive image text labels.
4. **Mobile Responsiveness**: The application layout must adapt seamlessly to touch screens down to 320px width, using standard minimum touch targets of 44px.
