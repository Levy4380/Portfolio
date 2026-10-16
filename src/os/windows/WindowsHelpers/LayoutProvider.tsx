import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { LayoutMode, Viewport } from '../../state/StateHelpers/types.ts';
import { viewportFromWindow } from './geometry.ts';
import { LayoutContext, type LayoutContextValue } from './useLayoutMode.ts';

/** Tailwind `lg`. Full desktop (§8.1). */
const DESKTOP_QUERY = '(min-width: 1024px)';
/** Tailwind `md` up to, but not including, `lg`. */
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023.98px)';

function readInitialMode(): LayoutMode {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet';
  return 'mobile';
}

function sameViewport(current: Viewport, next: Viewport): boolean {
  return current.width === next.width && current.height === next.height;
}

/**
 * Layout mode and the desktop-area viewport. Mounted outside `WindowProvider`
 * so dispatch reads the same snapshot. One `matchMedia` subscription; resize
 * is written by the window manager through `setViewport`.
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutMode] = useState(readInitialMode);
  const [viewport, setViewportState] = useState(() =>
    viewportFromWindow(layoutMode),
  );

  const snapshotRef = useRef({ layoutMode, viewport });
  // Child effects run before this provider's effects, so the snapshot is
  // published during render. Stable readers close over this ref.
  // eslint-disable-next-line react-hooks/refs -- readers must see this render, not an effect
  snapshotRef.current = { layoutMode, viewport };

  const readLayoutMode = useCallback(() => snapshotRef.current.layoutMode, []);
  const readViewport = useCallback(() => snapshotRef.current.viewport, []);
  const setViewport = useCallback((next: Viewport) => {
    setViewportState((current) =>
      sameViewport(current, next) ? current : next,
    );
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const tablet = window.matchMedia(TABLET_QUERY);

    const update = () => {
      const nextMode: LayoutMode = desktop.matches
        ? 'desktop'
        : tablet.matches
          ? 'tablet'
          : 'mobile';
      setLayoutMode((current) => (current === nextMode ? current : nextMode));
      setViewport(viewportFromWindow(nextMode));
    };

    desktop.addEventListener('change', update);
    tablet.addEventListener('change', update);
    update();

    return () => {
      desktop.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, [setViewport]);

  const value = useMemo<LayoutContextValue>(
    () => ({
      layoutMode,
      viewport,
      readLayoutMode,
      readViewport,
      setViewport,
    }),
    [layoutMode, viewport, readLayoutMode, readViewport, setViewport],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}
