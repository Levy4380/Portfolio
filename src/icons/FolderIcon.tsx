import {
  BriefcaseBusiness,
  FlaskConical,
  User,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '../lib/cn';

export type FolderAccent = 'about' | 'projects' | 'experiments';

const accentTabClass: Record<FolderAccent, string> = {
  about: 'fill-moss-600',
  projects: 'fill-rust-500',
  experiments: 'fill-amber-600',
};

const accentGlyph: Record<FolderAccent, LucideIcon> = {
  about: User,
  projects: BriefcaseBusiness,
  experiments: FlaskConical,
};

export interface FolderIconProps {
  accent: FolderAccent;
  /** When the folder window is open and visible, the front panel tilts open. */
  open?: boolean;
  className?: string;
}

export function FolderIcon({ accent, open = false, className }: FolderIconProps) {
  const Glyph = accentGlyph[accent];

  return (
    <svg
      viewBox="0 0 48 48"
      width={48}
      height={48}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      {/* Back panel with left tab */}
      <path
        className="fill-paper-400"
        d="M8 7h12l2 3h20a2 2 0 012 2v27a3 3 0 01-3 3H9a3 3 0 01-3-3V10a3 3 0 013-3z"
      />

      {/* Front panel */}
      <g transform={open ? 'rotate(-8 8 42)' : undefined}>
        <rect
          x={8}
          y={14}
          width={34}
          height={28}
          rx={2}
          className="fill-paper-100 stroke-ink-900/15"
          strokeWidth={1}
        />
        <rect
          x={10}
          y={16}
          width={12}
          height={4}
          rx={1}
          className={accentTabClass[accent]}
        />
        <g className="text-ink-600" transform="translate(15 23)">
          <Glyph size={18} strokeWidth={1.75} aria-hidden />
        </g>
      </g>
    </svg>
  );
}
