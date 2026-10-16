import { FileShortcut } from '../../os/grid/FileShortcut.tsx';
import { FolderIconGrid } from '../../os/grid/IconGrid.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { CatalogStorefrontFile } from './CatalogStorefrontFile.tsx';
import { OperationsDeskFile } from './OperationsDeskFile.tsx';

export const ProjectsFolder = defineOpenable(
  {
    id: 'folder:projects',
    path: '/folder/projects',
    title: 'Projects',
    preset: 'folder',
    emptyText: 'Projects are on their way.',
    icon: { glyph: 'folder', accent: 'projects' },
  },
  function ProjectsBody({ windowId }) {
    return (
      <FolderChrome folder={ProjectsFolder} windowId={windowId}>
        <FolderIconGrid ariaLabel={`${ProjectsFolder.title} contents`} className="flex-1 p-3">
          <FileShortcut file={CatalogStorefrontFile} />
          <FileShortcut file={OperationsDeskFile} />
        </FolderIconGrid>
      </FolderChrome>
    );
  },
);
