-- Migration 09: Row-Level Security (RLS) Enablement & Access Policies

-- Enable RLS on all user-owned & sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Reference Tables: Public read access for authenticated users
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 1. Public Reference Tables (Read-Only for Authenticated Users)
CREATE POLICY "Allow public read access to roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to institutions" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to faculties" ON public.faculties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to achievements" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read access to subscription_plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);

-- 2. User Profile & Settings Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view own academic profile" ON public.academic_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own academic profile" ON public.academic_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic profile" ON public.academic_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage learning preferences" ON public.learning_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage user settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Documents & Learning Library Policies
CREATE POLICY "Users can access own documents" ON public.documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own document chunks" ON public.document_chunks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = document_chunks.document_id AND documents.user_id = auth.uid())
);

CREATE POLICY "Users can access own summaries" ON public.summaries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access own flashcard decks" ON public.flashcard_decks FOR ALL TO authenticated USING (auth.uid() = user_id OR is_public = true) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access flashcards in accessible decks" ON public.flashcards FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flashcard_decks WHERE flashcard_decks.id = flashcards.deck_id AND (flashcard_decks.user_id = auth.uid() OR flashcard_decks.is_public = true))
);

CREATE POLICY "Users can access own quizzes" ON public.quizzes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access quiz questions for own quizzes" ON public.quiz_questions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid())
);

-- 4. AI Workspace Policies
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own chat messages" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI memory" ON public.ai_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage conversation summaries" ON public.conversation_summaries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE chat_sessions.id = conversation_summaries.session_id AND chat_sessions.user_id = auth.uid())
);

CREATE POLICY "Users can manage own study plans" ON public.study_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage plan tasks" ON public.plan_tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.study_plans WHERE study_plans.id = plan_tasks.plan_id AND study_plans.user_id = auth.uid())
);

CREATE POLICY "Users can manage own career roadmaps" ON public.career_roadmaps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Academic Performance & Gamification Policies
CREATE POLICY "Users can manage own academic records" ON public.academic_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and manage own stats" ON public.user_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Platform & Business Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
