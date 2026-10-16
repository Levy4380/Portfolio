import { useLayoutEffect, useRef, useState } from 'react';

import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';

const WALLPAPER_SRC = '/Wallpaper.webp';

const GRAIN_SVG =
  "after:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")]";

export function DesktopBackground({ onClearSelection }: { onClearSelection?: () => void }) {
  const { blurAll } = useWindowActions();
  const imageRef = useRef<HTMLImageElement>(null);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setShown(true);
  }, []);

  return (
    <div
      onPointerDown={() => {
        onClearSelection?.();
        blurAll();
      }}
      className="absolute inset-0 bg-desktop select-none"
    >
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'} after:absolute after:inset-0 after:opacity-6 after:mix-blend-overlay ${GRAIN_SVG}`}
      >
        <img
          ref={imageRef}
          src={WALLPAPER_SRC}
          alt=""
          fetchPriority="high"
          decoding="async"
          onLoad={() => setShown(true)}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-3 hidden font-mono text-meta text-fg-inverse-muted md:block"
      >
        tomaslevy@portfolio ~ v1
      </span>
    </div>
  );
}
