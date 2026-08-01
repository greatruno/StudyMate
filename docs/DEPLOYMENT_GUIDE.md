# StudyMate Deployment & Infrastructure Guide

This guide describes the environments, deployment pipelines, infrastructure architecture, environment variables, and pre-flight checklists used to deploy StudyMate.

---

## 🗺️ Environment Architecture Matrix

```
  ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐
  │      Development      │      │        Staging        │      │      Production       │
  ├───────────────────────┤      ├───────────────────────┤      ├───────────────────────┤
  │ Local Laptop          │      │ Cloud Run (Internal)  │      │ Cloud Run (Public)    │
  │ Hot Reload enabled    │      │ Triggered on Merge-PR │      │ Manual release tag    │
  │ Volatile Storage /tmp │      │ Cloud SQL Sandbox     │      │ Cloud SQL Prod Pool   │
  └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
```

---

## 🏗️ Environment Specifications

### 1. Local Development
- **Host**: Developer workstation.
- **Port**: `3000` (mapped via reverse proxy if necessary).
- **Setup**:
  ```bash
  npm install
  npm run dev
  ```

### 2. Staging Environment
- **Host**: Isolated Google Cloud Run service with scale-to-zero capabilities.
- **Database**: Sandbox instance of Google Cloud SQL (PostgreSQL).
- **Deployment**: Automatic triggers upon pull request merges into the `main` branch.

### 3. Production Environment
- **Host**: Highly available, horizontally autoscaling Google Cloud Run container.
- **Database**: Multi-AZ Cloud SQL (PostgreSQL) cluster with auto-backups.
- **CDN**: Cloud CDN caching static bundle assets (`/dist/*`).
- **Deployment**: Manual release approvals triggered by creating a Git tag (e.g., `v*.*.*`).

---

## 📋 Environment Variables Checklist

The following environment variables are required. Ensure they are injected via the Cloud Console settings rather than committed to source control:

```env
# Server Operations
NODE_ENV=production
PORT=3000
SESSION_SECRET=super_secret_high_entropy_cryptographic_key

# Database Connection (Production-ready)
DATABASE_URL=postgresql://db_user:db_password@host:5432/studymate_db

# AI & GenAI Orchestration
GEMINI_API_KEY=AIzaSy...

# Cloud File Store
GCS_BUCKET_NAME=studymate-production-blobs
```

---

## 📦 Containerization (Dockerfile)

Below is the standard Docker configuration for containerizing the full-stack Monolith:

```dockerfile
# Step 1: Build the static React frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Production runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/server.cjs ./server.js

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🚀 CI/CD Release Pipeline
We recommend using **GitHub Actions** to automate builds and deployments to Cloud Run:

```yaml
name: Build and Deploy to Cloud Run

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Authenticate GCP
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Build and Push Docker Image
        run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/studymate:${{ github.sha }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy studymate \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/studymate:${{ github.sha }} \
            --platform managed \
            --region europe-west2 \
            --allow-unauthenticated
```

---

## 🛑 Pre-Flight Production Checklist
- [ ] Confirm `NODE_ENV` is set to `"production"`.
- [ ] Disable HMR and confirm client compiles without warnings.
- [ ] Confirm `GEMINI_API_KEY` is loaded and functional on the production server.
- [ ] Ensure database migrations have successfully finished (`npm run db:push`).
- [ ] Configure automatic daily backup windows for the PostgreSQL instance.
- [ ] Implement Row-Level Security in the database layer.
- [ ] Turn on rate limiting for public endpoints.
