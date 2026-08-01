# StudyMate REST API Specification

This document maps the REST endpoints, expected payloads, structural responses, error statuses, and authorization protocols utilized by StudyMate's service mesh.

---

## 🔒 Authentication Requirements

In version 0.1, endpoints are public and trust raw payloads.
For the upcoming production-ready version, **all requests** targeting non-auth routes must provide a JWT bearer token in the `Authorization` header:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 🛣️ API Endpoint Contracts

### 1. User Registration
Creates a new academic account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body (JSON)**:
  ```json
  {
    "username": "coder_learner",
    "email": "coder@domain.com",
    "password": "SecretPassword123",
    "displayName": "Alex Coder",
    "role": "student",
    "subscription": "free",
    "academicProfile": {
      "role": "student",
      "academicCategory": "Computing",
      "primaryField": "Computer Science",
      "learningGoals": "Build systems with AI.",
      "experienceLevel": "Intermediate",
      "preferredLearningStyle": "Mixed"
    }
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "user_1719946800000",
    "username": "coder_learner",
    "email": "coder@domain.com",
    "displayName": "Alex Coder",
    "avatarEmoji": "🎓",
    "role": "student",
    "subscription": "free",
    "createdAt": "2026-07-03T19:15:00.000Z"
  }
  ```

---

### 2. User Login
Authenticates credentials and matches active user profiles.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body (JSON)**:
  ```json
  {
    "username": "coder_learner",
    "password": "SecretPassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "user_1719946800000",
    "username": "coder_learner",
    "email": "coder@domain.com",
    "displayName": "Alex Coder",
    "subscription": "free",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

---

### 3. Parse Document
Ingests text streams to index documents.

- **URL**: `/api/parse-document`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body (JSON)**:
  ```json
  {
    "text": "The solar system contains eight planets revolving around the Sun...",
    "fileName": "Solar_System_Intro"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "documentId": "doc_1719946920000",
    "wordCount": 110,
    "chunksCount": 1
  }
  ```

---

### 4. Generate Study Suite
Triggers the synthesis of summaries, quizzes, or flashcard decks based on an ingested document.

- **URL**: `/api/generate/summary` (Similar endpoints: `/api/generate/quiz`, `/api/generate/flashcards`)
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body (JSON)**:
  ```json
  {
    "documentId": "doc_1719946920000",
    "content": "Full source content to summarize..."
  }
  ```
- **Success Response (200 OK - Summary Endpoint)**:
  ```json
  {
    "subject": "Astronomy",
    "topic": "Solar System",
    "sections": [
      {
        "title": "Introduction to Helicosmics",
        "bulletPoints": [
          "The solar system consists of eight distinct major orbiting spheres.",
          "The primary gravitational anchor is the central sun core."
        ]
      }
    ],
    "keyConcepts": [
      {
        "concept": "Gravitational Anchor",
        "definition": "The central celestial mass holding orbital trajectories."
      }
    ]
  }
  ```

---

### 5. Chat Query Conversation
Grounds AI tutoring inside the text boundaries of a specific document.

- **URL**: `/api/generate/chat`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body (JSON)**:
  ```json
  {
    "message": "Explain how gravitational anchor pulls orbiting spheres.",
    "history": [
      { "role": "user", "content": "Help me study solar dynamics." },
      { "role": "assistant", "content": "Sure, let's learn about orbital balances!" }
    ],
    "documentContext": "Extracted document reference source text used to ground the chat..."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "response": "The gravitational anchor utilizes massive core density to curve space-time, pulling orbiting spheres while orbital forward momentum prevents direct collapse...",
    "sourceCitations": [
      "The primary gravitational anchor is the central sun core."
    ]
  }
  ```

---

## 🚫 Error Code Directory

| HTTP Status | Error Name | Error Response Body (JSON) | Root Cause |
| :--- | :--- | :--- | :--- |
| **400** | Bad Request | `{"error": "Username, email, and password are required."}` | Missing fields or malformed payload. |
| **401** | Unauthorized | `{"error": "Invalid username, email, or password."}` | Credentials mismatch or invalid/missing JWT token. |
| **403** | Forbidden | `{"error": "Tier upgrade required."}` | Attempting to access premium operations on a free account. |
| **404** | Not Found | `{"error": "User profile not found to sync."}` | Target resources do not exist in storage database. |
| **413** | Payload Too Large | `{"error": "Request entity too large."}` | Content uploads exceed maximum system limits (25MB). |
| **500** | Internal Server Error | `{"error": "Could not create account on server database."}` | Server crashed, external API timed out, or storage error occurred. |
