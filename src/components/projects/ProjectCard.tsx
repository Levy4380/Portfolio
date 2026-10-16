import type { Openable } from '../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import type { ImageAsset } from '../../content/types.ts';
import type { WindowId } from '../../os/state/StateHelpers/types.ts';
import { useWindowActions } from '../../os/state/StateHelpers/useWindowActions.ts';
import { TechList } from '../ui/TechList.tsx';
import { ProjectVisual } from './ProjectVisual.tsx';

type ProjectCardProps = {
  file: Openable;
  category: string;
  summary?: string;
  technologies: readonly string[];
  cover?: ImageAsset;
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
  cover,
  originId,
}: ProjectCardProps) {
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-tile border border-line bg-window transition-colors duration-(--duration-fast) focus-within:bg-sunken hover:bg-sunken">
      <ProjectVisual label={category} cover={cover} crop={cover !== undefined} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-meta font-medium tracking-wide text-accent uppercase">{category}</p>
        <div>
          <h5 className="text-heading font-semibold text-fg">
            <button
              type="button"
              className="text-left after:absolute after:inset-0 after:rounded-tile focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
              onClick={() =>
                openContent(file, originId !== undefined ? { originId } : undefined)
              }
            >
              {translation(file.title)}
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
