import type { Ref } from 'react';

import { FolderShortcut } from '../os/grid/FolderShortcut.tsx';
import { DesktopGrid, type IconGridHandle } from '../os/grid/IconGrid.tsx';
import { AboutMeFolder } from './about/AboutMeFolder.tsx';
import { setDesktopFolders } from './catalog.ts';
import { ExperimentsFolder } from './experiments/ExperimentsFolder.tsx';
import { ProjectsFolder } from './projects/ProjectsFolder.tsx';

setDesktopFolders([AboutMeFolder, ProjectsFolder, ExperimentsFolder]);

export function Desktop({
  clearSelectionRef,
}: {
  clearSelectionRef?: Ref<IconGridHandle | null>;
}) {
  return (
    <div className="pointer-events-none relative z-10 h-full overflow-y-auto">
      <DesktopGrid
        ref={clearSelectionRef}
        ariaLabel="Desktop"
        className="pointer-events-none *:pointer-events-auto"
      >
        <FolderShortcut folder={AboutMeFolder} />
        <FolderShortcut folder={ProjectsFolder} />
        <FolderShortcut folder={ExperimentsFolder} />
      </DesktopGrid>
    </div>
  );
}
