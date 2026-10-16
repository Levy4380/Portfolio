import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

import { LanguageMenu, languageItemSelector } from './LanguageMenu.tsx';

export interface LanguageMenuBehaviorProps {
  triggerRef: RefObject<HTMLElement | null>;
  /** `restoreFocus` returns focus to the language button. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

export function LanguageMenuBehavior({
  triggerRef,
  onClose,
}: LanguageMenuBehaviorProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(languageItemSelector) ?? [],
    );
    const checked = items.find((item) => item.getAttribute('aria-checked') === 'true');
    (checked ?? items[0])?.focus();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, triggerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(languageItemSelector) ?? [],
    );
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(current + 1) % items.length]?.focus();
        return;
      case 'ArrowUp':
        event.preventDefault();
        items[current <= 0 ? items.length - 1 : current - 1]?.focus();
        return;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        return;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        return;
      case 'Escape':
        event.preventDefault();
        onClose(true);
        return;
      case 'Tab':
        triggerRef.current?.focus();
        onClose(false);
        return;
    }
  };

  return <LanguageMenu menuRef={menuRef} onKeyDown={handleKeyDown} onClose={onClose} />;
}
