import type { PointerEvent as ReactPointerEvent } from 'react';

interface WindowResizeHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * Bottom-right grip. Desktop and resizable presets only; the parent omits it
 * below the `lg` breakpoint. Maximize is the keyboard alternative.
 */
export function WindowResizeHandle({ onPointerDown }: WindowResizeHandleProps) {
  return (
    <div
      aria-hidden
      className="absolute right-0 bottom-0 z-10 size-4 cursor-nwse-resize touch-none text-indicator-muted"
      onPointerDown={onPointerDown}
    >
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
        <path
          d="M6 15 L15 6 M9 15 L15 9 M12 15 L15 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
