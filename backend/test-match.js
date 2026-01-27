import db from './db.js';

async function testMatch() {
  try {
    // Get ID items
    const result = await db.query(`
      SELECT id, category, student_id, name, type, status
      FROM items 
      WHERE category = 'id'
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('=== ID Items in Database ===');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`  Category: ${row.category}`);
      console.log(`  Type: ${row.type}`);
      console.log(`  Status: ${row.status}`);
      console.log(`  Student ID: "${row.student_id}" (type: ${typeof row.student_id})`);
      console.log(`  Name: "${row.name}"`);
      console.log('---');
    });
    
    // Show lost vs found
    const lost = result.rows.filter(r => r.type === 'lost');
    const found = result.rows.filter(r => r.type === 'found');
    
    console.log(`\nSummary: ${lost.length} lost, ${found.length} found`);
    
    if (lost.length > 0 && found.length > 0) {
      console.log('\nPotential Match Test:');
      const l = lost[0];
      const f = found[0];
      console.log(`Lost: student_id="${l.student_id}", name="${l.name}"`);
      console.log(`Found: student_id="${f.student_id}", name="${f.name}"`);
      console.log(`Student IDs match: ${l.student_id === f.student_id}`);
      console.log(`Student IDs (lowercased) match: ${(l.student_id || '').toLowerCase() === (f.student_id || '').toLowerCase()}`);
    }

    // Check for existing matches
    console.log('\n=== Checking for Existing Matches ===');
    const matches = await db.query(`
      SELECT m.id, m.lost_item_id, m.found_item_id, m.confidence, m.created_at
      FROM matches m
      INNER JOIN items i1 ON m.lost_item_id = i1.id
      INNER JOIN items i2 ON m.found_item_id = i2.id
      WHERE i1.category = 'id' OR i2.category = 'id'
      ORDER BY m.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${matches.rows.length} matches with ID category items`);
    matches.rows.forEach(m => {
      console.log(`  Match ${m.id}: lost=${m.lost_item_id.substring(0,8)}... found=${m.found_item_id.substring(0,8)}... confidence=${m.confidence}%`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testMatch();
