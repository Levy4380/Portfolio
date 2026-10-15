import { matchPath } from 'react-router';
import { getContent } from '../../content/registry.ts';
import type { ContentKey } from '../../content/types.ts';

export type RouteTarget =
  | { type: 'desktop' }
  | { type: 'content'; contentKey: ContentKey }
  | { type: 'not-found'; requestedPath: string };

type RoutableKind = 'folder' | 'project' | 'experiment' | 'profile';

/**
 * Pure pathname parse. `/about` and `/projects` are router redirects, not
 * handled here. A matched pattern is content only when the registry has the key.
 */
export function resolvePath(pathname: string): RouteTarget {
  const folder = matchPath('/folder/:folderSlug', pathname);
  if (folder) {
    return contentOrNotFound(pathname, 'folder', folder.params.folderSlug);
  }

  const project = matchPath('/projects/:slug', pathname);
  if (project) {
    return contentOrNotFound(pathname, 'project', project.params.slug);
  }

  const experiment = matchPath('/experiments/:slug', pathname);
  if (experiment) {
    return contentOrNotFound(pathname, 'experiment', experiment.params.slug);
  }

  const profile = matchPath('/about/:slug', pathname);
  if (profile) {
    return contentOrNotFound(pathname, 'profile', profile.params.slug);
  }

  if (matchPath('/', pathname)) {
    return { type: 'desktop' };
  }

  return { type: 'not-found', requestedPath: pathname };
}

/** `null` for `system:*` and links. Other kinds map to their public URL. */
export function pathFor(contentKey: ContentKey): string | null {
  const parsed = parseRoutableKey(contentKey);
  if (!parsed) return null;

  switch (parsed.kind) {
    case 'folder':
      return `/folder/${parsed.slug}`;
    case 'project':
      return `/projects/${parsed.slug}`;
    case 'experiment':
      return `/experiments/${parsed.slug}`;
    case 'profile':
      return `/about/${parsed.slug}`;
  }
}

function contentOrNotFound(
  pathname: string,
  kind: RoutableKind,
  slug: string | undefined,
): RouteTarget {
  if (slug) {
    const contentKey: ContentKey = `${kind}:${slug}`;
    if (getContent(contentKey)) {
      return { type: 'content', contentKey };
    }
  }
  return { type: 'not-found', requestedPath: pathname };
}

function parseRoutableKey(
  contentKey: ContentKey,
): { kind: RoutableKind; slug: string } | null {
  const separator = contentKey.indexOf(':');
  if (separator <= 0) return null;

  const kind = contentKey.slice(0, separator);
  const slug = contentKey.slice(separator + 1);
  if (!slug) return null;

  if (
    kind === 'folder' ||
    kind === 'project' ||
    kind === 'experiment' ||
    kind === 'profile'
  ) {
    return { kind, slug };
  }

  return null;
}
