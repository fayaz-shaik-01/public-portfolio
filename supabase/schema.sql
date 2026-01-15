-- ============================================
-- PRODUCTION-GRADE EDITOR DATABASE SCHEMA
-- SECURE VERSION
-- ============================================

-- Drop existing tables if migrating
DROP TABLE IF EXISTS mindmaps CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS revisions CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
-- Keep articles table, just modify it

-- ============================================
-- 1. UPDATE ARTICLES TABLE
-- ============================================

-- Add new columns to existing articles table
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Update status column constraint
ALTER TABLE articles 
  DROP CONSTRAINT IF EXISTS articles_status_check;
  
ALTER TABLE articles 
  ADD CONSTRAINT articles_status_check 
  CHECK (status IN ('draft', 'published', 'archived'));

-- Add full-text search
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS search_vector tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) STORED;

-- Indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_published_articles ON articles(created_at DESC) 
  WHERE status = 'published';

-- ============================================
-- 2. BLOCKS TABLE (Core Content)
-- ============================================

CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  
  -- Block positioning
  position INTEGER NOT NULL,
  parent_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
  
  -- Block type and content
  type TEXT NOT NULL CHECK (type IN (
    'paragraph', 'heading1', 'heading2', 'heading3', 'heading4',
    'bulletList', 'numberedList', 'toggle', 'quote', 'callout',
    'divider', 'code', 'math', 'image', 'mindmap', 'table', 'link'
  )),
  
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique positioning within article
  UNIQUE(article_id, position)
);

-- Indexes for blocks
CREATE INDEX IF NOT EXISTS idx_blocks_article ON blocks(article_id, position);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON blocks(type);
CREATE INDEX IF NOT EXISTS idx_blocks_parent ON blocks(parent_id);
CREATE INDEX IF NOT EXISTS idx_blocks_content ON blocks USING GIN(content);

-- ============================================
-- 3. REVISIONS TABLE (Version History)
-- ============================================

CREATE TABLE IF NOT EXISTS revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  
  -- Snapshot data
  title TEXT NOT NULL,
  blocks JSONB NOT NULL, -- Full snapshot of all blocks
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  revision_note TEXT,
  
  -- Auto-cleanup old revisions (90 days)
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Indexes for revisions
CREATE INDEX IF NOT EXISTS idx_revisions_article ON revisions(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_expires ON revisions(expires_at);

-- ============================================
-- 4. MINDMAPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mindmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID REFERENCES blocks(id) ON DELETE CASCADE UNIQUE,
  
  -- Mind map data (React Flow format)
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  viewport JSONB, -- Zoom and pan state
  
  -- Export cache
  svg_export TEXT,
  png_export_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for mindmaps
CREATE INDEX IF NOT EXISTS idx_mindmaps_block ON mindmaps(block_id);

-- ============================================
-- 5. ASSETS TABLE (Images, Files)
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Index for assets
CREATE INDEX IF NOT EXISTS idx_assets_article ON assets(article_id);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to blocks
DROP TRIGGER IF EXISTS update_blocks_updated_at ON blocks;
CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to mindmaps
DROP TRIGGER IF EXISTS update_mindmaps_updated_at ON mindmaps;
CREATE TRIGGER update_mindmaps_updated_at
  BEFORE UPDATE ON mindmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to articles
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BLOCKS POLICIES
-- ============================================

-- Public can view blocks from published articles
DROP POLICY IF EXISTS "Public can view published article blocks" ON blocks;
CREATE POLICY "Public can view published article blocks"
  ON blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.status = 'published'
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
-- REVISIONS POLICIES
-- ============================================

-- Authors can view their own revisions
DROP POLICY IF EXISTS "Authors can view own revisions" ON revisions;
CREATE POLICY "Authors can view own revisions"
  ON revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = revisions.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- Authors can create revisions for their articles
DROP POLICY IF EXISTS "Authors can create own revisions" ON revisions;
CREATE POLICY "Authors can create own revisions"
  ON revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = revisions.article_id 
      AND articles.author_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- ============================================
-- MINDMAPS POLICIES
-- ============================================

-- Public can view mindmaps from published articles
DROP POLICY IF EXISTS "Public can view published mindmaps" ON mindmaps;
CREATE POLICY "Public can view published mindmaps"
  ON mindmaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN articles ON articles.id = blocks.article_id
      WHERE blocks.id = mindmaps.block_id 
      AND articles.status = 'published'
    )
  );

-- Authors can manage mindmaps in their articles
DROP POLICY IF EXISTS "Authors can view own mindmaps" ON mindmaps;
CREATE POLICY "Authors can view own mindmaps"
  ON mindmaps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN articles ON articles.id = blocks.article_id
      WHERE blocks.id = mindmaps.block_id 
      AND articles.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can insert own mindmaps" ON mindmaps;
CREATE POLICY "Authors can insert own mindmaps"
  ON mindmaps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN articles ON articles.id = blocks.article_id
      WHERE blocks.id = mindmaps.block_id 
      AND articles.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can update own mindmaps" ON mindmaps;
CREATE POLICY "Authors can update own mindmaps"
  ON mindmaps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN articles ON articles.id = blocks.article_id
      WHERE blocks.id = mindmaps.block_id 
      AND articles.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can delete own mindmaps" ON mindmaps;
CREATE POLICY "Authors can delete own mindmaps"
  ON mindmaps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blocks 
      JOIN articles ON articles.id = blocks.article_id
      WHERE blocks.id = mindmaps.block_id 
      AND articles.author_id = auth.uid()
    )
  );

-- ============================================
-- ASSETS POLICIES
-- ============================================

-- Public can view assets from published articles
DROP POLICY IF EXISTS "Public can view published assets" ON assets;
CREATE POLICY "Public can view published assets"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = assets.article_id 
      AND articles.status = 'published'
    )
  );

-- Authors can view their own assets
DROP POLICY IF EXISTS "Authors can view own assets" ON assets;
CREATE POLICY "Authors can view own assets"
  ON assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = assets.article_id 
      AND articles.author_id = auth.uid()
    )
  );

-- Authors can upload assets to their articles
DROP POLICY IF EXISTS "Authors can insert own assets" ON assets;
CREATE POLICY "Authors can insert own assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = assets.article_id 
      AND articles.author_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- Authors can delete their own assets
DROP POLICY IF EXISTS "Authors can delete own assets" ON assets;
CREATE POLICY "Authors can delete own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = assets.article_id 
      AND articles.author_id = auth.uid()
    )
  );
