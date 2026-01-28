/**
 * Migration Script - Generate embeddings for all existing items
 * Run this ONCE after setting up the embedding service
 * Usage: node backend/scripts/generate-embeddings.js
 */

import pool from '../db.js';
import { getEmbedding } from '../services/embeddingService.js';

async function populateEmbeddings() {
  try {
    console.log('🔍 Fetching items without embeddings...');
    
    // Get all items that don't have embeddings yet
    const result = await pool.query(
      `SELECT id, name, brand, color, description 
       FROM items 
       WHERE embedding IS NULL 
       AND type = 'found' 
       AND status = 'in_security_custody'
       LIMIT 1000`
    );

    const items = result.rows;
    
    if (items.length === 0) {
      console.log('✅ All items already have embeddings!');
      process.exit(0);
    }

    console.log(`📊 Found ${items.length} items to embed`);
    console.log('⏳ Starting embedding generation... (this may take a while)\n');

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Combine all text fields for better embeddings
        const textToEmbed = [
          item.name,
          item.brand,
          item.color,
          item.description
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (!textToEmbed) {
          console.log(`⏭️  Skipping item ${item.id} (no text content)`);
          continue;
        }

        // Generate embedding
        const embedding = await getEmbedding(textToEmbed);

        // Store in database
        await pool.query(
          `UPDATE items 
           SET embedding = $1::vector 
           WHERE id = $2`,
          [JSON.stringify(embedding), item.id]
        );

        successCount++;
        const progress = Math.round(((i + 1) / items.length) * 100);
        console.log(`✓ [${progress}%] Item: "${item.name}" (ID: ${item.id})`);

      } catch (error) {
        failureCount++;
        console.error(`✗ Failed for item ${item.id}:`, error.message);
      }

      // Add delay to avoid overwhelming the model
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${items.length}\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n========================================');
    console.log(`✅ Embedding generation complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failures: ${failureCount}`);
    console.log('========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
populateEmbeddings();
