import axios from 'axios';

async function testSearchEndpoint() {
  try {
    // Get the lost item ID
    const lostId = 'e14b6396-4fce-4551-bc8f-5b0ebb914763';
    const reporterId = '00000000-0000-0000-0000-000000000001'; // Admin user ID
    
    console.log('Testing search endpoint with:');
    console.log(`  Lost Item ID: ${lostId}`);
    console.log(`  Reporter ID: ${reporterId}`);
    console.log(`  Query: 221-01898 (student ID)\n`);
    
    const response = await axios.get('http://localhost:5000/api/items/search', {
      params: {
        source_item_id: lostId,
        reporter_id: reporterId,
        query: '221-01898'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Matches found:', response.data?.matches?.length || 0);
    
    if (response.data?.matches) {
      response.data.matches.forEach((m, i) => {
        console.log(`\nMatch ${i+1}:`);
        console.log(`  Found Item: ${m.found_item_id}`);
        console.log(`  Name: ${m.found_item_name}`);
        console.log(`  Student ID: ${m.found_item_student_id}`);
        console.log(`  Confidence: ${m.confidence}%`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
  
  process.exit(0);
}

testSearchEndpoint();
