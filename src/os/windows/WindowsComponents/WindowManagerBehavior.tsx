import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

import { announce } from '../../a11y/A11yHelpers/announce.ts';
import { getDesktopFolders, getOpenable, titleFor } from '../../../content/catalog.ts';
import {
  translate,
  useLanguage,
  type TranslationKey,
} from '../../../content/i18n/useTranslation.ts';
import type {
  ContentId,
  WindowId,
  WindowInstance,
  WindowState,
} from '../../state/StateHelpers/types.ts';
import {
  useWindowDispatch,
  useWindowState,
} from '../../state/StateHelpers/useWindowActions.ts';
import { viewportFromWindow } from '../WindowsHelpers/geometry.ts';
import { useLayout } from '../WindowsHelpers/useLayoutMode.ts';
import { WindowManager } from './WindowManager.tsx';

type FocusHost = 'window' | 'minimize-control' | 'outside';

/**
 * Viewport sync, closed-window announcements, and focus when windows close
 * or Show Desktop runs. The shell only paints.
 */
export function WindowManagerBehavior() {
  const { state, taskbarItems } = useWindowState();
  const { layoutMode, viewport } = useLayout();

  useViewportSync();
  useClosedWindowAnnounce(state);
  const focusBeforeEffectsRef = useCloseFocus(state);

  return (
    <>
      <FocusProbe state={state} probeRef={focusBeforeEffectsRef} />
      <WindowManager
        state={state}
        taskbarItems={taskbarItems}
        layoutMode={layoutMode}
        viewport={viewport}
      />
    </>
  );
}

/**
 * Listens to `resize` only. The first mount adds the listener and does not
 * flush. A later `layoutMode` change re-subscribes and flushes so entering
 * desktop still clamps stored bounds.
 */
function useViewportSync() {
  const dispatch = useWindowDispatch();
  const { layoutMode, setViewport, readLayoutMode } = useLayout();
  const trackedModeRef = useRef(layoutMode);

  useEffect(() => {
    let frame = 0;
    const flush = () => {
      frame = 0;
      const mode = readLayoutMode();
      const next = viewportFromWindow(mode);
      setViewport(next);
      // Tablet and mobile paint with `displayBounds` and must not rewrite
      // the stored desktop arrangement (§8.1).
      if (mode === 'desktop') {
        dispatch({ type: 'VIEWPORT_CHANGED', viewport: next });
      }
    };
    const onResize = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(flush);
    };

    window.addEventListener('resize', onResize);
    if (trackedModeRef.current !== layoutMode) {
      trackedModeRef.current = layoutMode;
      flush();
    }
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [dispatch, layoutMode, readLayoutMode, setViewport]);
}

/** Announces windows that disappeared. Does not move focus. */
function useClosedWindowAnnounce(state: WindowState) {
  const previousRef = useRef(state);
  const { language } = useLanguage();

  useLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = state;
    if (previous === state) return;

    for (const instance of closedWindows(previous, state)) {
      announce(
        `${translate(language, titleFor(instance.contentId))} ${translate(language, 'os.closed')}`,
      );
    }
  }, [language, state]);
}

/**
 * Close and Show Desktop focus. This effect lives on `WindowManagerBehavior`,
 * the parent of the windows, so it runs after each `WindowBehavior` focus
 * effect. `FocusProbe` is the first child and captures `document.activeElement`
 * before those window effects.
 */
function useCloseFocus(state: WindowState): RefObject<Element | null> {
  const focusBeforeEffectsRef = useRef<Element | null>(null);
  const previousRef = useRef(state);
  const { language } = useLanguage();

  useLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = state;
    if (previous === state) return;

    const host = classifyFocus(focusBeforeEffectsRef.current);
    const minimizedNow = newlyMinimized(previous, state);
    const closed = closedWindows(previous, state);
    const focusWasInside = host === 'window' || host === 'minimize-control';

    // Show Desktop minimizes every visible window at once. A single minimize
    // keeps focus on that window's taskbar button (handled by `WindowBehavior`).
    if (minimizedNow.length > 1 && focusWasInside) {
      focusDesktopIcon(undefined);
      return;
    }
    if (
      minimizedNow.length === 1 &&
      closed.length === 0 &&
      host === 'window' &&
      state.activeId === null
    ) {
      focusDesktopIcon(undefined);
      return;
    }
    if (closed.length > 0 && state.activeId === null) {
      const activeClosed =
        closed.find((instance) => instance.id === previous.activeId) ??
        closed[0];
      if (activeClosed) {
        const key = desktopTitleFor(activeClosed.contentId);
        focusDesktopIcon(key ? translate(language, key) : undefined);
      }
    }
  }, [language, state]);

  return focusBeforeEffectsRef;
}

/** First child: records focus before each window's layout effect. */
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

function classifyFocus(target: Element | null): FocusHost {
  if (!(target instanceof HTMLElement)) return 'outside';
  if (!target.closest('[data-window]')) return 'outside';
  if (target.closest('button')?.dataset.control === 'minimize') return 'minimize-control';
  return 'window';
}

function desktopTitleFor(contentId: ContentId): TranslationKey | undefined {
  const opened = getOpenable(contentId);
  if (!opened) return undefined;
  const slug = placeSlug(opened.path);
  if (!slug) return undefined;
  return getDesktopFolders().find((place) => place.path === `/folder/${slug}`)?.title;
}

function placeSlug(path: string): string | undefined {
  const folder = /^\/folder\/([^/]+)$/.exec(path);
  if (folder?.[1]) return folder[1];
  const file = /^\/(about|projects|experiments)\//.exec(path);
  return file?.[1];
}

function focusDesktopIcon(title: string | undefined) {
  const list = document.querySelector<HTMLElement>(
    '[role="listbox"][data-variant="desktop"]',
  );
  if (!list) return;
  const options = list.querySelectorAll<HTMLElement>('[role="option"]');
  if (options.length === 0) return;
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
