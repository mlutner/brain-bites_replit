import { Mistral } from '@mistralai/mistralai';
import { readFile } from 'fs/promises';
import path from 'path';

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
});

export async function extractTextWithMistral(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Starting Mistral OCR text extraction...');
    
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDFWithMistral(filePath);
    }
    
    // For image files, use Mistral OCR directly
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
    
    // Read the PDF file as base64
    const pdfBuffer = await readFile(filePath);
    const base64Pdf = pdfBuffer.toString('base64');
    
    // For now, save the file temporarily and use document_url approach
    const fs = await import('fs');
    const os = await import('os');
    const tempFilePath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);
    await fs.promises.writeFile(tempFilePath, pdfBuffer);
    
    try {
      // Use Mistral OCR API to process the document via file upload simulation
      const response = await fetch('https://api.mistral.ai/v1/ocr/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "mistral-ocr-latest",
          document: {
            type: "document_base64",
            document_base64: base64Pdf
          },
          include_image_base64: false
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral OCR API error: ${response.status} ${response.statusText}`);
      }

      const ocrResponse = await response.json();
      
      // Extract text from the response
      let extractedText = '';
      if (ocrResponse.pages && ocrResponse.pages.length > 0) {
        for (const page of ocrResponse.pages) {
          if (page.blocks) {
            for (const block of page.blocks) {
              if (block.text) {
                extractedText += block.text + ' ';
              }
            }
            extractedText += '\n\n';
          } else if (page.text) {
            extractedText += page.text + '\n\n';
          }
        }
      }

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      return extractedText.trim();
    
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
    
    // Read image and convert to base64
    const imageBuffer = await readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Use Mistral OCR API to process the image
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_base64",
        document_base64: base64Image
      },
      include_image_base64: false
    });
    
    // Extract text from the response
    let extractedText = '';
    if (ocrResponse.pages && ocrResponse.pages.length > 0) {
      for (const page of ocrResponse.pages) {
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

async function callMistralVision(base64Image: string): Promise<string> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all the text from this image. Focus on educational content, headings, paragraphs, and any readable text. Preserve the structure and formatting as much as possible. Return only the extracted text without any commentary or explanations.'
              },
              {
                type: 'image_url',
                image_url: `data:image/png;base64,${base64Image}`
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    
    return extractedText;
    
  } catch (error) {
    console.error('Mistral API call failed:', error);
    throw error;
  }
}