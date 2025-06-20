import {
  users,
  uploadedFiles,
  generations,
  type User,
  type UpsertUser,
  type InsertFile,
  type UploadedFile,
  type InsertGeneration,
  type Generation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<UploadedFile>;
  getFile(id: number): Promise<UploadedFile | undefined>;
  getUserFiles(userId: string): Promise<UploadedFile[]>;
  updateFileText(id: number, extractedText: string): Promise<void>;
  
  // Generation operations
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGeneration(id: number): Promise<Generation | undefined>;
  getUserGenerations(userId: string): Promise<Generation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // File operations
  async createFile(file: InsertFile): Promise<UploadedFile> {
    const [created] = await db.insert(uploadedFiles).values(file).returning();
    return created;
  }

  async getFile(id: number): Promise<UploadedFile | undefined> {
    const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
    return file;
  }

  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.createdAt));
  }

  async updateFileText(id: number, extractedText: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ extractedText })
      .where(eq(uploadedFiles.id, id));
  }

  // Generation operations
  async createGeneration(generation: InsertGeneration): Promise<Generation> {
    const [created] = await db.insert(generations).values(generation).returning();
    return created;
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation;
  }

  async getUserGenerations(userId: string): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt));
  }
}

export const storage = new DatabaseStorage();
