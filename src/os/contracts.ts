import type { Openable } from '../content/catalog.ts';
import type { Bounds, LayoutMode, WindowId, WindowInstance } from './state/StateHelpers/types.ts';

export type IconGridVariant = 'desktop' | 'window';

export interface OpenContentOptions {
  originId?: WindowId;
}

/**
 * The only UI entry to the window manager.
 * `blurAll` dispatches `BLUR` and does not navigate.
 * `SHOW_DESKTOP` is a reducer action used when the route is `/`, not a method here.
 */
export interface WindowActions {
  openContent(target: Openable, options?: OpenContentOptions): void;
  focusWindow(id: WindowId): void;
  minimizeWindow(id: WindowId): void;
  closeWindow(id: WindowId): void;
  toggleMaximize(id: WindowId): void;
  move(id: WindowId, x: number, y: number): void;
  resize(id: WindowId, bounds: Bounds): void;
  blurAll(): void;
}

/** Props `Window` is memoized on. */
export interface WindowFrameProps {
  instance: WindowInstance;
  isActive: boolean;
  zIndex: number;
  layoutMode: LayoutMode;
}
