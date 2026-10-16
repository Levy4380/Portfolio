import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type { Bounds, Viewport } from '../../state/StateHelpers/types.ts';
import { clampPosition, DRAG_THRESHOLD } from './geometry.ts';
import { holdCursor } from './pointerCursor.ts';

export interface UseWindowDragOptions {
  /** Desktop layout and not maximized. */
  enabled: boolean;
  getBounds: () => Bounds;
  getViewport: () => Viewport;
  onLive: (bounds: Bounds | null) => void;
  onCommit: (x: number, y: number) => void;
}

/**
 * Title-bar drag. Movement under `DRAG_THRESHOLD` is a click.
 * Each animation frame calls `onLive`. pointerup and pointercancel commit
 * one move and clear the live bounds. Escape clears them and does not commit.
 */
export function useWindowDrag({
  enabled,
  getBounds,
  getViewport,
  onLive,
  onCommit,
}: UseWindowDragOptions) {
  const enabledRef = useRef(enabled);
  const getBoundsRef = useRef(getBounds);
  const getViewportRef = useRef(getViewport);
  const onLiveRef = useRef(onLive);
  const onCommitRef = useRef(onCommit);
  const teardownRef = useRef<(() => void) | null>(null);
  const blockDoubleClickRef = useRef(false);
  const dragGenerationRef = useRef(0);

  // Gesture listeners outlive this render and read these mirrors. Not an effect.
  // eslint-disable-next-line react-hooks/refs
  enabledRef.current = enabled;
  // eslint-disable-next-line react-hooks/refs
  getBoundsRef.current = getBounds;
  // eslint-disable-next-line react-hooks/refs
  getViewportRef.current = getViewport;
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
    const target = event.target;
    if (target instanceof Element && target.closest('button')) return;

    const origin = getBoundsRef.current();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const pointerId = event.pointerId;
    const handle = event.currentTarget;

    let dragging = false;
    let lastX = origin.x;
    let lastY = origin.y;
    let raf = 0;
    let stopped = false;
    let releaseCursor = () => {};

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
      const didDrag = dragging;
      const x = lastX;
      const y = lastY;
      teardown();
      if (!didDrag) return;
      if (commit) onCommitRef.current(x, y);
      onLiveRef.current(null);
    };

    const onMove = (ev: PointerEvent) => {
      if (stopped || ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging = true;
        releaseCursor = holdCursor('grabbing');
        blockDoubleClickRef.current = true;
        const generation = dragGenerationRef.current + 1;
        dragGenerationRef.current = generation;
        window.setTimeout(() => {
          if (dragGenerationRef.current === generation)
            blockDoubleClickRef.current = false;
        }, 500);
        handle.setPointerCapture(pointerId);
        document.body.classList.add('select-none');
      }
      const position = clampPosition(
        {
          x: origin.x + dx,
          y: origin.y + dy,
          width: origin.width,
          height: origin.height,
        },
        getViewportRef.current(),
      );
      lastX = position.x;
      lastY = position.y;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!stopped) {
          onLiveRef.current({
            x: lastX,
            y: lastY,
            width: origin.width,
            height: origin.height,
          });
        }
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
      if (ev.key !== 'Escape' || !dragging) return;
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

  return { onPointerDown, blockDoubleClickRef };
}
