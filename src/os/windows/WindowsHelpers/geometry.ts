import type { Bounds, LayoutMode, Viewport, WindowInstance } from '../../state/StateHelpers/types.ts';
import type { WindowPreset } from './presets.ts';

/** 56 below the `md` breakpoint. */
export const TASKBAR_H = 48;
/** Menu bar. The safe-area inset stays in the menu bar CSS. */
export const MENUBAR_H = 40;
export const TITLEBAR_H = 40;
export const GUTTER = 16;
export const CASCADE_STEP = 28;
/** Px of a window that must stay on screen horizontally. */
export const MIN_VISIBLE_X = 96;
/** Px before a pointerdown becomes a drag. */
export const DRAG_THRESHOLD = 3;

/**
 * Desktop area between the menu bar and the taskbar.
 * Mobile's taskbar is `h-14` (56). Safe-area insets stay in the bar CSS.
 */
export function viewportFromWindow(layoutMode: LayoutMode): Viewport {
  const taskbar = layoutMode === 'mobile' ? 56 : TASKBAR_H;
  return {
    width: window.innerWidth,
    height: Math.max(0, window.innerHeight - taskbar - MENUBAR_H),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/** Whole pixels. A half-pixel origin paints the 1px frame as a double edge. */
function snap(value: number): number {
  return Math.round(value);
}

/**
 * Min wins over the area cap, so a window never shrinks below its preset
 * minimum while the layout is still desktop.
 */
function fitSize(
  width: number,
  height: number,
  preset: WindowPreset,
  viewport: Viewport,
): { width: number; height: number } {
  const capWidth = viewport.width - 2 * GUTTER;
  const capHeight = viewport.height - 2 * GUTTER;
  const maxWidth = Math.max(preset.minWidth, Math.min(preset.maxWidth, capWidth));
  const maxHeight = Math.max(preset.minHeight, Math.min(preset.maxHeight, capHeight));
  return {
    width: clamp(width, preset.minWidth, maxWidth),
    height: clamp(height, preset.minHeight, maxHeight),
  };
}

function extendsPastGutter(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: Viewport,
): boolean {
  return x + width > viewport.width - GUTTER || y + height > viewport.height - GUTTER;
}

/**
 * Initial desktop placement.
 * A null anchor centers the first window. Any anchor cascades by `CASCADE_STEP`
 * from that point (the origin window, or `lastPlaced`). Re-opening an existing
 * window does not call this.
 */
export function placeWindow(
  preset: WindowPreset,
  viewport: Viewport,
  anchor: { x: number; y: number } | null,
): Bounds {
  const fitted = fitSize(preset.defaultWidth, preset.defaultHeight, preset, viewport);
  const width = snap(fitted.width);
  const height = snap(fitted.height);

  let x: number;
  let y: number;

  if (anchor === null) {
    x = (viewport.width - width) / 2;
    y = (viewport.height - height) * 0.45;
  } else {
    x = anchor.x + CASCADE_STEP;
    y = anchor.y + CASCADE_STEP;
    if (extendsPastGutter(x, y, width, height, viewport)) {
      x = GUTTER + 2 * CASCADE_STEP;
      y = GUTTER + CASCADE_STEP;
    }
  }

  const position = clampPosition({ x, y, width, height }, viewport);
  return { x: position.x, y: position.y, width, height };
}

/** Keep the title bar on screen: at least `MIN_VISIBLE_X` px horizontally, and never under the taskbar. */
export function clampPosition(bounds: Bounds, viewport: Viewport): { x: number; y: number } {
  return {
    x: snap(clamp(bounds.x, MIN_VISIBLE_X - bounds.width, viewport.width - MIN_VISIBLE_X)),
    y: snap(clamp(bounds.y, 0, viewport.height - TITLEBAR_H)),
  };
}

/** Clamp a resize or a viewport change to the preset and the desktop area, then re-clamp position. */
export function clampBounds(bounds: Bounds, preset: WindowPreset, viewport: Viewport): Bounds {
  const fitted = fitSize(bounds.width, bounds.height, preset, viewport);
  const size = { width: snap(fitted.width), height: snap(fitted.height) };
  const position = clampPosition({ ...bounds, ...size }, viewport);
  return { x: position.x, y: position.y, width: size.width, height: size.height };
}

/** Edges and corners a resize hit can name. */
export const RESIZE_EDGES = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const;
export type ResizeEdge = (typeof RESIZE_EDGES)[number];

const RESIZE_EDGE_SET = new Set<string>(RESIZE_EDGES);

export function isResizeEdge(value: string | undefined): value is ResizeEdge {
  return value !== undefined && RESIZE_EDGE_SET.has(value);
}

/** CSS cursor keyword for a window edge. */
export function cursorForResizeEdge(edge: ResizeEdge): string {
  switch (edge) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    default: {
      const unreachable: never = edge;
      return unreachable;
    }
  }
}

/**
 * Resize from the edge under the pointer. The opposite side or corner stays
 * at `origin`. Size uses `fitSize`, then the free axis stops at the
 * `clampPosition` band, so `clampBounds` leaves this rect unchanged.
 */
export function anchoredResize(
  origin: Bounds,
  dx: number,
  dy: number,
  edge: ResizeEdge,
  preset: WindowPreset,
  viewport: Viewport,
): Bounds {
  const right = origin.x + origin.width;
  const bottom = origin.y + origin.height;
  const xEdge = draggedX(edge);
  const yEdge = draggedY(edge);
  const low = fitSize(0, 0, preset, viewport);
  const high = fitSize(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, preset, viewport);

  let width = origin.width;
  let height = origin.height;

  if (xEdge !== null) {
    const requested = xEdge === 'e' ? origin.width + dx : origin.width - dx;
    const bandFloor =
      xEdge === 'e'
        ? MIN_VISIBLE_X - origin.x
        : right - (viewport.width - MIN_VISIBLE_X);
    width = sizeWithin(
      requested,
      Math.max(snap(low.width), Math.ceil(bandFloor)),
      snap(high.width),
      origin.width,
    );
  }

  if (yEdge !== null) {
    const requested = yEdge === 's' ? origin.height + dy : origin.height - dy;
    let lo = snap(low.height);
    let hi = snap(high.height);
    if (yEdge === 'n') {
      lo = Math.max(lo, Math.ceil(bottom - (viewport.height - TITLEBAR_H)));
      hi = Math.min(hi, Math.floor(bottom));
    }
    height = sizeWithin(requested, lo, hi, origin.height);
  }

  return {
    x: xEdge === 'w' ? right - width : origin.x,
    y: yEdge === 'n' ? bottom - height : origin.y,
    width,
    height,
  };
}

function draggedX(edge: ResizeEdge): 'e' | 'w' | null {
  if (edge === 'e' || edge === 'ne' || edge === 'se') return 'e';
  if (edge === 'w' || edge === 'nw' || edge === 'sw') return 'w';
  return null;
}

function draggedY(edge: ResizeEdge): 'n' | 's' | null {
  if (edge === 'n' || edge === 'ne' || edge === 'nw') return 'n';
  if (edge === 's' || edge === 'se' || edge === 'sw') return 's';
  return null;
}

/** Integer size inside `[lo, hi]`. A reversed range keeps the origin size. */
function sizeWithin(requested: number, lo: number, hi: number, fallback: number): number {
  if (lo > hi) return fallback;
  return clamp(snap(requested), lo, hi);
}

/**
 * Bounds to paint. Stored bounds stay untouched: tablet and mobile keep a
 * gutter so the wallpaper and the rounded frame stay visible, and a
 * maximized desktop window fills the area.
 */
export function displayBounds(instance: WindowInstance, mode: LayoutMode, viewport: Viewport): Bounds {
  switch (mode) {
    case 'mobile':
    case 'tablet':
      return {
        x: GUTTER,
        y: GUTTER,
        width: snap(Math.max(0, viewport.width - 2 * GUTTER)),
        height: snap(Math.max(0, viewport.height - 2 * GUTTER)),
      };
    case 'desktop':
      if (instance.maximized) {
        return { x: 0, y: 0, width: snap(viewport.width), height: snap(viewport.height) };
      }
      return {
        x: snap(instance.bounds.x),
        y: snap(instance.bounds.y),
        width: snap(instance.bounds.width),
        height: snap(instance.bounds.height),
      };
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}
