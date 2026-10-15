import { useRef, type MouseEvent } from 'react';

import { site } from '../content/site.ts';
import { LiveAnnouncer } from './a11y/LiveAnnouncer.tsx';
import { DesktopBackground } from './desktop/DesktopBackground.tsx';
import { DesktopIcons } from './desktop/DesktopIcons.tsx';
import type { IconGridHandle } from './grid/IconGrid.tsx';
import { RouteWindowSync } from './routing/RouteWindowSync.tsx';
import { useWindowState } from './state/useWindowActions.ts';
import { WindowProvider } from './state/WindowProvider.tsx';
import { Taskbar } from './taskbar/Taskbar.tsx';
import { TaskbarAnchorProvider } from './taskbar/taskbarAnchors.ts';
import { WindowManager } from './windows/WindowManager.tsx';

const skipLinkClass =
  'absolute top-3 -left-[999px] z-1300 rounded-control bg-window px-3 py-2 text-ui font-medium text-fg shadow-menu focus:left-3 focus-ring';

/** The single route component. Window state lives in `WindowProvider`, not here. */
export function DesktopEnvironment() {
  return (
    <WindowProvider>
      <TaskbarAnchorProvider>
        <Shell />
      </TaskbarAnchorProvider>
    </WindowProvider>
  );
}

function Shell() {
  const { state } = useWindowState();
  const desktopGridRef = useRef<IconGridHandle>(null);
  const hasActiveWindow = state.activeId !== null;

  return (
    <div className="relative h-dvh overflow-hidden">
      {hasActiveWindow ? (
        <a href="#active-window" className={skipLinkClass} onClick={skipTo('active-window')}>
          Skip to active window
        </a>
      ) : null}
      <a href="#taskbar" className={skipLinkClass} onClick={skipTo('taskbar')}>
        Skip to taskbar
      </a>
      <h1 className="sr-only">{site.name} — Portfolio</h1>
      <RouteWindowSync />
      <LiveAnnouncer />
      <main aria-label="Desktop" className="relative h-full">
        <DesktopBackground
          onClearSelection={() => {
            desktopGridRef.current?.clearSelection();
          }}
        />
        <DesktopIcons clearSelectionRef={desktopGridRef} />
        <WindowManager />
      </main>
      <Taskbar />
    </div>
  );
}

/** Move focus without writing a hash into history. */
function skipTo(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.focus();
  };
}
