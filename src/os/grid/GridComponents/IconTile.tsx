import { memo, useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

import { cn } from '../../../lib/cn.ts';
import type { IconGridVariant } from '../../contracts.ts';

const tile = {
  base: 'group flex h-(--os-icon-tile-h) cursor-pointer flex-col items-center gap-1 rounded-tile p-2 text-center select-none touch-manipulation focus-ring transition-colors duration-120 active:scale-97 motion-reduce:transform-none aria-selected:ring-1 [&>svg]:block',
  desktop:
    'w-full max-w-24 md:w-24 hover:bg-glass-hover active:bg-glass-active aria-selected:ring-accent-on-dark/60',
  window:
    'w-24 text-fg hover:bg-chrome-hover active:bg-chrome-press aria-selected:bg-selection aria-selected:ring-accent/40 window-inactive:aria-selected:ring-indicator-muted',
} as const;

const label = {
  base: 'line-clamp-2 max-h-9 max-w-full shrink-0 hyphens-auto break-words text-label',
  desktop:
    'rounded-chip px-1 font-medium text-paper-50 group-aria-selected:bg-selection-desktop',
  window: 'font-medium group-aria-selected:font-semibold',
} as const;

export interface IconTileProps {
  id: string;
  title: string;
  icon: ReactNode;
  variant: IconGridVariant;
  fileName?: string;
  selected: boolean;
  tabIndex: 0 | -1;
  describedBy: string;
  onSelect: () => void;
  onOpen: () => void;
  onFocusItem: () => void;
}

/**
 * Icon, label and optional file name. Selection and the tab stop belong to the grid.
 *
 * Pointer rules (design.md §8.5) are decided per event from `pointerType`:
 * - `mouse`: a click selects, the second click of a double click opens.
 * - `touch` / `pen`: a single tap selects and opens.
 * - No known pointer (assistive-technology click, programmatic click): treated as
 *   an activation, because those users cannot double click.
 */
function IconTileComponent({
  id,
  title,
  icon,
  variant,
  fileName,
  selected,
  tabIndex,
  describedBy,
  onSelect,
  onOpen,
  onFocusItem,
}: IconTileProps) {
  const pointerType = useRef('');

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerType.current = event.pointerType;
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const type = pointerType.current;
    pointerType.current = '';

    onSelect();
    if (type === 'mouse') {
      if (event.detail >= 2) onOpen();
      return;
    }
    onOpen();
  };

  const showFileName = variant === 'window' && fileName;

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-describedby={describedBy}
      data-id={id}
      tabIndex={tabIndex}
      title={title}
      className={cn(tile.base, tile[variant])}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onFocus={onFocusItem}
    >
      {icon}
      <span className={cn(label.base, label[variant])}>{title}</span>
      {showFileName ? (
        <span aria-hidden className="max-w-full truncate font-mono text-meta text-fg-subtle">
          {fileName}
        </span>
      ) : null}
    </div>
  );
}

export const IconTile = memo(IconTileComponent);
