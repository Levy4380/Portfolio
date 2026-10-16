import { site } from '../site.ts';
import { defineOpenable } from '../catalog.ts';
import { useLanguage, useTranslation, type TranslationKey } from '../i18n/useTranslation.ts';

const link =
  'focus-ring rounded-chip text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-strong';

const lines = [
  { label: 'os.linkedin', href: site.linkedinUrl, text: 'os.linkedin' },
  { label: 'aboutme.contact.email', href: `mailto:${site.email}`, text: site.email },
] as const satisfies readonly {
  label: TranslationKey;
  href: string;
  text: string | TranslationKey;
}[];

export const ContactFile = defineOpenable(
  {
    id: 'profile:contact',
    path: '/about/contact',
    title: 'aboutme.contact.title',
    preset: 'profile',
    fileName: 'contact.vcf',
    icon: { glyph: 'file', kind: 'profile' },
  },
  function ContactFile() {
    const { language } = useLanguage();
    const translation = useTranslation(language);

    return (
      <div className="flex min-h-full flex-col gap-6 bg-window px-6 pt-6 text-fg">
        <header className="flex max-w-prose flex-col gap-3">
          <p className="text-heading text-fg">{translation('aboutme.contact.questions')}</p>
          <p className="text-heading font-medium text-accent-strong">{translation('aboutme.contact.write')}</p>
        </header>
        <ul className="flex flex-col gap-3">
          {lines.map((line) => {
            const external = !line.href.startsWith('mailto:');
            const text = line.text.includes('@') ? line.text : translation(line.text as TranslationKey);
            return (
              <li
                key={line.label}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3 last:border-b-0"
              >
                <span className="w-24 text-meta font-medium tracking-wide text-fg-muted uppercase">
                  {translation(line.label)}
                </span>
                <a
                  href={line.href}
                  className={link}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {text}
                  {external ? (
                    <span className="sr-only"> {translation('os.opensInNewTab')}</span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
