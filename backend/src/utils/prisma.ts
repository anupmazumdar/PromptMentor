import { PrismaClient } from '@prisma/client';
import { curriculumData } from '../../../database/seed/curriculumData';

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
  users: new Map<string, MemoryUser>([
    [
      'admin@promptmentor.com',
      {
        id: 'user_admin_default',
        email: 'admin@promptmentor.com',
        passwordHash: '$2b$10$Tvzob8SyOaaLGx5CXQYgD.uQ/r11J5kxhsneQBoyXU9dDvH5dwMSG', // Admin@PromptMentor2026!
        name: 'Admin Mentor',
        role: 'ADMIN',
        currentLevel: 'ADVANCED',
        createdAt: new Date()
      }
    ],
    [
      'student@promptmentor.ai',
      {
        id: 'user_student_demo',
        email: 'student@promptmentor.ai',
        passwordHash: '$2b$10$nJxs.1EDGxxDAhRjLbL9nOq6dovFzHXDu1.ThCOXEXBzBEVBiDRVG', // prompt123
        name: 'Demo Student',
        role: 'STUDENT',
        currentLevel: 'BASICS',
        createdAt: new Date()
      }
    ]
  ]),
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
