-- Migration 13: Expanded Storage Buckets & Complete Security Policies
-- Buckets: documents, avatars, course_assets, collaboration, assignments

-- 1. Create or Update Storage Buckets Idempotently
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/markdown', 'text/x-markdown']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('course_assets', 'course_assets', false, 104857600, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'video/mp4', 'image/png', 'image/jpeg']),
  ('collaboration', 'collaboration', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/png', 'image/jpeg']),
  ('assignments', 'assignments', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for 'documents' Bucket
DROP POLICY IF EXISTS "Users can upload own study documents" ON storage.objects;
CREATE POLICY "Users can upload own study documents" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own study documents" ON storage.objects;
CREATE POLICY "Users can view own study documents" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own study documents" ON storage.objects;
CREATE POLICY "Users can update own study documents" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own study documents" ON storage.objects;
CREATE POLICY "Users can delete own study documents" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Storage Policies for 'avatars' Bucket
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable" ON storage.objects 
  FOR SELECT TO public 
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Storage Policies for 'course_assets' Bucket
DROP POLICY IF EXISTS "Users can upload course assets" ON storage.objects;
CREATE POLICY "Users can upload course assets" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'course_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view course assets" ON storage.objects;
CREATE POLICY "Users can view course assets" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'course_assets');

DROP POLICY IF EXISTS "Users can update own course assets" ON storage.objects;
CREATE POLICY "Users can update own course assets" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'course_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own course assets" ON storage.objects;
CREATE POLICY "Users can delete own course assets" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'course_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Storage Policies for 'collaboration' Bucket
DROP POLICY IF EXISTS "Users can upload collaboration files" ON storage.objects;
CREATE POLICY "Users can upload collaboration files" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'collaboration' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view collaboration files" ON storage.objects;
CREATE POLICY "Users can view collaboration files" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'collaboration');

DROP POLICY IF EXISTS "Users can update own collaboration files" ON storage.objects;
CREATE POLICY "Users can update own collaboration files" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'collaboration' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own collaboration files" ON storage.objects;
CREATE POLICY "Users can delete own collaboration files" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'collaboration' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. Storage Policies for 'assignments' Bucket
DROP POLICY IF EXISTS "Users can upload assignment submissions" ON storage.objects;
CREATE POLICY "Users can upload assignment submissions" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own assignment submissions" ON storage.objects;
CREATE POLICY "Users can view own assignment submissions" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'assignments');

DROP POLICY IF EXISTS "Users can update own assignment submissions" ON storage.objects;
CREATE POLICY "Users can update own assignment submissions" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own assignment submissions" ON storage.objects;
CREATE POLICY "Users can delete own assignment submissions" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);
