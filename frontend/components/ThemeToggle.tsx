'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const applyTheme = (nextTheme: 'dark' | 'light') => {
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
    document.body.style.background =
      nextTheme === 'dark'
        ? 'radial-gradient(circle at top left, rgba(88, 244, 255, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(44, 163, 255, 0.14), transparent 24%), linear-gradient(180deg, #050816 0%, #071126 45%, #09172d 100%)'
        : 'linear-gradient(180deg, #eef8ff 0%, #dbeaff 100%)';
    document.body.style.color = nextTheme === 'dark' ? '#e8f4ff' : '#0f172a';
  };

  useEffect(() => {
    const stored = window.localStorage.getItem('speakpro-theme') as 'dark' | 'light' | null;
    const nextTheme = stored ?? 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem('speakpro-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
    >
      {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
    </button>
  );
}
