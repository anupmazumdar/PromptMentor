import { offlineDb, CachedModule, CachedLesson, QueuedQuiz, QueuedSandbox } from '../db/offlineDb';
import { ModuleData, LessonDetail } from '../types';
import { submitQuizApi } from './progress.service';
import { critiquePromptApi } from './tutor.service';

type SyncListener = (isOnline: boolean, pendingCount: number) => void;
const listeners: Set<SyncListener> = new Set();

let isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function subscribeNetworkStatus(callback: SyncListener): () => void {
  listeners.add(callback);
  getPendingSyncCount().then((count) => callback(isOnlineState, count));

  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  getPendingSyncCount().then((count) => {
    listeners.forEach((cb) => cb(isOnlineState, count));
  });
}

// Global network event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnlineState = true;
    console.log('🌐 Device back ONLINE. Triggering background synchronization...');
    notifyListeners();
    syncPendingActions();
  });

  window.addEventListener('offline', () => {
    isOnlineState = false;
    console.log('📡 Device is OFFLINE. Operations will be cached locally.');
    notifyListeners();
  });
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const [quizzes, sandbox, chat] = await Promise.all([
      offlineDb.queuedQuizzes.where('synced').equals(0).count(),
      offlineDb.queuedSandbox.where('synced').equals(0).count(),
      offlineDb.queuedChat.where('synced').equals(0).count()
    ]);
    return quizzes + sandbox + chat;
  } catch {
    return 0;
  }
}

/**
 * Saves fetched curriculum modules and lessons into IndexedDB for 100% offline access.
 */
export async function cacheCurriculumLocally(modules: ModuleData[]): Promise<void> {
  try {
    const now = Date.now();
    for (const mod of modules) {
      await offlineDb.cachedModules.put({
        id: mod.id,
        level: mod.level,
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
        cachedAt: now
      });

      for (const lesson of mod.lessons) {
        const existing = await offlineDb.cachedLessons.get(lesson.id);
        await offlineDb.cachedLessons.put({
          id: lesson.id,
          moduleId: mod.id,
          slug: lesson.slug,
          level: mod.level,
          title: lesson.title,
          summary: lesson.summary,
          content: existing?.content || lesson.summary,
          practiceGoal: lesson.practiceGoal,
          practicePrompt: existing?.practicePrompt || '',
          orderIndex: lesson.orderIndex,
          quizQuestions: existing?.quizQuestions || [],
          cachedAt: now
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not cache curriculum to IndexedDB:', err);
  }
}

/**
 * Cache single detailed lesson with its full markdown content and quiz questions.
 */
export async function cacheLessonDetailLocally(detail: LessonDetail): Promise<void> {
  try {
    const existing = await offlineDb.cachedLessons.where('slug').equals(detail.slug).first();
    await offlineDb.cachedLessons.put({
      id: detail.id || existing?.id || `les-${detail.slug}`,
      moduleId: existing?.moduleId || `mod-${detail.level.toLowerCase()}`,
      slug: detail.slug,
      level: detail.level,
      title: detail.title,
      summary: detail.summary,
      content: detail.content,
      practiceGoal: detail.practiceGoal,
      practicePrompt: detail.practicePrompt,
      orderIndex: detail.orderIndex,
      quizQuestions: detail.quizQuestions,
      cachedAt: Date.now()
    });
  } catch (err) {
    console.warn('⚠️ Could not cache lesson detail to IndexedDB:', err);
  }
}

/**
 * Retrieve cached curriculum from IndexedDB when offline.
 */
export async function getCachedCurriculum(): Promise<ModuleData[] | null> {
  try {
    const modules = await offlineDb.cachedModules.orderBy('orderIndex').toArray();
    if (!modules.length) return null;

    const allLessons = await offlineDb.cachedLessons.orderBy('orderIndex').toArray();

    return modules.map((m) => {
      const moduleLessons = allLessons
        .filter((l) => l.moduleId === m.id || l.level === m.level)
        .map((l) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          summary: l.summary,
          orderIndex: l.orderIndex,
          practiceGoal: l.practiceGoal,
          status: (m.level === 'BASICS' ? 'IN_PROGRESS' : 'LOCKED') as any,
          quizPassed: false,
          quizScore: 0
        }));

      return {
        id: m.id,
        level: m.level,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        lessons: moduleLessons
      };
    });
  } catch (err) {
    console.warn('Error reading cached curriculum:', err);
    return null;
  }
}

/**
 * Retrieve cached single lesson from IndexedDB when offline.
 */
export async function getCachedLesson(slug: string): Promise<LessonDetail | null> {
  try {
    const lesson = await offlineDb.cachedLessons.where('slug').equals(slug).first();
    if (!lesson) return null;

    return {
      id: lesson.id,
      level: lesson.level,
      moduleTitle: `${lesson.level} Foundations`,
      title: lesson.title,
      slug: lesson.slug,
      summary: lesson.summary,
      content: lesson.content,
      practiceGoal: lesson.practiceGoal,
      practicePrompt: lesson.practicePrompt,
      orderIndex: lesson.orderIndex,
      status: 'IN_PROGRESS',
      quizPassed: false,
      quizScore: 0,
      quizQuestions: lesson.quizQuestions
    };
  } catch {
    return null;
  }
}

/**
 * Enqueue quiz submission when offline.
 */
export async function queueOfflineQuiz(
  lessonSlug: string,
  answers: number[],
  score: number,
  passed: boolean
): Promise<void> {
  await offlineDb.queuedQuizzes.add({
    lessonSlug,
    answers,
    score,
    passed,
    timestamp: Date.now(),
    synced: false
  });
  notifyListeners();
}

/**
 * Enqueue sandbox prompt attempt when offline.
 */
export async function queueOfflineSandbox(
  studentPrompt: string,
  level: string,
  topic: string,
  practiceGoal: string,
  lessonId?: string
): Promise<void> {
  await offlineDb.queuedSandbox.add({
    studentPrompt,
    level,
    topic,
    practiceGoal,
    lessonId,
    timestamp: Date.now(),
    synced: false
  });
  notifyListeners();
}

/**
 * Enqueue chat query when offline.
 */
export async function queueOfflineChat(query: string, level: string, topic: string): Promise<void> {
  await offlineDb.queuedChat.add({
    query,
    level,
    topic,
    timestamp: Date.now(),
    synced: false
  });
  notifyListeners();
}

/**
 * Background synchronizer: Flushes queued offline actions to backend API once back online.
 */
export async function syncPendingActions(): Promise<void> {
  if (!isOnline()) return;

  console.log('🔄 Flushing offline action queues...');

  // 1. Sync Quizzes
  try {
    const pendingQuizzes = await offlineDb.queuedQuizzes.where('synced').equals(0).toArray();
    for (const q of pendingQuizzes) {
      if (!q.id) continue;
      try {
        await submitQuizApi(q.lessonSlug, q.answers);
        await offlineDb.queuedQuizzes.update(q.id, { synced: true });
        console.log(`✅ Synced offline quiz for: ${q.lessonSlug}`);
      } catch (syncErr) {
        console.warn(`Failed to sync quiz for ${q.lessonSlug}:`, syncErr);
      }
    }
  } catch (err) {
    console.warn('Error during quiz sync:', err);
  }

  // 2. Sync Sandbox attempts
  try {
    const pendingSandbox = await offlineDb.queuedSandbox.where('synced').equals(0).toArray();
    for (const s of pendingSandbox) {
      if (!s.id) continue;
      try {
        await critiquePromptApi({
          studentPrompt: s.studentPrompt,
          level: s.level,
          topic: s.topic,
          practiceGoal: s.practiceGoal,
          lessonId: s.lessonId
        });
        await offlineDb.queuedSandbox.update(s.id, { synced: true });
        console.log('✅ Synced offline sandbox attempt');
      } catch (syncErr) {
        console.warn('Failed to sync sandbox attempt:', syncErr);
      }
    }
  } catch (err) {
    console.warn('Error during sandbox sync:', err);
  }

  notifyListeners();
}
