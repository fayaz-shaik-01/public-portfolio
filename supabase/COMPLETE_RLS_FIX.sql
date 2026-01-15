-- ============================================
-- COMPLETE RLS POLICY FIX
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- This file contains ALL the RLS policies needed for the editor to work
-- Run this entire file in one go

-- ============================================
-- ARTICLES TABLE POLICIES
-- ============================================

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

-- ============================================
-- BLOCKS TABLE POLICIES
-- ============================================

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Public can view blocks from published articles
DROP POLICY IF EXISTS "Public can view published article blocks" ON blocks;
CREATE POLICY "Public can view published article blocks"
  ON blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.published = true
    )
  );

-- Authors can view their own article blocks
DROP POLICY IF EXISTS "Authors can view own blocks" ON blocks;
CREATE POLICY "Authors can view own blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- Authors can insert blocks to their own articles
DROP POLICY IF EXISTS "Authors can insert own blocks" ON blocks;
CREATE POLICY "Authors can insert own blocks"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- Authors can update their own blocks
DROP POLICY IF EXISTS "Authors can update own blocks" ON blocks;
CREATE POLICY "Authors can update own blocks"
  ON blocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- Authors can delete their own blocks
DROP POLICY IF EXISTS "Authors can delete own blocks" ON blocks;
CREATE POLICY "Authors can delete own blocks"
  ON blocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- ============================================
-- CONTACTS TABLE POLICIES (if not already set)
-- ============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact submissions
DROP POLICY IF EXISTS "Anyone can submit contacts" ON contacts;
CREATE POLICY "Anyone can submit contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view contacts
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
CREATE POLICY "Authenticated users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update contacts (mark as read)
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
CREATE POLICY "Authenticated users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this, you should be able to:
-- 1. Create new articles ✅
-- 2. Save article content (blocks) ✅
-- 3. Edit existing articles ✅
-- 4. View published articles publicly ✅
-- 5. Submit contact forms ✅
