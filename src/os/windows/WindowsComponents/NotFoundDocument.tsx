import { useNavigate } from 'react-router';

import { ButtonLink } from '../../../components/ui/ButtonLink.tsx';
import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import { ProjectsFolder } from '../../../content/projects/ProjectsFolder.tsx';
import type { WindowId } from '../../state/StateHelpers/types.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';

export function NotFoundDocument({
  windowId,
  requestedPath,
}: {
  windowId: WindowId;
  requestedPath?: string;
}) {
  const { openContent } = useWindowActions();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <div className="flex min-h-full flex-col gap-4 bg-window px-6 pt-6 text-fg">
      <h3 className="text-title font-semibold">{translation('notfound.heading')}</h3>
      <p className="max-w-prose text-body text-fg-muted">
        {requestedPath ? (
          <>
            {translation('notfound.atPath')}{' '}
            <code className="rounded-chip border border-line bg-sunken px-1.5 py-0.5 font-mono text-ui break-all text-fg">
              {requestedPath}
            </code>
            .
          </>
        ) : (
          translation('notfound.mismatch')
        )}{' '}
        {translation('notfound.next')}
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink
          onClick={() => {
            openContent(ProjectsFolder, { originId: windowId });
          }}
        >
          {translation('notfound.openProjects')}
        </ButtonLink>
        <ButtonLink
          variant="secondary"
          onClick={() => {
            navigate('/');
          }}
        >
          {translation('notfound.goToDesktop')}
        </ButtonLink>
      </div>
    </div>
  );
}
