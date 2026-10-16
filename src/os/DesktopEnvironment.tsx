import { useRef, type MouseEvent } from 'react';

import { useLanguage, useTranslation } from '../content/i18n/useTranslation.ts';
import { site } from '../content/site.ts';
import { LiveAnnouncer } from './a11y/LiveAnnouncer.tsx';
import { DesktopBackground } from './desktop/DesktopBackground.tsx';
import { Desktop } from '../content/desktop.tsx';
import type { IconGridHandle } from './grid/IconGrid.tsx';
import { RouteWindowSync } from './routing/RouteWindowSync.tsx';
import { useWindowState } from './state/StateHelpers/useWindowActions.ts';
import { WindowProvider } from './state/WindowProvider.tsx';
import { MenuBarBehavior } from './menubar/MenuBarBehavior.tsx';
import { TaskbarBehavior } from './taskbar/TaskbarBehavior.tsx';
import { TaskbarAnchorProvider } from './taskbar/TaskbarHelpers/taskbarAnchors.ts';
import { LayoutProvider } from './windows/WindowsHelpers/LayoutProvider.tsx';
import { WindowManagerBehavior } from './windows/WindowsComponents/WindowManagerBehavior.tsx';

const skipLinkClass =
  'absolute top-[calc(var(--os-menubar-h)+env(safe-area-inset-top)+0.75rem)] -left-[999px] z-1300 rounded-control bg-fg px-3 py-2 text-ui font-medium text-window shadow-menu focus:left-3 focus-ring';

/** The single route component. Window state lives in `WindowProvider`, not here. */
export function DesktopEnvironment() {
  return (
    <LayoutProvider>
      <WindowProvider>
        <TaskbarAnchorProvider>
          <Shell />
        </TaskbarAnchorProvider>
      </WindowProvider>
    </LayoutProvider>
  );
}

function Shell() {
  const { state } = useWindowState();
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const desktopGridRef = useRef<IconGridHandle>(null);
  const hasActiveWindow = state.activeId !== null;

  return (
    <div className="relative h-dvh overflow-hidden">
      {hasActiveWindow ? (
        <a
          href="#active-window"
          className={skipLinkClass}
          onClick={skipTo('active-window')}
        >
          {translation('os.skipToActiveWindow')}
        </a>
      ) : null}
      <a href="#taskbar" className={skipLinkClass} onClick={skipTo('taskbar')}>
        {translation('os.skipToTaskbar')}
      </a>
      <h1 className="sr-only">
        {site.name} — {translation('os.portfolio')}
      </h1>
      <RouteWindowSync />
      <LiveAnnouncer />
      <main aria-label={translation('os.desktop')} className="relative h-full">
        <DesktopBackground
          onClearSelection={() => {
            desktopGridRef.current?.clearSelection();
          }}
        />
        <Desktop clearSelectionRef={desktopGridRef} />
        <WindowManagerBehavior />
      </main>
      <MenuBarBehavior />
      <TaskbarBehavior />
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
