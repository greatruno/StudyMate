-- Migration 03: Learning Library Domain Schema
-- Tables: documents, document_chunks, summaries, flashcard_decks, flashcards, quizzes, quiz_questions

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_path TEXT,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  full_text TEXT,
  word_count INT DEFAULT 0,
  subject VARCHAR(100) DEFAULT 'General',
  status VARCHAR(20) DEFAULT 'processing',
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Document Chunks (Vector Search Enabled)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Document Summaries
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  summary_markdown TEXT NOT NULL,
  summary_type VARCHAR(50) DEFAULT 'comprehensive',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Flashcard Decks
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  card_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Flashcards (SM-2 Spaced Repetition Attributes)
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  explanation TEXT,
  difficulty_rating INT DEFAULT 1,
  reps INT DEFAULT 0,
  interval INT DEFAULT 0,
  efactor NUMERIC(4,2) DEFAULT 2.50,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INT DEFAULT 0,
  time_limit_mins INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  explanation TEXT,
  question_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
