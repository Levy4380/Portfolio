import { Component, type ReactNode } from 'react';

import { useLanguage, useTranslation } from '../../../content/i18n/useTranslation.ts';
import type { WindowId } from '../../state/StateHelpers/types.ts';
import { useWindowActions } from '../../state/StateHelpers/useWindowActions.ts';

interface WindowErrorBoundaryProps {
  windowId: WindowId;
  children: ReactNode;
}

interface WindowErrorBoundaryState {
  hasError: boolean;
}

/**
 * One crashing renderer takes down only its window.
 * The boundary offers an explicit close; it does not retry the render.
 */
export class WindowErrorBoundary extends Component<
  WindowErrorBoundaryProps,
  WindowErrorBoundaryState
> {
  state: WindowErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WindowErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-start gap-3 p-4 md:p-6"
          role="alert"
        >
          <WindowErrorNotice windowId={this.props.windowId} />
        </div>
      );
    }
    return this.props.children;
  }
}

function WindowErrorNotice({ windowId }: { windowId: WindowId }) {
  const { closeWindow } = useWindowActions();
  const { language } = useLanguage();
  const translation = useTranslation(language);

  return (
    <>
      <p className="text-body text-fg">{translation('os.windowProblem')}</p>
      <button
        type="button"
        className="focus-ring rounded-control border border-edge px-3 py-1.5 text-ui font-semibold text-fg hover:bg-chrome-hover active:bg-chrome-press"
        onClick={() => closeWindow(windowId)}
      >
        {translation('os.closeWindow')}
      </button>
    </>
  );
}
