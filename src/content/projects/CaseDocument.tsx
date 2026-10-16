import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import type { ContentId } from '../../os/state/StateHelpers/types.ts';
import { defineOpenable, type Openable } from '../catalog.ts';
import { useLanguage, useTranslation, type TranslationKey } from '../i18n/useTranslation.ts';
import type { ImageAsset } from '../types.ts';

export type CaseConfig = {
  id: ContentId;
  path: string;
  fileName: string;
  title: TranslationKey;
  summary: TranslationKey;
  category: TranslationKey;
  imageAlt: TranslationKey;
  client: string;
  year: string;
  challenge: TranslationKey;
  solution: TranslationKey;
  result: TranslationKey;
  cover: ImageAsset;
  liveUrl?: string;
  caseUrl?: string;
  technologies: readonly string[];
};

const subheading = 'text-meta font-medium tracking-wide text-fg-muted uppercase';

export function defineCase(config: CaseConfig): Openable {
  return defineOpenable(
    {
      id: config.id,
      path: config.path,
      title: config.title,
      preset: 'document',
      fileName: config.fileName,
      summary: config.summary,
      icon: { glyph: 'file', kind: 'project' },
    },
    function CaseFile() {
      const { language } = useLanguage();
      const translation = useTranslation(language);
      const cover = { ...config.cover, alt: translation(config.imageAlt) };

      return (
        <div className="flex min-h-full flex-col bg-window text-fg">
          <div className="flex flex-wrap gap-2 border-b border-line bg-sunken px-4 py-2">
            {config.liveUrl ? (
              <ButtonLink href={config.liveUrl}>{translation('projects.visitSite')}</ButtonLink>
            ) : null}
            {config.caseUrl ? (
              <ButtonLink href={config.caseUrl} variant={config.liveUrl ? 'secondary' : 'primary'}>
              {translation('projects.caseStudy')}
            </ButtonLink>
            ) : null}
          </div>
          <article className="flex flex-col gap-6 px-6 pt-6">
            <ProjectVisual label={translation(config.category)} cover={cover} priority />
            <header className="flex max-w-prose flex-col gap-2">
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
                <li>{translation(config.category)}</li>
                <li>{config.client}</li>
                <li>{config.year}</li>
                <li>{translation('projects.atTonica')}</li>
              </ul>
              <h3 className="text-display font-semibold">{translation(config.title)}</h3>
              <p className="text-body text-fg-muted">{translation(config.summary)}</p>
            </header>
            <div className="flex max-w-prose flex-col gap-4">
              <section className="flex flex-col gap-2">
                <h4 className={subheading}>{translation('projects.challenge')}</h4>
                <p className="text-body text-fg-muted">{translation(config.challenge)}</p>
              </section>
              <section className="flex flex-col gap-2">
                <h4 className={subheading}>{translation('projects.solution')}</h4>
                <p className="text-body text-fg-muted">{translation(config.solution)}</p>
              </section>
              <section className="flex flex-col gap-2">
                <h4 className={subheading}>{translation('projects.results')}</h4>
                <p className="text-body text-fg-muted">{translation(config.result)}</p>
              </section>
            </div>
            <section className="flex flex-col gap-3" aria-label={translation('os.technologies')}>
              <h4 className={subheading}>{translation('os.technologies')}</h4>
              <TechList items={config.technologies} />
            </section>
          </article>
        </div>
      );
    },
  );
}
