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
    console.log('Processing PDF with Mistral Vision API...');
    
    // For PDFs, let's try to convert to images first since Mistral doesn't directly support PDF
    const pdf2pic = (await import('pdf2pic')).default;
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    // Create temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-mistral-'));
    
    const options = {
      density: 300,
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 2000,
      height: 2600
    };
    
    const convert = pdf2pic.fromPath(filePath, options);
    const pages = await convert.bulk(-1);
    let combinedText = '';
    
    // Process first 3 pages with Mistral Vision
    for (let i = 0; i < Math.min(pages.length, 3); i++) {
      const page = pages[i];
      
      if (page.path && fs.existsSync(page.path)) {
        try {
          console.log(`Processing page ${i + 1} with Mistral Vision...`);
          
          const imageBuffer = await readFile(page.path);
          const base64Image = imageBuffer.toString('base64');
          
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "pixtral-12b-2409",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Please extract all the text from this image. Focus on educational content, headings, paragraphs, and any readable text. Preserve the structure and formatting as much as possible. Return only the extracted text without any commentary."
                    },
                    {
                      type: "image_url",
                      image_url: `data:image/png;base64,${base64Image}`
                    }
                  ]
                }
              ],
              max_tokens: 2000,
              temperature: 0
            })
          });

          if (response.ok) {
            const result = await response.json();
            const pageText = result.choices?.[0]?.message?.content || '';
            
            if (pageText.trim().length > 20) {
              combinedText += pageText + '\n\n';
              console.log(`Extracted ${pageText.length} characters from page ${i + 1}`);
            }
          }
          
          // Clean up page file
          fs.unlinkSync(page.path);
          
        } catch (pageError) {
          console.error(`Failed to process page ${i + 1}:`, pageError);
        }
      }
    }
    
    // Clean up temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.log('Temporary directory cleanup failed (non-critical)');
    }

    if (combinedText.trim().length > 50) {
      console.log('Successfully extracted text via Mistral Vision:', combinedText.length, 'characters');
      return combinedText.trim();
    }
    
    return 'Could not extract sufficient text from this PDF using Mistral Vision. Please try uploading a text-based PDF or convert to plain text.';
    
  } catch (error) {
    console.error('Mistral Vision PDF processing failed:', error);
    return 'PDF processing with Mistral Vision failed. Please try uploading a text-based PDF or convert to plain text.';
  }
}

async function extractTextFromImageWithMistral(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Processing image with Mistral Vision API...');
    
    const imageBuffer = await readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract all the text from this image. Focus on educational content, headings, paragraphs, and any readable text. Preserve the structure and formatting as much as possible. Return only the extracted text without any commentary."
              },
              {
                type: "image_url",
                image_url: `data:${mimeType};base64,${base64Image}`
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
      throw new Error(`Mistral Vision API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const extractedText = result.choices?.[0]?.message?.content || '';

    if (extractedText.trim().length > 10) {
      console.log('Successfully extracted text via Mistral Vision:', extractedText.length, 'characters');
      return extractedText.trim();
    }
    
    return 'Could not extract text from this image using Mistral Vision. Please ensure the image contains clear, readable text.';
    
  } catch (error) {
    console.error('Mistral Vision image processing failed:', error);
    return 'Image processing with Mistral Vision failed. Please try uploading a clearer image or convert to text format.';
  }
}