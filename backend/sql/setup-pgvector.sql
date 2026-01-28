-- pgvector Setup Script for Lost and Found
-- Run this SQL in pgAdmin or psql to set up vector search

-- Step 1: Create vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Step 2: Add embedding column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Step 3: Create index for faster similarity search
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON items USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Step 4: Verify setup
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'embedding';

-- Step 5: Check for indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'items' AND indexname LIKE '%embedding%';

-- All done! You should see:
-- 1. 'vector' in the extension list
-- 2. 'embedding | vector(1536)' in the columns
-- 3. 'items_embedding_idx' in the indexes
