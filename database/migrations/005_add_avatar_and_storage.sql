-- ============================================================
-- Migration: Profile Avatar with Supabase Storage
-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create storage bucket for avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  102400,  -- 100KB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policy: Allow authenticated users to upload their own avatar
-- File path pattern: avatars/{username}.jpg
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = ''
  AND name LIKE 'avatars/%'
);

-- 4. RLS Policy: Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 5. RLS Policy: Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- 6. RLS Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- ============================================================
-- Done! Bucket 'avatars' created with:
-- - Public read access
-- - Authenticated upload/update/delete
-- - 100KB file size limit
-- - JPEG, PNG, WebP allowed
-- ============================================================
