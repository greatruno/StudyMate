# StudyMate v1.0 Architectural Specification

## System Architecture Diagram

```
                 ┌──────────────────────────────────────────────┐
                 │          Client Browser Layer                │
                 │   React 18 SPA / Vite / Tailwind / Motion    │
                 └──────────────────────┬───────────────────────┘
                                        │
                             HTTPS / JSON / WebSockets
                                        │
                 ┌──────────────────────▼───────────────────────┐
                 │       Production Nginx Proxy Layer           │
                 │          (Port 3000 Ingress Router)          │
                 └──────────────────────┬───────────────────────┘
                                        │
                 ┌──────────────────────▼───────────────────────┐
                 │       Express Backend Gateway & Server       │
                 │ ┌──────────────────────────────────────────┐ │
                 │ │ Security Headers / Rate Limiter / Tracing│ │
                 │ ├──────────────────────────────────────────┤ │
                 │ │ Auth, Document RAG & File Parser Routes  │ │
                 │ ├──────────────────────────────────────────┤ │
                 │ │ Academic Infrastructure & Institution API│ │
                 │ ├──────────────────────────────────────────┤ │
                 │ │ AI Study Tools & Research Integrity API  │ │
                 │ └────────────────────┬─────────────────────┘ │
                 └──────────────────────┼───────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
┌─────────▼──────────┐        ┌─────────▼──────────┐        ┌─────────▼──────────┐
│ Google Gemini SDK  │        │ Disk Cache (/tmp)  │        │ Structured Logger  │
│  (@google/genai)   │        │ User & Doc State   │        │ Correlation Tracing│
└────────────────────┘        └────────────────────┘        └────────────────────┘
```

## Layered Design

1. **Client Tier**:
   - Built with React 18, Vite, TypeScript, Tailwind CSS, and Framer Motion (`motion/react`).
   - Pure client-side UI modularization across `src/components/academic/`, `src/components/collaboration/`, and `src/components/study/`.

2. **API & Security Tier**:
   - Express 4 server compiled via `esbuild` into CommonJS `dist/server.cjs`.
   - Security Middleware: Rate Limiter (sliding window), Security Headers (CSP, HSTS, X-Frame-Options `SAMEORIGIN`, XSS filter), Input Sanitizer, payload upload safeguards.
   - Observability: Request correlation `X-Request-ID`, structured JSON logging, `/api/health`, `/api/ready`, `/api/metrics`.

3. **Domain & Retrieval Engine**:
   - TF-IDF indexing for Retrieval-Augmented Generation (RAG).
   - Domain calculation engines: Grade point calculations, weighted CGPA, academic standing, and diagnostic risk scoring (`server/domain/gpaEngine.ts`).

4. **External Integrations**:
   - Gemini 3.5 Flash model accessed via `@google/genai` server-side SDK. Secrets never sent to client.
