import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { DocumentMeta } from '../../components/seo/DocumentMeta.tsx';
import { getOpenable, NOT_FOUND_ID } from '../../content/catalog.ts';
import { site } from '../../content/site.ts';
import { useReadViewport, useWindowDispatch } from '../state/StateHelpers/useWindowActions.ts';
import { resolvePath, type RouteTarget } from './RoutingHelpers/paths.ts';

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
      case 'content': {
        const opened = getOpenable(target.contentId);
        if (!opened) return;
        dispatch({
          type: 'OPEN',
          contentId: opened.id,
          preset: opened.preset,
          viewport: readViewport(),
        });
        return;
      }
      case 'not-found':
        dispatch({
          type: 'OPEN',
          contentId: NOT_FOUND_ID,
          preset: 'dialog',
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
      const opened = getOpenable(target.contentId);
      if (!opened) {
        return {
          title: `File not found — ${site.name}`,
          description: site.description,
        };
      }
      return {
        title: `${opened.title} — ${site.name}`,
        description: opened.summary ?? site.description,
      };
    }
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}
