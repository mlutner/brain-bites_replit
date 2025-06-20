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
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const buffer = await readFile(filePath);
        const data = await pdfParse(buffer);
        return data.text || 'Unable to extract text from this PDF file.';
      } catch (error) {
        console.error('PDF parsing failed:', error);
        // Fallback: return placeholder text indicating PDF processing failed
        return "PDF text extraction failed. Please try uploading a text file instead or ensure your PDF contains readable text.";
      }
    }
    
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Failed to extract text from file');
  }
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
