import { apiRequest } from './api';
import { ModuleData, LessonDetail } from '../types';
import {
  cacheCurriculumLocally,
  cacheLessonDetailLocally,
  getCachedCurriculum,
  getCachedLesson,
  isOnline
} from './offlineSync.service';

export async function getCurriculumApi(): Promise<ModuleData[]> {
  // If offline, attempt immediate retrieval from IndexedDB
  if (!isOnline()) {
    const cached = await getCachedCurriculum();
    if (cached) return cached;
  }

  try {
    const res = await apiRequest<{ success: boolean; data: ModuleData[] }>('/api/lessons');
    // Save to IndexedDB cache in background
    cacheCurriculumLocally(res.data);
    return res.data;
  } catch (networkErr) {
    // Network failed, fallback to local IndexedDB cache
    const cached = await getCachedCurriculum();
    if (cached) {
      console.log('📦 Serving curriculum from local IndexedDB cache.');
      return cached;
    }
    throw networkErr;
  }
}

export async function getLessonBySlugApi(slug: string): Promise<LessonDetail> {
  if (!isOnline()) {
    const cached = await getCachedLesson(slug);
    if (cached) return cached;
  }

  try {
    const res = await apiRequest<{ success: boolean; data: LessonDetail }>(`/api/lessons/${slug}`);
    cacheLessonDetailLocally(res.data);
    return res.data;
  } catch (networkErr) {
    const cached = await getCachedLesson(slug);
    if (cached) {
      console.log(`📦 Serving lesson ${slug} from local IndexedDB cache.`);
      return cached;
    }
    throw networkErr;
  }
}
