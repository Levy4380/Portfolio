import { clampBounds, clampPosition, placeWindow } from '../../windows/WindowsHelpers/geometry.ts';
import { presetFor } from '../../windows/WindowsHelpers/presets.ts';
import { selectNextActive, windowIdFor } from './selectors.ts';
import type {
  Bounds,
  ContentId,
  PresetName,
  Viewport,
  WindowAction,
  WindowId,
  WindowInstance,
  WindowState,
} from './types.ts';

type WindowMeta = WindowInstance['meta'];
type Windows = WindowState['windows'];

export const initialWindowState: WindowState = {
  windows: {},
  order: [],
  activeId: null,
  seq: 0,
  lastPlaced: null,
};

/**
 * Pure transitions of §4.4. Every branch that would not change state returns
 * the same reference, which is what makes route-driven dispatches idempotent.
 * Invariant: `activeId` is `null` or a non-minimized window that is the
 * topmost non-minimized entry of `order`.
 */
export function windowReducer(state: WindowState, action: WindowAction): WindowState {
  switch (action.type) {
    case 'OPEN':
      return open(
        state,
        action.contentId,
        action.preset,
        action.viewport,
        action.originId,
        action.meta,
      );
    case 'FOCUS':
      return focus(state, action.id);
    case 'MINIMIZE':
      return minimize(state, action.id);
    case 'CLOSE':
      return close(state, action.id);
    case 'TOGGLE_MAXIMIZE':
      return toggleMaximize(state, action.id);
    case 'MOVE':
      return move(state, action.id, action.x, action.y, action.viewport);
    case 'RESIZE':
      return resize(state, action.id, action.bounds, action.viewport);
    case 'BLUR':
      return state.activeId === null ? state : { ...state, activeId: null };
    case 'SHOW_DESKTOP':
      return showDesktop(state);
    case 'VIEWPORT_CHANGED':
      return viewportChanged(state, action.viewport);
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}

function open(
  state: WindowState,
  contentId: ContentId,
  preset: PresetName,
  viewport: Viewport,
  originId: WindowId | undefined,
  meta: WindowMeta,
): WindowState {
  const id = windowIdFor(contentId);
  if (getInstance(state, id)) {
    // Existing id: focus or restore, never move (§7.3). Not-found keeps one window
    // and only refreshes `meta.requestedPath` (§4.5).
    return focus(state, id, meta);
  }

  const origin = originId ? getInstance(state, originId) : undefined;
  const anchor = origin ? { x: origin.bounds.x, y: origin.bounds.y } : state.lastPlaced;
  const bounds = placeWindow(presetFor(preset), viewport, anchor);

  const instance: WindowInstance = {
    id,
    contentId,
    preset,
    minimized: false,
    maximized: false,
    bounds,
    openedAt: state.seq,
    ...(meta !== undefined ? { meta } : {}),
  };

  return {
    windows: { ...state.windows, [id]: instance },
    order: [...state.order, id],
    activeId: id,
    seq: state.seq + 1,
    lastPlaced: { x: bounds.x, y: bounds.y },
  };
}

/** OPEN-existing and FOCUS share this. Restoring implies focusing (§4.4). */
function focus(state: WindowState, id: WindowId, meta?: WindowMeta): WindowState {
  const instance = getInstance(state, id);
  if (!instance) return state;

  let next = instance;
  if (next.minimized) next = { ...next, minimized: false };
  const nextMeta = mergeMeta(instance.meta, meta);
  if (nextMeta !== instance.meta) next = { ...next, meta: nextMeta };

  const order = moveToTop(state.order, id);
  if (next === instance && order === state.order && state.activeId === id) return state;

  return {
    ...state,
    windows: next === instance ? state.windows : { ...state.windows, [id]: next },
    order,
    activeId: id,
  };
}

function minimize(state: WindowState, id: WindowId): WindowState {
  const instance = getInstance(state, id);
  if (!instance || instance.minimized) return state;

  return {
    ...state,
    windows: { ...state.windows, [id]: { ...instance, minimized: true } },
    activeId: state.activeId === id ? selectNextActive(state, id) : state.activeId,
  };
}

function close(state: WindowState, id: WindowId): WindowState {
  if (!getInstance(state, id)) return state;

  // `lastPlaced` is kept on purpose so the cascade continues (§4.4).
  return {
    ...state,
    windows: omit(state.windows, id),
    order: state.order.filter((other) => other !== id),
    activeId: state.activeId === id ? selectNextActive(state, id) : state.activeId,
  };
}

function toggleMaximize(state: WindowState, id: WindowId): WindowState {
  const instance = getInstance(state, id);
  if (!instance) return state;

  const preset = presetFor(instance.preset);
  if (!preset.resizable || !preset.maximizable) return state;

  // `bounds` is left untouched: it is the restore geometry.
  const next: WindowInstance = { ...instance, maximized: !instance.maximized, minimized: false };
  return {
    ...state,
    windows: { ...state.windows, [id]: next },
    order: moveToTop(state.order, id),
    activeId: id,
  };
}

function move(
  state: WindowState,
  id: WindowId,
  x: number,
  y: number,
  viewport: Viewport,
): WindowState {
  const instance = getInstance(state, id);
  if (!instance || instance.maximized) return state;

  const position = clampPosition({ ...instance.bounds, x, y }, viewport);
  if (position.x === instance.bounds.x && position.y === instance.bounds.y) return state;

  return replaceInstance(state, { ...instance, bounds: { ...instance.bounds, ...position } });
}

function resize(state: WindowState, id: WindowId, bounds: Bounds, viewport: Viewport): WindowState {
  const instance = getInstance(state, id);
  if (!instance || instance.maximized) return state;

  const preset = presetFor(instance.preset);
  if (!preset.resizable) return state;

  const next = clampBounds(bounds, preset, viewport);
  if (sameBounds(next, instance.bounds)) return state;

  return replaceInstance(state, { ...instance, bounds: next });
}

function showDesktop(state: WindowState): WindowState {
  let windows: Record<WindowId, WindowInstance> | null = null;
  for (const instance of Object.values(state.windows)) {
    if (instance.minimized) continue;
    windows ??= { ...state.windows };
    windows[instance.id] = { ...instance, minimized: true };
  }

  if (windows === null && state.activeId === null) return state;

  return { ...state, windows: windows ?? state.windows, activeId: null };
}

function viewportChanged(state: WindowState, viewport: Viewport): WindowState {
  let windows: Record<WindowId, WindowInstance> | null = null;
  for (const instance of Object.values(state.windows)) {
    const bounds = clampBounds(instance.bounds, presetFor(instance.preset), viewport);
    if (sameBounds(bounds, instance.bounds)) continue;
    windows ??= { ...state.windows };
    windows[instance.id] = { ...instance, bounds };
  }

  return windows === null ? state : { ...state, windows };
}

/* Helpers */

function getInstance(state: WindowState, id: WindowId): WindowInstance | undefined {
  return state.windows[id];
}

/** Incoming meta only replaces the stored one when `requestedPath` differs. */
function mergeMeta(current: WindowMeta, incoming: WindowMeta): WindowMeta {
  if (incoming === undefined) return current;
  if (current?.requestedPath === incoming.requestedPath) return current;
  return incoming;
}

function moveToTop(order: readonly WindowId[], id: WindowId): readonly WindowId[] {
  if (order[order.length - 1] === id) return order;
  return [...order.filter((other) => other !== id), id];
}

function replaceInstance(state: WindowState, instance: WindowInstance): WindowState {
  return { ...state, windows: { ...state.windows, [instance.id]: instance } };
}

function omit(windows: Windows, id: WindowId): Windows {
  const result: Record<WindowId, WindowInstance> = {};
  for (const instance of Object.values(windows)) {
    if (instance.id !== id) result[instance.id] = instance;
  }
  return result;
}

function sameBounds(a: Bounds, b: Bounds): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
