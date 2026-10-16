import { useReducedMotion } from 'motion/react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  useWindowActions,
  useWindowState,
} from '../state/StateHelpers/useWindowActions.ts';
import { useLayoutMode } from '../windows/WindowsHelpers/useLayoutMode.ts';
import {
  closeStart,
  closeSwitcher,
  openStartFromKey,
  panelAfterLayoutChange,
  toggleStart,
  toggleSwitcher,
  type TaskbarPanel,
} from './panelState.ts';
import { Taskbar } from './Taskbar.tsx';
import type { StartMenuFocus } from './TaskbarComponents/StartButton.tsx';

/**
 * Owns the taskbar panel, the Start and Windows button refs, and the node
 * that receives focus when a panel closes. The shell only paints.
 */
export function TaskbarBehavior() {
  const { state, taskbarItems } = useWindowState();
  const { focusWindow, minimizeWindow, closeWindow } = useWindowActions();
  const reduced = useReducedMotion() ?? false;
  const layoutMode = useLayoutMode();
  const mobile = layoutMode === 'mobile';

  const startRef = useRef<HTMLButtonElement>(null);
  const windowsRef = useRef<HTMLButtonElement>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  const [panel, setPanel] = useState<TaskbarPanel>(null);

  useLayoutEffect(() => {
    // layoutMode is the trigger. Updating the panel here, not during render,
    // is what keeps a later resize from reopening the switcher.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- panelAfterLayoutChange runs when layoutMode changes, not during render
    setPanel((current) => panelAfterLayoutChange(current, layoutMode));
  }, [layoutMode]);

  useLayoutEffect(() => {
    if (panel !== null) return;
    const node = focusReturn.current;
    focusReturn.current = null;
    node?.focus();
  }, [panel]);

  const onToggleStart = useCallback(() => {
    setPanel(toggleStart);
  }, []);

  const onOpenStartFromKey = useCallback((focus: StartMenuFocus) => {
    setPanel((current) => openStartFromKey(current, focus));
  }, []);

  const onCloseStart = useCallback((restoreFocus: boolean) => {
    focusReturn.current = restoreFocus ? startRef.current : null;
    setPanel(closeStart);
  }, []);

  const onToggleSwitcher = useCallback(() => {
    setPanel(toggleSwitcher);
  }, []);

  const onCloseSwitcher = useCallback((restoreFocus: boolean) => {
    focusReturn.current = restoreFocus ? windowsRef.current : null;
    setPanel(closeSwitcher);
  }, []);

  return (
    <Taskbar
      mobile={mobile}
      reduced={reduced}
      panel={panel}
      taskbarItems={taskbarItems}
      activeId={state.activeId}
      startRef={startRef}
      windowsRef={windowsRef}
      onToggleStart={onToggleStart}
      onOpenStartFromKey={onOpenStartFromKey}
      onCloseStart={onCloseStart}
      onToggleSwitcher={onToggleSwitcher}
      onCloseSwitcher={onCloseSwitcher}
      onFocusWindow={focusWindow}
      onMinimizeWindow={minimizeWindow}
      onCloseWindow={closeWindow}
    />
  );
}
