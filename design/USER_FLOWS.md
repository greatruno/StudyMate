# StudyMate User Flow Specifications

This document outlines the core user interaction pathways and system actions for the StudyMate application, detailing how users navigate through key experiences.

---

## 🧭 Onboarding & On-First-Load Flow
This flow maps a user's initial onboarding and setup journey.

```
  [ New User / Registration Form ]
                 │
                 ▼
     [ Step 1: Account Creation ]
 (Username, Email, Plain-text Password)
                 │
                 ▼
    [ Step 2: Onboarding Survey ]
(Primary Academic Category, Subject Selection)
                 │
                 ▼
     [ Step 3: Profile Assembly ]
  (Database stores profile definitions)
                 │
                 ▼
   [ WelcomeScreen / Personalized Home ]
 - AI-generated personal greeting card
 - Personalized starters & recommended paths
 - Interactive topics curated for the subject
```

1. **Trigger**: User loads StudyMate and clicks "Register" or completes the onboarding questions.
2. **System Action**: Server writes the user's details and chosen discipline (e.g., Computer Science, Biochemistry) to a profile file or database record.
3. **Outcome**: The `WelcomeScreen` displays personalized starter topics, goals, and customized learning milestones based on the profile.

---

## 📂 Document Upload & Analysis Flow
How raw documents are ingested and compiled into active learning suites.

```
  [ Dashboard / Upload Tab ]
             │
             ├─► [ Drag & Drop File ] (PDF, DOCX, TXT)
             └─► [ Select File from Computer ]
             │
             ▼
  [ Client Triggers Extraction ]
 (Word extraction or PDF page parser)
             │
             ▼
   [ Server Parser Endpoint ]
 (Text extracted & split into semantic chunks)
             │
             ▼
  [ Parallel AI Generation Requests ]
 ┌───────────┼───────────┐
 ▼           ▼           ▼
[Summary]  [Quiz]   [Flashcards]
(Gemini)  (Gemini)   (Gemini)
 └───────────┼───────────┘
             ▼
[ Document JSON Saved & Cached ]
             │
             ▼
[ Redirect to Home / Active Revision View ]
```

1. **Trigger**: User drags a PDF or DOCX into the upload dropzone.
2. **System Action**: 
   - Client sends file binary to `/api/parse-document`.
   - Server processes the file, splits the text into semantic chunks, and responds with a document ID.
   - Client sequentially (or in parallel) triggers `/api/generate/summary`, `/api/generate/quiz`, and `/api/generate/flashcards` to populate the study suite.
3. **Outcome**: The study materials are generated, and the user is redirected to the home dashboard to start studying.

---

## 🔁 Active Recall & Study Loop Flow
How users practice with generated revision tools and update their learning analytics.

```
    [ Active Document Selection ]
                 │
                 ▼
   [ Study Suite Dashboard Tabs ]
 ┌───────────────┼───────────────┐
 ▼               ▼               ▼
[Summary Tab] [Quiz Tab] [Flashcards Tab]
  Read Core     Take Test     Flip Cards
  Concepts      (4-Options)   & Mark Met
                 │               │
                 ▼               ▼
       [ Log Event / Update User Stats ]
- Complete a Quiz ────► Update average score, increase test count
- Flashcards Flipping ─► Increment mastered metrics
- Active Screen Time ──► Increment study minutes tracking
                 │
                 ▼
     [ Live Analytics Updated ]
```

1. **User Action**: User selects a topic, clicks "Take Quiz" or flips "Flashcards".
2. **System Action**: On quiz submission or flashcard mastery, the client logs progress, updates state, and syncs the new stats (study minutes, scores) to the server.
3. **Outcome**: The stats dashboard reflects updated weekly progress charts, daily streaks, and unlocked achievement badges.
