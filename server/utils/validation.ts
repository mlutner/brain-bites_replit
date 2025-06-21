import { Response } from "express";

export function handleValidationError(res: Response, errors: any[]) {
  return res.status(400).json({ 
    message: 'Invalid request', 
    errors 
  });
}

export function handleNotFound(res: Response, message: string = 'Resource not found') {
  return res.status(404).json({ message });
}

export function handleUnauthorized(res: Response, message: string = 'Unauthorized') {
  return res.status(401).json({ message });
}

export function handleServerError(res: Response, error: any, message: string = 'Internal server error') {
  console.error('Server error:', error);
  return res.status(500).json({ 
    message,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}

export function validateTextContent(text: string, minLength: number = 50): { isValid: boolean; error?: string } {
  if (!text) {
    return { isValid: false, error: 'No text content found' };
  }
  
  if (text.trim().length < minLength) {
    return { 
      isValid: false, 
      error: `Text content is too short to generate meaningful study materials. Please upload a document with more content (minimum ${minLength} characters).`
    };
  }
  
  return { isValid: true };
}