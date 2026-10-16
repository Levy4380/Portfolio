import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';

const subheading = 'text-meta font-medium tracking-wide text-fg-muted uppercase';

export const SkillsFile = defineOpenable(
  {
    id: 'profile:skills',
    path: '/about/skills',
    title: 'Skills',
    preset: 'profile',
    fileName: 'skills.json',
    icon: { glyph: 'file', kind: 'profile' },
  },
  function SkillsFile() {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-window p-6 text-fg">
        <header className="flex max-w-prose flex-col gap-2">
          <h3 className="font-display text-title">Tools used in the work</h3>
          <p className="text-body text-fg-muted">Grouped so the list stays easy to scan.</p>
        </header>
        <ul className="grid gap-6 sm:grid-cols-2">
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>Frontend</h4>
            <TechList items={['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Accessible UI']} />
          </li>
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>Backend</h4>
            <TechList items={['Laravel', 'PHP', 'REST APIs', 'MySQL']} />
          </li>
          <li className="flex flex-col gap-3">
            <h4 className={subheading}>E-commerce</h4>
            <TechList items={['Shopify', 'Liquid', 'Storefronts', 'Checkout flows']} />
          </li>
        </ul>
      </div>
    );
  },
);
