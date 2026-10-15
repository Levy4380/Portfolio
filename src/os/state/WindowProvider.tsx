import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { TASKBAR_H } from '../windows/geometry.ts';
import { selectTaskbarItems } from './selectors.ts';
import type { Viewport, WindowAction, WindowState } from './types.ts';
import {
  WindowDispatchContext,
  WindowStateContext,
  type WindowDispatchApi,
  type WindowStateSnapshot,
} from './useWindowActions.ts';
import { initialWindowState, windowReducer } from './windowReducer.ts';

/** Desktop area. geometry.ts has no viewport helper; the taskbar is `TASKBAR_H`. */
function readViewport(): Viewport {
  return {
    width: window.innerWidth,
    height: window.innerHeight - TASKBAR_H,
  };
}

/** `selectTaskbarItems` only reads `windows`, and it allocates a new array every call. */
function taskbarItemsFor(
  windows: WindowState['windows'],
): WindowStateSnapshot['taskbarItems'] {
  return selectTaskbarItems({ windows } as WindowState);
}

/**
 * Holds window state. Components that only call actions subscribe to the
 * dispatch context, whose value does not change when state does.
 */
export function WindowProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(windowReducer, initialWindowState);
  // Event-handler mirror. Action creators read it instead of the state context,
  // so they do not re-render when windows move. Not written during render.
  const stateRef = useRef(initialWindowState);

  const dispatch = useCallback(
    (action: WindowAction) => {
      // The reducer is pure, so React's later call commits the same transition.
      stateRef.current = windowReducer(stateRef.current, action);
      rawDispatch(action);
    },
    [rawDispatch],
  );

  const getState = useCallback(() => stateRef.current, [stateRef]);

  const windows = state.windows;
  const taskbarItems = useMemo(() => taskbarItemsFor(windows), [windows]);

  const stateValue = useMemo<WindowStateSnapshot>(
    () => ({ state, taskbarItems }),
    [state, taskbarItems],
  );

  const dispatchValue = useMemo<WindowDispatchApi>(
    () => ({ dispatch, getState, readViewport }),
    [dispatch, getState],
  );

  return (
    <WindowDispatchContext.Provider value={dispatchValue}>
      <WindowStateContext.Provider value={stateValue}>
        {children}
      </WindowStateContext.Provider>
    </WindowDispatchContext.Provider>
  );
}
