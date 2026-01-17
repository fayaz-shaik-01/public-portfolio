-- ============================================
-- NOTION CMS INTEGRATION - DATABASE MIGRATION
-- ============================================

-- This migration updates the articles table to support Notion content caching
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ADD NOTION-SPECIFIC COLUMNS
-- ============================================

ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS notion_page_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS notion_content JSONB,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_articles_notion_page_id ON articles(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_articles_last_synced ON articles(last_synced_at DESC);

-- ============================================
-- 3. UPDATE RLS POLICIES (if needed)
-- ============================================

-- Public can view published articles with Notion content
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (published = true);

-- Authors can view all their articles
DROP POLICY IF EXISTS "Authors can view own articles" ON articles;
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- Authors can insert their own articles
DROP POLICY IF EXISTS "Authors can insert own articles" ON articles;
CREATE POLICY "Authors can insert own articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Authors can update their own articles
DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Authors can delete their own articles
DROP POLICY IF EXISTS "Authors can delete own articles" ON articles;
CREATE POLICY "Authors can delete own articles"
  ON articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================
-- 4. OPTIONAL: DROP OLD BLOCKS TABLE
-- ============================================

-- Uncomment these lines if you want to completely remove the old block editor
-- WARNING: This will delete all existing block content!

-- DROP TABLE IF EXISTS blocks CASCADE;
-- DROP TABLE IF EXISTS revisions CASCADE;
-- DROP TABLE IF EXISTS mindmaps CASCADE;
-- DROP TABLE IF EXISTS assets CASCADE;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Your articles table is now ready for Notion content!
-- Next steps:
-- 1. Use the admin dashboard to sync articles from Notion
-- 2. The notion_content column will store the full Notion page data
-- 3. The notion_page_id links to your Notion page
