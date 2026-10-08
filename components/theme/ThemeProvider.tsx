'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudioAudio } from '../../lib/watermark';

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jadai-theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
        if (document.body) document.body.setAttribute('data-theme', saved);
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initial = prefersLight ? 'light' : 'dark';
        setThemeState(initial);
        document.documentElement.setAttribute('data-theme', initial);
        if (document.body) document.body.setAttribute('data-theme', initial);
      }
    } catch {
      // Fallback
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('jadai-theme', t);
    } catch {}
    document.documentElement.setAttribute('data-theme', t);
    if (document.body) document.body.setAttribute('data-theme', t);
    StudioAudio.playClick();
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // If used outside ThemeProvider, fallback gracefully
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}

export default ThemeProvider;
