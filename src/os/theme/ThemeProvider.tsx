import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import {
  applyTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
  ThemeContext,
  type ThemeName,
} from './ThemeHelpers/theme.ts';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* Private mode can reject storage. The attribute still paints this visit. */
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
