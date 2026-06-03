'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AttemptRecord, AnalysisResponse, ProgressState, StageProgress, TrendPoint } from '@/types';

const STORAGE_KEY = 'speakpro-progress-v2';
const TOTAL_STAGES = 15;
const DEFAULT_ROLE = 'software_engineer';

interface PersistedStore {
  selectedRole: string;
  attemptsByRole: Record<string, AttemptRecord[]>;
}

const initialStore: PersistedStore = {
  selectedRole: DEFAULT_ROLE,
  attemptsByRole: {},
};

const initialProgress: ProgressState = {
  highestUnlockedStage: 1,
  bestScore: 0,
  totalAttempts: 0,
  completionPercentage: 0,
  attempts: [],
  weakWords: {},
  stageStats: {},
  latestAnalysis: undefined,
};

function buildStageStats(attempts: AttemptRecord[]): Record<number, StageProgress> {
  return attempts.reduce<Record<number, StageProgress>>((accumulator, attempt) => {
    const current = accumulator[attempt.stage_id] ?? {
      attempts: 0,
      bestScore: 0,
      passed: false,
    };

    accumulator[attempt.stage_id] = {
      attempts: current.attempts + 1,
      bestScore: Math.max(current.bestScore, attempt.final_score),
      passed: current.passed || attempt.passed,
      latestAttemptId: attempt.id,
    };

    return accumulator;
  }, {});
}

function computeWeakWords(attempts: AttemptRecord[]): Record<string, number> {
  const words: Record<string, number> = {};

  for (const attempt of attempts) {
    for (const issue of attempt.difficult_words) {
      words[issue.word] = (words[issue.word] ?? 0) + 1;
    }
  }

  return words;
}

function buildProgress(attempts: AttemptRecord[]): ProgressState {
  const stageStats = buildStageStats(attempts);
  const passedStages = Object.entries(stageStats)
    .filter(([, value]) => value.passed)
    .map(([key]) => Number(key));

  const highestPassed = passedStages.length ? Math.max(...passedStages) : 0;
  const highestUnlockedStage = Math.min(TOTAL_STAGES, Math.max(1, highestPassed + 1));
  const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.final_score)) : 0;
  const completionPercentage = Math.round((passedStages.length / TOTAL_STAGES) * 100);

  return {
    highestUnlockedStage,
    bestScore,
    totalAttempts: attempts.length,
    completionPercentage,
    attempts,
    weakWords: computeWeakWords(attempts),
    stageStats,
    latestAnalysis: attempts[0],
  };
}

export function useProgress() {
  const [store, setStore] = useState<PersistedStore>(initialStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as PersistedStore;
      setStore({
        selectedRole: parsed.selectedRole || DEFAULT_ROLE,
        attemptsByRole: parsed.attemptsByRole ?? {},
      });
    } catch {
      setStore(initialStore);
    } finally {
      setIsReady(true);
    }
  }, []);

  const updateStore = useCallback((updater: (current: PersistedStore) => PersistedStore) => {
    setStore((current) => {
      const nextStore = updater(current);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
      }
      return nextStore;
    });
  }, []);

  const selectedRole = store.selectedRole || DEFAULT_ROLE;
  const selectedRoleAttempts = store.attemptsByRole[selectedRole] ?? [];
  const progress = useMemo(() => buildProgress(selectedRoleAttempts), [selectedRoleAttempts]);

  const setSelectedRole = useCallback(
    (role: string) => {
      updateStore((current) => ({
        ...current,
        selectedRole: role,
      }));
    },
    [updateStore],
  );

  const saveAttempt = useCallback(
    (analysis: AnalysisResponse): AttemptRecord => {
      const attempt: AttemptRecord = {
        ...analysis,
        id: `${analysis.role}-${analysis.stage_id}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      updateStore((current) => {
        const roleId = analysis.role || current.selectedRole || DEFAULT_ROLE;
        const currentAttempts = current.attemptsByRole[roleId] ?? [];
        return {
          ...current,
          selectedRole: roleId,
          attemptsByRole: {
            ...current.attemptsByRole,
            [roleId]: [attempt, ...currentAttempts].slice(0, 100),
          },
        };
      });

      return attempt;
    },
    [updateStore],
  );

  const resetProgress = useCallback(() => {
    updateStore((current) => ({
      selectedRole: current.selectedRole,
      attemptsByRole: {},
    }));
  }, [updateStore]);

  const getAttemptById = useCallback(
    (attemptId: string) =>
      Object.values(store.attemptsByRole)
        .flat()
        .find((attempt) => attempt.id === attemptId),
    [store.attemptsByRole],
  );

  const trendData = useMemo<TrendPoint[]>(() => {
    const recentAttempts = [...progress.attempts].slice(0, 6).reverse();
    return recentAttempts.map((attempt, index) => ({
      label: `A${index + 1}`,
      accuracy: attempt.accuracy_score,
      fluency: attempt.fluency_score,
      confidence: attempt.confidence_score,
    }));
  }, [progress.attempts]);

  const topWeakWords = useMemo(
    () =>
      Object.entries(progress.weakWords)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count })),
    [progress.weakWords],
  );

  return {
    progress,
    isReady,
    selectedRole,
    setSelectedRole,
    saveAttempt,
    resetProgress,
    getAttemptById,
    trendData,
    topWeakWords,
  };
}
