import type { ExperimentItem } from './types.ts';

export const experiments = [
  {
    kind: 'experiment',
    slug: 'layout-study',
    title: 'Layout study',
    fileName: 'layout-study.lab',
    summary:
      'A small experimental interface focused on type, spacing, and motion.',
    icon: 'file-experiment',
    parent: 'folder:experiments',
    order: 1,
    description:
      'Replace this with an experiment or side project. It exists to show a third kind of work: a frontend study that is not a store and not a business application.\n\nUse the cover field for frames of the study. Until then, the window shows a placeholder instead of a broken image.',
    technologies: ['React', 'TypeScript', 'CSS'],
    status: 'in-progress',
  },
] as const satisfies readonly ExperimentItem[];
