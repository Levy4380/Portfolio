import { memo, useCallback, type MouseEvent } from 'react';

import { getContent } from '../../content/registry.ts';
import { iconMap } from '../../icons/iconMap.ts';
import { cn } from '../../lib/cn.ts';
import type { WindowId, WindowInstance } from '../state/types.ts';
import { registerTaskbarAnchor } from './taskbarAnchors.ts';

export interface TaskbarWindowItemProps {
  instance: WindowInstance;
  /** Focused and visible. Decided by the parent from `activeId`. */
  isActive: boolean;
  onFocus: (id: WindowId) => void;
  onMinimize: (id: WindowId) => void;
  onClose: (id: WindowId) => void;
}

/**
 * One taskbar button per window. Click minimizes the active window and
 * focuses (restores) any other. Middle click closes. The button registers
 * itself as the minimize/restore animation target.
 */
function TaskbarWindowItemComponent({
  instance,
  isActive,
  onFocus,
  onMinimize,
  onClose,
}: TaskbarWindowItemProps) {
  const { id, minimized } = instance;
  const content = getContent(instance.contentKey);
  const title = content?.title ?? instance.contentKey;
  const Icon = iconMap[content?.icon ?? 'file-missing'];

  const setAnchor = useCallback(
    (element: HTMLButtonElement | null) => {
      registerTaskbarAnchor(id, element);
    },
    [id],
  );

  const handleClick = () => {
    if (isActive) onMinimize(id);
    else onFocus(id);
  };

  // Stops the browser's middle-button autoscroll from taking over the gesture.
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button === 1) event.preventDefault();
  };

  const handleAuxClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) return;
    event.preventDefault();
    onClose(id);
  };

  return (
    <button
      ref={setAnchor}
      type="button"
      aria-pressed={isActive}
      data-minimized={minimized ? '' : undefined}
      title={minimized ? `${title} (minimized)` : title}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onAuxClick={handleAuxClick}
      className={cn(
        'relative flex h-10 w-full min-w-0 items-center gap-2 rounded-control px-2 text-label text-fg-inverse select-none touch-manipulation',
        'transition-colors duration-120 focus-ring focus-visible:-outline-offset-2',
        'hover:bg-glass-hover active:scale-97 active:bg-glass-active aria-pressed:bg-glass-active',
        'data-minimized:italic data-minimized:text-fg-inverse-muted motion-reduce:active:scale-100 pointer-coarse:h-11',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className={cn('min-w-0 truncate', isActive && 'font-semibold')}>{title}</span>
      {minimized ? <span className="sr-only">, minimized</span> : null}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-[width,background-color] duration-120 motion-reduce:transition-none',
          minimized
            ? 'w-1 bg-indicator-muted'
            : isActive
              ? 'w-6 bg-accent-on-dark'
              : 'w-3 bg-indicator',
        )}
      />
    </button>
  );
}

export const TaskbarWindowItem = memo(TaskbarWindowItemComponent);
