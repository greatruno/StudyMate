-- Migration 08: Database Indexes (B-Tree, HNSW Vector, Compound)

-- Identity & User Lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Learning Library Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON public.document_chunks(document_id);

-- Vector Index for Semantic RAG Search (HNSW on vector embeddings)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
  ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Summary & Flashcard Indexes
CREATE INDEX IF NOT EXISTS idx_summaries_doc_id ON public.summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON public.summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review_at);

-- Quiz Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- AI Workspace Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_time ON public.chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_id ON public.ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_tasks_plan_id ON public.plan_tasks(plan_id);

-- Academic Performance Indexes
CREATE INDEX IF NOT EXISTS idx_faculties_institution_id ON public.faculties(institution_id);
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON public.departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_user_id ON public.academic_records(user_id);

-- Platform & Audit Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_time ON public.api_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_time ON public.security_audit_logs(user_id, created_at DESC);
