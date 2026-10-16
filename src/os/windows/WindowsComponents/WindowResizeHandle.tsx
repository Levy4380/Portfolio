import type { PointerEvent as ReactPointerEvent } from 'react';

import { cn } from '../../../lib/cn.ts';
import type { ResizeEdge } from '../WindowsHelpers/geometry.ts';

interface WindowResizeHandleProps {
  edge: ResizeEdge;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

const hit = 'absolute z-10 touch-none';

/** 8px, except the bottom-right grip, which stays the 16px mark. */
const edgeClass: Record<ResizeEdge, string> = {
  n: 'top-0 right-2 left-2 h-2 cursor-ns-resize',
  e: 'top-2 right-0 bottom-4 w-2 cursor-ew-resize',
  s: 'right-4 bottom-0 left-2 h-2 cursor-ns-resize',
  w: 'top-2 bottom-2 left-0 w-2 cursor-ew-resize',
  ne: 'top-0 right-0 size-2 cursor-nesw-resize',
  nw: 'top-0 left-0 size-2 cursor-nwse-resize',
  se: 'right-0 bottom-0 size-4 cursor-nwse-resize text-indicator-muted',
  sw: 'bottom-0 left-0 size-2 cursor-nesw-resize',
};

/**
 * One resize hit. Desktop and resizable presets only; the parent omits
 * these below the `lg` breakpoint. The bottom-right grip is the only
 * visible mark. Maximize is the keyboard alternative.
 */
export function WindowResizeHandle({ edge, onPointerDown }: WindowResizeHandleProps) {
  return (
    <div
      aria-hidden
      data-resize-edge={edge}
      className={cn(hit, edgeClass[edge])}
      onPointerDown={onPointerDown}
    >
      {edge === 'se' ? (
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path
            d="M6 15 L15 6 M9 15 L15 9 M12 15 L15 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      ) : null}
    </div>
  );
}
