import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useImperativeHandle,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { cn } from '../../lib/cn.ts';
import { useRovingGrid } from '../a11y/A11yHelpers/useRovingGrid.ts';
import type { IconGridVariant } from '../contracts.ts';
import { IconGridContext, type IconGridContextValue } from './iconGridContext.tsx';

const grid = {
  base: 'grid content-start gap-2',
  desktop:
    'grid-cols-3 justify-items-center p-4 pt-6 sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,96px)] md:justify-start md:justify-items-start md:pt-4 lg:h-full lg:grid-flow-col lg:grid-cols-none lg:grid-rows-[repeat(auto-fill,120px)]',
  window: 'grid-cols-[repeat(auto-fill,6rem)] justify-start',
} as const satisfies Record<'base' | IconGridVariant, string>;

export interface IconGridHandle {
  clearSelection: () => void;
}

interface IndexedShortcut {
  index?: number;
}

export interface IconGridProps {
  variant: IconGridVariant;
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
  ref?: Ref<IconGridHandle | null>;
}

/**
 * Shared selection, roving tabindex, and the "Press Enter to open." hint.
 * Shortcuts are children. The grid does not open anything itself.
 */
export function IconGrid({ variant, ariaLabel, className, children, ref }: IconGridProps) {
  const hintId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const count = Children.toArray(children).filter(isValidElement).length;

  const selectAt = useCallback((index: number) => {
    const option = optionAt(index);
    const id = option?.getAttribute('data-id');
    if (id) setSelectedId(id);
  }, []);

  const activateAt = useCallback((index: number) => {
    optionAt(index)?.click();
  }, []);

  const { containerRef, activeIndex, setActiveIndex, onKeyDown } = useRovingGrid({
    count,
    onMove: selectAt,
    onSelect: selectAt,
    onActivate: activateAt,
  });

  useImperativeHandle(
    ref,
    () => ({
      clearSelection() {
        setSelectedId(null);
      },
    }),
    [],
  );

  const value: IconGridContextValue = {
    variant,
    hintId,
    selectedId,
    activeIndex,
    select: setSelectedId,
    focusIndex: setActiveIndex,
  };

  return (
    <IconGridContext.Provider value={value}>
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
        {withIndex(children)}
      </div>
    </IconGridContext.Provider>
  );
}

function optionAt(index: number): HTMLElement | undefined {
  const list = document.activeElement?.closest('[role="listbox"]');
  const options = list?.querySelectorAll<HTMLElement>('[role="option"]');
  return options?.[index];
}

function withIndex(children: ReactNode): ReactNode {
  return Children.map(children, (child, index) => {
    if (!isValidElement<IndexedShortcut>(child)) return child;
    return cloneElement(child as ReactElement<IndexedShortcut>, { index });
  });
}

export function DesktopGrid(props: Omit<IconGridProps, 'variant'>) {
  return <IconGrid variant="desktop" {...props} />;
}

export function FolderIconGrid(props: Omit<IconGridProps, 'variant'>) {
  return <IconGrid variant="window" {...props} />;
}
