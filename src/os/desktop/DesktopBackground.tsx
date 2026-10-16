import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';

const GRAIN_SVG =
  "after:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")]";

export function DesktopBackground({ onClearSelection }: { onClearSelection?: () => void }) {
  const { blurAll } = useWindowActions();

  return (
    <div
      onPointerDown={() => {
        onClearSelection?.();
        blurAll();
      }}
      className={`bg-wallpaper absolute inset-0 select-none after:pointer-events-none after:absolute after:inset-0 after:opacity-6 after:mix-blend-overlay ${GRAIN_SVG}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-3 hidden font-mono text-meta text-fg-inverse-muted md:block"
      >
        tomaslevy@portfolio ~ v1
      </span>
    </div>
  );
}
