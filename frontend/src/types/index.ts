export type TierLevel = 'BASICS' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  currentLevel: TierLevel;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number; // only returned after submission or for evaluation
  explanation?: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  orderIndex: number;
  practiceGoal: string;
  status: LessonStatus;
  quizPassed: boolean;
  quizScore: number;
}

export interface LessonDetail extends LessonSummary {
  level: TierLevel;
  moduleTitle: string;
  content: string;
  practicePrompt: string;
  quizQuestions: QuizQuestion[];
}

export interface ModuleData {
  id: string;
  level: TierLevel;
  title: string;
  description: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

export interface TierProgress {
  completed: number;
  total: number;
  percentage: number;
  unlocked: boolean;
}

export interface OverallProgress {
  currentLevel: TierLevel;
  overallPercentage: number;
  totalCompleted: number;
  totalLessons: number;
  tiers: {
    basics: TierProgress;
    intermediate: TierProgress;
    advanced: TierProgress;
  };
}

export interface CritiqueResult {
  score: number;
  levelFeedback: string;
  strengths: string[];
  improvements: string[];
  optimizedPrompt: string;
  socraticQuestion: string;
  submittedAt?: string;
}

export interface PromptAttempt {
  id: string;
  level: string;
  taskTitle: string;
  studentPrompt: string;
  score: number;
  aiCritique: string | CritiqueResult;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}
