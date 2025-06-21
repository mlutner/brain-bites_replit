import OpenAI from "openai";

// Centralized OpenAI client configuration
export const openaiClient = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export function validateOpenAIConfig(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
}

export const OPENAI_CONFIG = {
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 4000,
  textLimit: 8000
} as const;

export interface GenerationPromptConfig {
  type: 'flashcards' | 'quiz';
  difficulty: string;
  questionCount?: number;
}

export function createFlashcardPrompt(text: string, difficulty: string): string {
  const difficultyPrompt = difficulty === 'auto' 
    ? "Automatically determine appropriate difficulty levels based on content complexity."
    : `Generate cards at ${difficulty} difficulty level.`;

  return `
    Analyze the following text and generate comprehensive flashcards for studying.
    ${difficultyPrompt}
    
    Create question-answer pairs that:
    - Cover key concepts, definitions, and important details
    - Are clear, concise, and educational
    - Include a mix of factual recall and conceptual understanding
    - Vary in difficulty from basic recall to deeper analysis
    
    Return a JSON object with this exact format:
    {
      "flashcards": [
        {
          "question": "Clear, specific question",
          "answer": "Comprehensive but concise answer",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Generate 15-25 flashcards from this text:
    
    ${text.substring(0, OPENAI_CONFIG.textLimit)}
  `;
}

export function createQuizPrompt(text: string, questionCount: number, difficulty: string): string {
  const difficultyPrompt = difficulty === 'auto'
    ? "Automatically determine appropriate difficulty levels based on content complexity."
    : `Generate questions at ${difficulty} difficulty level.`;

  return `
    Create a comprehensive quiz with exactly ${questionCount} multiple-choice questions based on the following text.
    ${difficultyPrompt}
    
    Each question should:
    - Test understanding of key concepts from the material
    - Have 4 plausible answer choices (A, B, C, D)
    - Include a clear explanation of why the correct answer is right
    - Cover different aspects of the content
    
    Return a JSON object with this exact format:
    {
      "questions": [
        {
          "question": "Clear, specific question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation of the correct answer",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Generate exactly ${questionCount} questions from this text:
    
    ${text.substring(0, OPENAI_CONFIG.textLimit)}
  `;
}