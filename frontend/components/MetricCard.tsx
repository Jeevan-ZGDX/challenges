import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-300">{label}</span>
        {icon ? <span className="text-cyan-200">{icon}</span> : null}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="text-sm text-slate-400">{helper}</p>
      </div>
    </div>
  );
}
