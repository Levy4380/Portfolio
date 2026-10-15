import { memo, Suspense } from 'react';

import { getContent } from '../../content/registry.ts';
import type {
  ContentItem,
  ContentKey,
  SystemItem,
} from '../../content/types.ts';
import type { WindowInstance } from '../state/types.ts';
import { renderContent } from '../renderers/renderContent.tsx';
import { WindowErrorBoundary } from './WindowErrorBoundary.tsx';

type WindowContent = Exclude<
  ContentItem,
  Extract<ContentItem, { kind: 'link' }>
>;

interface WindowBodyProps {
  instance: WindowInstance;
  isActive: boolean;
}

/**
 * Scroll container, skeleton, and error boundary.
 * Memoized on content identity and `isActive`, never on geometry, so a drag
 * commit does not re-render the document.
 */
function WindowBodyComponent({ instance, isActive }: WindowBodyProps) {
  const item = resolveWindowContent(instance);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <WindowErrorBoundary windowId={instance.id}>
        <Suspense fallback={<WindowSkeleton />}>
          {item
            ? renderContent(item, { windowId: instance.id, isActive })
            : null}
        </Suspense>
      </WindowErrorBoundary>
    </div>
  );
}

function propsAreEqual(prev: WindowBodyProps, next: WindowBodyProps) {
  return (
    prev.instance.contentKey === next.instance.contentKey &&
    prev.instance.id === next.instance.id &&
    prev.instance.meta === next.instance.meta &&
    prev.isActive === next.isActive
  );
}

export const WindowBody = memo(WindowBodyComponent, propsAreEqual);

function WindowSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="h-4 w-2/3 rounded-chip bg-sunken" />
      <div className="h-4 w-full rounded-chip bg-sunken" />
      <div className="h-4 w-4/5 rounded-chip bg-sunken" />
    </div>
  );
}

/** Not-found is not a registry row; it still opens a window. */
function resolveWindowContent(instance: WindowInstance): WindowContent | null {
  const item = getContent(instance.contentKey);
  if (item) return item.kind === 'link' ? null : item;
  if (instance.kind !== 'system') return null;
  return systemItem(instance);
}

function systemItem(instance: WindowInstance): SystemItem {
  const requested = instance.meta?.requestedPath;
  return {
    kind: 'system',
    slug: slugFromKey(instance.contentKey),
    title: 'File not found',
    icon: 'file-missing',
    parent: 'desktop',
    ...(requested !== undefined ? { summary: requested } : {}),
  };
}

function slugFromKey(contentKey: ContentKey): string {
  const separator = contentKey.indexOf(':');
  return separator === -1 ? contentKey : contentKey.slice(separator + 1);
}
