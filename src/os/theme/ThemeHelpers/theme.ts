import { createContext, useContext } from 'react';

/** Dark is the default workstation. Light is the paper desktop. */
export type ThemeName = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'portfolio-theme';

export const ThemeContext = createContext<{
  theme: ThemeName;
  toggleTheme: () => void;
} | null>(null);
ThemeContext.displayName = 'ThemeContext';

export function readStoredTheme(): ThemeName {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Paint the theme on `<html>` so every semantic token resolves before the shell. */
export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value;
}
