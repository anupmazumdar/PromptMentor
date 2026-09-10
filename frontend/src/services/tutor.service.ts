import { apiRequest } from './api';
import { CritiqueResult } from '../types';

export interface TutorChatPayload {
  query: string;
  level?: string;
  topic?: string;
  history?: { role: 'system' | 'user' | 'assistant'; content: string }[];
}

export interface SandboxPayload {
  studentPrompt: string;
  level?: string;
  topic?: string;
  practiceGoal?: string;
  lessonId?: string;
}

export async function askTutorApi(payload: TutorChatPayload): Promise<{ reply: string; level: string; topic: string }> {
  const res = await apiRequest<{ success: boolean; data: { reply: string; level: string; topic: string } }>('/api/tutor/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function critiquePromptApi(payload: SandboxPayload): Promise<CritiqueResult> {
  const res = await apiRequest<{ success: boolean; data: CritiqueResult }>('/api/tutor/sandbox', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}
