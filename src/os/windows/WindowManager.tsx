import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { AnimatePresence } from 'motion/react';

import { announce } from '../a11y/announce.ts';
import { getContent } from '../../content/registry.ts';
import type { ContentKey } from '../../content/types.ts';
import { selectZIndex } from '../state/selectors.ts';
import type {
  LayoutMode,
  Viewport,
  WindowId,
  WindowInstance,
  WindowState,
} from '../state/types.ts';
import {
  useReadViewport,
  useWindowDispatch,
  useWindowState,
} from '../state/useWindowActions.ts';
import { TASKBAR_H } from './geometry.ts';
import { readLayoutMode, useLayoutMode } from './useLayoutMode.ts';
import { Window } from './Window.tsx';

/** Taskbar is `h-14` (56px) below `md`. `geometry.ts` only exports the 48px constant. */
const MOBILE_TASKBAR_H = 56;

type FocusHost = 'window' | 'minimize-control' | 'outside';

/**
 * Maps open windows in `openedAt` order. The shell passes no props: place this
 * inside the full-viewport desktop (`relative`) so the layer can fill it.
 */
export function WindowManager() {
  const { state, taskbarItems } = useWindowState();
  const dispatch = useWindowDispatch();
  const readViewport = useReadViewport();
  const layoutMode = useLayoutMode();
  const [providerViewport, setProviderViewport] = useState(readViewport);
  const previousRef = useRef(state);
  const focusBeforeEffectsRef = useRef<Element | null>(null);

  useEffect(() => {
    let frame = 0;
    const flush = () => {
      frame = 0;
      const next = readViewport();
      setProviderViewport((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next,
      );
      // Tablet and mobile paint with `displayBounds` and must not rewrite
      // the stored desktop arrangement (§8.1).
      if (readLayoutMode() === 'desktop') {
        dispatch({ type: 'VIEWPORT_CHANGED', viewport: next });
      }
    };
    const onResize = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(flush);
    };

    const desktop = window.matchMedia('(min-width: 1024px)');
    const tablet = window.matchMedia(
      '(min-width: 768px) and (max-width: 1023.98px)',
    );
    window.addEventListener('resize', onResize);
    desktop.addEventListener('change', onResize);
    tablet.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      desktop.removeEventListener('change', onResize);
      tablet.removeEventListener('change', onResize);
      cancelAnimationFrame(frame);
    };
  }, [dispatch, readViewport]);

  const viewport = useMemo(
    () => paintedViewport(providerViewport, layoutMode),
    [providerViewport, layoutMode],
  );

  const frontId = frontWindowId(state);

  useLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = state;
    if (previous === state) return;

    const host = classifyFocus(focusBeforeEffectsRef.current);
    const minimizedNow = newlyMinimized(previous, state);
    const closed = closedWindows(previous, state);
    const focusWasInside = host === 'window' || host === 'minimize-control';

    for (const instance of closed) announce(`${titleOf(instance)} closed`);

    // Show Desktop minimizes every visible window at once. A single minimize
    // keeps focus on that window's taskbar button (handled by `Window`).
    if (minimizedNow.length > 1 && focusWasInside) {
      focusDesktopIcon(null);
      return;
    }
    if (
      minimizedNow.length === 1 &&
      closed.length === 0 &&
      host === 'window' &&
      state.activeId === null
    ) {
      focusDesktopIcon(null);
      return;
    }
    if (closed.length > 0 && state.activeId === null) {
      const activeClosed =
        closed.find((instance) => instance.id === previous.activeId) ??
        closed[0];
      if (activeClosed)
        focusDesktopIcon(rootDesktopKey(activeClosed.contentKey));
    }
  }, [state]);

  return (
    <>
      <FocusProbe state={state} probeRef={focusBeforeEffectsRef} />
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {taskbarItems.map((instance) => (
            <Window
              key={instance.id}
              instance={instance}
              isActive={instance.id === state.activeId}
              zIndex={selectZIndex(state, instance.id)}
              layoutMode={layoutMode}
              viewport={viewport}
              isFront={instance.id === frontId}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function FocusProbe({
  state,
  probeRef,
}: {
  state: WindowState;
  probeRef: RefObject<Element | null>;
}) {
  useLayoutEffect(() => {
    probeRef.current = document.activeElement;
  }, [state, probeRef]);
  return null;
}

function paintedViewport(provider: Viewport, mode: LayoutMode): Viewport {
  if (mode !== 'mobile') return provider;
  return {
    width: provider.width,
    height: Math.max(0, provider.height - (MOBILE_TASKBAR_H - TASKBAR_H)),
  };
}

function frontWindowId(state: WindowState): WindowId | null {
  for (let index = state.order.length - 1; index >= 0; index -= 1) {
    const id = state.order[index];
    if (!id) continue;
    const instance = state.windows[id];
    if (instance && !instance.minimized) return id;
  }
  return null;
}

function newlyMinimized(previous: WindowState, next: WindowState): WindowId[] {
  const ids: WindowId[] = [];
  for (const instance of Object.values(previous.windows)) {
    const updated = next.windows[instance.id];
    if (updated && !instance.minimized && updated.minimized)
      ids.push(instance.id);
  }
  return ids;
}

function closedWindows(
  previous: WindowState,
  next: WindowState,
): WindowInstance[] {
  const closed: WindowInstance[] = [];
  for (const instance of Object.values(previous.windows)) {
    if (!next.windows[instance.id]) closed.push(instance);
  }
  return closed;
}

function titleOf(instance: WindowInstance): string {
  const item = getContent(instance.contentKey);
  if (item && item.kind !== 'link') return item.title;
  if (instance.kind === 'system') return 'File not found';
  return 'Window';
}

function classifyFocus(target: Element | null): FocusHost {
  if (!(target instanceof HTMLElement)) return 'outside';
  if (!target.closest('[data-window]')) return 'outside';
  const label = target.closest('button')?.getAttribute('aria-label') ?? '';
  if (label.startsWith('Minimize ')) return 'minimize-control';
  return 'window';
}

function rootDesktopKey(contentKey: ContentKey): ContentKey | null {
  const item = getContent(contentKey);
  if (!item || item.kind === 'link') return null;
  if (item.parent === 'desktop') return contentKey;
  return rootDesktopKey(item.parent);
}

function focusDesktopIcon(contentKey: ContentKey | null) {
  const list = document.querySelector<HTMLElement>(
    '[role="listbox"][aria-label="Desktop"]',
  );
  if (!list) return;
  const options = list.querySelectorAll<HTMLElement>('[role="option"]');
  if (options.length === 0) return;
  const title = contentKey ? getContent(contentKey)?.title : undefined;
  let match: HTMLElement | undefined;
  if (title) {
    for (const option of options) {
      if (option.getAttribute('title') === title) {
        match = option;
        break;
      }
    }
  }
  (match ?? options[0])?.focus({ preventScroll: true });
}
