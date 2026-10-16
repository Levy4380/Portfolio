import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import type { Bounds, Viewport } from '../../state/StateHelpers/types.ts';
import { clampPosition, DRAG_THRESHOLD } from './geometry.ts';

export interface UseWindowDragOptions {
  /** Desktop layout and not maximized. */
  enabled: boolean;
  frameRef: RefObject<HTMLElement | null>;
  /** Set while a gesture owns the frame style, so a render cannot clobber it. */
  liveBoundsRef: RefObject<Bounds | null>;
  getBounds: () => Bounds;
  getViewport: () => Viewport;
  onCommit: (x: number, y: number) => void;
}

/**
 * Title-bar drag. Movement under `DRAG_THRESHOLD` is a click.
 * The frame transform is written in `requestAnimationFrame`; one `MOVE` is
 * committed on pointerup. Escape reverts to the position where the drag began.
 */
export function useWindowDrag({
  enabled,
  frameRef,
  liveBoundsRef,
  getBounds,
  getViewport,
  onCommit,
}: UseWindowDragOptions) {
  const enabledRef = useRef(enabled);
  const getBoundsRef = useRef(getBounds);
  const getViewportRef = useRef(getViewport);
  const onCommitRef = useRef(onCommit);
  const teardownRef = useRef<(() => void) | null>(null);
  const blockDoubleClickRef = useRef(false);
  const dragGenerationRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
    getBoundsRef.current = getBounds;
    getViewportRef.current = getViewport;
    onCommitRef.current = onCommit;
  });

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

    const write = (x: number, y: number) => {
      const next: Bounds = { x, y, width: origin.width, height: origin.height };
      liveBoundsRef.current = next;
      const el = frameRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const teardown = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('select-none');
      if (handle.hasPointerCapture(pointerId))
        handle.releasePointerCapture(pointerId);
      liveBoundsRef.current = null;
      if (teardownRef.current === teardown) teardownRef.current = null;
    };

    const finish = (commit: boolean) => {
      const didDrag = dragging;
      teardown();
      if (!didDrag) return;
      const el = frameRef.current;
      if (!commit) {
        if (el)
          el.style.transform = `translate3d(${origin.x}px, ${origin.y}px, 0)`;
        return;
      }
      // Flush the last pointer sample. The rAF that would have painted it may
      // not have run yet, and the live ref must stay clear so React can own
      // the style after the single MOVE.
      if (el) el.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
      onCommitRef.current(lastX, lastY);
    };

    const onMove = (ev: PointerEvent) => {
      if (stopped || ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging = true;
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
        if (!stopped) write(lastX, lastY);
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
