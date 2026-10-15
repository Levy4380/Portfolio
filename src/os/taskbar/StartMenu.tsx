import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

import { getContent, keyOf } from '../../content/registry.ts';
import { startMenu } from '../../content/startMenu.ts';
import type { ContentItem } from '../../content/types.ts';
import { iconMap } from '../../icons/iconMap.ts';
import { cn } from '../../lib/cn.ts';
import { menuPresence } from '../motion.ts';
import { useWindowActions } from '../state/useWindowActions.ts';
import type { StartMenuFocus } from './StartButton.tsx';

export const START_MENU_ID = 'start-menu';

const groups = startMenu.map((group) => ({
  label: group.label,
  items: group.items
    .map((key) => getContent(key))
    .filter((item): item is ContentItem => item !== undefined),
}));

const itemClass = cn(
  'flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-label text-fg-inverse select-none touch-manipulation',
  'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
  'hover:bg-glass-hover focus:bg-glass-hover active:bg-glass-active pointer-coarse:min-h-11',
);

export interface StartMenuProps {
  /** Below `md`: full-width bottom sheet instead of the 320px panel. */
  mobile: boolean;
  /** Which item receives focus on open. */
  initialFocus: StartMenuFocus;
  /** The Start button. Outside clicks on it are its own toggle's business. */
  triggerRef: RefObject<HTMLElement | null>;
  /** `restoreFocus` returns focus to the Start button. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

export function StartMenu({ mobile, initialFocus, triggerRef, onClose }: StartMenuProps) {
  const { openContent } = useWindowActions();
  const reduced = useReducedMotion() ?? false;
  const menuRef = useRef<HTMLDivElement>(null);
  const motionProps = menuPresence(reduced, mobile);

  const getItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    (initialFocus === 'last' ? items[items.length - 1] : items[0])?.focus();
  }, [initialFocus]);

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
    const items = getItems();
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
        // Focus the trigger first so the default Tab moves on from the Start button.
        triggerRef.current?.focus();
        onClose(false);
        return;
      case ' ':
        // Buttons activate on Space natively; anchors do not.
        if (event.target instanceof HTMLAnchorElement) {
          event.preventDefault();
          event.target.click();
        }
        return;
    }

    // Type-ahead: a single letter jumps to the next item starting with it.
    if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
    <motion.div
      ref={menuRef}
      id={START_MENU_ID}
      role="menu"
      aria-label="Start"
      aria-orientation="vertical"
      data-surface="dark"
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed z-1100 overflow-y-auto overscroll-contain bg-taskbar p-2 text-fg-inverse shadow-menu backdrop-blur-md',
        mobile
          ? 'inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-h-[70dvh] rounded-t-menu'
          : 'bottom-[calc(3rem+0.5rem)] left-2 w-80 rounded-menu',
      )}
    >
      {groups.map((group, index) => (
        <div
          key={group.label}
          role="group"
          aria-label={group.label}
          className={cn(index > 0 && 'mt-2 border-t border-edge-dark pt-2')}
        >
          <div aria-hidden className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted">
            {group.label}
          </div>
          {group.items.map((item) => {
            const Icon = iconMap[item.icon];
            if (item.kind === 'link') {
              return (
                <a
                  key={keyOf(item)}
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemClass}
                  onClick={() => onClose(true)}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>
                    {item.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              );
            }
            return (
              <button
                key={keyOf(item)}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={itemClass}
                onClick={() => {
                  openContent(keyOf(item));
                  onClose(false);
                }}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}
