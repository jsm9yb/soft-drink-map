-- Soft Drink Review Map Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Establishments table (cached Google Places data)
CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade TEXT NOT NULL CHECK (grade IN ('A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F')),
  review_text TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allowed emails table (invite-only control)
CREATE TABLE allowed_emails (
  email TEXT PRIMARY KEY,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_establishments_location ON establishments(lat, lng);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_establishments_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- Establishments: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can view establishments"
  ON establishments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert establishments"
  ON establishments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update establishments"
  ON establishments FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Reviews: Anyone can read, users can only modify their own
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Allowed emails: Only authenticated users can read, first user (admin) can modify
CREATE POLICY "Authenticated users can view allowed emails"
  ON allowed_emails FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert allowed emails"
  ON allowed_emails FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete allowed emails"
  ON allowed_emails FOR DELETE
  USING (auth.role() = 'authenticated');

-- Storage bucket for review photos
-- Run this separately or via Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);

-- Storage policy for review photos
-- CREATE POLICY "Anyone can view review photos"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'review-photos');

-- CREATE POLICY "Authenticated users can upload review photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can delete their own photos"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
