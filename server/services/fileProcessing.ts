import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'text/plain') {
      const content = await readFile(filePath, 'utf-8');
      return content;
    }
    
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    }
    
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Failed to extract text from file');
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  let extractedText = '';
  
  // Step 1: Try direct text extraction using pdf-parse
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    extractedText = data.text || '';
    
    // If we got substantial text (more than 100 characters), use it
    if (extractedText.trim().length > 100) {
      console.log('PDF text extraction successful:', extractedText.length, 'characters');
      return extractedText;
    }
    
    console.log('Minimal text extracted via direct method, trying OCR fallback');
  } catch (error) {
    console.error('Direct PDF text extraction failed:', error);
  }
  
  // Step 2: OCR fallback using Tesseract.js
  try {
    const pdf2pic = (await import('pdf2pic')).default;
    const Tesseract = (await import('tesseract.js')).default;
    
    // Convert PDF to images
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,
      saveFilename: "page",
      savePath: "/tmp",
      format: "png",
      width: 2000,
      height: 2000
    });
    
    const imageResults = await convert.bulk(-1); // Convert all pages
    
    let ocrText = '';
    
    // OCR each page
    for (const result of imageResults) {
      try {
        const worker = await Tesseract.createWorker('eng');
        const { data: { text } } = await worker.recognize(result.path);
        ocrText += text + '\n';
        await worker.terminate();
        
        // Clean up temporary image file
        try {
          fs.unlinkSync(result.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', result.path);
        }
      } catch (pageError) {
        console.error('OCR failed for page:', pageError);
      }
    }
    
    if (ocrText.trim().length > 0) {
      console.log('OCR text extraction successful:', ocrText.length, 'characters');
      return ocrText;
    }
    
  } catch (ocrError) {
    console.error('OCR fallback failed:', ocrError);
  }
  
  // Step 3: Final fallback
  if (extractedText.trim().length > 0) {
    return extractedText;
  }
  
  return "Unable to extract readable text from this PDF. The document may contain only images, be password-protected, or have poor quality text. Please try uploading a text file or a PDF with better text quality.";
}

export function validateFile(file: any): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['text/plain', 'application/pdf'];
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Only PDF and TXT files are supported' };
  }
  
  return { isValid: true };
}
