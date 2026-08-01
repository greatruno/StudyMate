-- Migration 11: Storage Buckets & Policies
-- Buckets: documents, avatars, course_assets

-- Insert / Update Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('course_assets', 'course_assets', false, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for 'documents' bucket
DROP POLICY IF EXISTS "Users can upload own study documents" ON storage.objects;
CREATE POLICY "Users can upload own study documents" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own study documents" ON storage.objects;
CREATE POLICY "Users can view own study documents" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own study documents" ON storage.objects;
CREATE POLICY "Users can delete own study documents" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage Policies for 'avatars' bucket
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
