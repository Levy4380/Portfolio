import { FileShortcut } from '../../os/grid/FileShortcut.tsx';
import { FolderIconGrid } from '../../os/grid/IconGrid.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';
import { LayoutStudyFile } from './LayoutStudyFile.tsx';

export const ExperimentsFolder = defineOpenable(
  {
    id: 'folder:experiments',
    path: '/folder/experiments',
    title: 'experiments.foldername',
    preset: 'folder',
    emptyText: 'experiments.empty',
    icon: { glyph: 'folder', accent: 'experiments' },
  },
  function ExperimentsBody({ windowId }) {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <FolderChrome folder={ExperimentsFolder} windowId={windowId}>
        <FolderIconGrid
          ariaLabel={`${translation('experiments.foldername')} ${translation('os.contents')}`}
          className="flex-1 p-3"
        >
          <FileShortcut file={LayoutStudyFile} />
        </FolderIconGrid>
      </FolderChrome>
    );
  },
);
