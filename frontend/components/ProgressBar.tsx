interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  tone?: 'cyan' | 'brand' | 'emerald';
}

const toneMap = {
  cyan: 'from-cyan-400 to-cyan-200',
  brand: 'from-brand-500 to-brand-300',
  emerald: 'from-emerald-400 to-teal-200',
};

export function ProgressBar({ label, value, max = 100, tone = 'cyan' }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{Math.round(width)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneMap[tone]} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
