import type { Ref } from 'react';

import { getChildren } from '../../content/registry.ts';
import type { ContentItem } from '../../content/types.ts';
import { IconGrid, type IconGridHandle } from '../grid/IconGrid.tsx';
import { useWindowActions } from '../state/useWindowActions.ts';

const desktopItems: readonly ContentItem[] = Object.freeze(
  getChildren('desktop').filter((item) => item.kind !== 'link'),
);

export function DesktopIcons({
  clearSelectionRef,
}: {
  clearSelectionRef?: Ref<IconGridHandle | null>;
}) {
  const { openContent } = useWindowActions();

  return (
    <div data-surface="dark" className="pointer-events-none relative z-10 h-full overflow-y-auto">
      <IconGrid
        ref={clearSelectionRef}
        items={desktopItems}
        variant="desktop"
        ariaLabel="Desktop"
        onOpen={openContent}
        className="pointer-events-none *:pointer-events-auto"
      />
    </div>
  );
}
