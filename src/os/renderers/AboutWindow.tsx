import type { ReactNode } from 'react';

import { ProjectCard } from '../../components/projects/ProjectCard.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import {
  contactIntro,
  contactLines,
  experienceEntries,
  profileIntro,
  skillGroups,
  skillsIntro,
} from '../../content/profile.ts';
import { getFeaturedProjects } from '../../content/registry.ts';
import { site } from '../../content/site.ts';
import type { ProfileItem } from '../../content/types.ts';
import type { WindowId } from '../state/types.ts';
import { useWindowActions } from '../state/useWindowActions.ts';

interface AboutWindowProps {
  item: ProfileItem;
  windowId: WindowId;
  isActive: boolean;
}

const eyebrow =
  'text-meta font-medium tracking-wide text-accent uppercase';
const subheading =
  'text-meta font-medium tracking-wide text-fg-muted uppercase';
const link =
  'focus-ring rounded-chip text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-strong';

function assertNever(value: never): never {
  throw new Error(`AboutWindow: unhandled section ${JSON.stringify(value)}`);
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col gap-6 bg-window p-6 text-fg">
      {children}
    </div>
  );
}

function ProfileSection({ windowId }: { windowId: WindowId }) {
  const { openContent } = useWindowActions();
  const featured = getFeaturedProjects();

  return (
    <Page>
      <header className="flex max-w-prose flex-col gap-2">
        <p className={eyebrow}>{site.role}</p>
        <h3 className="font-display text-display">{site.name}</h3>
        <p className="text-heading text-fg-muted">{profileIntro.lede}</p>
      </header>

      <div className="flex max-w-prose flex-col gap-4">
        {profileIntro.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-body text-fg-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <section className="flex flex-col gap-3" aria-label="Focus">
        <h4 className={subheading}>Focus</h4>
        <TechList items={profileIntro.focus} />
      </section>

      {featured.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Selected work">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className={subheading}>Selected work</h4>
            <ButtonLink
              variant="secondary"
              onClick={() => {
                openContent('folder:projects', { originId: windowId });
              }}
            >
              All projects
            </ButtonLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {featured.map((project) => (
              <li key={project.slug}>
                <ProjectCard item={project} originId={windowId} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Page>
  );
}

function ExperienceSection() {
  return (
    <Page>
      <ol className="flex flex-col gap-8">
        {experienceEntries.map((entry) => (
          <li key={`${entry.organization}-${entry.title}`}>
            <article className="flex max-w-prose flex-col gap-2">
              <p className={eyebrow}>
                {entry.organization} · {entry.period}
              </p>
              <h3 className="font-display text-title">{entry.title}</h3>
              {entry.body.split('\n\n').map((paragraph) => (
                <p key={paragraph} className="text-body text-fg-muted">
                  {paragraph}
                </p>
              ))}
            </article>
          </li>
        ))}
      </ol>
    </Page>
  );
}

function SkillsSection() {
  return (
    <Page>
      <header className="flex max-w-prose flex-col gap-2">
        <h3 className="font-display text-title">{skillsIntro.title}</h3>
        <p className="text-body text-fg-muted">{skillsIntro.description}</p>
      </header>
      <ul className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <li key={group.title} className="flex flex-col gap-3">
            <h4 className={subheading}>{group.title}</h4>
            <TechList items={group.items} />
          </li>
        ))}
      </ul>
    </Page>
  );
}

function ContactSection() {
  return (
    <Page>
      <header className="flex max-w-prose flex-col gap-2">
        <h3 className="font-display text-title">Start a conversation</h3>
        <p className="text-body text-fg-muted">{contactIntro}</p>
      </header>
      <ul className="flex flex-col gap-3">
        {contactLines.map((line) => {
          const external = !line.href.startsWith('mailto:');
          return (
            <li
              key={line.label}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3 last:border-b-0"
            >
              <span className="w-24 text-meta font-medium tracking-wide text-fg-muted uppercase">
                {line.label}
              </span>
              <a
                href={line.href}
                className={link}
                {...(external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {line.text}
                {external ? (
                  <span className="sr-only"> (opens in a new tab)</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

export default function AboutWindow({ item, windowId }: AboutWindowProps) {
  switch (item.section) {
    case 'profile':
      return <ProfileSection windowId={windowId} />;
    case 'experience':
      return <ExperienceSection />;
    case 'skills':
      return <SkillsSection />;
    case 'contact':
      return <ContactSection />;
    default:
      return assertNever(item.section);
  }
}
