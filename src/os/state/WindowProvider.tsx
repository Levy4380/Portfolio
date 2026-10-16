import {
  memo,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { useLayout } from '../windows/WindowsHelpers/useLayoutMode.ts';
import { selectTaskbarItems } from './StateHelpers/selectors.ts';
import type {
  LayoutMode,
  Viewport,
  WindowAction,
  WindowState,
} from './StateHelpers/types.ts';
import {
  WindowDispatchContext,
  WindowStateContext,
  type WindowDispatchApi,
  type WindowStateSnapshot,
} from './StateHelpers/useWindowActions.ts';
import { initialWindowState, windowReducer } from './StateHelpers/windowReducer.ts';

/** `selectTaskbarItems` only reads `windows`, and it allocates a new array every call. */
function taskbarItemsFor(
  windows: WindowState['windows'],
): WindowStateSnapshot['taskbarItems'] {
  return selectTaskbarItems({ windows } as WindowState);
}

/**
 * Holds window state. Components that only call actions subscribe to the
 * dispatch context, whose value does not change when state does.
 * Layout readers come from `LayoutProvider`. The store itself does not
 * subscribe to viewport changes, so a resize does not re-render the shell.
 */
export function WindowProvider({ children }: { children: ReactNode }) {
  const { readViewport, readLayoutMode } = useLayout();
  return (
    <WindowStore readLayoutMode={readLayoutMode} readViewport={readViewport}>
      {children}
    </WindowStore>
  );
}

const WindowStore = memo(function WindowStore({
  children,
  readLayoutMode,
  readViewport,
}: {
  children: ReactNode;
  readLayoutMode: () => LayoutMode;
  readViewport: () => Viewport;
}) {
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
    () => ({ dispatch, getState, readViewport, readLayoutMode }),
    [dispatch, getState, readLayoutMode, readViewport],
  );

  return (
    <WindowDispatchContext.Provider value={dispatchValue}>
      <WindowStateContext.Provider value={stateValue}>
        {children}
      </WindowStateContext.Provider>
    </WindowDispatchContext.Provider>
  );
});
