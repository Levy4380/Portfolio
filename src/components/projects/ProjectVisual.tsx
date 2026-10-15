import type { ExperimentItem, ProjectItem } from '../../content/types.ts';

type ProjectVisualProps = {
  item: ProjectItem | ExperimentItem;
  /** Opened by deep link: load the cover first instead of lazily. */
  priority?: boolean;
};

function labelFor(item: ProjectItem | ExperimentItem): string {
  return item.kind === 'project' ? item.category : 'Experiment';
}

/** Cover image, or a typographic placeholder. Never a broken image. */
export function ProjectVisual({ item, priority = false }: ProjectVisualProps) {
  const { cover } = item;

  if (cover) {
    return (
      <img
        src={cover.src}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className="h-auto w-full"
      />
    );
  }

  return (
    <div
      className="flex aspect-[16/10] items-end bg-sunken p-4"
      aria-hidden="true"
    >
      <span className="font-display text-title text-fg-muted">
        {labelFor(item)}
      </span>
    </div>
  );
}
