import { useNavigate } from 'react-router';

import { ButtonLink } from '../../../components/ui/ButtonLink.tsx';
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

  return (
    <div className="flex min-h-full flex-col gap-4 bg-window p-6 text-fg">
      <h3 className="font-display text-title">File not found</h3>
      <p className="max-w-prose text-body text-fg-muted">
        {requestedPath ? (
          <>
            Nothing lives at{' '}
            <code className="rounded-chip border border-line bg-sunken px-1.5 py-0.5 font-mono text-ui break-all text-fg">
              {requestedPath}
            </code>
            .
          </>
        ) : (
          'This address does not match anything in the portfolio.'
        )}{' '}
        Open the projects folder, or step back to the desktop.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink
          onClick={() => {
            openContent(ProjectsFolder, { originId: windowId });
          }}
        >
          Open Projects
        </ButtonLink>
        <ButtonLink
          variant="secondary"
          onClick={() => {
            navigate('/');
          }}
        >
          Go to desktop
        </ButtonLink>
      </div>
    </div>
  );
}
