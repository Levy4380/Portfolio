import type { Openable } from '../../content/catalog.ts';
import type { WindowId } from '../../os/state/StateHelpers/types.ts';
import { useWindowActions } from '../../os/state/StateHelpers/useWindowActions.ts';
import { TechList } from '../ui/TechList.tsx';
import { ProjectVisual } from './ProjectVisual.tsx';

type ProjectCardProps = {
  file: Openable;
  category: string;
  summary?: string;
  technologies: readonly string[];
  originId?: WindowId;
};

/**
 * One activation target: the title is a button whose pseudo-element covers
 * the card. Opening the project is a window action, not navigation by link.
 */
export function ProjectCard({
  file,
  category,
  summary,
  technologies,
  originId,
}: ProjectCardProps) {
  const { openContent } = useWindowActions();

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-tile border border-line bg-window transition-colors duration-(--duration-fast) focus-within:bg-sunken hover:bg-sunken">
      <ProjectVisual label={category} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-meta font-medium tracking-wide text-accent uppercase">{category}</p>
        <div>
          <h5 className="font-display text-heading text-fg">
            <button
              type="button"
              className="text-left after:absolute after:inset-0 after:rounded-tile focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
              onClick={() =>
                openContent(file, originId !== undefined ? { originId } : undefined)
              }
            >
              {file.title}
            </button>
          </h5>
          {summary ? <p className="mt-1 text-ui text-fg-muted">{summary}</p> : null}
        </div>
        <div className="mt-auto">
          <TechList items={technologies} />
        </div>
      </div>
    </article>
  );
}
