import { memo, useRef, type MouseEvent, type PointerEvent } from 'react';

import type { ContentItem } from '../../content/types.ts';
import { iconMap } from '../../icons/iconMap.ts';
import { cn } from '../../lib/cn.ts';
import type { IconGridVariant } from '../contracts.ts';

// Recipes replace a class group per variant instead of appending over it (design.md §11.6).
const tile = {
  base: 'group flex flex-col items-center gap-1 rounded-tile p-2 text-center select-none touch-manipulation focus-ring transition-colors duration-120 active:scale-97 motion-reduce:transform-none aria-selected:ring-1',
  // §8.2: 88×100 on mobile, 96×104 from `md` (tablet and desktop).
  desktop:
    'h-25 w-22 md:h-26 md:w-24 text-fg-inverse hover:bg-glass-hover active:bg-glass-active aria-selected:ring-accent-on-dark/60',
  window:
    'w-24 text-fg hover:bg-chrome-hover active:bg-chrome-press aria-selected:bg-selection aria-selected:ring-accent/40 window-inactive:aria-selected:ring-indicator-muted',
} as const;

const label = {
  base: 'line-clamp-2 max-w-full break-words text-label',
  desktop: 'rounded-chip px-1 font-medium group-aria-selected:bg-selection-desktop',
  window: 'font-medium group-aria-selected:font-semibold',
} as const;

export interface IconTileProps {
  item: ContentItem;
  variant: IconGridVariant;
  /** Owned by the grid. The tile only reflects it. */
  selected: boolean;
  /** Roving tabindex: `0` for the single tab stop, `-1` otherwise. */
  tabIndex: 0 | -1;
  /** Id of the shared "Press Enter to open." hint. */
  describedBy: string;
  onSelect: (item: ContentItem) => void;
  onOpen: (item: ContentItem) => void;
  /** Keeps the grid's tab stop on whichever tile received focus. */
  onFocusItem: (item: ContentItem) => void;
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
  item,
  variant,
  selected,
  tabIndex,
  describedBy,
  onSelect,
  onOpen,
  onFocusItem,
}: IconTileProps) {
  const Icon = iconMap[item.icon];
  const pointerType = useRef('');

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerType.current = event.pointerType;
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const type = pointerType.current;
    pointerType.current = '';

    onSelect(item);
    if (type === 'mouse') {
      // `detail` is the click count; 2 is the second click of a double click.
      if (event.detail >= 2) onOpen(item);
      return;
    }
    onOpen(item);
  };

  const showFileName = variant === 'window' && item.fileName;

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-describedby={describedBy}
      tabIndex={tabIndex}
      title={item.title}
      className={cn(tile.base, tile[variant])}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onFocus={() => onFocusItem(item)}
    >
      <Icon />
      <span className={cn(label.base, label[variant])}>
        {item.title}
        {item.kind === 'link' ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </span>
      {showFileName ? (
        <span aria-hidden className="max-w-full truncate font-mono text-meta text-fg-subtle">
          {item.fileName}
        </span>
      ) : null}
    </div>
  );
}

export const IconTile = memo(IconTileComponent);
