import type { ContentId, WindowId, WindowInstance, WindowState } from './types.ts';

/** Deterministic window id: one window per content id (ADR-02). */
export function windowIdFor(contentId: ContentId): WindowId {
  return `win:${contentId}`;
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

export function selectByContentId(
  state: WindowState,
  contentId: ContentId,
): WindowInstance | undefined {
  return state.windows[windowIdFor(contentId)];
}
