import { FileShortcut } from '../../os/grid/FileShortcut.tsx';
import { FolderIconGrid } from '../../os/grid/IconGrid.tsx';
import { defineOpenable } from '../catalog.ts';
import { FolderChrome } from '../FolderChrome.tsx';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';
import { ContactFile } from './ContactFile.tsx';
import { ExperienceFile } from './ExperienceFile.tsx';
import { ProfileFile } from './ProfileFile.tsx';
import { SkillsFile } from './SkillsFile.tsx';

export const AboutMeFolder = defineOpenable(
  {
    id: 'folder:about',
    path: '/folder/about',
    title: 'aboutme.foldername',
    preset: 'folder',
    emptyText: 'aboutme.empty',
    icon: { glyph: 'folder', accent: 'about' },
  },
  function AboutMeBody({ windowId }) {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <FolderChrome folder={AboutMeFolder} windowId={windowId}>
        <FolderIconGrid
          ariaLabel={`${translation('aboutme.foldername')} ${translation('os.contents')}`}
          className="flex-1 p-3"
        >
          <FileShortcut file={ProfileFile} />
          <FileShortcut file={ExperienceFile} />
          <FileShortcut file={SkillsFile} />
          <FileShortcut file={ContactFile} />
        </FolderIconGrid>
      </FolderChrome>
    );
  },
);
