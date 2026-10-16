import { FileIcon } from '../icons/FileIcon.tsx';
import { FolderIcon } from '../icons/FolderIcon.tsx';
import type { ShellIcon } from './catalog.ts';

/** Taskbar, start menu, and folder sidebar glyph. Shortcuts draw their own. */
export function ShellGlyph({
  icon,
  className,
}: {
  icon: ShellIcon;
  className?: string;
}) {
  if (icon.glyph === 'folder') {
    return <FolderIcon accent={icon.accent} className={className} />;
  }
  return <FileIcon kind={icon.kind} className={className} />;
}
