import type { ProjectItem } from '../../content/types.ts';

type ProjectGalleryProps = {
  item: ProjectItem;
};

export function ProjectGallery({ item }: ProjectGalleryProps) {
  const frames = item.gallery ?? [];

  if (frames.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-tile border border-dashed border-line bg-sunken px-6">
        <p className="max-w-sm text-center text-ui text-fg-muted">
          Screenshot placeholder. Add a gallery in the project content.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {frames.map((frame) => (
        <li
          key={frame.src}
          className="overflow-hidden rounded-tile border border-line"
        >
          <img
            src={frame.src}
            alt={frame.alt}
            width={frame.width}
            height={frame.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </li>
      ))}
    </ul>
  );
}
