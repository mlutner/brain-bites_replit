import { readFile } from 'fs/promises';

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
    
    const response = await fetch('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: {
          type: "document_base64",
          data: base64Pdf
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    let extractedText = '';
    
    if (result.text) {
      extractedText = result.text;
    } else if (result.pages) {
      for (const page of result.pages) {
        if (page.text) {
          extractedText += page.text + '\n\n';
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
    
    const response = await fetch('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: {
          type: "image_base64",
          data: base64Image
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    let extractedText = '';
    
    if (result.text) {
      extractedText = result.text;
    } else if (result.pages) {
      for (const page of result.pages) {
        if (page.text) {
          extractedText += page.text + '\n\n';
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