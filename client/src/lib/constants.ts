export const DIFFICULTY_LEVELS = {
  auto: 'Auto-detect',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
} as const;

export const QUIZ_LENGTHS = [
  { value: 5, label: '5 questions' },
  { value: 10, label: '10 questions' },
  { value: 15, label: '15 questions' },
  { value: 20, label: '20 questions' }
] as const;

export const AI_PERSONALITIES = {
  encouraging: 'Encouraging & Supportive',
  balanced: 'Balanced & Professional',
  concise: 'Direct & Concise',
  detailed: 'Detailed & Thorough'
} as const;

export const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  supportedTypes: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png']
} as const;

export const GENERATION_TYPES = {
  flashcards: 'flashcards',
  quiz: 'quiz'
} as const;

export const NAVIGATION_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/', label: 'My Library' },
  { href: '/settings', label: 'Settings' }
] as const;