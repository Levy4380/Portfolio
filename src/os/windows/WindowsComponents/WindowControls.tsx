import { Copy, Minus, Square, X } from 'lucide-react';

import { cn } from '../../../lib/cn.ts';

/** Fine pointers sit the discs close together. Coarse pointers keep a 44px hit. */
const hit =
  'inline-flex size-5 shrink-0 items-center justify-center rounded-full focus-ring focus-visible:-outline-offset-2 pointer-coarse:size-11 max-md:size-11';

const disc =
  'flex size-3 items-center justify-center rounded-full transition-colors duration-fast ease-os-out motion-reduce:transition-none';

const glyph =
  'text-traffic-glyph opacity-0 transition-opacity duration-fast ease-os-out group-hover/traffic:opacity-100 group-focus-within/traffic:opacity-100 motion-reduce:transition-none';

export interface WindowControlsProps {
  title: string;
  /** Dialog presets and layouts below `lg` omit maximize. */
  showMaximize: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

/** Close, minimize, zoom. Glyphs appear when the cluster is hovered or focused. */
export function WindowControls({
  title,
  showMaximize,
  maximized,
  onMinimize,
  onToggleMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div className="group/traffic flex shrink-0 items-center gap-1">
      <button
        type="button"
        className={hit}
        aria-label={`Close ${title}`}
        onClick={onClose}
      >
        <span
          className={cn(
            disc,
            'bg-traffic-close',
            'window-inactive:bg-traffic-idle window-inactive:group-hover/traffic:bg-traffic-close',
          )}
        >
          <X className={glyph} size={8} strokeWidth={2.5} aria-hidden />
        </span>
      </button>
      <button
        type="button"
        className={hit}
        aria-label={`Minimize ${title}`}
        onClick={onMinimize}
      >
        <span
          className={cn(
            disc,
            'bg-traffic-minimize',
            'window-inactive:bg-traffic-idle window-inactive:group-hover/traffic:bg-traffic-minimize',
          )}
        >
          <Minus className={glyph} size={8} strokeWidth={2.5} aria-hidden />
        </span>
      </button>
      {showMaximize ? (
        <button
          type="button"
          className={hit}
          aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
          onClick={onToggleMaximize}
        >
          <span
            className={cn(
              disc,
              'bg-traffic-zoom',
              'window-inactive:bg-traffic-idle window-inactive:group-hover/traffic:bg-traffic-zoom',
            )}
          >
            {maximized ? (
              <Copy className={glyph} size={8} strokeWidth={2.5} aria-hidden />
            ) : (
              <Square
                className={glyph}
                size={8}
                strokeWidth={2.5}
                aria-hidden
              />
            )}
          </span>
        </button>
      ) : null}
    </div>
  );
}
