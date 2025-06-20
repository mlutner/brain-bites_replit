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
    return '';
  }
}

async function extractTextFromPDFWithOCR(filePath: string): Promise<string> {
  try {
    // Import PDF.js
    const pdfjs = await import('pdfjs-dist');
    const { createCanvas } = await import('canvas');
    
    const pdfBuffer = await readFile(filePath);
    let extractedText = '';
    
    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF has ${pdf.numPages} pages, processing first 3 for OCR...`);
    
    // Process first 3 pages to avoid long processing times
    const maxPages = Math.min(pdf.numPages, 3);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum} for OCR...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas for rendering
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image buffer
        const imageBuffer = canvas.toBuffer('image/png');
        
        // Run OCR on the rendered page
        console.log(`Running OCR on page ${pageNum}...`);
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`Page ${pageNum} OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        if (text && text.trim().length > 10) {
          extractedText += `\n--- Page ${pageNum} ---\n${text}\n`;
          console.log(`Extracted ${text.length} characters from page ${pageNum}`);
        }
        
      } catch (pageError) {
        console.log(`Failed to process page ${pageNum}:`, pageError.message);
      }
    }
    
    return extractedText.trim();
    
  } catch (error) {
    console.error('PDF OCR processing failed:', error);
    return '';
  }
}