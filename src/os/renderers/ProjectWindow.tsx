import { useId } from 'react';

import { ProjectGallery } from '../../components/projects/ProjectGallery.tsx';
import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import type { ProjectItem, ProjectStatus } from '../../content/types.ts';
import type { WindowId } from '../state/types.ts';

interface ProjectWindowProps {
  item: ProjectItem;
  windowId: WindowId;
  isActive: boolean;
}

const statusLabels = {
  live: 'Live',
  'in-progress': 'In progress',
  archived: 'Archived',
} as const satisfies Record<ProjectStatus, string>;

const originLabels = {
  client: 'Client work',
  personal: 'Personal project',
} as const satisfies Record<ProjectItem['origin'], string>;

export default function ProjectWindow({ item }: ProjectWindowProps) {
  const uid = useId();
  const paragraphs = item.description.split('\n\n');
  const hasActions = item.liveUrl !== undefined || item.repositoryUrl !== undefined;
  const meta = [
    item.category,
    originLabels[item.origin],
    item.year !== undefined ? String(item.year) : undefined,
    item.status !== undefined ? statusLabels[item.status] : undefined,
    item.role,
  ].filter((entry): entry is string => entry !== undefined);

  return (
    <div className="flex min-h-full flex-col bg-window text-fg">
      {hasActions ? (
        <div className="flex flex-wrap gap-2 border-b border-line bg-sunken px-4 py-2">
          {item.liveUrl ? (
            <ButtonLink href={item.liveUrl}>Live demo</ButtonLink>
          ) : null}
          {item.repositoryUrl ? (
            <ButtonLink href={item.repositoryUrl} variant="secondary">
              Source
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      <article className="flex flex-col gap-6 p-6">
        <ProjectVisual item={item} />

        <header className="flex max-w-prose flex-col gap-2">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
            {meta.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
          <h3 className="font-display text-display">{item.title}</h3>
          {item.summary ? (
            <p className="text-body text-fg-muted">{item.summary}</p>
          ) : null}
        </header>

        <div className="flex max-w-prose flex-col gap-4">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-body text-fg-muted">
              {paragraph}
            </p>
          ))}
        </div>

        <section className="flex flex-col gap-3" aria-labelledby={`${uid}-tech`}>
          <h4
            id={`${uid}-tech`}
            className="text-meta font-medium tracking-wide text-fg-muted uppercase"
          >
            Technologies
          </h4>
          <TechList items={item.technologies} />
        </section>

        {item.gallery && item.gallery.length > 0 ? (
          <section
            className="flex flex-col gap-3"
            aria-labelledby={`${uid}-gallery`}
          >
            <h4
              id={`${uid}-gallery`}
              className="text-meta font-medium tracking-wide text-fg-muted uppercase"
            >
              Gallery
            </h4>
            <ProjectGallery item={item} />
          </section>
        ) : null}
      </article>
    </div>
  );
}
