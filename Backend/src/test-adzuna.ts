const axios = require('axios');
require('dotenv').config();

async function testAdzunaCredentials() {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_API_KEY;
  
  console.log('Testing Adzuna API credentials:');
  console.log('APP_ID:', APP_ID ? `${APP_ID.substring(0, 3)}...` : 'undefined');
  console.log('APP_KEY:', APP_KEY ? `${APP_KEY.substring(0, 3)}...` : 'undefined');
  
  if (!APP_ID || !APP_KEY) {
    console.error('Missing API credentials in .env file');
    return;
  }
  
  try {
    // Using the exact same format as your original working code
    const skills = ['JavaScript', 'React', 'Node.js'];
    const what = skills.join(" ");
    console.log('Search query:', what);
    
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1`, {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_API_KEY,
          what_or: what // Using what_or parameter as in your original code
        }
      }
    );
    
    console.log('Success! API credentials are working.');
    console.log('Status:', response.status);
    console.log('Found jobs:', response.data.results.length);
    console.log('First job:', response.data.results[0]?.title);
  } catch (error: any) {
    console.error('API credential test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.statusText);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdzunaCredentials();
