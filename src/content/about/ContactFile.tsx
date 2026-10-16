import { site } from '../site.ts';
import { defineOpenable } from '../catalog.ts';

const link =
  'focus-ring rounded-chip text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-strong';

const lines = [
  { label: 'Email', href: `mailto:${site.email}`, text: site.email },
  { label: 'GitHub', href: site.githubUrl, text: 'GitHub' },
  { label: 'LinkedIn', href: site.linkedinUrl, text: 'LinkedIn' },
  { label: 'Instagram', href: site.instagramUrl, text: 'Instagram' },
] as const;

export const ContactFile = defineOpenable(
  {
    id: 'profile:contact',
    path: '/about/contact',
    title: 'Contact',
    preset: 'profile',
    fileName: 'contact.vcf',
    icon: { glyph: 'file', kind: 'profile' },
  },
  function ContactFile() {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-window p-6 text-fg">
        <header className="flex max-w-prose flex-col gap-2">
          <h3 className="font-display text-title">Start a conversation</h3>
          <p className="text-body text-fg-muted">
            For a project or a role, use the email below. GitHub, LinkedIn, and Instagram are the
            same links configured for the rest of the site.
          </p>
        </header>
        <ul className="flex flex-col gap-3">
          {lines.map((line) => {
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
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {line.text}
                  {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
