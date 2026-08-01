-- Migration 06: Gamification Domain Schema
-- Tables: achievements, badges, user_achievements, user_stats

-- 1. Achievements Registry
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  icon_emoji VARCHAR(20) DEFAULT '🏆',
  xp_reward INT DEFAULT 50,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Initial System Achievements
INSERT INTO public.achievements (code, title, description, icon_emoji, xp_reward, category)
VALUES
  ('first_doc', 'Knowledge Seeker', 'Uploaded your first study document', '📄', 25, 'onboarding'),
  ('quiz_master', 'Quiz Master', 'Scored 100% on any practice quiz', '🎯', 50, 'quizzes'),
  ('streak_3', 'Consistency Is Key', 'Maintained a 3-day study streak', '🔥', 40, 'streaks'),
  ('streak_7', 'Unstoppable Scholar', 'Maintained a 7-day study streak', '⚡', 100, 'streaks'),
  ('flash_50', 'Memory Champion', 'Mastered 50 flashcards using SM-2', '🧠', 75, 'flashcards')
ON CONFLICT (code) DO NOTHING;

-- 2. Badges Registry
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  tier VARCHAR(20) DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Badges
INSERT INTO public.badges (code, name, description, tier)
VALUES
  ('bronze_scholar', 'Bronze Scholar', 'Completed 5 hours of active study', 'bronze'),
  ('silver_scholar', 'Silver Scholar', 'Completed 20 hours of active study', 'silver'),
  ('gold_scholar', 'Gold Scholar', 'Completed 50 hours of active study', 'gold'),
  ('deans_list', 'Deans List Prodigy', 'Achieved a target CGPA of 3.8 or higher', 'platinum')
ON CONFLICT (code) DO NOTHING;

-- 3. User Achievements Junction Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_achievement UNIQUE(user_id, achievement_id)
);

-- 4. User Stats & Progress Telemetry
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  quizzes_taken INT DEFAULT 0,
  avg_quiz_score NUMERIC(5,2) DEFAULT 0.00,
  flashcards_mastered INT DEFAULT 0,
  study_time_mins INT DEFAULT 0,
  daily_streak INT DEFAULT 1,
  longest_streak INT DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE,
  weekly_progress JSONB DEFAULT '{"mon":0,"tue":0,"wed":0,"thu":0,"fri":0,"sat":0,"sun":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
