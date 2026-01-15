-- Fix for blocks not saving (400 error)
-- Run this in Supabase SQL Editor

-- The blocks table needs INSERT policy for authenticated users
-- This allows authors to add blocks to their own articles

DROP POLICY IF EXISTS "Authors can insert blocks to own articles" ON blocks;
CREATE POLICY "Authors can insert blocks to own articles"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = blocks.article_id 
      AND articles.author_id = auth.uid()
    )
  );
