import { useEffect, useState } from 'react';

import type { LayoutMode } from '../../state/StateHelpers/types.ts';

/** Tailwind `lg`. Full desktop (§8.1). */
const DESKTOP_QUERY = '(min-width: 1024px)';
/** Tailwind `md` up to, but not including, `lg`. */
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023.98px)';

/** Current mode from `matchMedia`. Safe to call from a resize callback. */
export function readLayoutMode(): LayoutMode {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet';
  return 'mobile';
}

/** Desktop, tablet, or mobile. Breakpoints are Tailwind's defaults (§8.1). */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState(readLayoutMode);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const tablet = window.matchMedia(TABLET_QUERY);

    const update = () => {
      const next = readLayoutMode();
      setMode((current) => (current === next ? current : next));
    };

    desktop.addEventListener('change', update);
    tablet.addEventListener('change', update);
    update();

    return () => {
      desktop.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, []);

  return mode;
}
