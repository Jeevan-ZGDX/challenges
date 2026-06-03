'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, Gauge, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { MetricCard } from '@/components/MetricCard';
import { ProgressBar } from '@/components/ProgressBar';
import { RoleSelector } from '@/components/RoleSelector';
import { StageCard } from '@/components/StageCard';
import { TrendChart } from '@/components/TrendChart';
import { WeakWordTracker } from '@/components/WeakWordTracker';
import { useProgress } from '@/hooks/useProgress';
import { fetchRoles, fetchStages } from '@/services/api';
import { RoleOption, Stage } from '@/types';

export default function DashboardPage() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { progress, isReady, selectedRole, setSelectedRole, resetProgress, trendData, topWeakWords } = useProgress();

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load roles.'));
  }, []);

  useEffect(() => {
    if (!isReady || !roles.length) {
      return;
    }

    if (!roles.some((role) => role.id === selectedRole)) {
      setSelectedRole(roles[0].id);
    }
  }, [isReady, roles, selectedRole, setSelectedRole]);

  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    setIsLoading(true);
    fetchStages(selectedRole)
      .then(setStages)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load stages.'))
      .finally(() => setIsLoading(false));
  }, [selectedRole]);

  const overallScore = useMemo(() => {
    if (!progress.attempts.length) {
      return 0;
    }
    const total = progress.attempts.reduce((sum, attempt) => sum + attempt.final_score, 0);
    return total / progress.attempts.length;
  }, [progress.attempts]);

  const passedStages = useMemo(
    () => Object.values(progress.stageStats).filter((stage) => stage.passed).length,
    [progress.stageStats],
  );

  const selectedRoleDetails = roles.find((role) => role.id === selectedRole);

  return (
    <AppShell
      title="Role-based speaking mastery dashboard"
      subtitle="Choose a job role, practice realistic workplace scenarios, and unlock increasingly difficult English passages built for professional communication growth."
      action={
        <div className="flex flex-wrap items-center gap-3">
          {roles.length ? <RoleSelector roles={roles} value={selectedRole} onChange={setSelectedRole} /> : null}
          <button
            type="button"
            onClick={resetProgress}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset local progress
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Current stage"
            value={`Stage ${progress.highestUnlockedStage}`}
            helper="Next unlocked challenge in your selected role pathway."
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="Overall score"
            value={`${overallScore.toFixed(1)}%`}
            helper={`Best recorded result ${progress.bestScore.toFixed(1)}% for this role.`}
            icon={<Trophy className="h-5 w-5" />}
          />
          <MetricCard
            label="Completion"
            value={`${progress.completionPercentage}%`}
            helper={`${passedStages} of 15 role-based stages cleared with a 90%+ score.`}
            icon={<Award className="h-5 w-5" />}
          />
          <MetricCard
            label="Total attempts"
            value={String(progress.totalAttempts)}
            helper={`Average result ${overallScore.toFixed(1)}% across this role path.`}
            icon={<Gauge className="h-5 w-5" />}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="glass-panel-strong rounded-3xl bg-hero-grid p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="pill mb-4">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Scenario-based role pathway
                </span>
                <h3 className="section-title">{selectedRoleDetails?.label ?? 'Professional role'} communication training</h3>
                <p className="section-subtitle mt-3">
                  {selectedRoleDetails?.description ?? 'Select a role to unlock tailored reading passages and pronunciation coaching.'}
                </p>
                <p className="mt-4 text-sm text-slate-300">
                  Difficulty rises from foundational workplace English to executive communication, while the scenarios stay relevant to the role you selected.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <ProgressBar label="Stage completion" value={progress.completionPercentage} tone="cyan" />
                <ProgressBar label="Best score" value={progress.bestScore} tone="brand" />
                <ProgressBar label="Average score" value={overallScore} tone="emerald" />
              </div>
            </div>
          </div>

          <WeakWordTracker words={topWeakWords} />
        </section>

        <TrendChart data={trendData} />

        <section className="space-y-4">
          <div>
            <h3 className="section-title">Challenge stages</h3>
            <p className="section-subtitle">
              Scenario-specific passages for {selectedRoleDetails?.label ?? 'your chosen role'}, from basic communication to executive-level leadership language.
            </p>
          </div>

          {!isReady || isLoading ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-slate-300">Loading your role-based SpeakPro workspace...</div>
          ) : error ? (
            <div className="glass-panel rounded-3xl border-red-400/20 p-8 text-center text-red-200">{error}</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {stages.map((stage) => {
                const unlocked = stage.id <= progress.highestUnlockedStage || progress.stageStats[stage.id]?.passed;
                return (
                  <StageCard
                    key={`${selectedRole}-${stage.id}`}
                    stage={stage}
                    progress={progress.stageStats[stage.id]}
                    unlocked={Boolean(unlocked)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
