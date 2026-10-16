import { Send } from 'lucide-react';

import { ContactFile } from '../../../content/about/ContactFile.tsx';
import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { site } from '../../../content/site.ts';
import { GitHubMark, LinkedInMark } from '../../../icons/brand.tsx';
import { cn } from '../../../lib/cn.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';

const pinned = [
  { title: 'os.github', caption: 'os.myGithub', href: site.githubUrl, Mark: GitHubMark },
  { title: 'os.linkedin', caption: 'os.myLinkedin', href: site.linkedinUrl, Mark: LinkedInMark },
] as const;

/** Icon buttons that reveal a caption on hover and keyboard focus. */
const pinClass =
  'group flex h-10 items-center rounded-control px-2.5 text-fg-inverse transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover focus-visible:bg-glass-hover active:scale-97 active:bg-glass-active motion-reduce:active:scale-100';

const markClass =
  'size-5 shrink-0 transition-transform duration-base ease-os-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:scale-100 motion-reduce:transition-none';

export function PinnedLinks() {
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <ul aria-label={translation('os.pinnedLinks')} className="flex items-center gap-1">
      {pinned.map((link) => (
        <li key={link.title}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${translation(link.caption)} ${translation('os.opensInNewTab')}`}
            className={pinClass}
          >
            <link.Mark className={markClass} />
            <span
              className={cn(
                'grid grid-cols-[0fr] transition-[grid-template-columns] duration-slow ease-os-out motion-reduce:transition-none',
                'group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]',
              )}
            >
              <span className="min-w-0 overflow-hidden">
                <span
                  aria-hidden
                  className="block whitespace-nowrap pl-2 text-label font-medium opacity-0 transition-opacity duration-base ease-os-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                >
                  {translation(link.caption)}
                </span>
              </span>
            </span>
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          aria-label={translation('os.contactMe')}
          onClick={() => openContent(ContactFile)}
          className={pinClass}
        >
          <Send aria-hidden className={markClass} />
          <span
            className={cn(
              'grid grid-cols-[0fr] transition-[grid-template-columns] duration-slow ease-os-out motion-reduce:transition-none',
              'group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]',
            )}
          >
            <span className="min-w-0 overflow-hidden">
              <span
                aria-hidden
                className="block whitespace-nowrap pl-2 text-label font-medium opacity-0 transition-opacity duration-base ease-os-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {translation('os.contactMe')}
              </span>
            </span>
          </span>
        </button>
      </li>
    </ul>
  );
}
