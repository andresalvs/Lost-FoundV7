-- Fix pgvector column dimensions
-- Run this if you already created the embedding column with wrong dimensions

-- Step 1: Drop the existing embedding column
ALTER TABLE items DROP COLUMN IF EXISTS embedding;

-- Step 2: Drop the old index (if it exists)
DROP INDEX IF EXISTS items_embedding_idx;

-- Step 3: Create new embedding column with correct dimensions (384)
ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Step 4: Create index for the corrected column
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON items USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'embedding';
