/* The lazy windows live next to the switch. `renderContent` stays a function, per design.md §6.4. */
/* eslint-disable react-refresh/only-export-components */
import { lazy, type ReactNode } from 'react';

import type { ContentItem, LinkItem } from '../../content/types.ts';
import type { WindowId } from '../state/types.ts';
import { FolderWindow } from './FolderWindow.tsx';
import { NotFoundWindow } from './NotFoundWindow.tsx';

const ProjectWindow = lazy(() => import('./ProjectWindow.tsx'));
const ExperimentWindow = lazy(() => import('./ExperimentWindow.tsx'));
const AboutWindow = lazy(() => import('./AboutWindow.tsx'));

interface RendererContext {
  windowId: WindowId;
  /** Only for presentation tweaks. Renderers never read window manager state for this. */
  isActive: boolean;
}

function assertNever(value: never): never {
  throw new Error(`renderContent: unhandled content ${JSON.stringify(value)}`);
}

export function renderContent(
  item: Exclude<ContentItem, LinkItem>,
  ctx: RendererContext,
): ReactNode {
  switch (item.kind) {
    case 'folder':
      return <FolderWindow item={item} {...ctx} />;
    case 'project':
      return <ProjectWindow item={item} {...ctx} />;
    case 'experiment':
      return <ExperimentWindow item={item} {...ctx} />;
    case 'profile':
      return <AboutWindow item={item} {...ctx} />;
    case 'system':
      return <NotFoundWindow {...ctx} />;
    default:
      return assertNever(item);
  }
}
