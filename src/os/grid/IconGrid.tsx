import {
  Children,
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

import {
  useLanguage,
  useTranslation,
} from '../../content/i18n/useTranslation.ts';
import { cn } from '../../lib/cn.ts';
import type { IconGridVariant } from '../contracts.ts';
import { IconGridBehavior } from './IconGridBehavior.tsx';
import {
  IconGridContext,
  type IconGridContextValue,
} from './iconGridContext.tsx';

const grid = {
  base: 'grid content-start gap-2',
  desktop:
    'grid-cols-3 justify-items-center sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,96px)] md:justify-start md:justify-items-start lg:h-full lg:grid-flow-col lg:grid-cols-none lg:grid-rows-[repeat(auto-fill,var(--os-icon-tile-h))]',
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

interface IconGridShellProps {
  variant: IconGridVariant;
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
  value: IconGridContextValue;
  containerRef: RefObject<HTMLDivElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * Listbox, the "Press Enter to open." hint, and the shortcut context.
 * Selection and roving tabindex live in IconGridBehavior.
 */
export function IconGrid({
  variant,
  ariaLabel,
  className,
  children,
  value,
  containerRef,
  onKeyDown,
}: IconGridShellProps) {
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <IconGridContext.Provider value={value}>
      <span id={value.hintId} className="sr-only">
        {translation('os.pressEnter')}
      </span>
      <div
        ref={containerRef}
        role="listbox"
        data-variant={variant}
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

function withIndex(children: ReactNode): ReactNode {
  return Children.map(children, (child, index) => {
    if (!isValidElement<IndexedShortcut>(child)) return child;
    return cloneElement(child as ReactElement<IndexedShortcut>, { index });
  });
}

export function DesktopGrid(props: Omit<IconGridProps, 'variant'>) {
  return <IconGridBehavior variant="desktop" {...props} />;
}

export function FolderIconGrid(props: Omit<IconGridProps, 'variant'>) {
  return <IconGridBehavior variant="window" {...props} />;
}
