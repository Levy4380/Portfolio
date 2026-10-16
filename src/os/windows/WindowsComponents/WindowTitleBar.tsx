import type { MouseEvent, PointerEvent, ReactNode } from 'react';

import { cn } from '../../../lib/cn.ts';
import type { LayoutMode } from '../../state/StateHelpers/types.ts';
import { WindowControls } from './WindowControls.tsx';

export interface WindowTitleBarProps {
  titleId: string;
  /** String kept for the title tooltip and the control names. The heading paints `children`. */
  title: string;
  children: ReactNode;
  isActive: boolean;
  layoutMode: LayoutMode;
  showMaximize: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onDoubleClick: (event: MouseEvent<HTMLElement>) => void;
}

/** Traffic lights, the window title beside them, and the drag region. */
export function WindowTitleBar({
  titleId,
  title,
  children,
  isActive,
  layoutMode,
  showMaximize,
  maximized,
  onMinimize,
  onToggleMaximize,
  onClose,
  onPointerDown,
  onDoubleClick,
}: WindowTitleBarProps) {
  return (
    <div
      className={cn(
        'flex h-12 shrink-0 cursor-default items-center gap-2 px-2.5 select-none md:h-10',
        'transition-colors duration-fast ease-os-out motion-reduce:transition-none',
        isActive ? 'bg-titlebar' : 'bg-titlebar-inactive',
        layoutMode === 'desktop' && 'touch-none',
      )}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      <WindowControls
        title={title}
        showMaximize={showMaximize}
        maximized={maximized}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
        onClose={onClose}
      />
      <h2
        id={titleId}
        title={title}
        className={cn(
          'min-w-0 flex-1 truncate text-ui font-semibold',
          isActive ? 'text-fg' : 'text-fg-subtle',
        )}
      >
        {children}
      </h2>
    </div>
  );
}
