import { AnimatePresence } from 'motion/react';

import { selectZIndex } from '../../state/StateHelpers/selectors.ts';
import type {
  LayoutMode,
  Viewport,
  WindowId,
  WindowInstance,
  WindowState,
} from '../../state/StateHelpers/types.ts';
import { WindowBehavior } from '../WindowBehavior.tsx';

export interface WindowManagerProps {
  state: WindowState;
  taskbarItems: readonly WindowInstance[];
  layoutMode: LayoutMode;
  viewport: Viewport;
}

/**
 * Maps open windows in `openedAt` order. Place this inside the full-viewport
 * desktop (`relative`) so the layer can fill it.
 */
export function WindowManager({
  state,
  taskbarItems,
  layoutMode,
  viewport,
}: WindowManagerProps) {
  const frontId = frontWindowId(state);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(var(--os-menubar-h)+env(safe-area-inset-top))]">
      <AnimatePresence>
        {taskbarItems.map((instance) => (
          <WindowBehavior
            key={instance.id}
            instance={instance}
            isActive={instance.id === state.activeId}
            zIndex={selectZIndex(state, instance.id)}
            layoutMode={layoutMode}
            viewport={viewport}
            isFront={instance.id === frontId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function frontWindowId(state: WindowState): WindowId | null {
  for (let index = state.order.length - 1; index >= 0; index -= 1) {
    const id = state.order[index];
    if (!id) continue;
    const instance = state.windows[id];
    if (instance && !instance.minimized) return id;
  }
  return null;
}
