import pool from './db.js';

async function checkPhoneCharger() {
  try {
    const result = await pool.query(`
      SELECT id, name, category, type, status, embedding IS NOT NULL as has_embedding, created_at
      FROM items 
      WHERE name LIKE '%charger%' OR name LIKE '%phone%'
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📱 Phone/Charger Items Found:');
    console.log('===============================');
    result.rows.forEach(item => {
      console.log(`\nID: ${item.id}`);
      console.log(`Name: ${item.name}`);
      console.log(`Category: ${item.category}`);
      console.log(`Type: ${item.type}`);
      console.log(`Status: ${item.status}`);
      console.log(`Has Embedding: ${item.has_embedding}`);
      console.log(`Created: ${item.created_at}`);
    });
    
    console.log('\n===============================');
  } catch (err) {
    console.error('Error:', err);
  }
  
  process.exit(0);
}

checkPhoneCharger();
