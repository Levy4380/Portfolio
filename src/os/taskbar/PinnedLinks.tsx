import { getContent } from '../../content/registry.ts';
import { startMenu } from '../../content/startMenu.ts';
import type { LinkItem } from '../../content/types.ts';
import { iconMap } from '../../icons/iconMap.ts';

// The same links the Start menu lists, so the two can never drift apart.
const pinned: readonly LinkItem[] = startMenu
  .flatMap((group) => group.items)
  .map((key) => getContent(key))
  .filter((item): item is LinkItem => item?.kind === 'link');

/** 40×40 icon links. Always external, never windows. The caller hides this below `md`. */
export function PinnedLinks() {
  return (
    <ul aria-label="Pinned links" className="flex items-center gap-1">
      {pinned.map((link) => {
        const Icon = iconMap[link.icon];
        return (
          <li key={link.slug}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.title} (opens in a new tab)`}
              title={link.title}
              className="grid size-10 place-items-center rounded-control text-fg-inverse transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover active:scale-97 active:bg-glass-active motion-reduce:active:scale-100"
            >
              <Icon className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
