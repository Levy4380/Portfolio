import {
  AppWindow,
  FileQuestionMark,
  FileText,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import { useId } from 'react';

import type { ImageAsset } from '../content/types';
import { cn } from '../lib/cn';

export type FileKind = 'project' | 'experiment' | 'profile' | 'system';

const kindGlyph: Record<FileKind, LucideIcon> = {
  project: AppWindow,
  experiment: FlaskConical,
  profile: FileText,
  system: FileQuestionMark,
};

const foldClass: Record<FileKind, string> = {
  project: 'fill-rust-500',
  experiment: 'fill-amber-600',
  profile: 'fill-moss-600',
  system: 'fill-ink-400',
};

/** 40×48 document silhouette with a 10px folded corner (in 48×48 space). */
const SHEET_PATH =
  'M4 0h26l10 10v38a2 2 0 01-2 2H6a2 2 0 01-2-2V2a2 2 0 012-2z';

const FOLD_PATH = 'M30 0h10v10L30 0z';

export interface FileIconProps {
  kind: FileKind;
  /** Optional cover thumbnail inside the sheet silhouette. */
  cover?: ImageAsset;
  className?: string;
}

export function FileIcon({ kind, cover, className }: FileIconProps) {
  const clipId = useId();
  const Glyph = kindGlyph[kind];

  return (
    <svg
      viewBox="0 0 48 48"
      width={48}
      height={48}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SHEET_PATH} />
        </clipPath>
      </defs>

      {cover ? (
        <image
          href={cover.src}
          x={4}
          y={0}
          width={40}
          height={48}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <path d={SHEET_PATH} className="fill-paper-50 stroke-ink-900/15" strokeWidth={1} />
      )}

      {cover ? (
        <path
          d={SHEET_PATH}
          className="fill-none stroke-ink-900/15"
          strokeWidth={1}
        />
      ) : null}

      <path d={FOLD_PATH} className={foldClass[kind]} />

      {!cover ? (
        <g className="text-ink-600" transform="translate(16 20)">
          <Glyph size={16} strokeWidth={1.75} aria-hidden />
        </g>
      ) : null}
    </svg>
  );
}
