-- Add this to your Supabase SQL editor
-- This adds the missing INSERT policy for articles table

-- Enable RLS on articles if not already enabled
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own articles
DROP POLICY IF EXISTS "Authors can insert own articles" ON articles;
CREATE POLICY "Authors can insert own articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Allow authenticated users to update their own articles
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Allow authenticated users to delete their own articles
DROP POLICY IF EXISTS "Authors can delete own articles" ON articles;
CREATE POLICY "Authors can delete own articles"
  ON articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Allow authenticated users to view their own articles
DROP POLICY IF EXISTS "Authors can view own articles" ON articles;
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- Allow public to view published articles
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (published = true);
