import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { KeyboardEvent, RefObject } from 'react';

import {
  useLanguage,
  useTranslation,
  type Language,
} from '../../content/i18n/useTranslation.ts';
import { cn } from '../../lib/cn.ts';
import { announce } from '../a11y/A11yHelpers/announce.ts';
import { dropPresence } from '../motion.ts';
import { LanguageFlag } from './LanguageFlag.tsx';

export const LANGUAGE_MENU_ID = 'language-menu';

export const languageItemSelector = '[role="menuitemradio"]';

const languages = [
  ['en', 'EN', 'os.english'],
  ['es', 'ES', 'os.spanish'],
] as const;

const itemClass = cn(
  'group flex min-h-8 w-full items-center gap-2 rounded-control px-2 text-left text-label text-fg-inverse select-none touch-manipulation',
  'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
  'cursor-pointer hover:bg-glass-hover focus:bg-glass-hover active:bg-glass-active pointer-coarse:min-h-11',
);

export interface LanguageMenuProps {
  menuRef: RefObject<HTMLDivElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onClose: (restoreFocus: boolean) => void;
}

export function LanguageMenu({ menuRef, onKeyDown, onClose }: LanguageMenuProps) {
  const { language, setLanguage } = useLanguage();
  const translation = useTranslation(language);
  const reduced = useReducedMotion() ?? false;
  const motionProps = dropPresence(reduced);

  const choose = (code: Language, label: (typeof languages)[number][2]) => {
    if (language !== code) {
      setLanguage(code);
      announce(translation(label));
    }
    onClose(true);
  };

  return (
    <motion.div
      ref={menuRef}
      id={LANGUAGE_MENU_ID}
      role="menu"
      aria-label={translation('os.language')}
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      onKeyDown={onKeyDown}
      className="absolute top-full right-0 z-1100 mt-1 min-w-40 rounded-menu bg-menu-solid p-1 text-fg-inverse shadow-menu"
    >
      {languages.map(([code, short, label]) => (
        <button
          key={code}
          type="button"
          role="menuitemradio"
          aria-checked={language === code}
          aria-label={translation(label)}
          tabIndex={-1}
          className={cn(itemClass, 'aria-checked:bg-glass-active')}
          onClick={() => choose(code, label)}
        >
          <Check
            className="size-3.5 shrink-0 opacity-0 group-aria-checked:opacity-100"
            aria-hidden
          />
          <LanguageFlag code={code} />
          <span aria-hidden>{short}</span>
        </button>
      ))}
    </motion.div>
  );
}
