import type { Ref } from 'react';

import { FolderShortcut } from '../os/grid/FolderShortcut.tsx';
import { DesktopGrid, type IconGridHandle } from '../os/grid/IconGrid.tsx';
import { AboutMeFolder } from './about/AboutMeFolder.tsx';
import { setDesktopFolders } from './catalog.ts';
import { ContactWidget } from './ContactWidget.tsx';
import { useLanguage, useTranslation } from './i18n/useTranslation.ts';
import { ExperimentsFolder } from './experiments/ExperimentsFolder.tsx';
import { ProjectsFolder } from './projects/ProjectsFolder.tsx';
import { FileShortcut } from '../os/grid/FileShortcut.tsx';
import { ProfileFile } from './about/ProfileFile.tsx';

setDesktopFolders([AboutMeFolder, ProjectsFolder, ExperimentsFolder]);

export function Desktop({
  clearSelectionRef,
}: {
  clearSelectionRef?: Ref<IconGridHandle | null>;
}) {
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <div className="pointer-events-none relative z-10 flex h-full flex-col gap-4 overflow-y-auto px-4 pt-[calc(var(--os-menubar-h)+env(safe-area-inset-top)+1.5rem)] pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] md:pt-[calc(var(--os-menubar-h)+env(safe-area-inset-top)+1rem)] md:pb-16 lg:flex-row-reverse lg:items-stretch lg:overflow-hidden">
      <ContactWidget />
      <DesktopGrid
        ref={clearSelectionRef}
        ariaLabel={translation('os.desktop')}
        className="pointer-events-none w-full shrink-0 *:pointer-events-auto lg:min-h-0 lg:min-w-0 lg:flex-1"
      >
        <FileShortcut file={ProfileFile} size={96} />
        <FolderShortcut folder={AboutMeFolder} />
        <FolderShortcut folder={ProjectsFolder} />
        <FolderShortcut folder={ExperimentsFolder} />
      </DesktopGrid>
    </div>
  );
}
