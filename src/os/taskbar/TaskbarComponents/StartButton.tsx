import { LayoutGrid } from 'lucide-react';
import type { KeyboardEvent, Ref } from 'react';

import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { cn } from '../../../lib/cn.ts';

export type StartMenuFocus = 'first' | 'last';

export interface StartButtonProps {
  ref?: Ref<HTMLButtonElement>;
  open: boolean;
  /** Click, Enter or Space. */
  onToggle: () => void;
  /** ArrowDown opens at the first item, ArrowUp at the last. */
  onOpenFrom: (focus: StartMenuFocus) => void;
  controlsId: string;
}

/**
 * Apps launcher. A 3×3 grid sits beside the Start label. 40px tall from `md`,
 * 44px below. The fill is the taskbar hover plate.
 */
export function StartButton({ ref, open, onToggle, onOpenFrom, controlsId }: StartButtonProps) {
  const { language } = useLanguage();
  const translation = useTranslation(language);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      onOpenFrom(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex h-10 max-md:h-11 shrink-0 items-center gap-2 rounded-control px-3 select-none touch-manipulation cursor-pointer',
        'bg-glass-hover hover:bg-glass-active active:bg-glass-active aria-expanded:bg-glass-active',
        'text-fg-inverse',
        'transition-[transform,background-color] duration-base ease-os-out',
        'focus-ring focus-visible:-outline-offset-2',
        'active:scale-97 motion-reduce:active:scale-100 motion-reduce:transition-none',
      )}
    >
      <LayoutGrid aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
      <span className="text-label font-medium">{translation('os.start')}</span>
    </button>
  );
}
