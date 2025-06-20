import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is not configured");
}

interface FlashcardPair {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateFlashcards(
  text: string,
  difficulty: string = 'auto'
): Promise<FlashcardPair[]> {
  console.log('Starting flashcard generation with difficulty:', difficulty);
  console.log('Text length:', text.length);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const difficultyPrompt = difficulty === 'auto' 
    ? "Automatically determine appropriate difficulty levels based on content complexity."
    : `Generate cards at ${difficulty} difficulty level.`;

  const prompt = `
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
    
    ${text.substring(0, 8000)}
  `;

  try {
    console.log('Making OpenAI API call for flashcards...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in flashcard generation. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log('OpenAI API response received');
    const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
    console.log('Parsed response structure:', Object.keys(result));
    
    // Handle both array and object with array property
    const flashcards = Array.isArray(result) ? result : (result.flashcards || []);
    console.log('Raw flashcards count:', flashcards.length);
    
    const processedFlashcards = flashcards.map((card: any) => ({
      question: card.question || "",
      answer: card.answer || "",
      difficulty: card.difficulty || 'medium'
    }));

    console.log('Processed flashcards count:', processedFlashcards.length);
    return processedFlashcards;

  } catch (error) {
    console.error("Error generating flashcards:", error);
    console.error("Error details:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error("Failed to generate flashcards: " + (error as Error).message);
  }
}

export async function generateQuiz(
  text: string,
  questionCount: number = 10,
  difficulty: string = 'auto'
): Promise<QuizQuestion[]> {
  console.log('Starting quiz generation with difficulty:', difficulty);
  console.log('Text length:', text.length);
  console.log('Question count requested:', questionCount);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const difficultyPrompt = difficulty === 'auto' 
    ? "Automatically determine appropriate difficulty levels based on content complexity."
    : `Generate questions at ${difficulty} difficulty level.`;

  const prompt = `
    Analyze the following text and generate a comprehensive multiple-choice quiz.
    ${difficultyPrompt}
    
    Create ${questionCount} multiple-choice questions that:
    - Test understanding of key concepts and details
    - Include 4 plausible answer options each
    - Have clear, unambiguous correct answers
    - Include smart distractors (wrong answers that seem reasonable)
    - Provide explanations for the correct answers
    
    Return a JSON object with this exact format:
    {
      "questions": [
        {
          "question": "Clear, specific question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Why this answer is correct",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Generate questions from this text:
    
    ${text.substring(0, 8000)}
  `;

  try {
    console.log('Making OpenAI API call for quiz...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in quiz generation. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log('OpenAI API response received for quiz');
    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    console.log('Parsed quiz response structure:', Object.keys(result));
    
    // Handle both array and object with array property
    const questions = Array.isArray(result) ? result : (result.questions || []);
    console.log('Raw questions count:', questions.length);
    
    const processedQuestions = questions.slice(0, questionCount).map((q: any) => ({
      question: q.question || "",
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || "",
      difficulty: q.difficulty || 'medium'
    }));

    console.log('Processed questions count:', processedQuestions.length);
    return processedQuestions;

  } catch (error) {
    console.error("Error generating quiz:", error);
    console.error("Error details:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error("Failed to generate quiz: " + (error as Error).message);
  }
}

export async function assessDifficulty(text: string): Promise<'easy' | 'medium' | 'hard'> {
  const prompt = `
    Analyze the following text and assess its academic difficulty level.
    Consider factors like:
    - Vocabulary complexity
    - Concept difficulty
    - Technical terminology
    - Subject matter complexity
    
    Respond with JSON in this format:
    {
      "difficulty": "easy|medium|hard",
      "reasoning": "Brief explanation of the assessment"
    }
    
    Text to analyze:
    ${text.substring(0, 2000)}...
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational content analyzer. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"difficulty": "medium"}');
    return result.difficulty || 'medium';

  } catch (error) {
    console.error("Error assessing difficulty:", error);
    return 'medium'; // Default fallback
  }
}
