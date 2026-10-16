import { ProjectCard } from '../../components/projects/ProjectCard.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import { useWindowActions } from '../../os/state/StateHelpers/useWindowActions.ts';
import { defineOpenable } from '../catalog.ts';
import { site } from '../site.ts';
import { CatalogStorefrontFile } from '../projects/CatalogStorefrontFile.tsx';
import { OperationsDeskFile } from '../projects/OperationsDeskFile.tsx';
import { ProjectsFolder } from '../projects/ProjectsFolder.tsx';

const eyebrow = 'text-meta font-medium tracking-wide text-accent uppercase';
const subheading = 'text-meta font-medium tracking-wide text-fg-muted uppercase';

export const ProfileFile = defineOpenable(
  {
    id: 'profile:profile',
    path: '/about/profile',
    title: 'Profile',
    preset: 'profile',
    fileName: 'readme.md',
    icon: { glyph: 'file', kind: 'profile' },
  },
  function ProfileFile({ windowId }) {
    const { openContent } = useWindowActions();

    return (
      <div className="flex min-h-full flex-col gap-6 bg-window p-6 text-fg">
        <header className="flex max-w-prose flex-col gap-2">
          <p className={eyebrow}>{site.role}</p>
          <h3 className="font-display text-display">{site.name}</h3>
          <p className="text-heading text-fg-muted">
            I build interfaces for web applications and online stores, working across React,
            Laravel, and Shopify.
          </p>
        </header>

        <div className="flex max-w-prose flex-col gap-4">
          <p className="text-body text-fg-muted">
            The useful work is usually specific: a checkout edge case, an admin screen people use
            every day, or a theme change that still has to make sense after the next release.
          </p>
          <p className="text-body text-fg-muted">
            This introduction is a placeholder. Swap it for a short account of the applications
            you have actually built and maintained.
          </p>
        </div>

        <section className="flex flex-col gap-3" aria-label="Focus">
          <h4 className={subheading}>Focus</h4>
          <TechList items={site.focus} />
        </section>

        <section className="flex flex-col gap-3" aria-label="Selected work">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className={subheading}>Selected work</h4>
            <ButtonLink
              variant="secondary"
              onClick={() => {
                openContent(ProjectsFolder, { originId: windowId });
              }}
            >
              All projects
            </ButtonLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li>
              <ProjectCard
                file={CatalogStorefrontFile}
                category="E-commerce"
                summary="A product listing, product page, and cart sketched as an e-commerce example."
                technologies={['React', 'Shopify', 'Liquid', 'Tailwind CSS']}
                originId={windowId}
              />
            </li>
            <li>
              <ProjectCard
                file={OperationsDeskFile}
                category="Web application"
                summary="An internal web application example for everyday operational tasks."
                technologies={['React', 'TypeScript', 'Laravel']}
                originId={windowId}
              />
            </li>
          </ul>
        </section>
      </div>
    );
  },
);
