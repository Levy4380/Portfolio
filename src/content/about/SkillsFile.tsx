import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';
import { useLanguage, useTranslation } from '../i18n/useTranslation.ts';

const subheading = 'text-meta font-medium tracking-wide text-fg-muted uppercase';

export const SkillsFile = defineOpenable(
  {
    id: 'profile:skills',
    path: '/about/skills',
    title: 'aboutme.skills.title',
    preset: 'profile',
    fileName: 'skills.json',
    icon: { glyph: 'file', kind: 'profile', badge: 'code' },
  },
  function SkillsFile() {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <div className="flex min-h-full flex-col gap-6 bg-window px-6 pt-6 text-fg">
        <header className="flex max-w-prose flex-col gap-2">
          <h3 className="text-title font-semibold">{translation('aboutme.skills.heading')}</h3>
          <p className="text-body text-fg-muted">{translation('aboutme.skills.intro')}</p>
        </header>
        <ul className="grid gap-6 sm:grid-cols-2">
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>{translation('aboutme.skills.frontend')}</h4>
            <TechList items={['React', 'JavaScript', 'HTML', 'CSS', 'jQuery']} />
          </li>
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>{translation('aboutme.skills.backend')}</h4>
            <TechList items={['PHP', 'Laravel', 'Node.js', 'Python', 'MySQL', 'PostgreSQL']} />
          </li>
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>{translation('aboutme.skills.ecommerce')}</h4>
            <TechList items={['Shopify', 'Shopify Liquid', 'Shopify Apps', 'Magento']} />
          </li>
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>{translation('aboutme.skills.other')}</h4>
            <TechList items={['Git', 'Linux', 'GraphQL']} />
          </li>
        </ul>
      </div>
    );
  },
);
