'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole, Target } from 'lucide-react';

import { Stage, StageProgress } from '@/types';

interface StageCardProps {
  stage: Stage;
  progress?: StageProgress;
  unlocked: boolean;
}

export function StageCard({ stage, progress, unlocked }: StageCardProps) {
  const passed = progress?.passed ?? false;
  const attempts = progress?.attempts ?? 0;
  const bestScore = progress?.bestScore ?? 0;

  return (
    <motion.div
      whileHover={{ y: unlocked ? -6 : 0 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-3xl border p-5 ${
        unlocked ? 'glass-panel-strong border-cyan-300/20' : 'border-white/8 bg-white/5 opacity-70'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-brand-400 to-cyan-200" />
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-cyan-200/80">Stage {stage.id}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{stage.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{stage.level_group}</p>
          <p className="mt-2 text-sm text-slate-400">{stage.difficulty}</p>
        </div>
        {passed ? (
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Passed
          </span>
        ) : unlocked ? (
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
            <Target className="mr-1 inline h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
            <LockKeyhole className="mr-1 inline h-3.5 w-3.5" /> Locked
          </span>
        )}
      </div>

      <p className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-cyan-100">{stage.scenario}</p>
      <p className="max-h-24 overflow-hidden text-sm leading-6 text-slate-300">{stage.paragraph}</p>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{attempts} attempt{attempts === 1 ? '' : 's'}</span>
        <span>Best {bestScore.toFixed(1)}%</span>
      </div>

      <div className="mt-5">
        {unlocked ? (
          <Link
            href={`/practice/${stage.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-400 px-4 py-3 font-medium text-white transition hover:shadow-glow"
          >
            Open challenge
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-400"
          >
            Unlock by scoring 90%+
          </button>
        )}
      </div>
    </motion.div>
  );
}
