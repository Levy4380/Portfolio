import type { ContentItem, ContentKey } from '../content/types.ts';
import type { Bounds, LayoutMode, WindowId, WindowInstance } from './state/types.ts';

export type IconGridVariant = 'desktop' | 'window';

export interface IconGridProps {
  items: readonly ContentItem[];
  variant: IconGridVariant;
  /**
   * Accessible name of the listbox.
   * Desktop icons use "Desktop". A folder uses "{title} contents".
   */
  ariaLabel: string;
  /**
   * Open a non-link item. The grid does not dispatch window actions itself.
   * Pointer type decides click versus double-click; this callback is the activate.
   */
  onOpen: (contentKey: ContentKey) => void;
  /** Layout placement from the parent only. */
  className?: string;
}

/** Props `Window` is memoized on. */
export interface WindowFrameProps {
  instance: WindowInstance;
  isActive: boolean;
  zIndex: number;
  layoutMode: LayoutMode;
}

export interface OpenContentOptions {
  originId?: WindowId;
}

/**
 * The only UI entry to the window manager.
 * `blurAll` dispatches `BLUR` and does not navigate.
 * `SHOW_DESKTOP` is a reducer action used when the route is `/`, not a method here.
 */
export interface WindowActions {
  openContent(contentKey: ContentKey, options?: OpenContentOptions): void;
  focusWindow(id: WindowId): void;
  minimizeWindow(id: WindowId): void;
  closeWindow(id: WindowId): void;
  toggleMaximize(id: WindowId): void;
  move(id: WindowId, x: number, y: number): void;
  resize(id: WindowId, bounds: Bounds): void;
  blurAll(): void;
}
