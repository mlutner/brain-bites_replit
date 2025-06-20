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
    console.log('Starting PDF OCR with improved approach...');
    
    // Step 1: Try embedded text extraction first
    const buffer = await readFile(filePath);
    
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      
      if (data.text && data.text.trim().length > 100) {
        console.log('Found embedded text in PDF:', data.text.length, 'characters');
        return data.text;
      }
      console.log('Minimal embedded text found, attempting image conversion...');
    } catch (parseError) {
      console.log('PDF text parsing failed, attempting image conversion...');
    }
    
    // Step 2: Convert PDF to images and OCR if embedded text is insufficient
    try {
      const pdf2pic = (await import('pdf2pic')).default;
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      
      // Create temporary directory for images
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-ocr-'));
      
      const options = {
        density: 200,
        saveFilename: "page",
        savePath: tempDir,
        format: "png",
        width: 1200,
        height: 1600
      };
      
      const convert = pdf2pic.fromPath(filePath, options);
      
      // Convert first 3 pages maximum to avoid long processing times
      const pages = await convert.bulk(-1);
      let combinedText = '';
      
      for (const page of pages) {
        if (page.path && fs.existsSync(page.path)) {
          try {
            const pageBuffer = await readFile(page.path);
            const result = await Tesseract.recognize(pageBuffer, 'eng', {
              logger: () => {} // Disable logging for batch processing
            });
            
            const pageText = result.data.text || '';
            if (pageText.trim().length > 20) {
              combinedText += pageText + '\n\n';
            }
            
            // Clean up individual page file
            fs.unlinkSync(page.path);
          } catch (pageError) {
            console.log('OCR failed for page, skipping...');
          }
        }
      }
      
      // Clean up temporary directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.log('Temporary directory cleanup failed (non-critical)');
      }
      
      if (combinedText.trim().length > 100) {
        console.log('Successfully extracted text via PDF-to-image OCR:', combinedText.length, 'characters');
        return combinedText.trim();
      }
      
    } catch (conversionError) {
      console.log('PDF to image conversion failed:', conversionError instanceof Error ? conversionError.message : conversionError);
    }
    
    // Final fallback message
    return `This PDF appears to contain primarily images or scanned content that couldn't be processed automatically. 

To get the best results:
1. Try uploading a text-based PDF where you can select and copy text
2. Convert the PDF content to a plain text file
3. Ensure the document contains clear, readable text

FlashGen works best with text-based documents containing substantial educational content.`;
    
  } catch (error) {
    console.error('PDF OCR processing failed:', error);
    return 'This PDF could not be processed automatically. Please try uploading a text-based PDF or convert your content to a plain text file for best results.';
  }
}