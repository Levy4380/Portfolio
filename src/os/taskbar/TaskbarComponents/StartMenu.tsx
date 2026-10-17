import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { ChevronRight, Send } from 'lucide-react';

import { AboutMeFolder } from '../../../content/about/AboutMeFolder.tsx';
import type { Openable } from '../../../content/catalog.ts';
import { ShellGlyph } from '../../../content/ShellGlyph.tsx';
import { ExperimentsFolder } from '../../../content/experiments/ExperimentsFolder.tsx';
import { ProjectsFolder } from '../../../content/projects/ProjectsFolder.tsx';
import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { site } from '../../../content/site.ts';
import { GitHubMark, LinkedInMark } from '../../../icons/brand.tsx';
import { cn } from '../../../lib/cn.ts';
import { menuPresence } from '../../motion.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';

export const START_MENU_ID = 'start-menu';

/** Root rows only. The networks flyout keeps its own menuitems. */
export const menuItemSelector = '[role="menuitem"][data-menu-level="root"]';

const submenuItemSelector = '[role="menuitem"]';

const places: readonly Openable[] = [
  AboutMeFolder,
  ProjectsFolder,
  ExperimentsFolder,
];

const networks = [
  { title: 'os.github', href: site.githubUrl, Mark: GitHubMark },
  { title: 'os.linkedin', href: site.linkedinUrl, Mark: LinkedInMark },
  { title: 'os.contactMe', href: site.email, Mark: Send },
] as const;

const itemClass = cn(
  'flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-label text-fg-inverse select-none touch-manipulation',
  'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
  'hover:bg-glass-hover focus:bg-glass-hover active:bg-glass-active pointer-coarse:min-h-11',
);

export interface StartMenuProps {
  /** Below `md`: full-width bottom sheet instead of the 320px panel. */
  mobile: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** `restoreFocus` returns focus to the Start button. Must be referentially stable. */
  onClose: (restoreFocus: boolean) => void;
}

export function StartMenu({
  mobile,
  menuRef,
  onKeyDown,
  onClose,
}: StartMenuProps) {
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const reduced = useReducedMotion() ?? false;
  const motionProps = menuPresence(reduced, mobile);
  const [networksOpen, setNetworksOpen] = useState(false);
  const networksPanel = useRef<HTMLDivElement>(null);
  const networksTrigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openNetworks = () => {
    cancelClose();
    setNetworksOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setNetworksOpen(false), 140);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const focusFirstNetwork = () => {
    window.requestAnimationFrame(() => {
      networksPanel.current
        ?.querySelector<HTMLElement>(submenuItemSelector)
        ?.focus();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const panel = networksPanel.current;
    const inSubmenu = panel?.contains(event.target as Node) ?? false;

    if (
      event.key === 'ArrowRight' &&
      !inSubmenu &&
      (event.target as HTMLElement).dataset.submenuTrigger === 'networks'
    ) {
      event.preventDefault();
      openNetworks();
      focusFirstNetwork();
      return;
    }

    if (inSubmenu && panel) {
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(submenuItemSelector),
      );
      const current = items.indexOf(document.activeElement as HTMLElement);

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next =
          event.key === 'ArrowDown'
            ? items[(current + 1) % items.length]
            : items[current <= 0 ? items.length - 1 : current - 1];
        next?.focus();
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        items[0]?.focus();
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        items[items.length - 1]?.focus();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setNetworksOpen(false);
        networksTrigger.current?.focus();
        return;
      }
    }

    onKeyDown(event);
  };

  return (
    <motion.div
      ref={menuRef}
      id={START_MENU_ID}
      role="menu"
      aria-label={translation('os.start')}
      aria-orientation="vertical"
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed z-1100 bg-taskbar p-2 text-fg-inverse shadow-menu backdrop-blur-md',
        mobile
          ? 'inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-h-[70dvh] overflow-y-auto overscroll-contain rounded-t-menu'
          : 'bottom-[calc(3rem+0.5rem)] left-4 w-80 overflow-visible rounded-menu',
      )}
    >
      <div role="group" aria-label={translation('os.places')}>
        <div
          aria-hidden
          className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted"
        >
          {translation('os.places')}
        </div>
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            role="menuitem"
            data-menu-level="root"
            tabIndex={-1}
            className={itemClass}
            onMouseEnter={() => setNetworksOpen(false)}
            onFocus={() => setNetworksOpen(false)}
            onClick={() => {
              openContent(place);
              onClose(false);
            }}
          >
            <ShellGlyph icon={place.icon} className="size-5 shrink-0" />
            <span>{translation(place.title)}</span>
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label={translation('os.networks')}
        className="relative mt-2 border-t border-edge-dark pt-2"
        onMouseEnter={openNetworks}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={networksTrigger}
          type="button"
          role="menuitem"
          data-menu-level="root"
          data-submenu-trigger="networks"
          tabIndex={-1}
          aria-haspopup="menu"
          aria-expanded={networksOpen}
          aria-controls="start-networks"
          className={itemClass}
          onClick={openNetworks}
          onFocus={openNetworks}
        >
          <span className="min-w-0 flex-1">{translation('os.networks')}</span>
          <ChevronRight aria-hidden className="size-4 shrink-0" />
        </button>
        {networksOpen ? (
          <div
            onMouseEnter={openNetworks}
            className={cn(
              'z-10',
              mobile
                ? 'absolute right-0 bottom-full mb-2'
                : 'absolute bottom-0 left-full pl-2',
            )}
          >
            <div
              ref={networksPanel}
              id="start-networks"
              role="menu"
              aria-label={translation('os.networks')}
              className="w-56 rounded-menu bg-menu-solid p-2 shadow-menu"
            >
              {networks.map((link) => (
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
                    {translation(link.title)}
                    <span className="sr-only">
                      {' '}
                      {translation('os.opensInNewTab')}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
