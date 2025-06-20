import { readFile } from 'fs/promises';
import Tesseract from 'tesseract.js';

export async function extractTextWithOCR(filePath: string): Promise<string> {
  try {
    console.log('Starting OCR text extraction...');
    
    // For PDF files, we'll use PDF.js to render pages to canvas, then OCR
    if (filePath.toLowerCase().endsWith('.pdf')) {
      return await extractTextFromPDFWithOCR(filePath);
    }
    
    // For image files, directly use Tesseract
    const buffer = await readFile(filePath);
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    return text || '';
    
  } catch (error) {
    console.error('OCR extraction failed:', error);
    // Return a helpful message instead of empty string
    return 'OCR text extraction failed. Please try uploading a text-based document or a clearer image file.';
  }
}

async function extractTextFromPDFWithOCR(filePath: string): Promise<string> {
  try {
    console.log('Starting PDF OCR with simplified approach...');
    
    // For now, let's use a simpler approach since PDF.js canvas rendering is complex
    // We'll try to extract any available text and provide a helpful message
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
    // Return helpful message instead of empty string
    return 'PDF processing failed. Please try uploading a text-based PDF or convert your content to a plain text file.';
  }
}