import type { Language } from '../../content/i18n/useTranslation.ts';

/** Small painted flags. SVG only, so they render the same on Windows. */
export function LanguageFlag({ code }: { code: Language }) {
  return (
    <span className="inline-flex h-3 w-4 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/30">
      {code === 'en' ? <EnglishFlag /> : <SpanishFlag />}
    </span>
  );
}

function EnglishFlag() {
  return (
    <svg viewBox="0 0 16 12" className="h-full w-full" aria-hidden>
      <rect width="16" height="12" fill="#b22234" />
      <g fill="#fff">
        <rect y="0.92" width="16" height="0.92" />
        <rect y="2.77" width="16" height="0.92" />
        <rect y="4.62" width="16" height="0.92" />
        <rect y="6.46" width="16" height="0.92" />
        <rect y="8.31" width="16" height="0.92" />
        <rect y="10.15" width="16" height="0.92" />
      </g>
      <rect width="7" height="6.46" fill="#3c3b6e" />
    </svg>
  );
}

function SpanishFlag() {
  return (
    <svg viewBox="0 0 16 12" className="h-full w-full" aria-hidden>
      <rect width="16" height="12" fill="#aa151b" />
      <rect y="3" width="16" height="6" fill="#f1bf00" />
    </svg>
  );
}
