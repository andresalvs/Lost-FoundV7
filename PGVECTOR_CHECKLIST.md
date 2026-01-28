# pgvector Setup Checklist

## Quick Reference - Do These in Order

### Phase 1: Database Setup (5 minutes)
- [ ] Open pgAdmin or psql
- [ ] Run: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Run: `ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(1536);`
- [ ] Run: `CREATE INDEX IF NOT EXISTS items_embedding_idx ON items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

### Phase 2: Install Dependencies (5-10 minutes)
```powershell
cd c:\Users\Mrdar\Desktop\"lost and found version 5"\Lost-and-Found-V7\backend
npm install
```
- [ ] Dependencies installed without errors

### Phase 3: Generate Embeddings (2-5 minutes)
```powershell
node scripts/generate-embeddings.js
```
- [ ] Script runs successfully
- [ ] All items get embeddings
- [ ] Shows success count > 0

### Phase 4: Start Server
```powershell
npm start
```
- [ ] Server starts without errors
- [ ] Backend logs show successful database connection

### Phase 5: Test in Browser
1. Go to http://localhost:5173 (or your frontend URL)
2. Go to Search page
3. - [ ] Search by Item Name (e.g., "black bag")
   - [ ] Check results appear
   - [ ] Try with typos (e.g., "lapto" should find "laptop")
4. - [ ] Search by Student ID (e.g., "221-01878")
   - [ ] Check exact match works

### Phase 6: Verify in Database
```sql
-- Count items with embeddings
SELECT COUNT(*) FROM items WHERE embedding IS NOT NULL;

-- Check embedding values
SELECT id, name, embedding FROM items WHERE embedding IS NOT NULL LIMIT 5;
```
- [ ] Items have embeddings stored

---

## Files Modified/Created

✅ **Modified:**
- `backend/package.json` - Added pgvector and transformers dependencies
- `backend/routes/itemRoutes.js` - Added vector search logic

✅ **Created:**
- `backend/services/embeddingService.js` - Embedding generation service
- `backend/scripts/generate-embeddings.js` - Migration script
- `PGVECTOR_SETUP.md` - Full setup guide (this directory)

---

## Expected Results

### Before pgvector:
- Search "dark blue bag" → Only finds items with exact text match
- Search "lapto" → No results (doesn't match "laptop")

### After pgvector:
- Search "dark blue bag" → Finds "Navy Backpack", "Blue Duffel", etc.
- Search "lapto" → Finds "Laptop", "MacBook Pro", etc.
- Search "221-01878" → Still uses exact match (fast!)

---

## Rollback (If Needed)

```sql
-- Remove vector column
ALTER TABLE items DROP COLUMN embedding;

-- Remove index
DROP INDEX IF EXISTS items_embedding_idx;

-- Remove extension
DROP EXTENSION IF EXISTS vector;

-- Uninstall packages
npm uninstall pgvector @xenova/transformers
```

---

## Status

- Database Extension: [ ] Not Installed / [✓] Installed
- Vector Column: [ ] Not Added / [✓] Added
- Dependencies: [ ] Not Installed / [✓] Installed
- Backend Code: [ ] Not Updated / [✓] Updated
- Embeddings: [ ] Not Generated / [ ] Generated

Next: **Run Step 1 from the PGVECTOR_SETUP.md guide**
