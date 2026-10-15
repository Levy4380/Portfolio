import { site } from './site.ts';
import type { LinkItem } from './types.ts';

export const links = [
  {
    kind: 'link',
    slug: 'github',
    title: 'GitHub',
    icon: 'brand-github',
    href: site.githubUrl,
    parent: 'desktop',
  },
  {
    kind: 'link',
    slug: 'linkedin',
    title: 'LinkedIn',
    icon: 'brand-linkedin',
    href: site.linkedinUrl,
    parent: 'desktop',
  },
  {
    kind: 'link',
    slug: 'instagram',
    title: 'Instagram',
    icon: 'brand-instagram',
    href: site.instagramUrl,
    parent: 'desktop',
  },
] as const satisfies readonly LinkItem[];
