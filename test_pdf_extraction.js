import { extractTextFromFile } from './server/services/fileProcessing.js';
import fs from 'fs';
import path from 'path';

// Test PDF text extraction
async function testPDFExtraction() {
  console.log('Testing PDF text extraction...');
  
  // Check if there are any uploaded files to test with
  const uploadsDir = './uploads';
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length > 0) {
      const testFile = path.join(uploadsDir, pdfFiles[0]);
      console.log(`Testing with file: ${pdfFiles[0]}`);
      
      try {
        const extractedText = await extractTextFromFile(testFile, 'application/pdf');
        console.log('Extraction successful!');
        console.log('Text length:', extractedText.length);
        console.log('Text preview:', extractedText.substring(0, 200) + '...');
      } catch (error) {
        console.error('Extraction failed:', error.message);
      }
    } else {
      console.log('No PDF files found in uploads directory');
    }
  } else {
    console.log('No uploads directory found');
  }
}

testPDFExtraction().catch(console.error);