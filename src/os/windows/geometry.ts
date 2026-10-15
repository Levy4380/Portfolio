import type { Bounds, LayoutMode, Viewport, WindowInstance } from '../state/types.ts';
import type { WindowPreset } from './presets.ts';

/** 56 below the `md` breakpoint. */
export const TASKBAR_H = 48;
export const TITLEBAR_H = 40;
export const GUTTER = 16;
export const CASCADE_STEP = 28;
/** Px of a window that must stay on screen horizontally. */
export const MIN_VISIBLE_X = 96;
/** Px before a pointerdown becomes a drag. */
export const DRAG_THRESHOLD = 3;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
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
  const { width, height } = fitSize(preset.defaultWidth, preset.defaultHeight, preset, viewport);

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
    x: clamp(bounds.x, MIN_VISIBLE_X - bounds.width, viewport.width - MIN_VISIBLE_X),
    y: clamp(bounds.y, 0, viewport.height - TITLEBAR_H),
  };
}

/** Clamp a resize or a viewport change to the preset and the desktop area, then re-clamp position. */
export function clampBounds(bounds: Bounds, preset: WindowPreset, viewport: Viewport): Bounds {
  const size = fitSize(bounds.width, bounds.height, preset, viewport);
  const position = clampPosition({ ...bounds, ...size }, viewport);
  return { x: position.x, y: position.y, width: size.width, height: size.height };
}

/**
 * Bounds to paint. Stored bounds stay untouched: tablet and mobile substitute
 * a sheet, and a maximized desktop window fills the area.
 */
export function displayBounds(instance: WindowInstance, mode: LayoutMode, viewport: Viewport): Bounds {
  switch (mode) {
    case 'mobile':
      return { x: 0, y: 0, width: viewport.width, height: viewport.height };
    case 'tablet':
      return {
        x: GUTTER,
        y: GUTTER,
        width: Math.max(0, viewport.width - 2 * GUTTER),
        height: Math.max(0, viewport.height - 2 * GUTTER),
      };
    case 'desktop':
      if (instance.maximized) {
        return { x: 0, y: 0, width: viewport.width, height: viewport.height };
      }
      return instance.bounds;
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}
