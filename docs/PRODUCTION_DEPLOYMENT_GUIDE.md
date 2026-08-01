# StudyMate v1.0 Production Deployment Guide

## Overview
This comprehensive guide details step-by-step instructions for deploying **StudyMate v1.0** from scratch to a live production environment.

---

## 1. Environment Variable Matrix

### Required Backend / Full-Stack Variables
| Variable Name | Required | Description / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` |
| `PORT` | **Yes** | `3000` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini 3.5 Flash API Key |
| `JWT_SECRET` | **Yes** | High-entropy random string (`openssl rand -hex 32`) |
| `DATABASE_URL` | Optional | Supabase / PostgreSQL Connection String |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase Admin Service Role Secret |

### Required Frontend Variables
| Variable Name | Required | Description / Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Optional | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase Anonymous Client Key |
| `VITE_API_BASE_URL` | Optional | `/api` (or custom API backend domain) |

---

## 2. Supabase Setup (Database & Object Storage)

### Step 2.1: Database Provisioning
1. Log in to [Supabase Dashboard](https://database.new) and create a new project `studymate-production`.
2. Navigate to **SQL Editor** and execute database migrations located in `/migrations/0000_initial_schema.sql`.
3. Verify foreign key constraints, indexes, and trigger functions.

### Step 2.2: Storage Buckets Configuration
1. Go to **Storage** in Supabase Dashboard and create two public/private buckets:
   - `studymate-documents` (Max file size: 15MB, Allowed MIME types: PDF, DOCX, PPTX, TXT)
   - `studymate-avatars` (Max file size: 2MB, Allowed MIME types: PNG, JPEG, WEBP)
2. Configure Row-Level Security (RLS) policies:
   ```sql
   -- Allow authenticated students and lecturers to read/write their uploaded documents
   CREATE POLICY "User Document Isolation" ON storage.objects
     FOR ALL TO authenticated
     USING (bucket_id = 'studymate-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

---

## 3. Backend Deployment Options

### Option A: Google Cloud Run (Recommended Container Deployment)
1. Ensure Google Cloud CLI (`gcloud`) is logged in and project set:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. Enable necessary Cloud APIs:
   ```bash
   gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
   ```
3. Submit build and deploy:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```
4. Configure environment secrets in Cloud Run:
   ```bash
   gcloud run services update studymate \
     --region us-central1 \
     --update-env-vars NODE_ENV=production,GEMINI_API_KEY=your_key,JWT_SECRET=your_jwt_secret
   ```

### Option B: Railway Deployment
1. Connect GitHub repository to [Railway.app](https://railway.app).
2. Railway detects the `Dockerfile` automatically.
3. In Railway **Variables** tab, set:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `GEMINI_API_KEY=...`
   - `JWT_SECRET=...`
4. Deploy service and expose public domain (e.g., `https://studymate-production.up.railway.app`).

---

## 4. Frontend Deployment (Vercel)

1. Import GitHub repository into [Vercel](https://vercel.com/new).
2. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add Rewrites in `vercel.json` to proxy API calls to Cloud Run / Railway backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://studymate-your-cloud-run-url.a.run.app/api/:path*"
       }
     ]
   }
   ```

---

## 5. Verification & Health Monitoring

1. Test Health Endpoint:
   ```bash
   curl -i https://your-backend-url/api/health
   ```
   Expect `200 OK` with `status: "healthy"`.
2. Check Swagger OpenAPI Documentation:
   Visit `https://your-backend-url/api/docs`.
3. Verify Application Capabilities:
   - User Registration & Authentication
   - File Uploads & RAG Text Extraction
   - AI Study Tools & Gemini 3.5 Flash Chat
   - Weighted GPA Calculation
