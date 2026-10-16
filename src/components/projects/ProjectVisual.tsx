import type { ImageAsset } from '../../content/types.ts';

type ProjectVisualProps = {
  label: string;
  cover?: ImageAsset;
  priority?: boolean;
  /** Crop to a shared frame on cards. Pages keep the full screenshot. */
  crop?: boolean;
};

/** Cover image, or a typographic placeholder. Never a broken image. */
export function ProjectVisual({ label, cover, priority = false, crop = false }: ProjectVisualProps) {
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
        className={crop ? 'aspect-[8/5] w-full object-cover' : 'h-auto w-full'}
      />
    );
  }

  return (
    <div className="flex aspect-[16/10] items-end bg-sunken p-4" aria-hidden="true">
      <span className="text-title font-semibold text-fg-muted">{label}</span>
    </div>
  );
}
