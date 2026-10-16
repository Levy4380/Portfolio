import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';

export const LayoutStudyFile = defineOpenable(
  {
    id: 'experiment:layout-study',
    path: '/experiments/layout-study',
    title: 'experiments.layout.title',
    preset: 'document',
    fileName: 'layout-study.lab',
    summary: 'experiments.layout.summary',
    icon: { glyph: 'file', kind: 'experiment' },
  },
  function LayoutStudyFile() {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <div className="flex min-h-full flex-col bg-window text-fg">
        <article className="flex flex-col gap-6 px-6 pt-6">
          <ProjectVisual label={translation('experiments.layout.category')} />
          <header className="flex max-w-prose flex-col gap-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
              <li>{translation('experiments.layout.category')}</li>
              <li>{translation('experiments.layout.inProgress')}</li>
            </ul>
            <h3 className="text-display font-semibold">{translation('experiments.layout.title')}</h3>
            <p className="text-body text-fg-muted">{translation('experiments.layout.summary')}</p>
          </header>
          <div className="flex max-w-prose flex-col gap-4">
            <p className="text-body text-fg-muted">{translation('experiments.layout.body1')}</p>
            <p className="text-body text-fg-muted">{translation('experiments.layout.body2')}</p>
          </div>
          <section className="flex flex-col gap-3" aria-label={translation('os.technologies')}>
            <h4 className="text-meta font-medium tracking-wide text-fg-muted uppercase">
              {translation('os.technologies')}
            </h4>
            <TechList items={['React', 'TypeScript', 'CSS']} />
          </section>
        </article>
      </div>
    );
  },
);
