const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Path to your test PDF or DOCX file
const filePath = path.join(__dirname, 'test-resume.pdf'); // Change this to your test file path

async function testUpload() {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Test file does not exist: ${filePath}`);
      return;
    }

    const form = new FormData();
    form.append('resume', fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: path.extname(filePath) === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    console.log('Uploading file:', filePath);
    console.log('Form data headers:', form.getHeaders());
    
    const response = await fetch('http://localhost:5000/api/resumes/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders() // This is important for node-fetch
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error during test upload:', error);
  }
}

testUpload();
