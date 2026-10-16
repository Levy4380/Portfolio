import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';

export const OperationsDeskFile = defineOpenable(
  {
    id: 'project:operations-desk',
    path: '/projects/operations-desk',
    title: 'Operations desk',
    preset: 'document',
    fileName: 'operations-desk.app',
    summary: 'An internal web application example for everyday operational tasks.',
    icon: { glyph: 'file', kind: 'project' },
  },
  function OperationsDeskFile() {
    return (
      <div className="flex min-h-full flex-col bg-window text-fg">
        <div className="flex flex-wrap gap-2 border-b border-line bg-sunken px-4 py-2">
          <ButtonLink href="https://example.com">Live demo</ButtonLink>
          <ButtonLink href="https://github.com/your-username/operations-desk" variant="secondary">
            Source
          </ButtonLink>
        </div>
        <article className="flex flex-col gap-6 p-6">
          <ProjectVisual label="Web application" />
          <header className="flex max-w-prose flex-col gap-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
              <li>Web application</li>
              <li>Client work</li>
              <li>Live</li>
            </ul>
            <h3 className="font-display text-display">Operations desk</h3>
            <p className="text-body text-fg-muted">
              An internal web application example for everyday operational tasks.
            </p>
          </header>
          <div className="flex max-w-prose flex-col gap-4">
            <p className="text-body text-fg-muted">
              Replace this with a real application you have built or maintained. The placeholder
              represents a staff-facing tool: a list of work, a detail view, and a small set of
              actions backed by an API.
            </p>
            <p className="text-body text-fg-muted">
              Keep the description concrete and leave out metrics you do not have. Wire liveUrl
              and repositoryUrl only when those destinations are real.
            </p>
          </div>
          <section className="flex flex-col gap-3" aria-label="Technologies">
            <h4 className="text-meta font-medium tracking-wide text-fg-muted uppercase">
              Technologies
            </h4>
            <TechList items={['React', 'TypeScript', 'Laravel']} />
          </section>
        </article>
      </div>
    );
  },
);
