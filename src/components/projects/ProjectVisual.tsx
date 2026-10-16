import type { ImageAsset } from '../../content/types.ts';

type ProjectVisualProps = {
  label: string;
  cover?: ImageAsset;
  priority?: boolean;
};

/** Cover image, or a typographic placeholder. Never a broken image. */
export function ProjectVisual({ label, cover, priority = false }: ProjectVisualProps) {
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
    <div className="flex aspect-[16/10] items-end bg-sunken p-4" aria-hidden="true">
      <span className="font-display text-title text-fg-muted">{label}</span>
    </div>
  );
}
