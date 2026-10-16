import {
  useEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import type {
  WindowId,
  WindowInstance,
} from '../../state/StateHelpers/types.ts';
import { WindowSwitcher } from './WindowSwitcher.tsx';

export interface WindowSwitcherBehaviorProps {
  items: readonly WindowInstance[];
  activeId: WindowId | null;
  /** The Windows button. Its own toggle handles clicks on it. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Tap a row: restore and focus. The sheet closes after. */
  onFocusWindow: (id: WindowId) => void;
  onCloseWindow: (id: WindowId) => void;
  /** `restoreFocus` returns focus to the trigger. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

/** Bottom sheet listing every window, for mobile. */
export function WindowSwitcherBehavior({
  items,
  activeId,
  triggerRef,
  onFocusWindow,
  onCloseWindow,
  onClose,
}: WindowSwitcherBehaviorProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    (sheet?.querySelector<HTMLElement>('button') ?? sheet)?.focus();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        sheetRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      onClose(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, triggerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    onClose(true);
  };

  // Tabbing out of the sheet dismisses it; the trigger keeps its own toggle.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (
      !next ||
      sheetRef.current?.contains(next) ||
      triggerRef.current?.contains(next)
    )
      return;
    onClose(false);
  };

  const focusSheet = () => {
    sheetRef.current?.focus();
  };

  return (
    <WindowSwitcher
      items={items}
      activeId={activeId}
      sheetRef={sheetRef}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onFocusWindow={onFocusWindow}
      onCloseWindow={onCloseWindow}
      onClose={onClose}
      onFocusSheet={focusSheet}
    />
  );
}
