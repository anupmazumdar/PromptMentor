import Dexie, { Table } from 'dexie';
import { ModuleData, LessonDetail, QuizQuestion, TierLevel } from '../types';

export interface CachedModule {
  id: string;
  level: TierLevel;
  title: string;
  description: string;
  orderIndex: number;
  cachedAt: number;
}

export interface CachedLesson {
  id: string;
  moduleId: string;
  slug: string;
  level: TierLevel;
  title: string;
  summary: string;
  content: string;
  practiceGoal: string;
  practicePrompt: string;
  orderIndex: number;
  quizQuestions: QuizQuestion[];
  cachedAt: number;
}

export interface QueuedQuiz {
  id?: number;
  lessonSlug: string;
  answers: number[];
  score: number;
  passed: boolean;
  timestamp: number;
  synced: boolean;
}

export interface QueuedSandbox {
  id?: number;
  studentPrompt: string;
  level: string;
  topic: string;
  practiceGoal: string;
  lessonId?: string;
  timestamp: number;
  synced: boolean;
}

export interface QueuedChatMessage {
  id?: number;
  query: string;
  level: string;
  topic: string;
  timestamp: number;
  synced: boolean;
}

export interface OfflineProgressItem {
  key: string; // `${userId}:${lessonSlug}`
  userId: string;
  lessonSlug: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  quizPassed: boolean;
  quizScore: number;
  completedAt?: string;
}

export class PromptMentorDB extends Dexie {
  cachedModules!: Table<CachedModule, string>;
  cachedLessons!: Table<CachedLesson, string>;
  queuedQuizzes!: Table<QueuedQuiz, number>;
  queuedSandbox!: Table<QueuedSandbox, number>;
  queuedChat!: Table<QueuedChatMessage, number>;
  offlineProgress!: Table<OfflineProgressItem, string>;

  constructor() {
    super('PromptMentorDB');
    this.version(1).stores({
      cachedModules: 'id, level, orderIndex',
      cachedLessons: 'id, slug, level, moduleId, orderIndex',
      queuedQuizzes: '++id, lessonSlug, timestamp, synced',
      queuedSandbox: '++id, timestamp, synced',
      queuedChat: '++id, timestamp, synced',
      offlineProgress: 'key, userId, lessonSlug, status'
    });
  }
}

export const offlineDb = new PromptMentorDB();
