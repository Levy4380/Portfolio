import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { DocumentMeta } from '../../components/seo/DocumentMeta.tsx';
import { getContent } from '../../content/registry.ts';
import { site } from '../../content/site.ts';
import type { ContentItem } from '../../content/types.ts';
import { useReadViewport, useWindowDispatch } from '../state/useWindowActions.ts';
import { resolvePath, type RouteTarget } from './paths.ts';

const NOT_FOUND_KEY = 'system:not-found' as const;

/**
 * Location changes become idempotent OPEN / SHOW_DESKTOP dispatches.
 * This component never navigates. Title and description follow the resolved
 * route, not whichever window happens to be active.
 */
export function RouteWindowSync() {
  const { pathname } = useLocation();
  const dispatch = useWindowDispatch();
  const readViewport = useReadViewport();

  useEffect(() => {
    const target = resolvePath(pathname);
    switch (target.type) {
      case 'content':
        dispatch({
          type: 'OPEN',
          contentKey: target.contentKey,
          viewport: readViewport(),
        });
        return;
      case 'not-found':
        dispatch({
          type: 'OPEN',
          contentKey: NOT_FOUND_KEY,
          viewport: readViewport(),
          meta: { requestedPath: target.requestedPath },
        });
        return;
      case 'desktop':
        dispatch({ type: 'SHOW_DESKTOP' });
        return;
      default: {
        const unreachable: never = target;
        return unreachable;
      }
    }
  }, [dispatch, pathname, readViewport]);

  const meta = metaFor(resolvePath(pathname));
  return <DocumentMeta title={meta.title} description={meta.description} />;
}

function metaFor(target: RouteTarget): { title: string; description: string } {
  switch (target.type) {
    case 'desktop':
      return {
        title: `${site.name} — ${site.role}`,
        description: site.description,
      };
    case 'not-found':
      return {
        title: `File not found — ${site.name}`,
        description: site.description,
      };
    case 'content': {
      const item = getContent(target.contentKey);
      if (!item || item.kind === 'link') {
        return {
          title: `File not found — ${site.name}`,
          description: site.description,
        };
      }
      return {
        title: `${item.title} — ${site.name}`,
        description: descriptionOf(item),
      };
    }
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}

/** `summary` when the item has one, otherwise the long description, otherwise the site line. */
function descriptionOf(item: Exclude<ContentItem, { kind: 'link' }>): string {
  if (item.summary) return item.summary;
  if (item.kind === 'project' || item.kind === 'experiment') return item.description;
  return site.description;
}
