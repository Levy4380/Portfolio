import { useCallback, useId, useImperativeHandle, useState, type Ref } from 'react';

import type { ContentItem, ContentKey } from '../../content/types.ts';
import { cn } from '../../lib/cn.ts';
import { useRovingGrid } from '../a11y/useRovingGrid.ts';
import type { IconGridProps, IconGridVariant } from '../contracts.ts';
import { IconTile } from './IconTile.tsx';

// Arbitrary values are single-use structural grid tracks (design.md §11.5).
const grid = {
  base: 'grid content-start gap-2',
  // §8.2: mobile home-screen grid, tablet row-major top-left, desktop column-major top-left.
  desktop:
    'grid-cols-3 justify-items-center p-4 pt-6 sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,96px)] md:justify-start md:justify-items-start md:pt-4 lg:h-full lg:grid-flow-col lg:grid-cols-none lg:grid-rows-[repeat(auto-fill,104px)]',
  window: 'grid-cols-[repeat(auto-fill,6rem)] justify-start',
} as const satisfies Record<'base' | IconGridVariant, string>;

function keyOf(item: ContentItem): ContentKey {
  return `${item.kind}:${item.slug}`;
}

/** Lets the desktop clear a selection it does not own. Keyboard and pointer stay inside the grid. */
export interface IconGridHandle {
  clearSelection: () => void;
}

export function IconGrid({
  items,
  variant,
  ariaLabel,
  onOpen,
  className,
  ref,
}: IconGridProps & { ref?: Ref<IconGridHandle | null> }) {
  const hintId = useId();
  const [selectedKey, setSelectedKey] = useState<ContentKey | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      clearSelection() {
        setSelectedKey(null);
      },
    }),
    [],
  );

  const select = useCallback((item: ContentItem) => {
    setSelectedKey(keyOf(item));
  }, []);

  const open = useCallback(
    (item: ContentItem) => {
      if (item.kind === 'link') {
        // External links are not windows; the grid never touches window state.
        window.open(item.href, '_blank', 'noopener,noreferrer');
        return;
      }
      onOpen(keyOf(item));
    },
    [onOpen],
  );

  const { containerRef, activeIndex, setActiveIndex, onKeyDown } = useRovingGrid({
    count: items.length,
    onMove: (index) => {
      const item = items[index];
      if (item) select(item);
    },
    onSelect: (index) => {
      const item = items[index];
      if (item) select(item);
    },
    onActivate: (index) => {
      const item = items[index];
      if (item) open(item);
    },
  });

  const focusItem = useCallback(
    (item: ContentItem) => {
      const index = items.indexOf(item);
      if (index !== -1) setActiveIndex(index);
    },
    [items, setActiveIndex],
  );

  return (
    <>
      <span id={hintId} className="sr-only">
        Press Enter to open.
      </span>
      <div
        ref={containerRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-orientation={variant === 'desktop' ? 'vertical' : undefined}
        className={cn(grid.base, grid[variant], className)}
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => (
          <IconTile
            key={keyOf(item)}
            item={item}
            variant={variant}
            selected={keyOf(item) === selectedKey}
            tabIndex={index === activeIndex ? 0 : -1}
            describedBy={hintId}
            onSelect={select}
            onOpen={open}
            onFocusItem={focusItem}
          />
        ))}
      </div>
    </>
  );
}
