import { site } from './site.ts';
import type { ProfileItem } from './types.ts';

export const profileFiles = [
  {
    kind: 'profile',
    slug: 'profile',
    section: 'profile',
    title: 'Profile',
    fileName: 'readme.md',
    icon: 'file-profile',
    parent: 'folder:about',
    order: 1,
  },
  {
    kind: 'profile',
    slug: 'experience',
    section: 'experience',
    title: 'Experience',
    fileName: 'experience.log',
    icon: 'file-profile',
    parent: 'folder:about',
    order: 2,
  },
  {
    kind: 'profile',
    slug: 'skills',
    section: 'skills',
    title: 'Skills',
    fileName: 'skills.json',
    icon: 'file-profile',
    parent: 'folder:about',
    order: 3,
  },
  {
    kind: 'profile',
    slug: 'contact',
    section: 'contact',
    title: 'Contact',
    fileName: 'contact.vcf',
    icon: 'file-profile',
    parent: 'folder:about',
    order: 4,
  },
] as const satisfies readonly ProfileItem[];

/** Profile window hero and introduction (from the former home page). */
export const profileIntro = {
  lede:
    'I build interfaces for web applications and online stores, working across React, Laravel, and Shopify.',
  paragraphs: [
    'The useful work is usually specific: a checkout edge case, an admin screen people use every day, or a theme change that still has to make sense after the next release.',
    'This introduction is a placeholder. Swap it for a short account of the applications you have actually built and maintained.',
  ],
  focus: site.focus,
} as const;

export const experienceEntries = [
  {
    title: 'Frontend development',
    organization: 'Replace with employers or clients',
    period: 'Present',
    body:
      'The useful work is usually specific: a checkout edge case, an admin screen people use every day, or a theme change that still has to make sense after the next release.\n\nThis introduction is a placeholder. Swap it for a short account of the applications you have actually built and maintained.',
  },
] as const;

export const skillGroups = [
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Accessible UI'],
  },
  {
    title: 'Backend',
    items: ['Laravel', 'PHP', 'REST APIs', 'MySQL'],
  },
  {
    title: 'E-commerce',
    items: ['Shopify', 'Liquid', 'Storefronts', 'Checkout flows'],
  },
] as const;

export const skillsIntro = {
  title: 'Tools used in the work',
  description:
    'Grouped so the list stays easy to scan. Edit the data file rather than the markup.',
} as const;

export const contactIntro =
  'For a project or a role, use the email below. GitHub, LinkedIn, and Instagram are the same links configured for the rest of the site.';

export const contactLines = [
  {
    label: 'Email',
    href: `mailto:${site.email}`,
    text: site.email,
  },
  {
    label: 'GitHub',
    href: site.githubUrl,
    text: 'GitHub',
  },
  {
    label: 'LinkedIn',
    href: site.linkedinUrl,
    text: 'LinkedIn',
  },
  {
    label: 'Instagram',
    href: site.instagramUrl,
    text: 'Instagram',
  },
] as const;
