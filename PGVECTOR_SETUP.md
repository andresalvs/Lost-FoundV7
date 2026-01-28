# pgvector Implementation Guide - Lost and Found

## Setup Complete! Here's Your Next Steps

### ✅ What's Been Done:
1. ✓ Installed pgvector Node.js package
2. ✓ Created embedding service (`backend/services/embeddingService.js`)
3. ✓ Created migration script (`backend/scripts/generate-embeddings.js`)
4. ✓ Updated search route (`backend/routes/itemRoutes.js`) with vector support
5. ✓ Added import for embedding service

---

## 🚀 Implementation Steps (Follow in Order)

### Step 1: Install Dependencies
```powershell
cd c:\Users\Mrdar\Desktop\"lost and found version 5"\Lost-and-Found-V7\backend
npm install
```

This will install:
- `pgvector` - PostgreSQL vector extension client
- `@xenova/transformers` - Local embedding model (no API key needed)

**Time estimate:** 5-10 minutes

---

### Step 2: Add pgvector Extension to PostgreSQL

Connect to your PostgreSQL database:
```powershell
psql -U postgres -d your_database_name
```

Then run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Verify it worked:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

### Step 3: Add Vector Column to Items Table

Still in psql, run:
```sql
-- Add vector column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON items USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Verify the column was added
\d items
```

You should see:
```
embedding | vector
```

---

### Step 4: Generate Embeddings for Existing Items

This is important! Your existing items need embeddings to be searchable.

```powershell
cd c:\Users\Mrdar\Desktop\"lost and found version 5"\Lost-and-Found-V7\backend
node scripts/generate-embeddings.js
```

**What it does:**
- Loads all items without embeddings
- Generates semantic embeddings using AI model
- Stores them in the database
- Shows progress as it goes

**Expected output:**
```
🔄 Loading embedding model (all-MiniLM-L6-v2)...
✅ Embedding model loaded successfully
🔍 Fetching items without embeddings...
📊 Found 45 items to embed
⏳ Starting embedding generation... (this may take a while)

✓ [2%] Item: "Black Umbrella" (ID: abc123...)
✓ [4%] Item: "Silver Laptop" (ID: def456...)
...
✅ Embedding generation complete!
   Success: 45
   Failures: 0
```

**Time estimate:** 2-5 minutes depending on number of items

**Note:** This script runs the embedding model locally - it may use significant CPU/RAM. It's safe to run and won't affect your database if it crashes.

---

### Step 5: Test the Vector Search

Create a test file to verify everything works:

```javascript
// backend/test-vector-search.js
import axios from 'axios';

async function testVectorSearch() {
  try {
    console.log('Testing vector search...\n');

    // Test 1: Item name search (should use vectors)
    console.log('Test 1: Vector search for "black bag"');
    let response = await axios.get('http://localhost:5000/api/items/search', {
      params: { itemName: 'black bag' }
    });
    console.log(`Found ${response.data.value.length} results`);
    if (response.data.value.length > 0) {
      console.log(`First result: "${response.data.value[0].name}" (score: ${response.data.value[0].similarity_score?.toFixed(3)})\n`);
    }

    // Test 2: Student ID search (should use exact match)
    console.log('Test 2: Exact match for student ID "221-01878"');
    response = await axios.get('http://localhost:5000/api/items/search', {
      params: { studentId: '221-01878' }
    });
    console.log(`Found ${response.data.value.length} results\n`);

    // Test 3: Typo tolerance (should still find results)
    console.log('Test 3: Typo tolerance for "lapto" (should match "laptop")');
    response = await axios.get('http://localhost:5000/api/items/search', {
      params: { itemName: 'lapto' }
    });
    console.log(`Found ${response.data.value.length} results`);
    if (response.data.value.length > 0) {
      console.log(`First result: "${response.data.value[0].name}"\n`);
    }

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVectorSearch();
```

Run it:
```powershell
npm install axios  # if not already installed
node backend/test-vector-search.js
```

---

### Step 6: Update Items When Adding New Ones

When users submit new lost/found items, embeddings are NOT automatically generated yet. 

**Option A: Generate embeddings on submission (recommended)**
Update your item creation route to generate embeddings:

```javascript
// In backend/routes/itemRoutes.js (POST /items)

import { getEmbedding } from '../services/embeddingService.js';

// When creating an item, add this before saving:
if (req.body.name) {
  try {
    const textToEmbed = [
      req.body.name,
      req.body.brand,
      req.body.color,
      req.body.description
    ].filter(Boolean).join(' ');
    
    const embedding = await getEmbedding(textToEmbed);
    // Then add to INSERT query:
    // embedding = $10, 
    // and params.push(JSON.stringify(embedding))
  } catch (err) {
    console.warn('Could not generate embedding:', err.message);
    // Continue without embedding (search will fall back to LIKE)
  }
}
```

**Option B: Run migration script periodically**
```powershell
# Run weekly or after adding items manually
node scripts/generate-embeddings.js
```

---

## 🧪 Testing the Implementation

### Test 1: Semantic Search Works
Search for "dark blue umbrella" - it should find items with similar meaning even if exact wording is different.

### Test 2: Typo Tolerance
Search for "lapto" - it should find "laptop" items.

### Test 3: Student ID Still Works
Search with student ID "221-01878" - should use exact match (fast).

### Test 4: Fallback Works
If embedding fails, it should fall back to LIKE search automatically.

---

## 📊 How It Works

### Vector Search Flow:
```
User enters: "black bag"
        ↓
Generate embedding for "black bag"
        ↓
Query database: SELECT items WHERE embedding is most similar
        ↓
Results ranked by semantic similarity (not just keyword matching)
```

### Student ID Flow (unchanged):
```
User enters: "221-01878"
        ↓
Detect student ID format
        ↓
Query database: SELECT items WHERE student_id = '221-01878'
        ↓
Exact match (fast!)
```

---

## 🛠️ Troubleshooting

### Issue: "embedding column not found"
**Solution:** Make sure you ran the ALTER TABLE statement in Step 3.

### Issue: Embedding generation is very slow
**Solution:** This is normal for the first run. The model is being downloaded and cached. Subsequent runs will be faster.

### Issue: "EXTENSION vector not found"
**Solution:** Make sure PostgreSQL has pgvector installed:
```sql
CREATE EXTENSION vector;
```

### Issue: Search returns empty results
**Solution:** Make sure you ran the embedding migration script in Step 4.

### Issue: Models downloading to wrong location
**Solution:** Set environment variable:
```powershell
$env:HF_HOME = "C:\path\to\cache"
```

---

## 📝 Configuration Tips

### Adjust Search Sensitivity (in backend/services/embeddingService.js)

If search is too strict (missing results):
- Current threshold in SQL: similarity-based ordering (no threshold)
- To add threshold: `AND (1 - (embedding <=> $1::vector)) > 0.3`

If search is finding too many irrelevant results:
- Increase threshold: `> 0.5` or `> 0.6`

---

## 🚀 Performance Notes

- **First search:** ~2-3 seconds (model loading on first use)
- **Subsequent searches:** ~100-500ms (depends on database size)
- **Embedding generation:** ~50-100ms per item

### To speed up:
1. Create PostgreSQL index (already done)
2. Use quantized model (already enabled)
3. Increase `lists` parameter in index if >10,000 items

---

## ✨ Next Features

Future enhancements you could add:
- [ ] Cache embeddings in Redis for faster search
- [ ] Batch embedding generation on backend startup
- [ ] Image-based search using image embeddings
- [ ] Hybrid search (combine vector + metadata filters)

---

## 📚 Resources

- pgvector docs: https://github.com/pgvector/pgvector
- Xenova/transformers: https://github.com/xenova/transformers.js
- Sentence transformers: https://www.sbert.net/

---

## ❓ Questions?

If something doesn't work:
1. Check browser console for errors
2. Check terminal output for backend logs
3. Verify database connection with `psql`
4. Check that embedding column exists: `SELECT COUNT(*) FROM items WHERE embedding IS NOT NULL`

Good luck! 🎉
