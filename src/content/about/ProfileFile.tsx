import { ProjectCard } from '../../components/projects/ProjectCard.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { useWindowActions } from '../../os/state/StateHelpers/useWindowActions.ts';
import type { ContentId } from '../../os/state/StateHelpers/types.ts';
import { defineOpenable, getOpenable } from '../catalog.ts';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';
import { featuredProjects } from '../projects/cases.tsx';
import { ProjectsFolder } from '../projects/ProjectsFolder.tsx';
import { site } from '../site.ts';

const TONICA_URL = 'https://www.wearetonica.com';

const eyebrow = 'text-meta font-medium tracking-wide text-accent uppercase';
const subheading = 'text-meta font-medium tracking-wide text-fg-muted uppercase';

export const ProfileFile = defineOpenable(
  {
    id: 'profile:profile',
    path: '/about/profile',
    title: 'aboutme.profile.title',
    preset: 'profile',
    fileName: 'readme.md',
    icon: { glyph: 'file', kind: 'profile', badge: 'user' },
  },
  function ProfileFile({ windowId }) {
    const { openContent } = useWindowActions();
    const { language } = useLanguage();
    const translation = useTranslation(language);

    function openRegistered(id: ContentId) {
      const target = getOpenable(id);
      if (!target) return;
      openContent(target, { originId: windowId });
    }

    return (
      <div className="flex min-h-full flex-col gap-6 bg-window px-6 pt-6 text-fg">
        <header className="flex flex-col gap-2">
          <p className={eyebrow}>{translation('site.role')}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-display font-semibold">{site.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <ButtonLink variant="secondary" onClick={() => openRegistered('folder:about')}>
                {translation('aboutme.profile.seeMore')}
              </ButtonLink>
              <ButtonLink onClick={() => openRegistered('profile:contact')}>
                {translation('aboutme.profile.contact')}
              </ButtonLink>
            </div>
          </div>
          <p className="max-w-prose text-meta text-fg-muted">{translation('aboutme.profile.location')}</p>
          <p className="max-w-prose text-heading text-fg-muted">{translation('aboutme.profile.intro')}</p>
        </header>

        <div className="flex max-w-prose flex-col gap-4">
          <p className="text-body text-fg-muted">{translation('aboutme.profile.body1')}</p>
          <p className="text-body text-fg-muted">{translation('aboutme.profile.body2')}</p>
        </div>

        <section className="flex flex-col gap-3" aria-label={translation('aboutme.profile.selectedWork')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className={subheading}>{translation('aboutme.profile.selectedWork')}</h4>
            <ButtonLink
              variant="secondary"
              onClick={() => {
                openContent(ProjectsFolder, { originId: windowId });
              }}
            >
              {translation('aboutme.profile.allProjects')}
            </ButtonLink>
          </div>
          <p className="max-w-prose text-body text-fg-muted">
            {translation('aboutme.profile.agencyBefore')}{' '}
            <a
              href={TONICA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-accent/40 underline-offset-2 focus-ring rounded-sm hover:decoration-accent"
            >
              wearetonica
              <span className="sr-only"> {translation('os.opensInNewTab')}</span>
            </a>
            . {translation('aboutme.profile.agencyAfter')}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <li key={project.config.id}>
                <ProjectCard
                  file={project.file}
                  category={translation(project.config.category)}
                  summary={translation(project.config.summary)}
                  technologies={project.config.technologies}
                  cover={{ ...project.config.cover, alt: translation(project.config.imageAlt) }}
                  originId={windowId}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  },
);
