'use client';

import Link from 'next/link';
import { BarChart3, BrainCircuit, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}

export function AppShell({ title, subtitle, children, action }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="glass-panel-strong rounded-3xl p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-3 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                  <BrainCircuit className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Enterprise AI Training</p>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">SpeakPro Challenge</h1>
                </div>
              </Link>
              <div>
                <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
                <p className="max-w-3xl text-sm text-slate-300 md:text-base">{subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  AI Pronunciation Scoring
                </span>
                <span className="pill border-brand-400/30 bg-brand-500/10 text-brand-100">
                  <BarChart3 className="mr-2 h-3.5 w-3.5" />
                  15 Unlockable Stages
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {action}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
