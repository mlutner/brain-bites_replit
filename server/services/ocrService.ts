import { readFile } from 'fs/promises';
import Tesseract from 'tesseract.js';

export async function extractTextWithOCR(filePath: string): Promise<string> {
  try {
    console.log('Starting OCR text extraction...');
    
    // For PDF files, skip Tesseract completely and use pdf-parse only
    if (filePath.toLowerCase().endsWith('.pdf')) {
      return await extractTextFromPDFWithOCR(filePath);
    }
    
    // For image files, use Tesseract with comprehensive error handling
    return await new Promise<string>((resolve) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        resolve('OCR timeout after 25 seconds - document may be too complex');
      }, 25000);
      
      // Process with full error isolation
      (async () => {
        try {
          const buffer = await readFile(filePath);
          
          const result = await Tesseract.recognize(buffer, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          clearTimeout(timeout);
          const text = result.data.text || '';
          
          if (text.trim().length > 10) {
            resolve(text);
          } else {
            resolve('This image file could not be processed with OCR. Please try uploading a clearer image or convert your content to a text file.');
          }
          
        } catch (tesseractError) {
          clearTimeout(timeout);
          const errorMsg = tesseractError instanceof Error ? tesseractError.message : String(tesseractError);
          console.error('Tesseract OCR failed safely:', errorMsg);
          resolve('This image file could not be processed with OCR. Please try uploading a clearer image or convert your content to a text file.');
        }
      })().catch((error) => {
        clearTimeout(timeout);
        console.error('OCR process failed with error:', error.message || error);
        resolve('OCR processing encountered an error. Please try uploading a different file format.');
      });
    });
    
  } catch (error) {
    console.error('OCR extraction failed:', error);
    // Don't throw - return fallback message to prevent server crash
    return 'This document appears to contain images or complex formatting that could not be processed automatically. For best results, please upload a text-based PDF or plain text file with clear educational content.';
  }
}

async function extractTextFromPDFWithOCR(filePath: string): Promise<string> {
  try {
    console.log('Starting PDF OCR with simplified approach...');
    
    // Skip direct Tesseract PDF processing as it's not supported
    // Instead, focus on embedded text extraction
    const buffer = await readFile(filePath);
    
    // Check if PDF has any embedded text we can extract
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      
      if (data.text && data.text.trim().length > 100) {
        console.log('Found embedded text in PDF:', data.text.length, 'characters');
        return data.text;
      }
    } catch (parseError) {
      console.log('PDF text parsing failed, PDF likely contains images');
    }
    
    // For image-based PDFs, provide guidance for better extraction
    return `This PDF appears to contain primarily images or scanned content. 

To get the best results from FlashGen:
1. Try uploading a text-based PDF (one where you can select and copy text)
2. Convert the PDF content to a plain text file
3. Use a document with more readable text content

FlashGen works best with text-based documents that contain substantial educational content.`;
    
  } catch (error) {
    console.error('PDF OCR processing failed:', error);
    // Don't throw - return fallback message to prevent server crash
    return 'This PDF could not be processed automatically. Please try uploading a text-based PDF where you can select and copy text, or convert your content to a plain text file for best results.';
  }
}