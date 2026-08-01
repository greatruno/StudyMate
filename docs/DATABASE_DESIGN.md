# StudyMate Database Design Specification

This document defines the production database schema for StudyMate. Moving from volatile file-system JSON stores (`/tmp`) to a structured, relational PostgreSQL database (managed by Cloud SQL and mapped via Drizzle ORM) will resolve data loss issues and support high concurrency.

---

## 🗺️ Entity Relationship (ER) Diagram
The following relational diagram maps the database entities and foreign-key constraints:

```
  ┌──────────────────┐               ┌──────────────────┐
  │      users       │               │    documents     │
  ├──────────────────┤               ├──────────────────┤
  │ id (PK)          │1             *│ id (PK)          │
  │ username         ├──────────────>│ user_id (FK)     │
  │ email            │               │ title            │
  │ password_hash    │               │ full_text        │
  │ subscription     │               │ uploaded_at      │
  │ role             │               └────────┬─────────┘
  │ academic_profile │                        │ 1
  └────────┬─────────┘                        │
           │ 1                                │ *
           │                                  ▼
           │                         ┌──────────────────┐
           │ *                       │   study_suites   │
           ├────────────────────────>│ (Summaries,      │
           │                         │  Quizzes, Decks) │
           │ 1                       └──────────────────┘
           │
           ▼
  ┌──────────────────┐
  │  chat_messages   │
  ├──────────────────┤
  │ id (PK)          │
  │ user_id (FK)     │
  │ message_text     │
  │ sender (user/ai) │
  │ timestamp        │
  └──────────────────┘
```

---

## 🗄️ Relational Table Definitions

### 1. `users` Table
Stores primary identity and academic configurations.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `VARCHAR` | `PRIMARY KEY`, Default UUID | Unique user identifier. |
| `username` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Lowercase alphanumeric username. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Securely hashed password (e.g., Bcrypt). |
| `display_name` | `VARCHAR(100)` | `NOT NULL` | User-facing nickname. |
| `avatar_emoji` | `VARCHAR(10)` | Default `"🎓"` | Chosen profile graphic icon. |
| `role` | `VARCHAR(20)` | Default `"student"` | e.g., `"student"`, `"educator"`, `"expert"`. |
| `subscription` | `VARCHAR(20)` | Default `"free"` | e.g., `"free"`, `"premium"`, `"institution"`. |
| `target_grade` | `VARCHAR(10)` | Default `"A+"` | Target milestone grade. |
| `study_goal_hours`| `INTEGER` | Default `5` | Weekly study goal hours. |
| `academic_profile`| `JSONB` | `NULLABLE` | Custom Profile metadata (goals, styles, category). |
| `created_at` | `TIMESTAMP` | Default `NOW()` | Registration timestamp. |
| `updated_at` | `TIMESTAMP` | Default `NOW()` | Profile change timestamp. |

---

### 2. `documents` Table
Stores parsed document texts, indexing them under users.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `VARCHAR` | `PRIMARY KEY`, Default UUID | Unique document identifier. |
| `user_id` | `UUID` / `VARCHAR` | `FOREIGN KEY` (References `users.id`), `ON DELETE CASCADE` | Owner profile link. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Document filename or customized title. |
| `full_text` | `TEXT` | `NOT NULL` | Extracted raw textual body of the document. |
| `word_count` | `INTEGER` | `NOT NULL` | Pre-calculated word count. |
| `subject` | `VARCHAR(100)` | Default `"General"` | Categorization subject metadata. |
| `uploaded_at` | `TIMESTAMP` | Default `NOW()` | Time of ingestion. |

---

### 3. `study_suites` Table
Stores derived summary notes, quiz records, and flashcards, linking directly back to the original source document.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `VARCHAR` | `PRIMARY KEY`, Default UUID | Unique suite identifier. |
| `document_id` | `UUID` / `VARCHAR` | `FOREIGN KEY` (References `documents.id`), `ON DELETE CASCADE` | Associated document link. |
| `summary` | `JSONB` | `NOT NULL` | Structured AI summary payload. |
| `quiz` | `JSONB` | `NOT NULL` | Structured 4-option questions array. |
| `flashcards` | `JSONB` | `NOT NULL` | Structured flashcard Q&A objects array. |
| `created_at` | `TIMESTAMP` | Default `NOW()` | Synthesis timestamp. |

---

### 4. `chat_messages` Table
Tracks user-ai chat conversations, decoupling chats from user profile documents.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `VARCHAR` | `PRIMARY KEY`, Default UUID | Unique message identifier. |
| `user_id` | `UUID` / `VARCHAR` | `FOREIGN KEY` (References `users.id`), `ON DELETE CASCADE` | Associated learner. |
| `document_id` | `UUID` / `VARCHAR` | `FOREIGN KEY` (References `documents.id`), `NULLABLE` | Source document boundary. |
| `role` | `VARCHAR(20)` | `NOT NULL` | `"user"` or `"assistant"`. |
| `content` | `TEXT` | `NOT NULL` | Text body of the chat exchange. |
| `timestamp` | `TIMESTAMP` | Default `NOW()` | Creation time. |

---

### 5. `user_stats` Table
Tracks progress telemetry separately, avoiding heavy index locking.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` / `VARCHAR` | `PRIMARY KEY`, `FOREIGN KEY` (References `users.id`), `ON DELETE CASCADE` | Associated user. |
| `quizzes_taken` | `INTEGER` | Default `0` | Total attempted quizzes. |
| `avg_quiz_score` | `FLOAT` | Default `0.0` | Accumulated average test score. |
| `flashcards_mastered`| `INTEGER` | Default `0` | Marked memorized cards. |
| `study_time_mins`| `INTEGER` | Default `0` | Accumulated active learning time. |
| `daily_streak` | `INTEGER` | Default `1` | Sequential log streak counter. |
| `weekly_progress`| `JSONB` | `NOT NULL` | Custom chart payload tracking mon-sun minutes. |
| `achievements` | `JSONB` | `NOT NULL` | List of unlocked awards metadata. |

---

## 📈 Indexing Strategy
To optimize database performance under concurrent production traffic, we establish database indexes:
1. **User Lookup Index**: Index `users(username)` and `users(email)` to guarantee sub-millisecond logins.
2. **Foreign-Key Indexes**: Create indices on foreign fields: `documents(user_id)`, `study_suites(document_id)`, and `chat_messages(user_id)` to speed up multi-table queries.
3. **Compound Indexes**: Create a compound index on `chat_messages(user_id, timestamp)` to speed up chat logs retrieval.

---

## 🔄 Schema Migration Plan
- **Migration Engine**: Drizzle Kit.
- **Drizzle Config**: Schema definitions live inside `src/db/schema.ts`, and migration states are recorded inside `drizzle.config.ts`.
- **Migration Deployment**: Migration SQL scripts are generated via `npm run db:generate` and executed via `npm run db:push` in production pipelines before startup.
