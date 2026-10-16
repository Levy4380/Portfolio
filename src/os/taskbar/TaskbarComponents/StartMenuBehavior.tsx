import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

import type { StartMenuFocus } from './StartButton.tsx';
import { menuItemSelector, StartMenu } from './StartMenu.tsx';

export interface StartMenuBehaviorProps {
  /** Below `md`: full-width bottom sheet instead of the 320px panel. */
  mobile: boolean;
  /** Which item receives focus on open. */
  initialFocus: StartMenuFocus;
  /** Bumps when the Start button asks for the same end again. */
  focusRequest: number;
  /** The Start button. Outside clicks on it are its own toggle's business. */
  triggerRef: RefObject<HTMLElement | null>;
  /** `restoreFocus` returns focus to the Start button. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

export function StartMenuBehavior({
  mobile,
  initialFocus,
  focusRequest,
  triggerRef,
  onClose,
}: StartMenuBehaviorProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(menuItemSelector) ?? [],
    );
    (initialFocus === 'last' ? items[items.length - 1] : items[0])?.focus();
  }, [initialFocus, focusRequest]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      onClose(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, triggerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(menuItemSelector) ?? [],
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
      case ' ':
        if (event.target instanceof HTMLAnchorElement) {
          event.preventDefault();
          event.target.click();
        }
        return;
    }

    if (
      event.key.length === 1 &&
      /\S/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const letter = event.key.toLowerCase();
      for (let step = 1; step <= items.length; step += 1) {
        const candidate = items[(current + step + items.length) % items.length];
        if (candidate?.textContent?.trim().toLowerCase().startsWith(letter)) {
          event.preventDefault();
          candidate.focus();
          return;
        }
      }
    }
  };

  return (
    <StartMenu
      mobile={mobile}
      menuRef={menuRef}
      onKeyDown={handleKeyDown}
      onClose={onClose}
    />
  );
}
