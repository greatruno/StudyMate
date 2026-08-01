-- Migration 12: Collaboration Domain Schema, Indexes & RLS Policies
-- Tables: study_groups, group_members, group_chat_messages, group_collaborative_notes, group_study_sessions, group_invitations

-- 1. Study Groups Table
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) DEFAULT 'General',
  avatar_emoji VARCHAR(20) DEFAULT '📚',
  visibility VARCHAR(20) DEFAULT 'public',
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_document_ids JSONB DEFAULT '[]'::jsonb,
  discussions_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Group Members Junction Table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

-- 3. Group Chat Messages Table
CREATE TABLE IF NOT EXISTS public.group_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_display_name VARCHAR(150),
  sender_avatar_emoji VARCHAR(20) DEFAULT '👤',
  text TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.group_chat_messages(id) ON DELETE SET NULL,
  reactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Group Collaborative Notes Table
CREATE TABLE IF NOT EXISTS public.group_collaborative_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_edited_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  checklists JSONB DEFAULT '[]'::jsonb,
  code_blocks JSONB DEFAULT '[]'::jsonb,
  equations JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Group Study Sessions Table
CREATE TABLE IF NOT EXISTS public.group_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 45,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  attendees JSONB DEFAULT '[]'::jsonb,
  agenda JSONB DEFAULT '[]'::jsonb,
  pomodoro_config JSONB DEFAULT '{"workMinutes":25,"breakMinutes":5,"currentCycle":1}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Group Invitations Table
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_group_invitation UNIQUE (group_id, invitee_id)
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_owner ON public.study_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON public.group_members(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_time ON public.group_chat_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_notes_group ON public.group_collaborative_notes(group_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_group ON public.group_study_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee ON public.group_invitations(invitee_id, status);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_collaborative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Public or member access for study_groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'study_groups' AND policyname = 'Public or Member Study Groups Access'
  ) THEN
    CREATE POLICY "Public or Member Study Groups Access" ON public.study_groups
      FOR SELECT USING (
        visibility = 'public' 
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.group_members 
          WHERE group_id = public.study_groups.id AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'study_groups' AND policyname = 'Group Owners Can Modify'
  ) THEN
    CREATE POLICY "Group Owners Can Modify" ON public.study_groups
      FOR ALL USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Members Can View Group Roster'
  ) THEN
    CREATE POLICY "Members Can View Group Roster" ON public.group_members
      FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.study_groups
          WHERE id = public.group_members.group_id AND (visibility = 'public' OR owner_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_chat_messages' AND policyname = 'Group Chat Isolation'
  ) THEN
    CREATE POLICY "Group Chat Isolation" ON public.group_chat_messages
      FOR ALL USING (
        sender_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_id = public.group_chat_messages.group_id AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_collaborative_notes' AND policyname = 'Group Notes Isolation'
  ) THEN
    CREATE POLICY "Group Notes Isolation" ON public.group_collaborative_notes
      FOR ALL USING (
        creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_id = public.group_collaborative_notes.group_id AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_study_sessions' AND policyname = 'Group Sessions Isolation'
  ) THEN
    CREATE POLICY "Group Sessions Isolation" ON public.group_study_sessions
      FOR ALL USING (
        created_by_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_id = public.group_study_sessions.group_id AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_invitations' AND policyname = 'Group Invitations Isolation'
  ) THEN
    CREATE POLICY "Group Invitations Isolation" ON public.group_invitations
      FOR ALL USING (inviter_id = auth.uid() OR invitee_id = auth.uid());
  END IF;
END $$;

-- 10. Automated Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_study_groups_modtime'
  ) THEN
    CREATE TRIGGER update_study_groups_modtime
      BEFORE UPDATE ON public.study_groups
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_group_notes_modtime'
  ) THEN
    CREATE TRIGGER update_group_notes_modtime
      BEFORE UPDATE ON public.group_collaborative_notes
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
