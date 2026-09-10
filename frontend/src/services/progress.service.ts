import { apiRequest } from './api';
import { OverallProgress, PromptAttempt } from '../types';
import { isOnline, queueOfflineQuiz, getCachedLesson } from './offlineSync.service';
import { offlineDb } from '../db/offlineDb';

export interface QuizSubmissionResult {
  passed: boolean;
  score: number;
  correctCount: number;
  totalQuestions: number;
  isOfflineCached?: boolean;
  results: {
    questionId: string;
    isCorrect: boolean;
    correctIndex: number;
    explanation?: string;
  }[];
}

export async function getUserProgressApi(): Promise<OverallProgress> {
  try {
    const res = await apiRequest<{ success: boolean; data: OverallProgress }>('/api/progress');
    return res.data;
  } catch (err) {
    // If offline, construct progress from local DB
    const cachedLessons = await offlineDb.cachedLessons.toArray();
    const offlineProgress = await offlineDb.offlineProgress.toArray();

    const completedSlugs = new Set(offlineProgress.filter((p) => p.status === 'COMPLETED').map((p) => p.lessonSlug));

    let basicsTotal = 6, basicsCompleted = 0;
    let intermediateTotal = 7, intermediateCompleted = 0;
    let advancedTotal = 7, advancedCompleted = 0;

    cachedLessons.forEach((l) => {
      if (completedSlugs.has(l.slug)) {
        if (l.level === 'BASICS') basicsCompleted++;
        if (l.level === 'INTERMEDIATE') intermediateCompleted++;
        if (l.level === 'ADVANCED') advancedCompleted++;
      }
    });

    return {
      currentLevel: 'BASICS',
      overallPercentage: Math.round(((basicsCompleted + intermediateCompleted + advancedCompleted) / 20) * 100),
      totalCompleted: basicsCompleted + intermediateCompleted + advancedCompleted,
      totalLessons: 20,
      tiers: {
        basics: { completed: basicsCompleted, total: basicsTotal, percentage: Math.round((basicsCompleted / basicsTotal) * 100), unlocked: true },
        intermediate: { completed: intermediateCompleted, total: intermediateTotal, percentage: Math.round((intermediateCompleted / intermediateTotal) * 100), unlocked: basicsCompleted >= basicsTotal },
        advanced: { completed: advancedCompleted, total: advancedTotal, percentage: Math.round((advancedCompleted / advancedTotal) * 100), unlocked: intermediateCompleted >= intermediateTotal }
      }
    };
  }
}

export async function submitQuizApi(lessonSlug: string, answers: number[]): Promise<QuizSubmissionResult> {
  // If online, attempt normal server submit
  if (isOnline()) {
    try {
      const res = await apiRequest<{ success: boolean; data: QuizSubmissionResult }>('/api/progress/quiz', {
        method: 'POST',
        body: JSON.stringify({ lessonSlug, answers })
      });
      return res.data;
    } catch (err) {
      console.warn('Network error during quiz submit, falling back to offline grading:', err);
    }
  }

  // Offline grading using local cached lesson
  const cachedLesson = await getCachedLesson(lessonSlug);
  if (!cachedLesson || !cachedLesson.quizQuestions.length) {
    throw new Error('Lesson data not available offline. Please connect to internet to submit.');
  }

  let correctCount = 0;
  const results = cachedLesson.quizQuestions.map((q, idx) => {
    const isCorrect = q.correctIndex !== undefined ? answers[idx] === q.correctIndex : true;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id || `q-${idx}`,
      isCorrect,
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || ''
    };
  });

  const total = cachedLesson.quizQuestions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
  const passed = score >= 70;

  // Queue in Dexie for sync when online
  await queueOfflineQuiz(lessonSlug, answers, score, passed);

  // Update local offline progress
  const user = localStorage.getItem('pm_user');
  const userId = user ? JSON.parse(user).id : 'local_student';
  await offlineDb.offlineProgress.put({
    key: `${userId}:${lessonSlug}`,
    userId,
    lessonSlug,
    status: passed ? 'COMPLETED' : 'IN_PROGRESS',
    quizPassed: passed,
    quizScore: score,
    completedAt: passed ? new Date().toISOString() : undefined
  });

  return {
    passed,
    score,
    correctCount,
    totalQuestions: total,
    isOfflineCached: true,
    results
  };
}

export async function getUserAttemptsApi(): Promise<PromptAttempt[]> {
  try {
    const res = await apiRequest<{ success: boolean; data: PromptAttempt[] }>('/api/progress/attempts');
    return res.data;
  } catch {
    return [];
  }
}
