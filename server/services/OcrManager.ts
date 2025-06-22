import { extractTextWithMistral } from './mistralOcr';
import { extractTextWithOpenAI } from './openaiOcr';
import { extractTextWithOCR as extractTextWithTesseract } from './ocrService'; // Assuming this is Tesseract

enum OcrProvider {
  MISTRAL = 'mistral',
  OPENAI = 'openai',
  TESSERACT = 'tesseract', // If you plan to use it
}

export class OcrManager {
  private provider: OcrProvider;

  constructor(provider: OcrProvider = OcrProvider.MISTRAL) {
    this.provider = provider;
    console.log(`OcrManager initialized with provider: ${this.provider}`);
  }

  async extractText(filePath: string, mimeType: string): Promise<string> {
    console.log(`OcrManager attempting to extract text using ${this.provider}`);
    try {
      switch (this.provider) {
        case OcrProvider.MISTRAL:
          return await extractTextWithMistral(filePath, mimeType);
        case OcrProvider.OPENAI:
          // Note: openaiOcr.ts might need adjustments if it's not strictly for PDFs
          // For now, assuming it can handle generic filePaths and mimeTypes like mistralOcr
          return await extractTextWithOpenAI(filePath, mimeType);
        case OcrProvider.TESSERACT:
          // Ensure extractTextWithTesseract is adapted or called correctly
          // It might be more specific to images or PDFs and not a general purpose OCR
          return await extractTextWithTesseract(filePath); // This might need mimeType too
        default:
          console.error(`Unsupported OCR provider: ${this.provider}`);
          throw new Error(`Unsupported OCR provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`Error during text extraction with ${this.provider}:`, error);
      // Rethrow the error to be handled by the caller, or implement specific fallback logic here
      throw error;
    }
  }

  // Optional: Method to change provider at runtime, if needed
  setProvider(provider: OcrProvider): void {
    this.provider = provider;
    console.log(`OcrManager provider switched to: ${this.provider}`);
  }
}

// Example of how it might be instantiated and used by other services
// export const ocrManager = new OcrManager(OcrProvider.MISTRAL);
