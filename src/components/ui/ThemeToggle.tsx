import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

const resolveTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('portfolio-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('portfolio-theme', theme);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0c0e11' : '#f2f4ed');
};

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>(resolveTheme);
  useEffect(() => applyTheme(theme), [theme]);
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button type="button" className={`theme-toggle ${className}`.trim()} onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
    <span className="theme-toggle-track" aria-hidden="true"><span className="theme-toggle-thumb">{theme === 'dark' ? <Moon size={13}/> : <Sun size={13}/>}</span></span>
    <span className="theme-toggle-label">{theme}</span>
  </button>;
};
