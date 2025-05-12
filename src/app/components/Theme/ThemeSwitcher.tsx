'use client';
import { useEffect, useRef, useState } from 'react';

const themes = [
  { name: 'System', value: 'system', icon: '💻' },
  { name: 'Light', value: 'light', icon: '🌞' },
  { name: 'Dark', value: 'dark', icon: '🌙' },
];

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('system');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'system';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (value: string) => {
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', value);
    }
    localStorage.setItem('theme', value);
    setTheme(value);
  };

  return (
    <div className="relative hidden lg:flex" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-sm btn-outline flex items-center gap-2 transition-transform duration-150 hover:scale-105"
      >
        <span>{themes.find((t) => t.value === theme)?.icon}</span>
        <span className="capitalize">{theme}</span>
        <span className="ml-1">▾</span>
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 z-50 menu p-2 shadow bg-base-200 rounded-box w-44 animate-fadeIn">
          {themes.map((t) => (
            <li key={t.value}>
              <button
                className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-base-300 transition-all ${
                  t.value === theme ? 'font-semibold' : ''
                }`}
                onClick={() => {
                  applyTheme(t.value);
                  setOpen(false);
                }}
              >
                <span>{t.icon}</span> <span>{t.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
