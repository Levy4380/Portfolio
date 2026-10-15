import type { ProjectItem } from './types.ts';

export const projects = [
  {
    kind: 'project',
    slug: 'catalog-storefront',
    title: 'Catalog storefront',
    fileName: 'catalog-storefront.site',
    summary:
      'A product listing, product page, and cart sketched as an e-commerce example.',
    icon: 'file-project',
    parent: 'folder:projects',
    order: 1,
    origin: 'client',
    category: 'E-commerce',
    description:
      'Replace this with the story of a real storefront. The example stands in for catalog browsing, a product detail view, and a cart — the kind of Shopify work this portfolio is meant to show.\n\nThere is no client, launch date, or traffic figure attached to it. Add screenshots by setting cover and gallery once the assets exist.',
    technologies: ['React', 'Shopify', 'Liquid', 'Tailwind CSS'],
    status: 'live',
    featured: true,
    liveUrl: 'https://example.com',
    repositoryUrl: 'https://github.com/your-username/catalog-storefront',
  },
  {
    kind: 'project',
    slug: 'operations-desk',
    title: 'Operations desk',
    fileName: 'operations-desk.app',
    summary:
      'An internal web application example for everyday operational tasks.',
    icon: 'file-project',
    parent: 'folder:projects',
    order: 2,
    origin: 'client',
    category: 'Web application',
    description:
      'Replace this with a real application you have built or maintained. The placeholder represents a staff-facing tool: a list of work, a detail view, and a small set of actions backed by an API.\n\nKeep the description concrete and leave out metrics you do not have. Wire liveUrl and repositoryUrl only when those destinations are real.',
    technologies: ['React', 'TypeScript', 'Laravel'],
    status: 'live',
    featured: true,
    liveUrl: 'https://example.com',
    repositoryUrl: 'https://github.com/your-username/operations-desk',
  },
] as const satisfies readonly ProjectItem[];
