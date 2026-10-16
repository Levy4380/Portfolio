import { memo, Suspense, type ReactNode } from 'react';

import { iconFor, NOT_FOUND_ID, renderOpenable } from '../../../content/catalog.ts';
import { FileRenderer } from '../../../content/FileRenderer.tsx';
import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import type { ContentId, WindowId } from '../../state/StateHelpers/types.ts';
import { NotFoundDocument } from './NotFoundDocument.tsx';
import { WindowErrorBoundary } from './WindowErrorBoundary.tsx';

interface WindowBodyProps {
  /** Stable document identity (`Component.id`). */
  documentId: ContentId;
  instanceId: WindowId;
  isActive: boolean;
  /** Not-found copy. Compared so a second unknown path updates the dialog. */
  requestedPath?: string;
  children: ReactNode;
}

/**
 * Scroll container, skeleton, and error boundary.
 * Memoized on document identity and `isActive`, never on geometry, so a drag
 * commit does not re-render the document. `children` is omitted from the
 * comparator: a new element each frame must not redraw the document.
 */
function WindowBodyComponent({ instanceId, children }: WindowBodyProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <WindowErrorBoundary windowId={instanceId}>
        <Suspense fallback={<WindowSkeleton />}>{children}</Suspense>
      </WindowErrorBoundary>
    </div>
  );
}

function propsAreEqual(prev: WindowBodyProps, next: WindowBodyProps) {
  return (
    prev.documentId === next.documentId &&
    prev.instanceId === next.instanceId &&
    prev.isActive === next.isActive &&
    prev.requestedPath === next.requestedPath
  );
}

export const WindowBody = memo(WindowBodyComponent, propsAreEqual);

/**
 * The document element. Memoized without `isActive` so a focus change that
 * re-renders the frame does not redraw the document.
 */
export const OpenedDocument = memo(function OpenedDocument({
  documentId,
  windowId,
  requestedPath,
}: {
  documentId: ContentId;
  windowId: WindowId;
  requestedPath?: string;
}) {
  const document =
    documentId === NOT_FOUND_ID ? (
      <NotFoundDocument windowId={windowId} requestedPath={requestedPath} />
    ) : (
      renderOpenable(documentId, { windowId })
    );

  if (iconFor(documentId).glyph !== 'file') return document;
  return <FileRenderer>{document}</FileRenderer>;
});

function WindowSkeleton() {
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-busy="true">
      <span className="sr-only">{translation('os.loading')}</span>
      <div className="h-4 w-2/3 rounded-chip bg-sunken" />
      <div className="h-4 w-full rounded-chip bg-sunken" />
      <div className="h-4 w-4/5 rounded-chip bg-sunken" />
    </div>
  );
}
