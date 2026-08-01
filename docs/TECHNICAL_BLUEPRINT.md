# StudyMate Technical Blueprint & Architectural Audit

This document serves as the master architectural specification and audit log for StudyMate. Below is the complete assessment of the current state architecture (Version 0.1) and the designated blueprints for migrating to a production-ready system capable of serving thousands of concurrent users securely.

---

## 🔍 Master Architectural Audit (Current State v0.1)

### 1. Current Authentication System
- **Implementation**: The authentication system is split between client-side handling and server-side matching.
- **Client Side**: On registration/login, the client saves the entire raw user profile object into `localStorage` (key: `studymate_active_user_v1`). To determine if a user is logged in, the app checks for the existence of this key.
- **Server Side**: The server exposes `/api/auth/register`, `/api/auth/login`, and `/api/auth/sync-userdata` POST endpoints. Users are authenticated by checking incoming usernames against matching JSON files.

### 2. Current Database & Storage Mechanism
- **Implementation**: Completely file-system based, using local file storage.
- **File System Paths**:
  - User accounts and metadata: `/tmp/study_mate_users/[cleanUsername].json`
  - Platform analytics records: `/tmp/study_mate_platform_analytics.json`
  - Processed and parsed study material chunks: `/tmp/study_mate_docs/[cleanUsername]/[documentId].json`
- **Volatile Nature**: Because these folders are initialized inside `/tmp`, all stored accounts, documents, chats, and analytic metrics are completely volatile. If the server scales to zero, restarts, or transitions between containers (such as in Cloud Run environments), **all data is wiped**.

### 3. User Account Persistence
- **State Merging**: The application utilizes a "synchronize on action" paradigm. Any client-side state changes (reading a document, completing a quiz, updating study minutes, adding chat messages) trigger a POST request to `/api/auth/sync-userdata` sending the entire, updated client-side user object to overwrite the server-side JSON file.
- **Multi-device Conflicts**: There is no conflict resolution or partial updates. Simultaneous changes from two browser tabs will result in the last writer overwriting other updates.

### 4. Password Storage & Hashing Status
- **Current Security State**: **CRITICAL VULNERABILITY**.
- **No Hashing**: Passwords are transmitted, matched, and stored in **plain, unhashed text**. 
- **Storage Field**: Inside `/tmp/study_mate_users/[cleanUsername].json`, passwords are saved inside the `passwordHash` attribute exactly as typed (e.g., `"passwordHash": "MySecretPassword123"`). No encryption keys, salts, or hashing algorithms (like Bcrypt, Argon2, or PBKDF2) are implemented.

### 5. Session Management Implementation
- **Status**: Non-existent.
- **No Tokenization**: The server does not issue cookies, session IDs, or JSON Web Tokens (JWT) upon login.
- **Security Implications**: The `/api/auth/sync-userdata` endpoint has no header-based or cookie-based bearer verification. It trusts the `username` sent in the request body, allowing arbitrary access and manipulation of any user profile by simply guessing or typing their username.

### 6. File Upload Storage
- **Processing Flow**:
  1. The browser uploads a document's raw text (or content parsed client-side/server-side).
  2. The server extracts text using `mammoth` or `pdf-parse`.
  3. The raw, parsed text is split into semantic blocks via `chunkText()`.
  4. The chunks and full text are stored in a processed document JSON object.
- **Storage Medium**: Saved as file-system JSON in `/tmp/study_mate_docs/`. The actual binary file is discarded; only the extracted text is persisted in volatile directories.

### 7. AI Conversation Storage
- **Structure**: Monolithic.
- **Storage Location**: Chat sessions are stored inside the `chatHistories` object nested directly inside the user profile JSON.
- **Vulnerability**: Every time a user sends a message, the client updates its internal chat history and syncs the entire user object (with all historical chat messages, stats, documents, and summaries) back to the server in a single, massive API payload.

### 8. API Endpoints Overview
The Express monolithic backend exposes the following endpoints:

| Endpoint | Method | Payload Size Limit | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | 25MB | Creates and saves a new user JSON in volatile `/tmp` |
| `/api/auth/login` | `POST` | 25MB | Verifies plain-text passwords against JSON archives |
| `/api/auth/sync-userdata` | `POST` | 25MB | Syncs monolithic user profiles to server filesystem |
| `/api/parse-document` | `POST` | 25MB | Extracts text from PDF/Word and caches chunks in `/tmp` |
| `/api/generate/summary` | `POST` | 25MB | Invokes Gemini to structure detailed summary sections |
| `/api/generate/quiz` | `POST` | 25MB | Generates active-recall multiple choice questions via Gemini |
| `/api/generate/flashcards` | `POST` | 25MB | Synthesizes interactive study deck cards via Gemini |
| `/api/generate/academic-welcome` | `POST` | 25MB | Synthesizes customized academic workspace topics |
| `/api/generate/chat` | `POST` | 25MB | Manages context-grounded conversation with prompt history |
| `/api/platform/analytics` | `GET` | N/A | Exposes platform telemetry stats |

### 9. Frameworks & Foundations
- **Backend**: Express on Node.js. Runs dynamically via `tsx` (TypeScript Execute) in development. Bundled to CommonJS (.cjs) in production via `esbuild`.
- **Frontend**: React 18+ powered by Vite. Styling is written natively with Tailwind CSS utilities. Icons are handled solely by `lucide-react`.

### 10. Existing Security Measures
- Alphanumeric validation regex on registration usernames.
- Standard CORS/routing containment of the dev server.
- Server-side environment isolation of the `GEMINI_API_KEY` (preventing exposure to client-side inspect tools).

### 11. Core Scalability Bottlenecks
1. **Volatile Directory Crash**: `/tmp` is wiped on container reboot or scaling events.
2. **Horizontal Scaling Blockers**: Local file writes prevent multi-instance setups; instance A cannot see files written on instance B.
3. **Payload Bloat**: Syncing monolithic user objects (nested chats, summaries, and stats) over `/api/auth/sync-userdata` increases bandwidth usage and network overhead with every study action.
4. **Synchronous File I/O**: High volume of synchronous disk operations (`fs.writeFileSync`, `fs.readFileSync`) blocks the single-threaded Node event loop under load.
5. **No Database Indexing**: User lookup loops through all files inside `/tmp` on login, introducing linear delay $O(n)$ relative to registered users.

---

## 🏗️ Production-Ready Migration Roadmap (Recommendations)

To scale StudyMate to thousands of concurrent users safely and robustly, we recommend migrating the application layers systematically:

```
                  ┌─────────────────────────────────────────┐
                  │          React Frontend Client          │
                  └────────────────────┬────────────────────┘
                                       │ Secure HTTPS/WSS
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Stateless Express API Layer       │
                  └─────────┬──────────────┬──────────────┬─┘
                            │              │              │
       JWT Verification     │              │ SQL Queries  │  Blob Uploads
                            ▼              ▼              ▼
                    ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
                    │ Firebase     │ │ Cloud SQL   │ │ Cloud       │
                    │ Auth / OAuth │ │ PostgreSQL  │ │ Storage     │
                    └──────────────┘ └─────────────┘ └─────────────┘
```

### Layer 1: Authentication & Identity Management
- **Action**: Replace the custom, plain-text login system.
- **Recommendation**: Integrate **Firebase Authentication** or **OAuth 2.0 Identity Server**.
- **Benefit**: Handles secure password hashing, brute-force protections, email verification, session rotation, JWT generation, and federated login (e.g., Google Sign-In) out-of-the-box without custom cryptographic overhead.

### Layer 2: Database Migration
- **Action**: Replace `/tmp` files with a persistent database.
- **Recommendation**: **Cloud SQL (PostgreSQL)** managed relational database or **Google Cloud Firestore**.
  - *Relational choice (Cloud SQL)*: Store clean, normalized tables for `users`, `documents`, `quizzes`, `flashcards`, `chats`, and `analytics` linked with foreign key structures. Utilizes Drizzle ORM or Prisma to handle schema synchronization and index optimizations.
  - *NoSQL choice (Firestore)*: Standard document-based architecture. Highly scalable, supports real-time synchronization, and eliminates file locking.

### Layer 3: Decoupled Session & Auth Headers
- **Action**: Transition from local JSON syncing to standard JWT session validation.
- **Mechanism**:
  1. Login issues an encrypted JSON Web Token (JWT) with a short lifespan (e.g., 2 hours).
  2. Client stores this JWT in an HttpOnly, Secure cookie (shielded from XSS) or securely in state.
  3. Every request to `/api/` must send this bearer token inside the `Authorization: Bearer <token>` header.
  4. Server validates signature of JWT before allowing action, enforcing user boundary security.

### Layer 4: Object & Blob File Storage
- **Action**: Stop storing parsed files as JSON files on server disks.
- **Recommendation**: Integrate **Google Cloud Storage (GCS)** or **AWS S3**.
- **Process**: Raw uploads (PDFs, Word docs) are streamed directly to Cloud Storage buckets. The metadata and parsed textual chunks are stored in indexed database tables, reducing server I/O bottleneck.

### Layer 5: Scalable State Synchronization (Decoupled Sync)
- **Action**: Deprecate the monolithic `/api/auth/sync-userdata` endpoint.
- **Mechanism**: Establish independent, RESTful micro-endpoints for partial sync:
  - `POST /api/documents` to create a new study material object.
  - `PATCH /api/users/stats` to increment study minutes or score records.
  - `POST /api/chat/message` to post an individual chat message into an index-friendly sub-table.
- **Benefit**: Payload sizes drop by 99%, increasing responsiveness and eliminating state-merging conflicts.
