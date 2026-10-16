import { Copy, Minus, Square, X } from 'lucide-react';

import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { cn } from '../../../lib/cn.ts';

/**
 * The box stays 20px so Close and Minimize stay clustered when Zoom is absent.
 * Below `md`, and on coarse pointers, a 44px slop covers the tap without
 * spreading the discs. `gap-2` on those layouts keeps each disc inside its own hit.
 */
const hit =
  'relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full focus-ring focus-visible:-outline-offset-2 max-md:before:absolute max-md:before:top-1/2 max-md:before:left-1/2 max-md:before:size-11 max-md:before:-translate-x-1/2 max-md:before:-translate-y-1/2 max-md:before:content-[""] pointer-coarse:before:absolute pointer-coarse:before:top-1/2 pointer-coarse:before:left-1/2 pointer-coarse:before:size-11 pointer-coarse:before:-translate-x-1/2 pointer-coarse:before:-translate-y-1/2 pointer-coarse:before:content-[""]';

const cluster =
  'group/traffic flex w-max shrink-0 items-center gap-1 max-md:gap-2 pointer-coarse:gap-2';

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
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <div className={cluster}>
      <button
        type="button"
        className={hit}
        aria-label={`${translation('os.close')} ${title}`}
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
        data-control="minimize"
        aria-label={`${translation('os.minimize')} ${title}`}
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
          aria-label={`${translation(maximized ? 'os.restore' : 'os.maximize')} ${title}`}
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
