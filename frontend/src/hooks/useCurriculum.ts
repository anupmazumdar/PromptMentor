import { useState, useEffect, useCallback } from 'react';
import { ModuleData } from '../types';
import { getCurriculumApi } from '../services/lessons.service';
import { useAuth } from './useAuth';

export function useCurriculum() {
  const { isAuthenticated } = useAuth();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurriculum = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCurriculumApi();
      setModules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum, isAuthenticated]);

  const getTierModule = (level: 'BASICS' | 'INTERMEDIATE' | 'ADVANCED'): ModuleData | undefined => {
    return modules.find((m) => m.level === level);
  };

  return {
    modules,
    isLoading,
    error,
    refetch: fetchCurriculum,
    getTierModule
  };
}
