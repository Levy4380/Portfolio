import {
  createContext,
  useContext,
  useMemo,
  type Context,
  type Dispatch,
} from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router';

import type { Openable } from '../../../content/catalog.ts';
import type { WindowActions } from '../../contracts.ts';
import { pathFor, routePointsAt } from '../../routing/RoutingHelpers/paths.ts';
import { selectNextActive } from './selectors.ts';
import type {
  LayoutMode,
  Viewport,
  WindowAction,
  WindowId,
  WindowInstance,
  WindowState,
} from './types.ts';

export interface WindowStateSnapshot {
  state: WindowState;
  /** Opening order. Memoized in the provider on `state.windows`. */
  taskbarItems: readonly WindowInstance[];
}

export interface WindowDispatchApi {
  dispatch: Dispatch<WindowAction>;
  /** Latest reducer state. Does not subscribe the caller to updates. */
  getState: () => WindowState;
  /** Latest desktop-area viewport from the layout context. */
  readViewport: () => Viewport;
  /** Latest layout mode from the layout context. */
  readLayoutMode: () => LayoutMode;
}

export const WindowStateContext: Context<WindowStateSnapshot | null> =
  createContext<WindowStateSnapshot | null>(null);
WindowStateContext.displayName = 'WindowStateContext';

export const WindowDispatchContext: Context<WindowDispatchApi | null> =
  createContext<WindowDispatchApi | null>(null);
WindowDispatchContext.displayName = 'WindowDispatchContext';

function useRequired<T>(context: Context<T | null>, hook: string): T {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`${hook} must be used within WindowProvider`);
  }
  return value;
}

function useDispatchApi(hook: string): WindowDispatchApi {
  return useRequired(WindowDispatchContext, hook);
}

/** Canonical window state plus the memoized taskbar list. */
export function useWindowState(): WindowStateSnapshot {
  return useRequired(WindowStateContext, 'useWindowState');
}

/**
 * Dispatch without navigation. Route sync and viewport changes use this.
 * Window chrome uses `useWindowActions` instead.
 */
export function useWindowDispatch(): Dispatch<WindowAction> {
  return useDispatchApi('useWindowDispatch').dispatch;
}

/** Stable reader for the desktop-area viewport from the layout context. */
export function useReadViewport(): () => Viewport {
  return useDispatchApi('useReadViewport').readViewport;
}

/** Skip when `target` is null (no URL) or already the address bar. */
function push(
  navigate: NavigateFunction,
  pathname: string,
  target: string | null,
): void {
  if (target === null || target === pathname) return;
  navigate(target);
}

function replace(
  navigate: NavigateFunction,
  pathname: string,
  target: string | null,
): void {
  if (target === null || target === pathname) return;
  navigate(target, { replace: true });
}

/**
 * Path of the window that becomes active, or `/` when none remains.
 * `null` when that window has no URL (`system:*`), so the caller skips navigation.
 */
function pathAfterLeaving(state: WindowState, id: WindowId): string | null {
  const nextId = selectNextActive(state, id);
  if (nextId === null) return '/';
  const next: WindowInstance | undefined = state.windows[nextId];
  if (!next) return '/';
  return pathFor(next.contentId);
}

/**
 * The only UI entry into the window manager. Each method dispatches, then
 * navigates. The route effect later only dispatches, so there is no source flag.
 */
export function useWindowActions(): WindowActions {
  const { dispatch, getState, readViewport, readLayoutMode } =
    useDispatchApi('useWindowActions');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useMemo<WindowActions>(() => {
    return {
      openContent(target: Openable, options) {
        dispatch({
          type: 'OPEN',
          contentId: target.id,
          preset: target.preset,
          viewport: readViewport(),
          ...(options?.originId !== undefined
            ? { originId: options.originId }
            : {}),
        });
        push(navigate, pathname, target.path);
      },
      focusWindow(id) {
        const instance: WindowInstance | undefined = getState().windows[id];
        dispatch({ type: 'FOCUS', id });
        if (!instance) return;
        replace(navigate, pathname, pathFor(instance.contentId));
      },
      minimizeWindow(id) {
        const state = getState();
        const wasActive = state.activeId === id;
        dispatch({ type: 'MINIMIZE', id });
        if (!wasActive) return;
        replace(navigate, pathname, pathAfterLeaving(state, id));
      },
      closeWindow(id) {
        const state = getState();
        const instance: WindowInstance | undefined = state.windows[id];
        dispatch({ type: 'CLOSE', id });
        if (!instance || !routePointsAt(pathname, instance.contentId)) return;
        replace(navigate, pathname, pathAfterLeaving(state, id));
      },
      toggleMaximize(id) {
        if (readLayoutMode() === 'desktop') {
          dispatch({ type: 'TOGGLE_MAXIMIZE', id });
        }
      },
      move(id, x, y) {
        dispatch({ type: 'MOVE', id, x, y, viewport: readViewport() });
      },
      resize(id, bounds) {
        dispatch({ type: 'RESIZE', id, bounds, viewport: readViewport() });
      },
      blurAll() {
        dispatch({ type: 'BLUR' });
      },
    };
  }, [dispatch, getState, navigate, pathname, readLayoutMode, readViewport]);
}
