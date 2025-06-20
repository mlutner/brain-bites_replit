import { Mistral } from '@mistralai/mistralai';
import { readFile } from 'fs/promises';

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
});

export async function extractTextWithMistral(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Starting Mistral OCR text extraction...');
    
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDFWithMistral(filePath);
    }
    
    if (mimeType.startsWith('image/')) {
      return await extractTextFromImageWithMistral(filePath, mimeType);
    }
    
    return 'Unsupported file type for Mistral text extraction';
    
  } catch (error) {
    console.error('Mistral text extraction failed:', error);
    return 'Text extraction failed with Mistral API. Please try uploading a different file or convert to plain text.';
  }
}

async function extractTextFromPDFWithMistral(filePath: string): Promise<string> {
  try {
    console.log('Processing PDF with Mistral OCR API...');
    
    const pdfBuffer = await readFile(filePath);
    const base64Pdf = pdfBuffer.toString('base64');
    
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: `data:application/pdf;base64,${base64Pdf}`
      },
      includeImageBase64: false
    });
    
    let extractedText = '';
    
    if (ocrResponse.pages && ocrResponse.pages.length > 0) {
      for (const page of ocrResponse.pages) {
        if ((page as any).blocks && (page as any).blocks.length > 0) {
          for (const block of (page as any).blocks) {
            if (block.text) {
              extractedText += block.text + ' ';
            }
          }
          extractedText += '\n\n';
        } else if ((page as any).text) {
          extractedText += (page as any).text + '\n\n';
        }
      }
    }
    
    if (extractedText.trim().length > 50) {
      console.log('Successfully extracted text via Mistral OCR:', extractedText.length, 'characters');
      return extractedText.trim();
    }
    
    return 'Could not extract sufficient text from this PDF using Mistral OCR. Please try uploading a text-based PDF or convert to plain text.';
    
  } catch (error) {
    console.error('Mistral OCR PDF processing failed:', error);
    return 'PDF processing with Mistral OCR failed. Please try uploading a text-based PDF or convert to plain text.';
  }
}

async function extractTextFromImageWithMistral(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Processing image with Mistral OCR API...');
    
    const imageBuffer = await readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        imageUrl: `data:${mimeType};base64,${base64Image}`
      },
      includeImageBase64: false
    });
    
    let extractedText = '';
    
    if (ocrResponse.pages && ocrResponse.pages.length > 0) {
      for (const page of ocrResponse.pages) {
        if ((page as any).blocks && (page as any).blocks.length > 0) {
          for (const block of (page as any).blocks) {
            if (block.text) {
              extractedText += block.text + ' ';
            }
          }
          extractedText += '\n\n';
        } else if ((page as any).text) {
          extractedText += (page as any).text + '\n\n';
        }
      }
    }

    if (extractedText.trim().length > 10) {
      console.log('Successfully extracted text via Mistral OCR:', extractedText.length, 'characters');
      return extractedText.trim();
    }
    
    return 'Could not extract text from this image using Mistral OCR. Please ensure the image contains clear, readable text.';
    
  } catch (error) {
    console.error('Mistral OCR image processing failed:', error);
    return 'Image processing with Mistral OCR failed. Please try uploading a clearer image or convert to text format.';
  }
}