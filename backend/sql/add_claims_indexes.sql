-- Add indexes to improve claim lookups by item and status
-- Run this once manually against your database (psql or any client)

CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

-- Optional: a composite index to speed up item-based queries ordered by created_at
CREATE INDEX IF NOT EXISTS idx_claims_item_id_created_at ON public.claims(item_id, created_at DESC);

-- Note: ensure there are no long-running transactions during index creation on large tables.
