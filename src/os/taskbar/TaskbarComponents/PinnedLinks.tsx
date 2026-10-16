import { site } from '../../../content/site.ts';
import { GitHubMark, LinkedInMark } from '../../../icons/brand.tsx';

const pinned = [
  { title: 'GitHub', href: site.githubUrl, Mark: GitHubMark },
  { title: 'LinkedIn', href: site.linkedinUrl, Mark: LinkedInMark },
] as const;

/** 40×40 icon links. Always external, never windows. The caller hides this below `md`. */
export function PinnedLinks() {
  return (
    <ul aria-label="Pinned links" className="flex items-center gap-1">
      {pinned.map((link) => (
        <li key={link.title}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.title} (opens in a new tab)`}
            title={link.title}
            className="grid size-10 place-items-center rounded-control text-fg-inverse transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover active:scale-97 active:bg-glass-active motion-reduce:active:scale-100"
          >
            <link.Mark className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
