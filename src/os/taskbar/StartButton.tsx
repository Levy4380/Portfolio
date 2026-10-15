import type { KeyboardEvent, Ref } from 'react';

import { site } from '../../content/site.ts';
import { cn } from '../../lib/cn.ts';

/** Owner's initials, at most two letters. */
const initials =
  site.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('') || '·';

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

/** 48×40 monogram button. The visible glyph is decorative; "Start" is the accessible name. */
export function StartButton({ ref, open, onToggle, onOpenFrom, controlsId }: StartButtonProps) {
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
        'grid h-10 w-12 shrink-0 place-items-center rounded-control text-fg-inverse select-none touch-manipulation',
        'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
        'hover:bg-glass-hover active:scale-97 active:bg-glass-active aria-expanded:bg-glass-active',
        'motion-reduce:active:scale-100 pointer-coarse:h-11',
      )}
    >
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-control border border-accent-on-dark font-mono text-meta font-semibold leading-none text-accent-on-dark"
      >
        {initials}
      </span>
      <span className="sr-only">Start</span>
    </button>
  );
}
