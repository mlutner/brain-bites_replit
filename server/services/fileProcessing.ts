import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { extractTextWithOCR } from './ocrService';

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
    console.log('Direct PDF text extraction failed, will try OCR fallback');
  }
  
  // Step 2: OCR fallback - completely isolated to prevent crashes
  try {
    console.log('Attempting OCR text extraction...');
    
    // Set a timeout to prevent hanging
    const ocrPromise = extractTextWithOCR(filePath);
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('OCR timeout - unable to process'), 60000);
    });
    
    const ocrText = await Promise.race([ocrPromise, timeoutPromise]);
    
    if (ocrText && ocrText.trim().length > 50 && 
        !ocrText.includes('could not be processed') && 
        !ocrText.includes('OCR timeout')) {
      console.log('OCR text extraction successful:', ocrText.length, 'characters');
      return ocrText;
    } else {
      console.log('OCR extracted minimal text or returned error message:', ocrText?.length || 0, 'characters');
    }
    
  } catch (ocrError) {
    console.error('OCR fallback failed, continuing with direct text extraction:', ocrError);
    // Don't let OCR errors crash the server - just log and continue
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
