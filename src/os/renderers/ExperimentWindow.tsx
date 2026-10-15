import {
  Suspense,
  lazy,
  useId,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import type { ExperimentItem } from '../../content/types.ts';
import type { WindowId } from '../state/types.ts';

interface ExperimentWindowProps {
  item: ExperimentItem;
  windowId: WindowId;
  isActive: boolean;
}

const statusLabels = {
  'in-progress': 'In progress',
  archived: 'Archived',
} as const satisfies Record<NonNullable<ExperimentItem['status']>, string>;

export default function ExperimentWindow({ item }: ExperimentWindowProps) {
  const uid = useId();
  // The demo chunk is only requested after "Run": `lazy` is created on press.
  const [Demo, setDemo] = useState<LazyExoticComponent<ComponentType> | null>(null);
  const paragraphs = item.description.split('\n\n');
  const meta = [
    'Experiment',
    item.year !== undefined ? String(item.year) : undefined,
    item.status !== undefined ? statusLabels[item.status] : undefined,
  ].filter((entry): entry is string => entry !== undefined);

  const { demo } = item;

  return (
    <div className="flex min-h-full flex-col bg-window text-fg">
      {item.repositoryUrl ? (
        <div className="flex flex-wrap gap-2 border-b border-line bg-sunken px-4 py-2">
          <ButtonLink href={item.repositoryUrl} variant="secondary">
            Source
          </ButtonLink>
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

        <section
          className="flex flex-col gap-3"
          aria-labelledby={`${uid}-tech`}
        >
          <h4
            id={`${uid}-tech`}
            className="text-meta font-medium tracking-wide text-fg-muted uppercase"
          >
            Technologies
          </h4>
          <TechList items={item.technologies} />
        </section>

        {demo ? (
          <section
            className="flex flex-col gap-3"
            aria-labelledby={`${uid}-demo`}
          >
            <h4
              id={`${uid}-demo`}
              className="text-meta font-medium tracking-wide text-fg-muted uppercase"
            >
              Demo
            </h4>
            {Demo === null ? (
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink
                  onClick={() => {
                    setDemo(() => lazy(demo));
                  }}
                >
                  Run demo
                </ButtonLink>
                <p className="text-ui text-fg-muted">
                  Loads on demand. Nothing runs until you press Run.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-tile border border-line bg-sunken p-4">
                  <Suspense
                    fallback={
                      <p role="status" className="text-ui text-fg-muted">
                        Loading demo…
                      </p>
                    }
                  >
                    <Demo />
                  </Suspense>
                </div>
                <div>
                  <ButtonLink
                    variant="secondary"
                    onClick={() => {
                      setDemo(null);
                    }}
                  >
                    Stop demo
                  </ButtonLink>
                </div>
              </>
            )}
          </section>
        ) : null}
      </article>
    </div>
  );
}
