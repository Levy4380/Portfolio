import { useContext } from 'react';

import type { Openable } from '../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import { FileIcon, type FileBadge, type FileKind } from '../../icons/FileIcon.tsx';
import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';
import { IconTile } from './GridComponents/IconTile.tsx';
import { useIconGrid } from './iconGridContext.tsx';
import { OpenOriginContext } from './OpenOrigin.tsx';

export function FileShortcut({
  file,
  index = 0,
  size = 48,
}: {
  file: Openable;
  index?: number;
  size?: number;
}) {
  const grid = useIconGrid();
  const originId = useContext(OpenOriginContext);
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const kind: FileKind = file.icon.glyph === 'file' ? file.icon.kind : 'profile';
  const badge: FileBadge | undefined = file.icon.glyph === 'file' ? file.icon.badge : undefined;

  const open = () => {
    openContent(file, originId !== undefined ? { originId } : undefined);
  };

  return (
    <IconTile
      id={file.id}
      title={translation(file.title)}
      fileName={file.fileName}
      icon={<FileIcon kind={kind} badge={badge} size={size} />}
      variant={grid.variant}
      selected={grid.selectedId === file.id}
      tabIndex={index === grid.activeIndex ? 0 : -1}
      describedBy={grid.hintId}
      onSelect={() => grid.select(file.id)}
      onOpen={open}
      onFocusItem={() => grid.focusIndex(index)}
    />
  );
}
