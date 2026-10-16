import {
  memo,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useReducedMotion } from 'motion/react';

import { announce } from '../a11y/A11yHelpers/announce.ts';
import { titleFor } from '../../content/catalog.ts';
import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import type { WindowFrameProps } from '../contracts.ts';
import {
  duration,
  easeOut,
  minimizeTarget,
  mobilePanelPresence,
  windowPresence,
  windowSettled,
  type MotionOffset,
} from '../motion.ts';
import type {
  Bounds,
  Viewport,
  WindowId,
} from '../state/StateHelpers/types.ts';
import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';
import { getTaskbarAnchorRect } from '../taskbar/TaskbarHelpers/taskbarAnchors.ts';
import { Window } from './Window.tsx';
import {
  phaseOnConcealed,
  phaseOnMinimizedChange,
  resolvePhase,
  type PhaseSnapshot,
} from './windowPhase.ts';
import { displayBounds } from './WindowsHelpers/geometry.ts';
import { presetFor } from './WindowsHelpers/presets.ts';
import { useWindowDrag } from './WindowsHelpers/useWindowDrag.ts';
import { useWindowResize } from './WindowsHelpers/useWindowResize.ts';

export interface WindowProps extends WindowFrameProps {
  /** Desktop-area viewport used by `displayBounds`. */
  viewport: Viewport;
  /** Frontmost non-minimized window. Mobile panels behind this one are inert. */
  isFront: boolean;
}

function WindowBehaviorComponent({
  instance,
  isActive,
  zIndex,
  layoutMode,
  viewport,
  isFront,
}: WindowProps) {
  const actions = useWindowActions();
  const titleId = useId();
  const frameRef = useRef<HTMLElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const pointerHeldRef = useRef(false);
  const mountedRef = useRef(false);
  const wasActiveRef = useRef(isActive);
  const wasMinimizedRef = useRef(instance.minimized);
  const announcedMinimizedRef = useRef(instance.minimized);
  const announcedOpenRef = useRef<string | null>(null);
  const persistedMinimizedRef = useRef(instance.minimized);
  const prevMaximized = useRef(instance.maximized);
  const maximizedDuringRender = useRef(instance.maximized);
  const zoomRef = useRef<Animation | null>(null);
  const heldFrom = useRef<Bounds | null>(null);
  const zoomContext = useRef({ instance, layoutMode, viewport, reduced: false });
  maximizedDuringRender.current = instance.maximized;

  const { language } = useLanguage();
  const translation = useTranslation(language);
  const title = translation(titleFor(instance.contentId));
  const preset = presetFor(instance.preset);
  const reduced = useReducedMotion() === true;
  zoomContext.current = { instance, layoutMode, viewport, reduced };

  const [snapshot, setSnapshot] = useState<PhaseSnapshot>(() => ({
    minimized: instance.minimized,
    concealed: false,
    motionMode: 'open',
  }));
  const [liveBounds, setLiveBounds] = useState<Bounds | null>(null);
  const [minimizeOffset, setMinimizeOffset] = useState<MotionOffset | null>(
    null,
  );
  const [zooming, setZooming] = useState(false);

  const { phase, motionMode } = resolvePhase(snapshot, instance.minimized);

  const flat = layoutMode === 'desktop' && instance.maximized;
  const showMaximize = layoutMode === 'desktop' && preset.maximizable;
  const canDrag = layoutMode === 'desktop' && !instance.maximized;
  const canResize = canDrag && preset.resizable;

  const bounds = liveBounds ?? displayBounds(instance, layoutMode, viewport);
  const style = {
    transform: `translate3d(${Math.round(bounds.x)}px, ${Math.round(bounds.y)}px, 0)`,
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    zIndex,
  };

  const presence = useMemo(
    () =>
      layoutMode === 'mobile'
        ? mobilePanelPresence(reduced)
        : windowPresence(reduced),
    [layoutMode, reduced],
  );
  const animate = useMemo(
    () =>
      phase === 'visible'
        ? windowSettled(reduced, motionMode)
        : minimizeTarget(reduced, minimizeOffset),
    [phase, reduced, motionMode, minimizeOffset],
  );

  const getBounds = () => displayBounds(instance, layoutMode, viewport);
  const getViewport = () => viewport;
  const getPreset = () => presetFor(instance.preset);

  const drag = useWindowDrag({
    enabled: canDrag,
    getBounds,
    getViewport,
    onLive: setLiveBounds,
    onCommit: (x, y) => actions.move(instance.id, x, y),
  });

  const resize = useWindowResize({
    enabled: canResize,
    getBounds,
    getViewport,
    getPreset,
    onLive: setLiveBounds,
    onCommit: (next) => actions.resize(instance.id, next),
  });

  useLayoutEffect(() => {
    if (persistedMinimizedRef.current === instance.minimized) return;
    persistedMinimizedRef.current = instance.minimized;
    setSnapshot((current) =>
      phaseOnMinimizedChange(current, instance.minimized),
    );
  }, [instance.minimized]);

  useLayoutEffect(() => {
    if (!instance.minimized) return;
    const frame = frameRef.current;
    setMinimizeOffset(frame ? taskbarOffset(frame, instance.id) : null);
  }, [instance.minimized, instance.id]);

  useEffect(() => {
    if (!instance.minimized) return;
    const ms = reduced ? duration.instant : duration.slow;
    const timeout = window.setTimeout(() => {
      setSnapshot((current) => phaseOnConcealed(current));
    }, ms);
    return () => window.clearTimeout(timeout);
  }, [instance.minimized, instance.id, reduced]);

  useLayoutEffect(() => {
    const wasMaximized = prevMaximized.current;
    if (wasMaximized === instance.maximized) return;
    prevMaximized.current = instance.maximized;

    const frame = frameRef.current;
    const {
      instance: current,
      layoutMode: mode,
      viewport: view,
      reduced: prefersReduced,
    } = zoomContext.current;

    if (!frame || prefersReduced || mode !== 'desktop') {
      zoomRef.current?.cancel();
      zoomRef.current = null;
      setZooming(false);
      return;
    }

    const from =
      heldFrom.current ??
      displayBounds({ ...current, maximized: wasMaximized }, mode, view);
    heldFrom.current = null;
    zoomRef.current?.cancel();
    zoomRef.current = null;

    const to = displayBounds(current, mode, view);
    if (sameBounds(from, to)) {
      setZooming(false);
      return;
    }

    const options: KeyframeAnimationOptions = {
      duration: duration.base,
      easing: `cubic-bezier(${easeOut.join(', ')})`,
      fill: 'both',
    };
    const frameAnim = frame.animate(
      [
        {
          transform: `translate3d(${from.x}px, ${from.y}px, 0)`,
          width: `${from.width}px`,
          height: `${from.height}px`,
        },
        {
          transform: `translate3d(${to.x}px, ${to.y}px, 0)`,
          width: `${to.width}px`,
          height: `${to.height}px`,
        },
      ],
      options,
    );
    const chrome = frame.querySelector<HTMLElement>('[data-window-chrome]');
    const chromeAnim = chrome?.animate(
      [
        { borderRadius: wasMaximized ? '0px' : 'var(--radius-window)' },
        { borderRadius: current.maximized ? '0px' : 'var(--radius-window)' },
      ],
      options,
    );

    zoomRef.current = frameAnim;
    setZooming(true);
    frameAnim.onfinish = () => {
      if (zoomRef.current !== frameAnim) return;
      chromeAnim?.cancel();
      frameAnim.cancel();
      zoomRef.current = null;
      setZooming(false);
    };

    return () => {
      if (zoomRef.current === frameAnim && frameRef.current) {
        heldFrom.current = boundsInOffsetParent(frameRef.current);
        zoomRef.current = null;
        frameAnim.cancel();
      }
      chromeAnim?.cancel();
      // Strict Mode replays this effect with the same flag. A newer toggle
      // has already written the render ref, so that path keeps `prevMaximized`.
      if (maximizedDuringRender.current === instance.maximized) {
        prevMaximized.current = wasMaximized;
      }
    };
  }, [instance.maximized]);

  useEffect(() => {
    if (announcedOpenRef.current === instance.id) return;
    const message = `${title} ${translation('os.opened')}`;
    const timeout = window.setTimeout(() => {
      announcedOpenRef.current = instance.id;
      announce(message);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [instance.id, title, translation]);

  useEffect(() => {
    if (announcedMinimizedRef.current === instance.minimized) return;
    announcedMinimizedRef.current = instance.minimized;
    announce(
      `${title} ${translation(instance.minimized ? 'os.minimized' : 'os.restored')}`,
    );
  }, [instance.minimized, title, translation]);

  useLayoutEffect(() => {
    const section = frameRef.current;
    if (!section) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      if (isActive && !instance.minimized) focusFrame(section);
      wasActiveRef.current = isActive;
      wasMinimizedRef.current = instance.minimized;
      return;
    }

    const justMinimized = instance.minimized && !wasMinimizedRef.current;
    const justRestored = !instance.minimized && wasMinimizedRef.current;
    const becameActive = isActive && !wasActiveRef.current;
    const pointerHeld = pointerHeldRef.current;
    pointerHeldRef.current = false;

    if (justMinimized) {
      focusTaskbarItem(instance.id);
    } else if (
      isActive &&
      !instance.minimized &&
      (becameActive || justRestored) &&
      !pointerHeld &&
      !section.contains(document.activeElement)
    ) {
      const last = lastFocusedRef.current;
      if (last && section.contains(last)) focusElement(last);
      else focusFrame(section);
    }

    wasActiveRef.current = isActive;
    wasMinimizedRef.current = instance.minimized;
  }, [isActive, instance.minimized, instance.id]);

  const onFramePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || instance.minimized || phase !== 'visible') return;
    if (isActive) return;
    pointerHeldRef.current = true;
    actions.focusWindow(instance.id);
    if (!isFocusableTarget(event.target)) focusFrame(frameRef.current);
  };

  const onFrameFocus = (event: FocusEvent<HTMLElement>) => {
    const section = frameRef.current;
    const target = event.target;
    if (!section || !(target instanceof HTMLElement)) return;
    if (target !== section) lastFocusedRef.current = target;
    if (!isActive && !instance.minimized) actions.focusWindow(instance.id);
  };

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (drag.blockDoubleClickRef.current) return;
    if (event.target instanceof Element && event.target.closest('button'))
      return;
    if (!showMaximize) return;
    actions.toggleMaximize(instance.id);
  };

  const onMinimizeAnimationComplete = (definition: unknown) => {
    // Open and restore settle at full opacity. Only the minimize target
    // hides the window, so a finishing enter animation cannot conceal it.
    if (!isMinimizeDefinition(definition)) return;
    setSnapshot((current) => phaseOnConcealed(current));
  };

  return (
    <Window
      instance={instance}
      title={title}
      titleId={titleId}
      isActive={isActive}
      layoutMode={layoutMode}
      isFront={isFront}
      phase={phase}
      style={style}
      flat={flat}
      showMaximize={showMaximize}
      canResize={canResize}
      zooming={zooming}
      initial={presence.initial}
      animate={animate}
      exit={presence.exit}
      frameRef={frameRef}
      onFramePointerDown={onFramePointerDown}
      onFrameFocus={onFrameFocus}
      onTitlePointerDown={drag.onPointerDown}
      onDoubleClick={onDoubleClick}
      onResizePointerDown={resize.onPointerDown}
      onMinimize={() => actions.minimizeWindow(instance.id)}
      onToggleMaximize={() => actions.toggleMaximize(instance.id)}
      onClose={() => actions.closeWindow(instance.id)}
      onMinimizeAnimationComplete={onMinimizeAnimationComplete}
    />
  );
}

export const WindowBehavior = memo(WindowBehaviorComponent);

function isMinimizeDefinition(definition: unknown): boolean {
  return (
    typeof definition === 'object' &&
    definition !== null &&
    'opacity' in definition &&
    definition.opacity === 0
  );
}

function sameBounds(a: Bounds, b: Bounds): boolean {
  return (
    Math.abs(a.x - b.x) < 0.5 &&
    Math.abs(a.y - b.y) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/** Visual box of the frame, in the same space as `displayBounds`. */
function boundsInOffsetParent(frame: HTMLElement): Bounds {
  const parent = frame.offsetParent;
  const origin =
    parent instanceof HTMLElement
      ? parent.getBoundingClientRect()
      : { left: 0, top: 0 };
  const rect = frame.getBoundingClientRect();
  return {
    x: rect.left - origin.left,
    y: rect.top - origin.top,
    width: rect.width,
    height: rect.height,
  };
}

function focusElement(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}

/** The frame is focused so its name is announced. The ring would read as a second border. */
function focusFrame(element: HTMLElement | null) {
  element?.focus({ preventScroll: true, focusVisible: false });
}

function isFocusableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('button, a, input, select, textarea') !== null
  );
}

/** Center of the taskbar button minus the center of the frame, in viewport pixels. */
function taskbarOffset(frame: HTMLElement, id: WindowId): MotionOffset | null {
  const anchor = getTaskbarAnchorRect(id);
  if (!anchor || anchor.width === 0 || anchor.height === 0) return null;
  const rect = frame.getBoundingClientRect();
  return {
    x: anchor.left + anchor.width / 2 - (rect.left + rect.width / 2),
    y: anchor.top + anchor.height / 2 - (rect.top + rect.height / 2),
  };
}

function focusTaskbarItem(id: WindowId) {
  const anchor = getTaskbarAnchorRect(id);
  if (!anchor || anchor.width === 0 || anchor.height === 0) return;
  const hit = document.elementFromPoint(
    anchor.left + anchor.width / 2,
    anchor.top + anchor.height / 2,
  );
  const button = hit?.closest('button');
  if (button instanceof HTMLElement) focusElement(button);
}
