import { PrismaClient } from '@prisma/client';
import { curriculumData } from '../../../database/seed/seed';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export let prisma: PrismaClient;
export let isDbConnected = false;

// Fallback in-memory state for immediate out-of-the-box local testing if no database is connected
export interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  currentLevel: string;
  createdAt: Date;
}

export interface MemoryProgress {
  userId: string;
  lessonId: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  quizPassed: boolean;
  quizScore: number;
  completedAt?: Date;
}

export interface MemoryAttempt {
  id: string;
  userId: string;
  lessonId?: string;
  level: string;
  taskTitle: string;
  studentPrompt: string;
  systemPromptUsed: string;
  aiCritique: string;
  score: number;
  createdAt: Date;
}

export const memoryStore = {
  users: new Map<string, MemoryUser>(),
  progress: new Map<string, MemoryProgress>(),
  attempts: [] as MemoryAttempt[],
  curriculum: curriculumData
};

try {
  if (process.env.DATABASE_URL) {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
      });
    }
    prisma = global.__prisma;
    isDbConnected = true;
  } else {
    console.warn('⚠️ No DATABASE_URL provided. Operating in fast local in-memory fallback mode.');
    prisma = null as any;
    isDbConnected = false;
  }
} catch (err) {
  console.warn('⚠️ Could not initialize Prisma client. Operating in memory fallback mode:', err);
  prisma = null as any;
  isDbConnected = false;
}

export async function checkDatabaseHealth(): Promise<boolean> {
  if (!isDbConnected) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    isDbConnected = false;
    return false;
  }
}
