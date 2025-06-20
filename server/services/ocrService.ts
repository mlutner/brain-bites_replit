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
    console.log('Starting enhanced PDF text extraction...');
    
    // Step 1: Try multiple PDF text extraction methods
    const buffer = await readFile(filePath);
    
    // Method 1: pdf-parse (most reliable for text-based PDFs)
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      
      if (data.text && data.text.trim().length > 50) {
        console.log('Successfully extracted text via pdf-parse:', data.text.length, 'characters');
        return data.text.trim();
      }
      console.log('pdf-parse returned minimal text, trying alternative methods...');
    } catch (parseError) {
      console.log('pdf-parse failed:', parseError instanceof Error ? parseError.message : parseError);
    }
    
    // Method 2: Try pdfjs-dist as fallback
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configure worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        verbosity: 0 // Suppress warnings
      });
      
      const pdf = await loadingTask.promise;
      let combinedText = '';
      
      // Extract text from first 5 pages maximum
      const maxPages = Math.min(pdf.numPages, 5);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .trim();
          
          if (pageText.length > 10) {
            combinedText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.log(`Failed to extract text from page ${pageNum}, skipping...`);
        }
      }
      
      if (combinedText.trim().length > 50) {
        console.log('Successfully extracted text via pdfjs-dist:', combinedText.length, 'characters');
        return combinedText.trim();
      }
      
    } catch (pdfjsError) {
      console.log('pdfjs-dist extraction failed:', pdfjsError instanceof Error ? pdfjsError.message : pdfjsError);
    }
    
    // If no substantial text was extracted, return helpful guidance
    return `This PDF appears to contain primarily images, scanned content, or complex formatting that couldn't be processed automatically.

For the best results with FlashGen:
• Upload a text-based PDF where you can select and copy text
• Convert your content to a plain text (.txt) file
• Ensure the document contains clear, readable educational content

Text-based documents work much better for generating study materials.`;
    
  } catch (error) {
    console.error('PDF text extraction failed completely:', error);
    return 'This PDF could not be processed. Please try uploading a text-based PDF or convert your content to a plain text file.';
  }
}