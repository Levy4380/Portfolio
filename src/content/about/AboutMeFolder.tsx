import { FileShortcut } from '../../os/grid/FileShortcut.tsx';
import { FolderIconGrid } from '../../os/grid/IconGrid.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { ContactFile } from './ContactFile.tsx';
import { ExperienceFile } from './ExperienceFile.tsx';
import { ProfileFile } from './ProfileFile.tsx';
import { SkillsFile } from './SkillsFile.tsx';

export const AboutMeFolder = defineOpenable(
  {
    id: 'folder:about',
    path: '/folder/about',
    title: 'About Me',
    preset: 'folder',
    emptyText: 'Nothing here yet.',
    icon: { glyph: 'folder', accent: 'about' },
  },
  function AboutMeBody({ windowId }) {
    return (
      <FolderChrome folder={AboutMeFolder} windowId={windowId}>
        <FolderIconGrid ariaLabel={`${AboutMeFolder.title} contents`} className="flex-1 p-3">
          <FileShortcut file={ProfileFile} />
          <FileShortcut file={ExperienceFile} />
          <FileShortcut file={SkillsFile} />
          <FileShortcut file={ContactFile} />
        </FolderIconGrid>
      </FolderChrome>
    );
  },
);
