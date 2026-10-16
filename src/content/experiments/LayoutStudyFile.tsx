import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';

export const LayoutStudyFile = defineOpenable(
  {
    id: 'experiment:layout-study',
    path: '/experiments/layout-study',
    title: 'Layout study',
    preset: 'document',
    fileName: 'layout-study.lab',
    summary: 'A small experimental interface focused on type, spacing, and motion.',
    icon: { glyph: 'file', kind: 'experiment' },
  },
  function LayoutStudyFile() {
    return (
      <div className="flex min-h-full flex-col bg-window text-fg">
        <article className="flex flex-col gap-6 p-6">
          <ProjectVisual label="Experiment" />
          <header className="flex max-w-prose flex-col gap-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
              <li>Experiment</li>
              <li>In progress</li>
            </ul>
            <h3 className="font-display text-display">Layout study</h3>
            <p className="text-body text-fg-muted">
              A small experimental interface focused on type, spacing, and motion.
            </p>
          </header>
          <div className="flex max-w-prose flex-col gap-4">
            <p className="text-body text-fg-muted">
              Replace this with an experiment or side project. It exists to show a third kind of
              work: a frontend study that is not a store and not a business application.
            </p>
            <p className="text-body text-fg-muted">
              Use the cover field for frames of the study. Until then, the window shows a
              placeholder instead of a broken image.
            </p>
          </div>
          <section className="flex flex-col gap-3" aria-label="Technologies">
            <h4 className="text-meta font-medium tracking-wide text-fg-muted uppercase">
              Technologies
            </h4>
            <TechList items={['React', 'TypeScript', 'CSS']} />
          </section>
        </article>
      </div>
    );
  },
);
