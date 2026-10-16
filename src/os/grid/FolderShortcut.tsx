import { useContext } from 'react';

import type { Openable } from '../../content/catalog.ts';
import { FolderIcon } from '../../icons/FolderIcon.tsx';
import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';
import { IconTile } from './GridComponents/IconTile.tsx';
import { useIconGrid } from './iconGridContext.tsx';
import { OpenOriginContext } from './OpenOrigin.tsx';

export function FolderShortcut({
  folder,
  index = 0,
}: {
  folder: Openable;
  index?: number;
}) {
  const grid = useIconGrid();
  const originId = useContext(OpenOriginContext);
  const { openContent } = useWindowActions();
  const accent = folder.icon.glyph === 'folder' ? folder.icon.accent : 'about';

  const open = () => {
    openContent(folder, originId !== undefined ? { originId } : undefined);
  };

  return (
    <IconTile
      id={folder.id}
      title={folder.title}
      icon={<FolderIcon accent={accent} />}
      variant={grid.variant}
      selected={grid.selectedId === folder.id}
      tabIndex={index === grid.activeIndex ? 0 : -1}
      describedBy={grid.hintId}
      onSelect={() => grid.select(folder.id)}
      onOpen={open}
      onFocusItem={() => grid.focusIndex(index)}
    />
  );
}
