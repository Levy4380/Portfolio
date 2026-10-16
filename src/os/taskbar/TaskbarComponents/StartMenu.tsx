import { Check, Sun } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

import { AboutMeFolder } from '../../../content/about/AboutMeFolder.tsx';
import type { Openable } from '../../../content/catalog.ts';
import { ShellGlyph } from '../../../content/ShellGlyph.tsx';
import { ExperimentsFolder } from '../../../content/experiments/ExperimentsFolder.tsx';
import { ProjectsFolder } from '../../../content/projects/ProjectsFolder.tsx';
import { site } from '../../../content/site.ts';
import { GitHubMark, LinkedInMark } from '../../../icons/brand.tsx';
import { cn } from '../../../lib/cn.ts';
import { announce } from '../../a11y/A11yHelpers/announce.ts';
import { menuPresence } from '../../motion.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';
import { useTheme } from '../../theme/ThemeHelpers/theme.ts';
import type { StartMenuFocus } from './StartButton.tsx';

export const START_MENU_ID = 'start-menu';

export const menuItemSelector = ':is([role="menuitem"], [role="menuitemcheckbox"])';

const places: readonly Openable[] = [AboutMeFolder, ProjectsFolder, ExperimentsFolder];

const elsewhere = [
  { title: 'GitHub', href: site.githubUrl, Mark: GitHubMark },
  { title: 'LinkedIn', href: site.linkedinUrl, Mark: LinkedInMark },
] as const;

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
  /** Bumps when the Start button asks for the same end again. */
  focusRequest: number;
  /** The Start button. Outside clicks on it are its own toggle's business. */
  triggerRef: RefObject<HTMLElement | null>;
  /** `restoreFocus` returns focus to the Start button. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

export function StartMenu({
  mobile,
  initialFocus,
  focusRequest,
  triggerRef,
  onClose,
}: StartMenuProps) {
  const { openContent } = useWindowActions();
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotion() ?? false;
  const menuRef = useRef<HTMLDivElement>(null);
  const motionProps = menuPresence(reduced, mobile);
  const light = theme === 'light';

  const getItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>(menuItemSelector) ?? []);

  useEffect(() => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(menuItemSelector) ?? [],
    );
    (initialFocus === 'last' ? items[items.length - 1] : items[0])?.focus();
  }, [initialFocus, focusRequest]);

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
      <div role="group" aria-label="Places">
        <div aria-hidden className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted">
          Places
        </div>
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={itemClass}
            onClick={() => {
              openContent(place);
              onClose(false);
            }}
          >
            <ShellGlyph icon={place.icon} className="size-5 shrink-0" />
            <span>{place.title}</span>
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label="Elsewhere"
        className="mt-2 border-t border-edge-dark pt-2"
      >
        <div aria-hidden className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted">
          Elsewhere
        </div>
        {elsewhere.map((link) => (
          <a
            key={link.title}
            role="menuitem"
            tabIndex={-1}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            onClick={() => onClose(true)}
          >
            <link.Mark className="size-5 shrink-0" />
            <span>
              {link.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        ))}
      </div>
      <div
        role="group"
        aria-label="Appearance"
        className="mt-2 border-t border-edge-dark pt-2"
      >
        <div aria-hidden className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted">
          Appearance
        </div>
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={light}
          tabIndex={-1}
          className={cn(itemClass, 'group aria-checked:bg-glass-active')}
          onClick={() => {
            toggleTheme();
            announce(light ? 'Dark theme' : 'Light theme');
          }}
        >
          <Sun className="size-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">Light theme</span>
          <Check
            className="size-4 shrink-0 opacity-0 group-aria-checked:opacity-100"
            aria-hidden
          />
        </button>
      </div>
    </motion.div>
  );
}
