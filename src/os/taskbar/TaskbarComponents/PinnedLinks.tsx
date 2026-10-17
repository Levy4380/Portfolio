import { Folder, User } from 'lucide-react';

import { AboutMeFolder } from '../../../content/about/AboutMeFolder.tsx';
import { ProfileFile } from '../../../content/about/ProfileFile.tsx';
import type { Openable } from '../../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { cn } from '../../../lib/cn.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';

const pinned: readonly { target: Openable; Icon: typeof User }[] = [
  { target: ProfileFile, Icon: User },
  { target: AboutMeFolder, Icon: Folder },
];

/** Fixed-width icon buttons. The name sits above the bar so the row never shifts. */
const pinClass =
  'group relative grid size-10 place-items-center rounded-control text-fg-inverse transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover focus-visible:bg-glass-hover active:scale-97 active:bg-glass-active motion-reduce:active:scale-100';

const markClass =
  'size-5 shrink-0 transition-transform duration-base ease-os-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:scale-100 motion-reduce:transition-none';

export function PinnedLinks() {
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <ul aria-label={translation('os.pinnedLinks')} className="flex items-center gap-1">
      {pinned.map(({ target, Icon }) => (
        <li key={target.id}>
          <button
            type="button"
            aria-label={translation(target.title)}
            onClick={() => openContent(target)}
            className={pinClass}
          >
            <Icon aria-hidden className={markClass} />
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-[calc(100%+0.375rem)] left-1/2 z-10 -translate-x-1/2',
                'rounded-control bg-menu-solid px-2 py-1 text-label font-medium whitespace-nowrap text-fg-inverse shadow-menu',
                'opacity-0 transition-opacity duration-120 motion-reduce:transition-none',
                'group-hover:opacity-100 group-hover:delay-200',
                'group-focus-visible:opacity-100 group-focus-visible:delay-0',
              )}
            >
              {translation(target.title)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
