import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import type { Bounds, Viewport } from '../state/types.ts';
import { clampBounds } from './geometry.ts';
import type { WindowPreset } from './presets.ts';

export interface UseWindowResizeOptions {
  /** Desktop layout, resizable preset, not maximized. */
  enabled: boolean;
  frameRef: RefObject<HTMLElement | null>;
  liveBoundsRef: RefObject<Bounds | null>;
  getBounds: () => Bounds;
  getViewport: () => Viewport;
  getPreset: () => WindowPreset;
  onCommit: (bounds: Bounds) => void;
}

/**
 * Bottom-right resize. Same capture / rAF / single-commit pattern as drag.
 * Escape restores the bounds from pointerdown. pointercancel commits.
 */
export function useWindowResize({
  enabled,
  frameRef,
  liveBoundsRef,
  getBounds,
  getViewport,
  getPreset,
  onCommit,
}: UseWindowResizeOptions) {
  const enabledRef = useRef(enabled);
  const getBoundsRef = useRef(getBounds);
  const getViewportRef = useRef(getViewport);
  const getPresetRef = useRef(getPreset);
  const onCommitRef = useRef(onCommit);
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
    getBoundsRef.current = getBounds;
    getViewportRef.current = getViewport;
    getPresetRef.current = getPreset;
    onCommitRef.current = onCommit;
  });

  useEffect(() => {
    return () => {
      teardownRef.current?.();
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabledRef.current || event.button !== 0) return;
    event.preventDefault();

    const origin = getBoundsRef.current();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const pointerId = event.pointerId;
    const handle = event.currentTarget;

    let last: Bounds = origin;
    let raf = 0;
    let stopped = false;

    const write = (bounds: Bounds) => {
      liveBoundsRef.current = bounds;
      const el = frameRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0)`;
      el.style.width = `${bounds.width}px`;
      el.style.height = `${bounds.height}px`;
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
      const committed = last;
      teardown();
      if (!commit) {
        writeOrigin(frameRef.current, origin);
        return;
      }
      if (
        committed.x === origin.x &&
        committed.y === origin.y &&
        committed.width === origin.width &&
        committed.height === origin.height
      ) {
        return;
      }
      writeOrigin(frameRef.current, committed);
      onCommitRef.current(committed);
    };

    handle.setPointerCapture(pointerId);
    document.body.classList.add('select-none');

    const onMove = (ev: PointerEvent) => {
      if (stopped || ev.pointerId !== pointerId) return;
      const next = clampBounds(
        {
          x: origin.x,
          y: origin.y,
          width: origin.width + (ev.clientX - startClientX),
          height: origin.height + (ev.clientY - startClientY),
        },
        getPresetRef.current(),
        getViewportRef.current(),
      );
      last = next;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!stopped) write(next);
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

function writeOrigin(el: HTMLElement | null, origin: Bounds) {
  if (!el) return;
  el.style.transform = `translate3d(${origin.x}px, ${origin.y}px, 0)`;
  el.style.width = `${origin.width}px`;
  el.style.height = `${origin.height}px`;
}
