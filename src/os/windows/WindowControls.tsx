import { Copy, Minus, Square, X } from 'lucide-react';

import { cn } from '../../lib/cn.ts';

const control =
  'inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-control text-fg window-inactive:text-fg-subtle hover:bg-chrome-hover active:bg-chrome-press focus-ring focus-visible:-outline-offset-2 pointer-coarse:size-11 max-md:size-11 transition-colors duration-fast ease-os-out motion-reduce:transition-none';

export interface WindowControlsProps {
  title: string;
  /** Dialog presets and layouts below `lg` omit maximize. */
  showMaximize: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

/** Minimize, maximize/restore, close. The handlers decide what each one means. */
export function WindowControls({
  title,
  showMaximize,
  maximized,
  onMinimize,
  onToggleMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        className={control}
        aria-label={`Minimize ${title}`}
        onClick={onMinimize}
      >
        <Minus size={14} strokeWidth={1.75} aria-hidden />
      </button>
      {showMaximize ? (
        <button
          type="button"
          className={control}
          aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
          onClick={onToggleMaximize}
        >
          {maximized ? (
            <Copy size={14} strokeWidth={1.75} aria-hidden />
          ) : (
            <Square size={14} strokeWidth={1.75} aria-hidden />
          )}
        </button>
      ) : null}
      <button
        type="button"
        className={cn(control, 'hover:bg-danger hover:text-fg-inverse')}
        aria-label={`Close ${title}`}
        onClick={onClose}
      >
        <X size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
