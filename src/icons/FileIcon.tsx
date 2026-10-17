import { Briefcase, Code, Mail, User, type LucideIcon } from 'lucide-react';

import { cn } from '../lib/cn';

export type FileKind = 'project' | 'experiment' | 'profile' | 'system';

/** Symbol drawn on the sheet so a file's contents read before it opens. */
export type FileBadge = 'user' | 'briefcase' | 'code' | 'mail';

const badgeGlyph: Record<FileBadge, LucideIcon> = {
  user: User,
  briefcase: Briefcase,
  code: Code,
  mail: Mail,
};

const foldClass: Record<FileKind, string> = {
  project: 'fill-rust-500',
  experiment: 'fill-amber-600',
  profile: 'fill-moss-600',
  system: 'fill-ink-400',
};

export interface FileIconProps {
  kind: FileKind;
  badge?: FileBadge;
  className?: string;
  size?: number;
}

/**
 * Document sheet. Dark theme keeps the paper fill. Light theme drops the
 * white fill and draws the page in ink, except on the desktop, where the
 * wallpaper stays dark and the paper sheet still reads.
 */
export function FileIcon({ kind, badge, className, size = 48 }: FileIconProps) {
  const Mark = badge ? badgeGlyph[badge] : null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 56"
      width={size}
      height={size}
      className={cn('file-icon block shrink-0', className)}
      aria-hidden
    >
      <path
        className="file-sheet"
        d="M10 4h18.5L40 15.5V48a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
      />
      <path className={cn('file-fold', foldClass[kind])} d="M28.5 4 40 15.5H32a3.5 3.5 0 0 1-3.5-3.5z" />
      {Mark ? (
        <Mark
          x={14}
          y={24}
          width={20}
          height={20}
          strokeWidth={2}
          className="file-mark"
          aria-hidden
        />
      ) : (
        <g className="file-lines" fill="none" strokeLinecap="round">
          <path d="M14 24h20" />
          <path d="M14 30h20" />
          <path d="M14 36h14" />
        </g>
      )}
    </svg>
  );
}
