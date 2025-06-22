import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { OcrManager } from './OcrManager';

const readFile = promisify(fs.readFile);
const ocrManager = new OcrManager(); // Using default Mistral provider

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
  let ocrText = '';
  
  // Step 1: Try direct text extraction using pdf-parse
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);
    extractedText = data.text || '';
    
    // If we got substantial text (more than 50 characters), use it
    if (extractedText.trim().length > 50) {
      console.log('PDF text extraction successful:', extractedText.length, 'characters');
      return extractedText;
    }
    
    console.log('Minimal text extracted via direct method, trying OCR fallback');
  } catch (error) {
    console.log('Direct PDF text extraction failed, will try OCR fallback');
  }
  
  // Step 2: OCR fallback - completely isolated to prevent crashes
  try {
    console.log('Attempting AI-powered text extraction...');
    
    // Wrap OCR in a more robust error boundary
    ocrText = await new Promise<string>((resolve) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        resolve('AI processing timeout - unable to process');
      }, 60000); // Longer timeout for AI processing

      // Use OcrManager for AI-powered text extraction
      ocrManager.extractText(filePath, 'application/pdf')
        .then((text: string) => {
          clearTimeout(timeout);
          resolve(text || 'No text extracted via AI processing');
        })
        .catch((error: any) => {
          clearTimeout(timeout);
          console.error('AI text extraction process failed safely:', error.message || error);
          resolve('AI text processing failed - document may contain complex formatting');
        });
    });

    if (ocrText && ocrText.trim().length > 50 &&
        !ocrText.includes('could not be processed') &&
        !ocrText.includes('processing timeout') &&
        !ocrText.includes('processing failed')) {
      console.log('AI text extraction successful via OcrManager:', ocrText.length, 'characters');
      return ocrText;
    } else {
      console.log('AI (OcrManager) extracted minimal text or returned error message:', ocrText?.length || 0, 'characters');
    }

  } catch (aiError) {
    console.error('AI text extraction (OcrManager) fallback failed, continuing with direct text extraction:', aiError);
    // Don't let AI errors crash the server - just log and continue
  }

  // Step 3: Final fallback - return any text we found, even if minimal
  if (extractedText.trim().length > 0) {
    console.log('Using directly extracted text as fallback:', extractedText.length, 'characters');
    return extractedText;
  }
  
  // If OCR produced some text, use it even if it seemed minimal
  if (ocrText && ocrText.trim().length > 20 && 
      !ocrText.includes('unable to process') && 
      !ocrText.includes('could not be processed')) {
    console.log('Using OCR text as final fallback:', ocrText.length, 'characters');
    return ocrText;
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
