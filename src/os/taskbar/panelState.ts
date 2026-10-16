import type { LayoutMode } from '../state/StateHelpers/types.ts';
import type { StartMenuFocus } from './TaskbarComponents/StartButton.tsx';

/** One surface at a time. Start and the switcher cannot both be open. */
export type TaskbarPanel =
  | { kind: 'start'; focus: StartMenuFocus; focusRequest: number }
  | { kind: 'switcher' }
  | null;

export function toggleStart(panel: TaskbarPanel): TaskbarPanel {
  return panel?.kind === 'start'
    ? null
    : { kind: 'start', focus: 'first', focusRequest: 0 };
}

export function openStartFromKey(
  panel: TaskbarPanel,
  focus: StartMenuFocus,
): TaskbarPanel {
  return {
    kind: 'start',
    focus,
    focusRequest: panel?.kind === 'start' ? panel.focusRequest + 1 : 0,
  };
}

export function closeStart(panel: TaskbarPanel): TaskbarPanel {
  return panel?.kind === 'start' ? null : panel;
}

export function toggleSwitcher(panel: TaskbarPanel): TaskbarPanel {
  return panel?.kind === 'switcher' ? null : { kind: 'switcher' };
}

export function closeSwitcher(panel: TaskbarPanel): TaskbarPanel {
  return panel?.kind === 'switcher' ? null : panel;
}

/**
 * The switcher only exists on mobile. Returning null when it is open and the
 * layout is no longer mobile means a later resize back down does not reopen it.
 */
export function panelAfterLayoutChange(
  panel: TaskbarPanel,
  layoutMode: LayoutMode,
): TaskbarPanel {
  if (panel?.kind === 'switcher' && layoutMode !== 'mobile') return null;
  return panel;
}
