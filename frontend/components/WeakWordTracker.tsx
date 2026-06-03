interface WeakWordTrackerProps {
  words: Array<{ word: string; count: number }>;
}

export function WeakWordTracker({ words }: WeakWordTrackerProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">Top weak words</h3>
        <p className="text-sm text-slate-400">Words that repeatedly need clarity or pronunciation practice.</p>
      </div>

      {words.length ? (
        <div className="space-y-3">
          {words.map((item, index) => (
            <div key={item.word} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-slate-400">#{index + 1}</p>
                <p className="text-base font-medium capitalize text-white">{item.word}</p>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100">{item.count} flags</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">
          No weak words yet. Complete an attempt to start building your pronunciation profile.
        </div>
      )}
    </div>
  );
}
