import { Send } from 'lucide-react';

import { useWindowActions } from '../os/state/StateHelpers/useWindowActions.ts';
import { ContactFile } from './about/ContactFile.tsx';
import { useLanguage, useTranslation } from './i18n/useTranslation.ts';
import { site } from './site.ts';

/**
 * Opaque desktop card. Same radius idea as a macOS widget, filled with the
 * workstation surface instead of glass.
 */
export function ContactWidget() {
  const { openContent } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <aside
      aria-label={translation('os.widget.label')}
      className="pointer-events-auto flex w-full shrink-0 items-center gap-4 rounded-widget border border-edge bg-sunken p-4 shadow-window lg:w-80 lg:self-start"
    >
      <p className="min-w-0 flex-1 text-body text-fg">
        {translation('os.widget.prompt')}
        <span className="mt-1 block">
          {translation('os.widget.reach')}{' '}
          <a
            href={`mailto:${site.email}`}
            className="focus-ring rounded-chip font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-strong"
          >
            {site.email}
          </a>
        </span>
      </p>
      <button
        type="button"
        aria-label={translation('os.widget.action')}
        onClick={() => openContent(ContactFile)}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent touch-manipulation transition-colors duration-120 focus-ring hover:bg-accent-strong active:scale-97 active:bg-accent-strong motion-reduce:transform-none"
      >
        <Send aria-hidden className="size-5" />
      </button>
    </aside>
  );
}
