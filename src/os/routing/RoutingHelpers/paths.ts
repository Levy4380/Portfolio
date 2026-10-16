import { matchPath } from 'react-router';

import { getOpenable, getOpenableByPath, NOT_FOUND_ID } from '../../../content/catalog.ts';
import type { ContentId } from '../../state/StateHelpers/types.ts';

export type RouteTarget =
  | { type: 'desktop' }
  | { type: 'content'; contentId: ContentId }
  | { type: 'not-found'; requestedPath: string };

/**
 * Pure pathname parse. `/about` and `/projects` are router redirects, not
 * handled here. A path is content only when a component registered that path.
 */
export function resolvePath(pathname: string): RouteTarget {
  if (matchPath('/', pathname)) {
    return { type: 'desktop' };
  }

  const opened = getOpenableByPath(pathname);
  if (opened) {
    return { type: 'content', contentId: opened.id };
  }

  return { type: 'not-found', requestedPath: pathname };
}

/** `null` for the not-found window, which has no public URL. */
export function pathFor(contentId: ContentId): string | null {
  if (contentId === NOT_FOUND_ID) return null;
  return getOpenable(contentId)?.path ?? null;
}
