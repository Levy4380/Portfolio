import { Children, isValidElement, useCallback, useId, useImperativeHandle, useState } from 'react';

import { useRovingGrid } from '../a11y/A11yHelpers/useRovingGrid.ts';
import { IconGrid, type IconGridProps } from './IconGrid.tsx';
import type { IconGridContextValue } from './iconGridContext.tsx';

/**
 * Selection, roving tabindex, and clearSelection.
 * Shortcuts are children. The grid does not open anything itself.
 */
export function IconGridBehavior({ variant, ariaLabel, className, children, ref }: IconGridProps) {
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
    <IconGrid
      variant={variant}
      ariaLabel={ariaLabel}
      className={className}
      value={value}
      containerRef={containerRef}
      onKeyDown={onKeyDown}
    >
      {children}
    </IconGrid>
  );
}

function optionAt(index: number): HTMLElement | undefined {
  const list = document.activeElement?.closest('[role="listbox"]');
  const options = list?.querySelectorAll<HTMLElement>('[role="option"]');
  return options?.[index];
}
