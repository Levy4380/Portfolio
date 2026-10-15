import type { ContentKey, ContentKind } from '../../content/types.ts';

/** Links never open windows. */
export type WindowKind = Exclude<ContentKind, 'link'>;

export type WindowId = `win:${ContentKey}`;

export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

export interface Bounds {
  /** Px, relative to the desktop area's top-left (taskbar excluded). */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  /** Desktop area width. */
  width: number;
  /** Desktop area height: innerHeight minus the taskbar height. */
  height: number;
}

export interface WindowInstance {
  id: WindowId;
  contentKey: ContentKey;
  kind: WindowKind;
  minimized: boolean;
  maximized: boolean;
  /** Last un-maximized desktop bounds. */
  bounds: Bounds;
  /** Monotonically increasing sequence. Taskbar order. */
  openedAt: number;
  /** Only for `system:not-found`. */
  meta?: { requestedPath?: string };
}

export interface WindowState {
  windows: Readonly<Record<WindowId, WindowInstance>>;
  /** Stacking order, back to front. Includes minimized windows. */
  order: readonly WindowId[];
  activeId: WindowId | null;
  /** Next `openedAt` value. */
  seq: number;
  /** Cascade anchor. */
  lastPlaced: { x: number; y: number } | null;
}

export type WindowAction =
  | {
      type: 'OPEN';
      contentKey: ContentKey;
      viewport: Viewport;
      originId?: WindowId;
      meta?: WindowInstance['meta'];
    }
  | { type: 'FOCUS'; id: WindowId }
  | { type: 'MINIMIZE'; id: WindowId }
  | { type: 'CLOSE'; id: WindowId }
  | { type: 'TOGGLE_MAXIMIZE'; id: WindowId }
  | { type: 'MOVE'; id: WindowId; x: number; y: number; viewport: Viewport }
  | { type: 'RESIZE'; id: WindowId; bounds: Bounds; viewport: Viewport }
  | { type: 'BLUR' }
  | { type: 'SHOW_DESKTOP' }
  | { type: 'VIEWPORT_CHANGED'; viewport: Viewport };
