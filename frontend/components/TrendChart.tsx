import { TrendPoint } from '@/types';

interface TrendChartProps {
  data: TrendPoint[];
}

function createPath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white">Performance trends</h3>
        <p className="mt-3 text-sm text-slate-400">Complete a few attempts to visualize your accuracy, fluency, and confidence trajectory.</p>
      </div>
    );
  }

  const width = 420;
  const height = 220;
  const padding = 28;

  const buildSeries = (key: keyof Pick<TrendPoint, 'accuracy' | 'fluency' | 'confidence'>) => {
    return data.map((point, index) => ({
      x: padding + (index * (width - padding * 2)) / Math.max(1, data.length - 1),
      y: height - padding - ((point[key] ?? 0) / 100) * (height - padding * 2),
    }));
  };

  const accuracy = buildSeries('accuracy');
  const fluency = buildSeries('fluency');
  const confidence = buildSeries('confidence');

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance trends</h3>
          <p className="text-sm text-slate-400">Latest attempts across your core speaking metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />Accuracy</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-400" />Fluency</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />Confidence</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = height - padding - (value / 100) * (height - padding * 2);
          return (
            <g key={value}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="0" y={y + 4} className="fill-slate-500 text-[10px]">{value}</text>
            </g>
          );
        })}

        <path d={createPath(accuracy)} fill="none" stroke="#58f4ff" strokeWidth="3" strokeLinecap="round" />
        <path d={createPath(fluency)} fill="none" stroke="#57beff" strokeWidth="3" strokeLinecap="round" />
        <path d={createPath(confidence)} fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />

        {accuracy.map((point, index) => (
          <g key={`label-${data[index]?.label ?? index}`}>
            <circle cx={point.x} cy={point.y} r="4" fill="#58f4ff" />
            <text x={point.x} y={height - 4} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {data[index]?.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
