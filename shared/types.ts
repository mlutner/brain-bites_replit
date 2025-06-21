// Centralized type definitions for better type safety across the application

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  hasText: boolean;
  extractedText?: string;
  userId: string;
}

export interface Generation {
  id: number;
  type: 'flashcards' | 'quiz';
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'auto';
  questionCount?: number;
  createdAt: string;
  userId: string;
  fileId: number;
  content: any[];
}

export interface DashboardStats {
  totalGenerations: number;
  flashcardsCount: number;
  quizzesCount: number;
  totalFiles: number;
  studyStreak: number;
  recentActivity: number;
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentGenerations: Array<{
    id: number;
    type: string;
    title: string;
    difficulty: string;
    createdAt: string;
  }>;
}

export interface FlashcardPair {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GenerationRequest {
  fileId: number;
  type: 'flashcards' | 'quiz';
  difficulty: 'easy' | 'medium' | 'hard' | 'auto';
  questionCount?: number;
}

export interface ApiError {
  message: string;
  error?: string;
  errors?: any[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'auto';
export type GenerationType = 'flashcards' | 'quiz';