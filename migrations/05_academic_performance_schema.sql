-- Migration 05: Academic Performance Domain Schema
-- Tables: institutions, faculties, departments, courses, academic_sessions, semesters, semester_courses, academic_records

-- 1. Institutions
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE,
  country VARCHAR(100),
  grading_scale_type VARCHAR(50) DEFAULT '4.0_scale',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Faculties
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_institution_faculty UNIQUE(institution_id, name)
);

-- 3. Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_faculty_department UNIQUE(faculty_id, name)
);

-- Link academic_profiles foreign keys now that institutions/faculties/departments exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_academic_profiles_institution'
  ) THEN
    ALTER TABLE public.academic_profiles 
      ADD CONSTRAINT fk_academic_profiles_institution 
      FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_academic_profiles_faculty'
  ) THEN
    ALTER TABLE public.academic_profiles 
      ADD CONSTRAINT fk_academic_profiles_faculty 
      FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_academic_profiles_department'
  ) THEN
    ALTER TABLE public.academic_profiles 
      ADD CONSTRAINT fk_academic_profiles_department 
      FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  credit_units INT NOT NULL DEFAULT 3,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Academic Sessions
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Semesters
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  semester_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Semester Courses
CREATE TABLE IF NOT EXISTS public.semester_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lecturer_name VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_semester_course UNIQUE(semester_id, course_id)
);

-- 8. Academic Records
CREATE TABLE IF NOT EXISTS public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  course_code VARCHAR(20) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  credit_units INT NOT NULL DEFAULT 3,
  score NUMERIC(5,2),
  grade VARCHAR(5),
  grade_point NUMERIC(3,2),
  academic_level VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
