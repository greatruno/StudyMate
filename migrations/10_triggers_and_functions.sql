-- Migration 10: Triggers & Automated System Functions

-- 1. Automatic Timestamp Update Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_set_updated_at_users ON public.users;
CREATE TRIGGER trg_set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_academic_profiles ON public.academic_profiles;
CREATE TRIGGER trg_set_updated_at_academic_profiles BEFORE UPDATE ON public.academic_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_learning_preferences ON public.learning_preferences;
CREATE TRIGGER trg_set_updated_at_learning_preferences BEFORE UPDATE ON public.learning_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_settings ON public.user_settings;
CREATE TRIGGER trg_set_updated_at_user_settings BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_documents ON public.documents;
CREATE TRIGGER trg_set_updated_at_documents BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_flashcard_decks ON public.flashcard_decks;
CREATE TRIGGER trg_set_updated_at_flashcard_decks BEFORE UPDATE ON public.flashcard_decks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_chat_sessions ON public.chat_sessions;
CREATE TRIGGER trg_set_updated_at_chat_sessions BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_career_roadmaps ON public.career_roadmaps;
CREATE TRIGGER trg_set_updated_at_career_roadmaps BEFORE UPDATE ON public.career_roadmaps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_academic_records ON public.academic_records;
CREATE TRIGGER trg_set_updated_at_academic_records BEFORE UPDATE ON public.academic_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_stats ON public.user_stats;
CREATE TRIGGER trg_set_updated_at_user_stats BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_subscriptions ON public.user_subscriptions;
CREATE TRIGGER trg_set_updated_at_user_subscriptions BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 2. Auth Sync Trigger (Sync auth.users -> public.users on registration)
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  default_student_role_id UUID;
  free_plan_id UUID;
BEGIN
  -- 1. Sync User Row
  INSERT INTO public.users (
    id,
    email,
    username,
    display_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- 2. Assign Default Student Role
  SELECT id INTO default_student_role_id FROM public.roles WHERE name = 'student' LIMIT 1;
  IF default_student_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, default_student_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  -- 3. Initialize Companion Profile & Preferences
  INSERT INTO public.academic_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.learning_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  -- 4. Assign Default Free Subscription Plan
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE code = 'free' LIMIT 1;
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();
