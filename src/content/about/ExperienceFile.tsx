import { defineOpenable } from '../catalog.ts';
import { useLanguage, useTranslation, type TranslationKey } from '../i18n/useTranslation.ts';

const eyebrow = 'text-meta font-medium tracking-wide text-accent uppercase';

const entries = [
  {
    eyebrow: 'aboutme.experience.tonica.eyebrow',
    role: 'aboutme.experience.tonica.role',
    body: 'aboutme.experience.tonica.body',
  },
  {
    eyebrow: 'aboutme.experience.freelance.eyebrow',
    role: 'aboutme.experience.freelance.role',
    body: 'aboutme.experience.freelance.body',
  },
  {
    eyebrow: 'aboutme.experience.education.eyebrow',
    role: 'aboutme.experience.education.role',
    body: 'aboutme.experience.education.body',
  },
] as const satisfies readonly {
  eyebrow: TranslationKey;
  role: TranslationKey;
  body: TranslationKey;
}[];

export const ExperienceFile = defineOpenable(
  {
    id: 'profile:experience',
    path: '/about/experience',
    title: 'aboutme.experience.title',
    preset: 'profile',
    fileName: 'experience.log',
    icon: { glyph: 'file', kind: 'profile', badge: 'briefcase' },
  },
  function ExperienceFile() {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <div className="flex min-h-full flex-col gap-6 bg-window px-6 pt-6 text-fg">
        <ol className="flex flex-col gap-8">
          {entries.map((entry) => (
            <li key={entry.role}>
              <article className="flex max-w-prose flex-col gap-2">
                <p className={eyebrow}>{translation(entry.eyebrow)}</p>
                <h3 className="text-title font-semibold">{translation(entry.role)}</h3>
                <p className="text-body text-fg-muted">{translation(entry.body)}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    );
  },
);
