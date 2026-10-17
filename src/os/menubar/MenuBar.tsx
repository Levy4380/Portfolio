import { AnimatePresence } from 'motion/react';
import type { RefObject } from 'react';
import { useLocation } from 'react-router';

import { titleFor } from '../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import { site } from '../../content/site.ts';
import { cn } from '../../lib/cn.ts';
import { routePointsAt } from '../routing/RoutingHelpers/paths.ts';
import { useWindowState } from '../state/StateHelpers/useWindowActions.ts';
import { LANGUAGE_MENU_ID } from './LanguageMenu.tsx';
import { LanguageFlag } from './LanguageFlag.tsx';
import { LanguageMenuBehavior } from './LanguageMenuBehavior.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

export interface MenuBarProps {
  languageOpen: boolean;
  languageRef: RefObject<HTMLButtonElement | null>;
  onToggleLanguage: () => void;
  /** `restoreFocus` returns focus to the language button. Must be referentially stable. */
  onCloseLanguage: (restoreFocus: boolean) => void;
}

/**
 * Top bar. The left names the focused window only when the address bar
 * points at it. A window opened on `/` keeps `site.name`. Language and the
 * theme switch sit together on the right.
 */
export function MenuBar({
  languageOpen,
  languageRef,
  onToggleLanguage,
  onCloseLanguage,
}: MenuBarProps) {
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const { pathname } = useLocation();
  const { state } = useWindowState();
  const active = state.activeId ? state.windows[state.activeId] : undefined;
  const contextTitle =
    active && !active.minimized && routePointsAt(pathname, active.contentId)
      ? translation(titleFor(active.contentId))
      : site.name;
  const current = translation(language === 'en' ? 'os.english' : 'os.spanish');
  const code = language === 'en' ? 'EN' : 'ES';

  return (
    <header
      aria-label={translation('os.menuBar')}
      className={cn(
        'fixed inset-x-0 top-0 z-1000 flex items-center justify-between gap-3 px-4 text-fg-inverse',
        'h-[calc(var(--os-menubar-h)+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]',
        'border-b border-edge-dark bg-menu-solid',
      )}
    >
      <span
        title={contextTitle}
        className="min-w-0 truncate px-1 text-label font-semibold text-fg-inverse select-none"
      >
        {contextTitle}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <div className="relative">
          <button
            ref={languageRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={languageOpen}
            aria-controls={LANGUAGE_MENU_ID}
            aria-label={`${translation('os.language')}, ${current}`}
            onClick={onToggleLanguage}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-control px-2 text-label font-medium text-fg-inverse select-none touch-manipulation transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover active:bg-glass-active aria-expanded:bg-glass-active"
          >
            <LanguageFlag code={language} />
            <span aria-hidden>{code}</span>
          </button>
          <AnimatePresence>
            {languageOpen ? (
              <LanguageMenuBehavior
                key="language-menu"
                triggerRef={languageRef}
                onClose={onCloseLanguage}
              />
            ) : null}
          </AnimatePresence>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
