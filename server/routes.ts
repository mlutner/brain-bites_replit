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
      
      // Validate request body
      const validation = generateContentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid request', 
          errors: validation.error.errors 
        });
      }

      const { fileId, type, difficulty, questionCount } = validation.data;

      // Get file and verify ownership
      const file = await storage.getFile(fileId);
      if (!file || file.userId !== userId) {
        return res.status(404).json({ message: 'File not found' });
      }

      if (!file.extractedText) {
        return res.status(400).json({ message: 'File text extraction is still in progress' });
      }

      // Assess difficulty if auto
      let finalDifficulty = difficulty;
      if (difficulty === 'auto') {
        finalDifficulty = await assessDifficulty(file.extractedText);
      }

      let generatedContent: any;
      let title: string;

      if (type === 'flashcards') {
        generatedContent = await generateFlashcards(file.extractedText, finalDifficulty);
        title = `Flashcards from ${file.originalName}`;
      } else {
        const count = questionCount || 10;
        generatedContent = await generateQuiz(file.extractedText, count, finalDifficulty);
        title = `Quiz from ${file.originalName}`;
      }

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
