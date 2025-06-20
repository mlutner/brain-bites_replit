import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { validateFile, extractTextFromFile } from "./services/fileProcessing";
import { generateFlashcards, generateQuiz, assessDifficulty } from "./services/openai";
import { generateContentSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint
  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const validation = validateFile(req.file);
      if (!validation.isValid) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: validation.error });
      }

      // Create file record
      const fileRecord = await storage.createFile({
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extractedText: null,
      });

      // Extract text in background
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
        await storage.updateFileText(fileRecord.id, extractedText);
      } catch (error) {
        console.error('Text extraction failed:', error);
        // Don't fail the upload, just log the error
      }

      res.json({
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        type: fileRecord.mimeType,
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'File upload failed' });
    }
  });

  // Get user files
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getUserFiles(userId);
      
      res.json(files.map(file => ({
        id: file.id,
        name: file.originalName,
        size: file.size,
        type: file.mimeType,
        uploadedAt: file.createdAt,
        hasText: !!file.extractedText,
      })));
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Failed to fetch files' });
    }
  });

  // Generate content endpoint
  app.post('/api/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('Generate request from user:', userId, 'Body:', req.body);
      
      // Validate request body
      const validation = generateContentSchema.safeParse(req.body);
      if (!validation.success) {
        console.error('Validation failed:', validation.error.errors);
        return res.status(400).json({ 
          message: 'Invalid request', 
          errors: validation.error.errors 
        });
      }

      const { fileId, type, difficulty, questionCount } = validation.data;
      console.log('Processing generation:', { fileId, type, difficulty, questionCount });

      // Get file and verify ownership
      const file = await storage.getFile(fileId);
      if (!file || file.userId !== userId) {
        console.error('File not found or access denied:', fileId, userId);
        return res.status(404).json({ message: 'File not found' });
      }

      console.log('File found:', { 
        id: file.id, 
        name: file.originalName, 
        hasText: !!file.extractedText,
        textLength: file.extractedText?.length || 0
      });

      if (!file.extractedText) {
        return res.status(400).json({ message: 'File text extraction is still in progress' });
      }

      // Assess difficulty if auto
      let finalDifficulty = difficulty;
      if (difficulty === 'auto') {
        console.log('Assessing difficulty automatically...');
        finalDifficulty = await assessDifficulty(file.extractedText);
        console.log('Auto-assessed difficulty:', finalDifficulty);
      }

      let generatedContent: any;
      let title: string;

      console.log('Starting content generation for type:', type);

      if (type === 'flashcards') {
        console.log('Generating flashcards...');
        generatedContent = await generateFlashcards(file.extractedText, finalDifficulty);
        title = `Flashcards from ${file.originalName}`;
        console.log('Generated flashcards count:', generatedContent?.length || 0);
      } else {
        const count = questionCount || 10;
        console.log('Generating quiz with', count, 'questions...');
        generatedContent = await generateQuiz(file.extractedText, count, finalDifficulty);
        title = `Quiz from ${file.originalName}`;
        console.log('Generated quiz questions count:', generatedContent?.length || 0);
      }

      if (!generatedContent || generatedContent.length === 0) {
        console.error('No content generated');
        return res.status(500).json({ 
          message: 'Failed to generate content - no items created'
        });
      }

      console.log('Saving generation to database...');
      // Save generation
      const generation = await storage.createGeneration({
        userId,
        fileId,
        type,
        title,
        content: generatedContent,
        difficulty: finalDifficulty,
        questionCount: type === 'quiz' ? (questionCount || 10) : null,
      });

      console.log('Generation saved with ID:', generation.id);

      res.json({
        id: generation.id,
        type: generation.type,
        title: generation.title,
        content: generation.content,
        difficulty: generation.difficulty,
        questionCount: generation.questionCount,
        createdAt: generation.createdAt,
      });

    } catch (error) {
      console.error('Content generation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: 'Content generation failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user generations
  app.get('/api/generations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const generations = await storage.getUserGenerations(userId);
      
      res.json(generations.map(gen => ({
        id: gen.id,
        type: gen.type,
        title: gen.title,
        difficulty: gen.difficulty,
        questionCount: gen.questionCount,
        createdAt: gen.createdAt,
      })));
    } catch (error) {
      console.error('Error fetching generations:', error);
      res.status(500).json({ message: 'Failed to fetch generations' });
    }
  });

  // Get specific generation
  app.get('/api/generations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const generationId = parseInt(req.params.id);
      
      const generation = await storage.getGeneration(generationId);
      if (!generation || generation.userId !== userId) {
        return res.status(404).json({ message: 'Generation not found' });
      }

      res.json({
        id: generation.id,
        type: generation.type,
        title: generation.title,
        content: generation.content,
        difficulty: generation.difficulty,
        questionCount: generation.questionCount,
        createdAt: generation.createdAt,
      });
    } catch (error) {
      console.error('Error fetching generation:', error);
      res.status(500).json({ message: 'Failed to fetch generation' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
