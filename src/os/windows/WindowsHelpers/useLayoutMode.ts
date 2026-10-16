import { createContext, useContext } from 'react';

import type { LayoutMode, Viewport } from '../../state/StateHelpers/types.ts';

export interface LayoutContextValue {
  layoutMode: LayoutMode;
  viewport: Viewport;
  /** Latest mode. Stable identity; reads a ref written during render. */
  readLayoutMode: () => LayoutMode;
  /** Latest viewport. Stable identity; reads a ref written during render. */
  readViewport: () => Viewport;
  /** Replace the viewport. Stable identity. Resize is the caller. */
  setViewport: (viewport: Viewport) => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);
LayoutContext.displayName = 'LayoutContext';

export function useLayout(): LayoutContextValue {
  const value = useContext(LayoutContext);
  if (value === null) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return value;
}

/** Desktop, tablet, or mobile. Breakpoints are Tailwind's defaults (§8.1). */
export function useLayoutMode(): LayoutMode {
  return useLayout().layoutMode;
}
