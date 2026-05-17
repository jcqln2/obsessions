-- Run after creating bucket "entry-images" (private) in Supabase Storage

CREATE POLICY "Users upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entry-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users read own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'entry-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'entry-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);
