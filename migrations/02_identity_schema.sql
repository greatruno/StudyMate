-- Migration 02: Identity Domain Schema
-- Tables: users, roles, user_roles, academic_profiles, learning_preferences, user_settings

-- 1. Public Users Table (Synced with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  avatar_emoji VARCHAR(10) DEFAULT '🎓',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. System Roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Default System Roles
INSERT INTO public.roles (name, description)
VALUES 
  ('student', 'Standard student learner profile'),
  ('educator', 'Teacher, professor, or course instructor'),
  ('expert', 'Academic subject matter expert or tutor'),
  ('institution_admin', 'Administrator for an educational institution'),
  ('admin', 'StudyMate system administrator')
ON CONFLICT (name) DO NOTHING;

-- 3. User Roles Junction Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_role UNIQUE(user_id, role_id)
);

-- 4. Academic Profiles
CREATE TABLE IF NOT EXISTS public.academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID, -- Foreign Key linked after Institutions table creation
  faculty_id UUID,     -- Foreign Key linked after Faculties table creation
  department_id UUID,  -- Foreign Key linked after Departments table creation
  degree_program VARCHAR(150),
  current_level VARCHAR(50) DEFAULT '100 Level',
  target_gpa NUMERIC(3,2) DEFAULT 4.00,
  target_grade VARCHAR(10) DEFAULT 'A+',
  graduation_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Learning Preferences
CREATE TABLE IF NOT EXISTS public.learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preferred_style VARCHAR(50) DEFAULT 'visual',
  study_goal_hours_per_week INT DEFAULT 5,
  daily_reminder_time TIME,
  quiz_difficulty VARCHAR(20) DEFAULT 'medium',
  auto_generate_flashcards BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  data_sharing_opt_in BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
