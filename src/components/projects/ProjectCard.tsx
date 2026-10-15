import { keyOf } from '../../content/registry.ts';
import type { ProjectItem } from '../../content/types.ts';
import type { WindowId } from '../../os/state/types.ts';
import { useWindowActions } from '../../os/state/useWindowActions.ts';
import { TechList } from '../ui/TechList.tsx';
import { ProjectVisual } from './ProjectVisual.tsx';

type ProjectCardProps = {
  item: ProjectItem;
  /** Window that hosts the card, so the opened project can sit beside it. */
  originId?: WindowId;
};

/**
 * One activation target: the title is a button whose pseudo-element covers
 * the card. Opening the project is a window action, not navigation by link.
 */
export function ProjectCard({ item, originId }: ProjectCardProps) {
  const { openContent } = useWindowActions();

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-tile border border-line bg-window transition-colors duration-(--duration-fast) focus-within:bg-sunken hover:bg-sunken">
      <ProjectVisual item={item} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-meta font-medium tracking-wide text-accent uppercase">
          {item.category}
        </p>
        <div>
          <h5 className="font-display text-heading text-fg">
            <button
              type="button"
              className="text-left after:absolute after:inset-0 after:rounded-tile focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
              onClick={() =>
                openContent(
                  keyOf(item),
                  originId !== undefined ? { originId } : undefined,
                )
              }
            >
              {item.title}
            </button>
          </h5>
          {item.summary ? (
            <p className="mt-1 text-ui text-fg-muted">{item.summary}</p>
          ) : null}
        </div>
        <div className="mt-auto">
          <TechList items={item.technologies} />
        </div>
      </div>
    </article>
  );
}
