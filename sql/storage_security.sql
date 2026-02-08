-- Storage Security Policies for event-media bucket
-- This script enforces file type and size validation at the server level (RLS)

-- 1. Ensure the bucket is public for viewing but restricted for uploads
-- Note: Replace 'event-media' with your actual bucket name if different
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow Public View" ON storage.objects;
DROP POLICY IF EXISTS "Strict Guest Upload Validation" ON storage.objects;

-- 3. Policy: Allow anybody to view the memories
CREATE POLICY "Allow Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'event-media' );

-- 4. Policy: Strict validation for uploads (INSERT)
-- This enforces: 
-- - Mime-types must be image/* or video/*
-- - File size must be < 10MB for images and < 50MB for videos
CREATE POLICY "Strict Guest Upload Validation"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-media' 
  AND (
    (
      (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp' OR storage.extension(name) = 'gif')
      AND (UPPER(storage.extension(name)) = storage.extension(name) OR LOWER(storage.extension(name)) = storage.extension(name))
      AND (metadata->>'mimetype' ILIKE 'image/%')
      AND (metadata->>'size')::int <= 10485760 -- 10MB
    )
    OR
    (
      (storage.extension(name) = 'mp4' OR storage.extension(name) = 'mov' OR storage.extension(name) = 'quicktime' OR storage.extension(name) = 'webm')
      AND (metadata->>'mimetype' ILIKE 'video/%')
      AND (metadata->>'size')::int <= 52428800 -- 50MB
    )
  )
);
