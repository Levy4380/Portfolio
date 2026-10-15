import type { FolderItem } from './types.ts';

export const folders = [
  {
    kind: 'folder',
    slug: 'about',
    title: 'About Me',
    icon: 'folder-about',
    accent: 'about',
    parent: 'desktop',
    order: 1,
    emptyText: 'Nothing here yet.',
  },
  {
    kind: 'folder',
    slug: 'projects',
    title: 'Projects',
    icon: 'folder-projects',
    accent: 'projects',
    parent: 'desktop',
    order: 2,
    emptyText: 'Projects are on their way.',
  },
  {
    kind: 'folder',
    slug: 'experiments',
    title: 'Experiments',
    icon: 'folder-experiments',
    accent: 'experiments',
    parent: 'desktop',
    order: 3,
    emptyText: 'The lab is quiet.',
  },
] as const satisfies readonly FolderItem[];
