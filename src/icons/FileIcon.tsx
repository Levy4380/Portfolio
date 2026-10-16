import textGenericUrl from './text-x-generic.svg';
import officeDocumentUrl from './x-office-document.svg';

import { cn } from '../lib/cn';

export type FileKind = 'project' | 'experiment' | 'profile' | 'system';

const kindSrc: Record<FileKind, string> = {
  profile: textGenericUrl,
  project: officeDocumentUrl,
  experiment: officeDocumentUrl,
  system: officeDocumentUrl,
};

export interface FileIconProps {
  kind: FileKind;
  className?: string;
}

export function FileIcon({ kind, className }: FileIconProps) {
  return (
    <img
      src={kindSrc[kind]}
      alt=""
      width={48}
      height={48}
      draggable={false}
      className={cn('block shrink-0', className)}
      aria-hidden
    />
  );
}
