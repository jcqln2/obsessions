-- Waitlist for closed beta (Option A: collect emails, invite manually)

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invited', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx
  ON waitlist (lower(trim(email)));

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist (insert only); no public reads
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) >= 5
    AND length(trim(email)) <= 320
    AND position('@' in trim(email)) > 1
  );

GRANT INSERT ON TABLE public.waitlist TO anon, authenticated;

-- Reads/updates: use Supabase dashboard (service role) or SQL Editor
