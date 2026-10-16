import { FileShortcut } from '../../os/grid/FileShortcut.tsx';
import { FolderIconGrid } from '../../os/grid/IconGrid.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { LayoutStudyFile } from './LayoutStudyFile.tsx';

export const ExperimentsFolder = defineOpenable(
  {
    id: 'folder:experiments',
    path: '/folder/experiments',
    title: 'Experiments',
    preset: 'folder',
    emptyText: 'The lab is quiet.',
    icon: { glyph: 'folder', accent: 'experiments' },
  },
  function ExperimentsBody({ windowId }) {
    return (
      <FolderChrome folder={ExperimentsFolder} windowId={windowId}>
        <FolderIconGrid ariaLabel={`${ExperimentsFolder.title} contents`} className="flex-1 p-3">
          <FileShortcut file={LayoutStudyFile} />
        </FolderIconGrid>
      </FolderChrome>
    );
  },
);
