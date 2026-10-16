import type { ContentKey } from './types.ts';

export const startMenu = [
  {
    label: 'Places',
    items: ['folder:about', 'folder:projects', 'folder:experiments'],
  },
  {
    label: 'Elsewhere',
    items: ['link:github', 'link:linkedin'],
  },
] as const satisfies readonly { label: string; items: readonly ContentKey[] }[];
