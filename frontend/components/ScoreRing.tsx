interface ScoreRingProps {
  label: string;
  score: number;
  accent?: string;
}

export function ScoreRing({ label, score, accent = '#58f4ff' }: ScoreRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-5 text-center">
      <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text x="50%" y="49%" dominantBaseline="middle" textAnchor="middle" className="fill-white text-3xl font-semibold">
          {Math.round(clamped)}
        </text>
        <text x="50%" y="67%" dominantBaseline="middle" textAnchor="middle" className="fill-slate-400 text-xs">
          / 100
        </text>
      </svg>
      <p className="mt-3 text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}
