import { Moon, Sun } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';

import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import { cn } from '../../lib/cn.ts';
import { announce } from '../a11y/A11yHelpers/announce.ts';
import type { ThemeName } from '../theme/ThemeHelpers/theme.ts';
import { useTheme } from '../theme/ThemeHelpers/theme.ts';

const segmentClass = cn(
  'grid h-6 w-8 cursor-pointer place-items-center rounded-full text-fg-inverse-muted',
  'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
  'hover:text-fg-inverse aria-checked:bg-segment aria-checked:text-segment-fg aria-checked:shadow-segment',
);

/**
 * Two-segment appearance control. Sun is light, moon is dark.
 * Arrows move the selection. The raised segment is the current theme.
 */
export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const lightRef = useRef<HTMLButtonElement>(null);
  const darkRef = useRef<HTMLButtonElement>(null);

  const select = (next: ThemeName) => {
    if (next === theme) return;
    toggleTheme();
    announce(translation(next === 'light' ? 'os.lightTheme' : 'os.darkTheme'));
    queueMicrotask(() => {
      (next === 'light' ? lightRef : darkRef).current?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'ArrowDown'
    ) {
      return;
    }
    event.preventDefault();
    select(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div
      role="radiogroup"
      aria-label={translation('os.appearance')}
      onKeyDown={onKeyDown}
      className="flex h-7 items-center rounded-full bg-segment-track p-0.5"
    >
      <button
        ref={lightRef}
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label={translation('os.lightTheme')}
        title={translation('os.lightTheme')}
        onClick={() => select('light')}
        className={segmentClass}
      >
        <Sun aria-hidden className="size-3.5" />
      </button>
      <button
        ref={darkRef}
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label={translation('os.darkTheme')}
        title={translation('os.darkTheme')}
        onClick={() => select('dark')}
        className={segmentClass}
      >
        <Moon aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
