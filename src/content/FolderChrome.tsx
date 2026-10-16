import { Children, isValidElement, type ReactNode } from 'react';

import { cn } from '../lib/cn.ts';
import { OpenOriginContext } from '../os/grid/OpenOrigin.tsx';
import { useLayoutMode } from '../os/windows/WindowsHelpers/useLayoutMode.ts';
import type { WindowId } from '../os/state/StateHelpers/types.ts';
import { useWindowActions } from '../os/state/StateHelpers/useWindowActions.ts';
import { getDesktopFolders, type Openable } from './catalog.ts';
import { ShellGlyph } from './ShellGlyph.tsx';

/**
 * Sidebar, icon grid, and the path line. The folder component supplies the grid.
 * An empty grid shows `emptyText` from that folder.
 */
export function FolderChrome({
  folder,
  windowId,
  children,
}: {
  folder: Openable;
  windowId: WindowId;
  children: ReactNode;
}) {
  const { openContent } = useWindowActions();
  const layoutMode = useLayoutMode();
  const showSidebar = layoutMode !== 'mobile';
  const places = getDesktopFolders();
  const count = shortcutCount(children);

  const open = (target: Openable) => {
    openContent(target, { originId: windowId });
  };

  const listing =
    count === 0 ? (
      <p className="flex-1 p-6 text-ui text-fg-muted">{folder.emptyText}</p>
    ) : (
      children
    );

  const status = (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 text-meta text-fg-muted">
      <p className="min-w-0 truncate font-mono">{`/Desktop/${folder.title}`}</p>
      <p className="shrink-0 tabular-nums">
        {count} {count === 1 ? 'item' : 'items'}
      </p>
    </div>
  );

  const body = (
    <OpenOriginContext.Provider value={windowId}>{listing}</OpenOriginContext.Provider>
  );

  if (!showSidebar) {
    return (
      <div className="flex min-h-full flex-col bg-window text-fg">
        {body}
        <div className="sticky bottom-0 bg-window">{status}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-window text-fg">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <nav
          aria-label="Folders"
          className="flex w-44 shrink-0 flex-col gap-0.5 self-stretch overflow-y-auto rounded-menu bg-sunken p-2"
        >
          {places.map((place) => {
            const current = place.id === folder.id;
            return (
              <button
                key={place.id}
                type="button"
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-ui text-fg focus-ring',
                  current ? 'bg-window' : 'hover:bg-chrome-hover active:bg-chrome-press',
                )}
                onClick={() => open(place)}
              >
                <ShellGlyph icon={place.icon} className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{place.title}</span>
              </button>
            );
          })}
        </nav>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            {body}
          </div>
          <div className="shrink-0">{status}</div>
        </div>
      </div>
    </div>
  );
}

function shortcutCount(children: ReactNode): number {
  let count = 0;
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return;
    count += Children.toArray(child.props.children).filter((node) => isValidElement(node)).length;
  });
  return count;
}
