# Brain Bites - AI-Powered Study Material Generator

## Overview

Brain Bites is a full-stack web application that transforms uploaded documents into interactive study materials using AI. Users can upload PDF or text files and generate flashcards or quizzes automatically. The application features a playful yet professional design with a green and pink color scheme, centered around a friendly brain character with glasses. The interface provides intuitive file management with direct action buttons for generating flashcards, quizzes, and deleting files.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite with hot module replacement for development

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **File Handling**: Multer for multipart file uploads
- **AI Integration**: OpenAI GPT-4o for content generation

### Authentication
- **Provider**: Replit Auth (OAuth-based authentication)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with secure flags in production

## Key Components

### Database Schema
- **Users Table**: Stores user profiles (required for Replit Auth)
- **Sessions Table**: Manages user sessions (required for Replit Auth)
- **Uploaded Files Table**: Tracks uploaded documents with metadata
- **Generations Table**: Stores AI-generated study materials

### File Processing Service
- **Supported Formats**: PDF and plain text files
- **Size Limit**: 10MB maximum file size
- **Text Extraction**: Built-in text extraction with fallback for PDF processing
- **Validation**: File type and size validation before processing

### AI Content Generation
- **Model**: OpenAI GPT-4o for high-quality content generation
- **Flashcard Generation**: Creates question-answer pairs with difficulty levels
- **Quiz Generation**: Produces multiple-choice questions with explanations
- **Difficulty Assessment**: Automatic or manual difficulty level assignment

### UI Components
- **File Upload**: Drag-and-drop interface with progress indicators
- **Study Sessions**: Interactive flashcard and quiz interfaces
- **Results Display**: Generated content with export and study options
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

1. **File Upload**: User uploads document → Server validates and stores file → Text extraction occurs
2. **Content Generation**: User selects format (flashcards/quiz) → AI processes extracted text → Generated content stored in database
3. **Study Session**: User accesses generated materials → Interactive study interface loads → Progress tracking and analytics
4. **Data Persistence**: All user interactions and generated content persisted to PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for PostgreSQL
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **openai**: Official OpenAI API client
- **drizzle-orm**: Type-safe database ORM

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management

### Third-Party Services
- **OpenAI API**: AI content generation
- **Replit Auth**: User authentication service
- **PostgreSQL**: Primary database storage

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts both frontend and backend with HMR
- **Port**: Application runs on port 5000 with proxy setup
- **Database**: Requires `DATABASE_URL` environment variable
- **AI Service**: Requires `OPENAI_API_KEY` environment variable

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild compiles server code to `dist/index.js`
- **Deployment**: Replit autoscale deployment with health checks
- **Environment**: Production mode with secure session cookies

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit authentication identifier
- `ISSUER_URL`: OAuth issuer endpoint

## Changelog

Changelog:
- June 20, 2025. Initial setup and complete implementation
  - Created full-stack FlashGen application with React frontend and Express backend
  - Implemented Replit Auth for user authentication and session management
  - Built comprehensive file upload system supporting PDF and text files (up to 10MB)
  - Integrated OpenAI GPT-4o for AI-powered content generation
  - Created interactive flashcard and quiz study components with progress tracking
  - Established PostgreSQL database with proper schema and migrations
  - Implemented minimalist Linear-inspired design with responsive UI
  - Added error handling and loading states throughout the application
  - Successfully deployed and tested all core functionality
  - Debugged and confirmed quiz/flashcard generation working with OpenAI API
  - Improved PDF text extraction error handling and logging
  - Fixed server crashes caused by PDF processing errors with global error handlers
  - Enhanced OCR service with improved error isolation and pdf2pic integration
  - Application now handles problematic PDF files gracefully without crashing
  - Replaced unreliable Tesseract OCR with Mistral OCR API for superior text extraction
  - Implemented AI-powered PDF and image text extraction using Mistral OCR latest model
  - Successfully integrated Mistral OCR API with proper markdown response parsing
  - Significantly improved text extraction accuracy and reliability for scanned documents
  - Fixed text extraction response parsing to handle Mistral OCR's markdown format output
  - Text extraction now properly extracts 6,000+ characters instead of partial 130 character responses
  - Complete rebranding to "Brain Bites" with green/pink color scheme and friendly brain mascot
  - Updated UI with Brain Bites branding, improved color palette, and custom styling
  - Enhanced file management interface with dedicated action buttons for flashcards and quizzes
  - Replaced generic "Study" button with specific "Generate Flashcards" and "Generate Quiz" options
  - Added file deletion functionality with dropdown menu and confirmation
  - Implemented separate sections for "Your Files" and "Recent Study Materials"
  - Applied Brain Bites design language throughout the application with gradient buttons and themed cards
- Added comprehensive Settings page with user preferences, study configurations, and account management
- Implemented functional navigation between Dashboard, Settings, and Home pages
- Created settings categories: Profile, Study Preferences, AI Personality, Notifications, Interface, Data & Privacy, and Help & Support
- Comprehensive code refactoring completed for improved maintainability and type safety:
  - Created reusable common components (PageHeader, Navigation, StatCard, LoadingOverlay)
  - Implemented centralized type definitions in shared/types.ts
  - Added utility modules for constants, formatters, and validation
  - Refactored server services with centralized OpenAI client configuration
  - Reduced code duplication across React components and server modules
  - Improved error handling with dedicated validation utilities
  - Enhanced TypeScript type safety throughout the application

## User Preferences

Preferred communication style: Simple, everyday language.