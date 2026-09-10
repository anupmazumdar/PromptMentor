import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OverallProgress, PromptAttempt } from '../types';
import { getUserProgressApi, getUserAttemptsApi } from '../services/progress.service';
import { useAuth } from './AuthContext';

interface ProgressContextType {
  progress: OverallProgress | null;
  isLoading: boolean;
  recentAttempts: PromptAttempt[];
  refreshProgress: () => Promise<void>;
  // Global Tutor Drawer Controls
  isTutorOpen: boolean;
  tutorLevel: string;
  tutorTopic: string;
  openTutor: (topic?: string, level?: string) => void;
  closeTutor: () => void;
  toggleTutor: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<OverallProgress | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<PromptAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Global Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorLevel, setTutorLevel] = useState<string>('Basics');
  const [tutorTopic, setTutorTopic] = useState<string>('General Prompt Engineering');

  const refreshProgress = useCallback(async () => {
    if (!isAuthenticated) {
      setProgress(null);
      setRecentAttempts([]);
      return;
    }

    try {
      setIsLoading(true);
      const [progData, attData] = await Promise.all([
        getUserProgressApi(),
        getUserAttemptsApi()
      ]);
      setProgress(progData);
      setRecentAttempts(attData);
    } catch (err) {
      console.warn('Could not fetch user progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const openTutor = (topic?: string, level?: string) => {
    if (topic) setTutorTopic(topic);
    if (level) setTutorLevel(level);
    setIsTutorOpen(true);
  };

  const closeTutor = () => setIsTutorOpen(false);
  const toggleTutor = () => setIsTutorOpen((prev) => !prev);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        recentAttempts,
        refreshProgress,
        isTutorOpen,
        tutorLevel,
        tutorTopic,
        openTutor,
        closeTutor,
        toggleTutor
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
