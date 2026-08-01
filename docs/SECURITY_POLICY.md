# StudyMate Security Policy & Standards

This document establishes the security policies, identity guidelines, data privacy frameworks, and threat mitigation strategies for the StudyMate application.

---

## 🛡️ Identity & Access Management (IAM)

### 1. Authentication Security
- **Legacy Status**: Password comparisons are done in plain-text with local `/tmp` files.
- **Production Requirement**: Passwords **must never** be stored in plain text.
- **Hashing Standard**: Passwords must be hashed using a modern adaptive hashing algorithm:
  - **Argon2id** (Preferred: 3 iterations, 64MB memory cost, parallelism 4) or
  - **Bcrypt** (Work Factor / Cost: `12` or higher).
- **Federated SSO**: Integrated through OpenID Connect / OAuth 2.0 (e.g. Google Sign-In) to encourage passwordless authentication.

### 2. Session Tokenization (JWT)
- **Engine**: JSON Web Tokens signed with high-entropy cryptographic algorithms (`RS256` or `HS256`).
- **Token Claims**: Contains only non-sensitive descriptors:
  - `sub`: User ID
  - `role`: Authorization clearance
  - `exp`: Expiration epoch (set to `2 hours` from issuance)
- **Token Delivery**: Tokens must be served in `HttpOnly`, `Secure`, and `SameSite=Strict` cookies. This shields active session contexts from Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### 3. Password Complexity Policies
All accounts choosing custom credentials must pass validation checks:
- At least **10 characters** in length.
- Contains at least one uppercase letter, one lowercase letter, one numeric digit, and one special character (e.g., `@`, `$`, `!`, `%`, `*`, `?`, `&`).
- Blocked matching against common password dictionary catalogs (checked using zxcvbn evaluation score of $\ge 3$).

---

## 🔒 Data Protection & Authorization

### 1. Row-Level Security (RLS)
- **Objective**: Prevent Broken Object Level Authorization (BOLA) where a user accesses another user's files.
- **Implementation**:
  - All database queries must explicitly filter by the requesting user's verified token ID (e.g., `WHERE user_id = current_user_id()`).
  - If using Supabase / PostgreSQL schemas, enable **Row-Level Security (RLS)** policies explicitly matching active JWT claims.

### 2. File & Data Ingestion Auditing
- Limit upload files strictly to supported MIME types:
  - `application/pdf` (PDF)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (Word .docx)
  - `text/plain` (TXT)
  - `text/markdown` (MD)
- Check and block executable headers, embedded macros, and recursive XML file uploads.

---

## 🛡️ Defensive Controls & Rate Limiting

### 1. Request Rate Limiting
To defend against Brute Force attempts and Denial of Service (DoS) attacks:
- **General Routes API**: Maximum of `100 requests` per 15 minutes per IP block.
- **Authentication Routes** (`/api/auth/register`, `/api/auth/login`): Strict limit of `5 attempts` per 15 minutes per IP block.
- **AI Completion Routes** (`/api/generate/*`): Maximum of `30 generation requests` per hour per active user to prevent budget exploitation.

### 2. Strict Input Sanitization
- All client-side text inputs are cleaned before DB insertions to prevent SQL injection and persistent Cross-Site Scripting (XSS).
- Use parametrized queries or ORM abstract models exclusively (do not concatenate strings in raw SQL queries).
- Escape special characters on markdown rendering interfaces using libraries like `dompurify`.

---

## 📝 Compliance Audit Logging
Production clusters must stream audit trails to isolated secure logs:
1. **User Audit Trails**: Track login attempts, ip ranges, password changes, subscription changes, and account deletions.
2. **AI Action Logs**: Track Gemini token usage and query rates to isolate bad actors.
3. **Database Security Logs**: Track failed database transactions and unauthorized access attempts.
