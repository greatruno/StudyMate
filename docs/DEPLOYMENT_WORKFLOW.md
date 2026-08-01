# StudyMate Production CI/CD & Deployment Workflow

## Overview
This document describes the automated Continuous Integration and Continuous Deployment (CI/CD) pipeline for **StudyMate v1.0**.

---

## 1. CI/CD Pipeline Architecture

```
[ Developer Push / Pull Request ]
              │
              ▼
    1. Static Type Check (`tsc --noEmit`)
              │
              ▼
    2. Code Quality & Linting (`npm run lint`)
              │
              ▼
    3. Automated Test Suite (`npm run test`)
              │
              ▼
    4. Pre-Release Verification (`npm run verify:all`)
              │
              ▼
    5. Production Esbuild & Vite Build (`npm run build`)
              │
              ▼
    6. Containerization & Cloud Run Deploy
```

---

## 2. GitHub Actions Configuration (`.github/workflows/ci.yml`)

The repository includes an automated GitHub Actions workflow file:

```yaml
name: StudyMate CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  validate-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run TypeScript Linter & Type Check
        run: npm run lint

      - name: Execute Automated Test Suite
        run: npm run test

      - name: Verify Production Build
        run: npm run build

      - name: Confirm Dist Server Bundle Existence
        run: test -f dist/server.cjs
```

---

## 3. Recommended Cloud Run Deployment Command
```bash
# 1. Build & tag Docker container
gcloud builds submit --tag gcr.io/your-project-id/studymate-app:v1.0.0

# 2. Deploy to Cloud Run
gcloud run deploy studymate \
  --image gcr.io/your-project-id/studymate-app:v1.0.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY=your_key_here
```
