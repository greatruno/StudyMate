-- Migration 04: AI Workspace Domain Schema
-- Tables: chat_sessions, chat_messages, ai_memory, conversation_summaries, study_plans, plan_tasks, career_roadmaps

-- 1. Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title VARCHAR(255) DEFAULT 'New Conversation',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. AI Memory (User Fact & Preference Retention)
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  importance_score NUMERIC(3,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Conversation Summaries
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  key_topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Study Plans
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Plan Tasks
CREATE TABLE IF NOT EXISTS public.plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  estimated_minutes INT DEFAULT 30,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  task_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Career Roadmaps
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_role VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  roadmap_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_progress_pct NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
