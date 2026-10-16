import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import { DocumentMeta } from '../../components/seo/DocumentMeta.tsx';
import { ProfileFile } from '../../content/about/ProfileFile.tsx';
import { getOpenable, NOT_FOUND_ID } from '../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import { site } from '../../content/site.ts';
import { useReadViewport, useWindowDispatch } from '../state/StateHelpers/useWindowActions.ts';
import { resolvePath, type RouteTarget } from './RoutingHelpers/paths.ts';

/**
 * Location changes become idempotent OPEN / SHOW_DESKTOP dispatches.
 * This component never navigates. Title and description follow the resolved
 * route, not whichever window happens to be active.
 * The first visit to `/` opens Profile without a route, so the menu bar
 * keeps the site name. Later visits to `/` still mean Show Desktop.
 */
export function RouteWindowSync() {
  const { pathname } = useLocation();
  const dispatch = useWindowDispatch();
  const readViewport = useReadViewport();
  const welcomedRef = useRef(false);

  useLayoutEffect(() => {
    const target = resolvePath(pathname);
    switch (target.type) {
      case 'content': {
        welcomedRef.current = true;
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
        welcomedRef.current = true;
        dispatch({
          type: 'OPEN',
          contentId: NOT_FOUND_ID,
          preset: 'dialog',
          viewport: readViewport(),
          meta: { requestedPath: target.requestedPath },
        });
        return;
      case 'desktop': {
        // Strict Mode replays this effect. The cleanup clears the flag so the
        // replay opens Profile again instead of minimizing it.
        if (!welcomedRef.current) {
          welcomedRef.current = true;
          dispatch({
            type: 'OPEN',
            contentId: ProfileFile.id,
            preset: ProfileFile.preset,
            viewport: readViewport(),
          });
          return () => {
            welcomedRef.current = false;
          };
        }
        dispatch({ type: 'SHOW_DESKTOP' });
        return;
      }
      default: {
        const unreachable: never = target;
        return unreachable;
      }
    }
  }, [dispatch, pathname, readViewport]);

  const { language } = useLanguage();
  const translation = useTranslation(language);
  const meta = metaFor(resolvePath(pathname), translation);
  return <DocumentMeta title={meta.title} description={meta.description} />;
}

function metaFor(
  target: RouteTarget,
  translation: ReturnType<typeof useTranslation>,
): { title: string; description: string } {
  const description = translation('site.description');
  switch (target.type) {
    case 'desktop':
      return {
        title: `${site.name} — ${translation('site.role')}`,
        description,
      };
    case 'not-found':
      return {
        title: translation('notfound.documentTitle', { name: site.name }),
        description,
      };
    case 'content': {
      const opened = getOpenable(target.contentId);
      if (!opened) {
        return {
          title: translation('notfound.documentTitle', { name: site.name }),
          description,
        };
      }
      return {
        title: `${translation(opened.title)} — ${site.name}`,
        description: opened.summary ? translation(opened.summary) : description,
      };
    }
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}
