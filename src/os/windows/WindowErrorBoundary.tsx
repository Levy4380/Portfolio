import { Component, type ReactNode } from 'react';

import type { WindowId } from '../state/types.ts';
import { useWindowActions } from '../state/useWindowActions.ts';

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
          <p className="text-body text-fg">This window ran into a problem.</p>
          <CloseWindowButton windowId={this.props.windowId} />
        </div>
      );
    }
    return this.props.children;
  }
}

function CloseWindowButton({ windowId }: { windowId: WindowId }) {
  const { closeWindow } = useWindowActions();

  return (
    <button
      type="button"
      className="focus-ring rounded-control border border-edge px-3 py-1.5 text-ui font-semibold text-fg hover:bg-chrome-hover active:bg-chrome-press"
      onClick={() => closeWindow(windowId)}
    >
      Close window
    </button>
  );
}
