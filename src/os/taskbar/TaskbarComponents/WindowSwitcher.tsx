import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';

import { iconFor, titleFor } from '../../../content/catalog.ts';
import { ShellGlyph } from '../../../content/ShellGlyph.tsx';
import { cn } from '../../../lib/cn.ts';
import { menuPresence } from '../../motion.ts';
import type { WindowId, WindowInstance } from '../../state/StateHelpers/types.ts';

export const WINDOW_SWITCHER_ID = 'window-switcher';

export interface WindowSwitcherProps {
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
export function WindowSwitcher({
  items,
  activeId,
  triggerRef,
  onFocusWindow,
  onCloseWindow,
  onClose,
}: WindowSwitcherProps) {
  const reduced = useReducedMotion() ?? false;
  const motionProps = menuPresence(reduced, true);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    (sheet?.querySelector<HTMLElement>('button') ?? sheet)?.focus();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (sheetRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
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
    if (!next || sheetRef.current?.contains(next) || triggerRef.current?.contains(next)) return;
    onClose(false);
  };

  return (
    <motion.div
      ref={sheetRef}
      id={WINDOW_SWITCHER_ID}
      role="dialog"
      aria-modal="false"
      aria-label="Open windows"
      tabIndex={-1}
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-1100 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-t-menu bg-taskbar p-2 text-fg-inverse shadow-menu outline-none backdrop-blur-md"
    >
      {items.length === 0 ? (
        <p className="px-3 py-4 text-label text-fg-inverse-muted">No open windows.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((instance) => {
            const title = titleFor(instance.contentId);
            const icon = iconFor(instance.contentId);
            const isActive = activeId === instance.id && !instance.minimized;
            const state = instance.minimized ? 'Minimized' : isActive ? 'Active' : 'Open';

            return (
              <li
                key={instance.id}
                className="flex items-center gap-1 border-b border-edge-dark last:border-b-0"
              >
                <button
                  type="button"
                  aria-current={isActive || undefined}
                  onClick={() => {
                    onFocusWindow(instance.id);
                    onClose(false);
                  }}
                  className={cn(
                    'flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-control px-3 text-left text-label text-fg-inverse touch-manipulation',
                    'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
                    'hover:bg-glass-hover active:bg-glass-active',
                    isActive && 'bg-glass-active',
                  )}
                >
                  <ShellGlyph icon={icon} className="size-5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{title}</span>
                  <span
                    className={cn(
                      'shrink-0 text-meta text-fg-inverse-muted',
                      instance.minimized && 'italic',
                      isActive && 'font-semibold text-fg-inverse',
                    )}
                  >
                    {state}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Close ${title}`}
                  onClick={() => {
                    // The row is about to unmount; keep focus inside the sheet.
                    sheetRef.current?.focus();
                    onCloseWindow(instance.id);
                  }}
                  className="grid size-11 shrink-0 place-items-center rounded-control text-fg-inverse touch-manipulation transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover active:bg-glass-active"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
