import type { ImageAsset } from '../../content/types.ts';

type ProjectGalleryProps = {
  images?: readonly ImageAsset[];
};

export function ProjectGallery({ images = [] }: ProjectGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-tile border border-dashed border-line bg-sunken px-6">
        <p className="max-w-sm text-center text-ui text-fg-muted">
          Screenshot placeholder. Add gallery frames on the project document.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {images.map((frame) => (
        <li key={frame.src} className="overflow-hidden rounded-tile border border-line">
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
