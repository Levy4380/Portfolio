import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type { Bounds, Viewport } from '../../state/StateHelpers/types.ts';
import { anchoredResize, cursorForResizeEdge, isResizeEdge } from './geometry.ts';
import { holdCursor } from './pointerCursor.ts';
import type { WindowPreset } from './presets.ts';

export interface UseWindowResizeOptions {
  /** Desktop layout, resizable preset, not maximized. */
  enabled: boolean;
  getBounds: () => Bounds;
  getViewport: () => Viewport;
  getPreset: () => WindowPreset;
  onLive: (bounds: Bounds | null) => void;
  onCommit: (bounds: Bounds) => void;
}

/**
 * Edge and corner resize. The anchor is the side or corner the pointer does
 * not touch. Same capture / rAF / single-commit pattern as drag. Each
 * animation frame calls `onLive`. pointerup and pointercancel commit one
 * resize and clear the live bounds. Escape clears them and does not commit.
 */
export function useWindowResize({
  enabled,
  getBounds,
  getViewport,
  getPreset,
  onLive,
  onCommit,
}: UseWindowResizeOptions) {
  const enabledRef = useRef(enabled);
  const getBoundsRef = useRef(getBounds);
  const getViewportRef = useRef(getViewport);
  const getPresetRef = useRef(getPreset);
  const onLiveRef = useRef(onLive);
  const onCommitRef = useRef(onCommit);
  const teardownRef = useRef<(() => void) | null>(null);

  // Gesture listeners outlive this render and read these mirrors. Not an effect.
  // eslint-disable-next-line react-hooks/refs
  enabledRef.current = enabled;
  // eslint-disable-next-line react-hooks/refs
  getBoundsRef.current = getBounds;
  // eslint-disable-next-line react-hooks/refs
  getViewportRef.current = getViewport;
  // eslint-disable-next-line react-hooks/refs
  getPresetRef.current = getPreset;
  // eslint-disable-next-line react-hooks/refs
  onLiveRef.current = onLive;
  // eslint-disable-next-line react-hooks/refs
  onCommitRef.current = onCommit;

  useEffect(() => {
    return () => {
      teardownRef.current?.();
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabledRef.current || event.button !== 0) return;
    const edge = event.currentTarget.dataset.resizeEdge;
    if (!isResizeEdge(edge)) return;
    event.preventDefault();

    const origin = getBoundsRef.current();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const pointerId = event.pointerId;
    const handle = event.currentTarget;

    let last: Bounds = origin;
    let raf = 0;
    let stopped = false;
    const releaseCursor = holdCursor(cursorForResizeEdge(edge));

    const teardown = () => {
      if (stopped) return;
      stopped = true;
      releaseCursor();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('select-none');
      if (handle.hasPointerCapture(pointerId))
        handle.releasePointerCapture(pointerId);
      if (teardownRef.current === teardown) teardownRef.current = null;
    };

    const finish = (commit: boolean) => {
      const committed = last;
      teardown();
      const changed =
        committed.x !== origin.x ||
        committed.y !== origin.y ||
        committed.width !== origin.width ||
        committed.height !== origin.height;
      if (commit && changed) onCommitRef.current(committed);
      onLiveRef.current(null);
    };

    handle.setPointerCapture(pointerId);
    document.body.classList.add('select-none');

    const onMove = (ev: PointerEvent) => {
      if (stopped || ev.pointerId !== pointerId) return;
      last = anchoredResize(
        origin,
        ev.clientX - startClientX,
        ev.clientY - startClientY,
        edge,
        getPresetRef.current(),
        getViewportRef.current(),
      );
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!stopped) onLiveRef.current(last);
      });
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      finish(true);
    };

    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      finish(true);
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(false);
    };

    teardownRef.current = teardown;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
  };

  return { onPointerDown };
}
