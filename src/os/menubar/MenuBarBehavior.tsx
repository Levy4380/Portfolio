import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { MenuBar } from './MenuBar.tsx';

/** Owns the language menu. The shell only paints. */
export function MenuBarBehavior() {
  const languageRef = useRef<HTMLButtonElement>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);

  useLayoutEffect(() => {
    if (languageOpen) return;
    const node = focusReturn.current;
    focusReturn.current = null;
    node?.focus();
  }, [languageOpen]);

  const onToggleLanguage = useCallback(() => {
    setLanguageOpen((open) => !open);
  }, []);

  const onCloseLanguage = useCallback((restoreFocus: boolean) => {
    focusReturn.current = restoreFocus ? languageRef.current : null;
    setLanguageOpen(false);
  }, []);

  return (
    <MenuBar
      languageOpen={languageOpen}
      languageRef={languageRef}
      onToggleLanguage={onToggleLanguage}
      onCloseLanguage={onCloseLanguage}
    />
  );
}
