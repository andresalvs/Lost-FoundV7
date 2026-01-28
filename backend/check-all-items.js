import pool from './db.js';

async function checkAllItems() {
  try {
    const result = await pool.query(`
      SELECT id, name, category, type, status, embedding IS NOT NULL as has_embedding, created_at
      FROM items 
      WHERE type = 'found' AND category = 'general'
      ORDER BY created_at DESC 
      LIMIT 15
    `);
    
    console.log('\n📦 Found Items (General Category):');
    console.log('==================================');
    console.log(`Total: ${result.rows.length}\n`);
    
    result.rows.forEach(item => {
      console.log(`✓ ${item.name}`);
      console.log(`  Status: ${item.status} | Has Embedding: ${item.has_embedding ? '✅' : '❌'}`);
    });
    
    console.log('\n==================================');
  } catch (err) {
    console.error('Error:', err);
  }
  
  process.exit(0);
}

checkAllItems();
