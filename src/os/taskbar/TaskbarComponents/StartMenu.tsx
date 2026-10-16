import { motion, useReducedMotion } from 'motion/react';
import type { KeyboardEvent, RefObject } from 'react';

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

export const menuItemSelector = '[role="menuitem"]';

const places: readonly Openable[] = [
  AboutMeFolder,
  ProjectsFolder,
  ExperimentsFolder,
];

const elsewhere = [
  { title: 'os.github', href: site.githubUrl, Mark: GitHubMark },
  { title: 'os.linkedin', href: site.linkedinUrl, Mark: LinkedInMark },
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
      onKeyDown={onKeyDown}
      className={cn(
        'fixed z-1100 overflow-y-auto overscroll-contain bg-taskbar p-2 text-fg-inverse shadow-menu backdrop-blur-md',
        mobile
          ? 'inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-h-[70dvh] rounded-t-menu'
          : 'bottom-[calc(3rem+0.5rem)] left-4 w-80 rounded-menu',
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
            tabIndex={-1}
            className={itemClass}
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
        aria-label={translation('os.elsewhere')}
        className="mt-2 border-t border-edge-dark pt-2"
      >
        <div
          aria-hidden
          className="px-3 pb-1 pt-1 text-meta text-fg-inverse-muted"
        >
          {translation('os.elsewhere')}
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
              {translation(link.title)}
              <span className="sr-only"> {translation('os.opensInNewTab')}</span>
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
