import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { createCanvas, loadImage } from 'canvas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractTextWithOpenAI(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Starting OpenAI-based text extraction...');
    
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDFWithOpenAI(filePath);
    }
    
    // For image files, use OpenAI Vision directly
    if (mimeType.startsWith('image/')) {
      return await extractTextFromImageWithOpenAI(filePath, mimeType);
    }
    
    return 'Unsupported file type for OpenAI text extraction';
    
  } catch (error) {
    console.error('OpenAI text extraction failed:', error);
    return 'Text extraction failed. Please try uploading a different file or convert to plain text.';
  }
}

async function extractTextFromPDFWithOpenAI(filePath: string): Promise<string> {
  try {
    console.log('Converting PDF to images for OpenAI Vision processing...');
    
    // Use pdf2pic to convert PDF to images
    const pdf2pic = (await import('pdf2pic')).default;
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    
    // Create temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-openai-'));
    
    const options = {
      density: 300, // Higher quality for better OCR
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 2000,
      height: 2600
    };
    
    const convert = pdf2pic.fromPath(filePath, options);
    
    // Convert first 5 pages maximum
    const pages = await convert.bulk(-1);
    let combinedText = '';
    
    // Process each page with OpenAI Vision
    for (let i = 0; i < Math.min(pages.length, 5); i++) {
      const page = pages[i];
      
      if (page.path && fs.existsSync(page.path)) {
        try {
          console.log(`Processing page ${i + 1} with OpenAI Vision...`);
          
          // Read image and convert to base64
          const imageBuffer = await readFile(page.path);
          const base64Image = imageBuffer.toString('base64');
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
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
                    image_url: {
                      url: `data:image/png;base64,${base64Image}`,
                      detail: "high"
                    }
                  }
                ]
              }
            ],
            max_tokens: 2000,
            temperature: 0
          });
          
          const pageText = response.choices[0]?.message?.content || '';
          if (pageText.trim().length > 20) {
            combinedText += pageText + '\n\n';
            console.log(`Extracted ${pageText.length} characters from page ${i + 1}`);
          }
          
          // Clean up individual page file
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
      console.log('Successfully extracted text via OpenAI Vision:', combinedText.length, 'characters');
      return combinedText.trim();
    }
    
    return 'Could not extract sufficient text from this PDF using AI vision processing. Please try uploading a text-based PDF or convert to plain text.';
    
  } catch (error) {
    console.error('OpenAI PDF processing failed:', error);
    return 'PDF processing with AI failed. Please try uploading a text-based PDF or convert to plain text.';
  }
}

async function extractTextFromImageWithOpenAI(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log('Processing image with OpenAI Vision...');
    
    // Read image and convert to base64
    const imageBuffer = await readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine the correct MIME type for the data URL
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
              image_url: {
                url: dataUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0
    });
    
    const extractedText = response.choices[0]?.message?.content || '';
    
    if (extractedText.trim().length > 10) {
      console.log('Successfully extracted text via OpenAI Vision:', extractedText.length, 'characters');
      return extractedText.trim();
    }
    
    return 'Could not extract text from this image using AI vision processing. Please ensure the image contains clear, readable text.';
    
  } catch (error) {
    console.error('OpenAI image processing failed:', error);
    return 'Image processing with AI failed. Please try uploading a clearer image or convert to text format.';
  }
}