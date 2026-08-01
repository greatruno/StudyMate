-- Migration 14: Comprehensive RLS Security Audit & Policy Completion
-- Ensures 100% table coverage for Row Level Security (RLS) and Role-Based Access Control (RBAC)

-- 1. Helper Functions for Role-Based Access Control (RBAC)
CREATE OR REPLACE FUNCTION public.has_role(target_user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = target_user_id AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_role(target_user_id, 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_institution_id(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  inst_id UUID;
BEGIN
  SELECT institution_id INTO inst_id
  FROM public.academic_profiles
  WHERE user_id = target_user_id;
  RETURN inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure RLS is Enabled on ALL Public Tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_packs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_collaborative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Additional & Audit-Specific RLS Policies

-- User Roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own roles') THEN
    CREATE POLICY "Users can view own roles" ON public.user_roles
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins manage user roles') THEN
    CREATE POLICY "Admins manage user roles" ON public.user_roles
      FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Practice Exams & Revision Packs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_exams' AND policyname = 'Users access own or public practice exams') THEN
    CREATE POLICY "Users access own or public practice exams" ON public.practice_exams
      FOR ALL TO authenticated USING (user_id = auth.uid() OR is_public = true) WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revision_packs' AND policyname = 'Users access own or public revision packs') THEN
    CREATE POLICY "Users access own or public revision packs" ON public.revision_packs
      FOR ALL TO authenticated USING (user_id = auth.uid() OR is_public = true) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Academic Structure: Sessions, Semesters, Semester Courses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_sessions' AND policyname = 'Authenticated view academic sessions') THEN
    CREATE POLICY "Authenticated view academic sessions" ON public.academic_sessions
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'semesters' AND policyname = 'Authenticated view semesters') THEN
    CREATE POLICY "Authenticated view semesters" ON public.semesters
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'semester_courses' AND policyname = 'Authenticated view semester courses') THEN
    CREATE POLICY "Authenticated view semester courses" ON public.semester_courses
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- System Audit & Usage Logs Isolation
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_usage_logs' AND policyname = 'Users view own API logs') THEN
    CREATE POLICY "Users view own API logs" ON public.api_usage_logs
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_usage_logs' AND policyname = 'Users insert own API logs') THEN
    CREATE POLICY "Users insert own API logs" ON public.api_usage_logs
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_logs' AND policyname = 'Users view own audit logs') THEN
    CREATE POLICY "Users view own audit logs" ON public.security_audit_logs
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_logs' AND policyname = 'Users insert own audit logs') THEN
    CREATE POLICY "Users insert own audit logs" ON public.security_audit_logs
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  END IF;
END $$;

-- Admin Override Policies for Academic Institutions & Catalog Management
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutions' AND policyname = 'Institution Admins & System Admins manage institutions') THEN
    CREATE POLICY "Institution Admins & System Admins manage institutions" ON public.institutions
      FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'institution_admin'))
      WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'institution_admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Educators & Admins manage courses') THEN
    CREATE POLICY "Educators & Admins manage courses" ON public.courses
      FOR ALL TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'educator') OR public.has_role(auth.uid(), 'institution_admin'))
      WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'educator') OR public.has_role(auth.uid(), 'institution_admin'));
  END IF;
END $$;
