import type { ContentKey } from '../../content/types.ts';
import type { WindowId, WindowInstance, WindowState } from './types.ts';

/** Deterministic window id: one window per content key (§4.5). */
export function windowIdFor(contentKey: ContentKey): WindowId {
  return `win:${contentKey}`;
}

export function selectActiveId(state: WindowState): WindowId | null {
  return state.activeId;
}

/** Taskbar items in opening order. Derived, so the taskbar can never show a missing window. */
export function selectTaskbarItems(state: WindowState): readonly WindowInstance[] {
  return Object.values(state.windows).sort((a, b) => a.openedAt - b.openedAt);
}

/** `100 + position in the stacking order`. A window outside `order` sits at the base. */
export function selectZIndex(state: WindowState, id: WindowId): number {
  const index = state.order.indexOf(id);
  return index < 0 ? 100 : 100 + index;
}

/** Topmost non-minimized window other than `excludeId`, or `null`. */
export function selectNextActive(state: WindowState, excludeId: WindowId): WindowId | null {
  for (let i = state.order.length - 1; i >= 0; i -= 1) {
    const id = state.order[i];
    if (id === excludeId) continue;
    const instance: WindowInstance | undefined = state.windows[id];
    if (instance && !instance.minimized) return id;
  }
  return null;
}

export function selectByContentKey(
  state: WindowState,
  contentKey: ContentKey,
): WindowInstance | undefined {
  return state.windows[windowIdFor(contentKey)];
}
