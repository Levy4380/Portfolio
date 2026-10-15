import { useCallback } from 'react';

import { getChildren, getContent } from '../../content/registry.ts';
import type { ContentKey, FolderItem } from '../../content/types.ts';
import { IconGrid } from '../grid/IconGrid.tsx';
import type { WindowId } from '../state/types.ts';
import { useWindowActions } from '../state/useWindowActions.ts';

interface FolderWindowProps {
  item: FolderItem;
  windowId: WindowId;
  isActive: boolean;
}

/** `/Desktop/Projects`, built by walking `parent` up to the desktop. */
function pathOf(item: FolderItem): string {
  const titles = [item.title];
  let parent = item.parent;
  // Bounded walk: a malformed parent chain can never loop forever.
  for (let depth = 0; parent !== 'desktop' && depth < 8; depth += 1) {
    const folder = getContent(parent);
    if (!folder) break;
    titles.unshift(folder.title);
    parent = folder.parent;
  }
  return `/Desktop/${titles.join('/')}`;
}

export function FolderWindow({ item, windowId }: FolderWindowProps) {
  const { openContent } = useWindowActions();
  const children = getChildren(`folder:${item.slug}`);
  const count = children.length;

  // Opening a child never closes the folder (design.md §4.5).
  const open = useCallback(
    (contentKey: ContentKey) => {
      openContent(contentKey, { originId: windowId });
    },
    [openContent, windowId],
  );

  return (
    <div className="flex min-h-full flex-col bg-window text-fg">
      <div className="flex items-center gap-2 border-b border-line bg-sunken px-3 py-1.5">
        <span className="text-meta text-fg-muted">Location</span>
        <p className="min-w-0 flex-1 truncate rounded-control border border-line bg-window px-2 py-0.5 font-mono text-meta text-fg">
          {pathOf(item)}
        </p>
      </div>

      {count === 0 ? (
        <p className="flex-1 p-6 text-ui text-fg-muted">{item.emptyText}</p>
      ) : (
        <IconGrid
          items={children}
          variant="window"
          ariaLabel={`${item.title} contents`}
          onOpen={open}
          className="flex-1 p-3"
        />
      )}

      <div className="sticky bottom-0 border-t border-line bg-sunken px-3 py-1 text-meta text-fg-muted">
        {count} {count === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
}
