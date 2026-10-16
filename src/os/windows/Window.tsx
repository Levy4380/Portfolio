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
import { motion, useReducedMotion } from 'motion/react';

import { announce } from '../a11y/A11yHelpers/announce.ts';
import { titleFor } from '../../content/catalog.ts';
import type { WindowFrameProps } from '../contracts.ts';
import {
  duration,
  minimizeTarget,
  mobilePanelPresence,
  windowPresence,
  windowSettled,
  type MotionOffset,
} from '../motion.ts';
import type { Bounds, Viewport } from '../state/StateHelpers/types.ts';
import { useWindowActions } from '../state/StateHelpers/useWindowActions.ts';
import { getTaskbarAnchorRect } from '../taskbar/TaskbarHelpers/taskbarAnchors.ts';
import { cn } from '../../lib/cn.ts';
import { displayBounds } from './WindowsHelpers/geometry.ts';
import { presetFor } from './WindowsHelpers/presets.ts';
import { useWindowDrag } from './WindowsHelpers/useWindowDrag.ts';
import { useWindowResize } from './WindowsHelpers/useWindowResize.ts';
import { OpenedDocument, WindowBody } from './WindowsComponents/WindowBody.tsx';
import { WindowResizeHandle } from './WindowsComponents/WindowResizeHandle.tsx';
import { WindowTitleBar } from './WindowsComponents/WindowTitleBar.tsx';

export interface WindowProps extends WindowFrameProps {
  /** Desktop-area viewport used by `displayBounds`. */
  viewport: Viewport;
  /** Frontmost non-minimized window. Mobile panels behind this one are inert. */
  isFront: boolean;
}

type Phase = 'visible' | 'minimizing' | 'hidden';

function WindowComponent({
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
  const liveBoundsRef = useRef<Bounds | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const pointerHeldRef = useRef(false);
  const mountedRef = useRef(false);
  const wasActiveRef = useRef(isActive);
  const wasMinimizedRef = useRef(instance.minimized);
  const announcedMinimizedRef = useRef(instance.minimized);

  const title = titleFor(instance.contentId);
  const preset = presetFor(instance.preset);
  const reduced = useReducedMotion() === true;

  const [concealed, setConcealed] = useState(false);
  const [minimizeOffset, setMinimizeOffset] = useState<MotionOffset | null>(
    null,
  );
  const [motionMode, setMotionMode] = useState<'open' | 'restore'>('open');
  const [trackedMinimized, setTrackedMinimized] = useState(instance.minimized);
  const [dimmed, setDimmed] = useState(false);

  if (!instance.minimized && concealed) setConcealed(false);
  if (instance.minimized !== trackedMinimized) {
    setTrackedMinimized(instance.minimized);
    if (!instance.minimized && trackedMinimized) setMotionMode('restore');
  }

  const phase: Phase = !instance.minimized
    ? 'visible'
    : concealed
      ? 'hidden'
      : 'minimizing';
  const flat =
    layoutMode === 'mobile' || (layoutMode === 'desktop' && instance.maximized);
  const showMaximize = layoutMode === 'desktop' && preset.maximizable;
  const canDrag = layoutMode === 'desktop' && !instance.maximized;
  const canResize = canDrag && preset.resizable;

  const bounds = displayBounds(instance, layoutMode, viewport);
  const frameStyle = {
    transform: `translate3d(${bounds.x}px, ${bounds.y}px, 0)`,
    width: bounds.width,
    height: bounds.height,
    zIndex,
  };

  const getBounds = () => displayBounds(instance, layoutMode, viewport);
  const getViewport = () => viewport;
  const getPreset = () => presetFor(instance.preset);

  const drag = useWindowDrag({
    enabled: canDrag,
    frameRef,
    liveBoundsRef,
    getBounds,
    getViewport,
    onCommit: (x, y) => actions.move(instance.id, x, y),
  });

  const resize = useWindowResize({
    enabled: canResize,
    frameRef,
    liveBoundsRef,
    getBounds,
    getViewport,
    getPreset,
    onCommit: (next) => actions.resize(instance.id, next),
  });

  useLayoutEffect(() => {
    const live = liveBoundsRef.current;
    const el = frameRef.current;
    if (!live || !el) return;
    el.style.transform = `translate3d(${live.x}px, ${live.y}px, 0)`;
    el.style.width = `${live.width}px`;
    el.style.height = `${live.height}px`;
  });

  useLayoutEffect(() => {
    if (!instance.minimized) return;
    const frame = frameRef.current;
    setMinimizeOffset(frame ? taskbarOffset(frame, instance.id) : null);
    const ms = reduced ? duration.instant : duration.slow;
    const timeout = window.setTimeout(() => setConcealed(true), ms);
    return () => window.clearTimeout(timeout);
  }, [instance.minimized, instance.id, reduced]);

  useLayoutEffect(() => {
    const section = frameRef.current;
    if (!section) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      if (isActive && !instance.minimized) focusElement(section);
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
      else focusElement(section);
    }

    wasActiveRef.current = isActive;
    wasMinimizedRef.current = instance.minimized;
  }, [isActive, instance.minimized, instance.id]);

  useEffect(() => {
    const message = `${title} opened`;
    const timeout = window.setTimeout(() => announce(message), 0);
    return () => window.clearTimeout(timeout);
  }, [title]);

  useEffect(() => {
    if (announcedMinimizedRef.current === instance.minimized) return;
    announcedMinimizedRef.current = instance.minimized;
    announce(`${title} ${instance.minimized ? 'minimized' : 'restored'}`);
  }, [instance.minimized, title]);

  const prevMaximized = useRef(instance.maximized);
  useEffect(() => {
    if (prevMaximized.current === instance.maximized) return;
    prevMaximized.current = instance.maximized;
    setDimmed(true);
    const timeout = window.setTimeout(() => setDimmed(false), duration.fast);
    return () => window.clearTimeout(timeout);
  }, [instance.maximized]);

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

  const onFramePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || instance.minimized || phase !== 'visible') return;
    if (isActive) return;
    pointerHeldRef.current = true;
    actions.focusWindow(instance.id);
    if (!isFocusableTarget(event.target)) focusElement(frameRef.current);
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

  const unavailable =
    phase !== 'visible' || (layoutMode === 'mobile' && !isFront);

  return (
    <section
      ref={frameRef}
      role="dialog"
      aria-modal={false}
      id={isActive ? 'active-window' : undefined}
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={phase === 'hidden'}
      inert={unavailable}
      aria-hidden={layoutMode === 'mobile' && !isFront ? true : undefined}
      data-window=""
      data-active={isActive ? '' : undefined}
      data-maximized={
        layoutMode === 'desktop' && instance.maximized ? '' : undefined
      }
      style={frameStyle}
      className={cn(
        'absolute top-0 left-0 focus-ring pointer-events-auto',
        unavailable && 'pointer-events-none',
      )}
      onPointerDown={onFramePointerDown}
      onFocus={onFrameFocus}
    >
      <motion.div
        className={cn(
          'relative flex h-full min-h-0 flex-col overflow-hidden border border-edge bg-window',
          'transition-[box-shadow,background-color,color] duration-fast ease-os-out motion-reduce:transition-none',
          flat ? 'rounded-none shadow-none' : 'rounded-window',
          !flat && (isActive ? 'shadow-window-active' : 'shadow-window'),
        )}
        initial={presence.initial}
        animate={animate}
        exit={presence.exit}
        onAnimationComplete={(definition) => {
          // Open and restore settle at full opacity. Only the minimize target
          // hides the window, so a finishing enter animation cannot conceal it.
          if (!instance.minimized || !isMinimizeDefinition(definition)) return;
          setConcealed(true);
        }}
      >
        <WindowTitleBar
          titleId={titleId}
          title={title}
          isActive={isActive}
          layoutMode={layoutMode}
          showMaximize={showMaximize}
          maximized={instance.maximized}
          onMinimize={() => actions.minimizeWindow(instance.id)}
          onToggleMaximize={() => actions.toggleMaximize(instance.id)}
          onClose={() => actions.closeWindow(instance.id)}
          onPointerDown={drag.onPointerDown}
          onDoubleClick={onDoubleClick}
        >
          {title}
        </WindowTitleBar>
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col transition-opacity duration-fast ease-os-out motion-reduce:transition-none',
            dimmed && 'opacity-0',
          )}
        >
          <WindowBody
            documentId={instance.contentId}
            instanceId={instance.id}
            isActive={isActive}
            requestedPath={instance.meta?.requestedPath}
          >
            <OpenedDocument
              documentId={instance.contentId}
              windowId={instance.id}
              requestedPath={instance.meta?.requestedPath}
            />
          </WindowBody>
        </div>
        {canResize ? (
          <WindowResizeHandle onPointerDown={resize.onPointerDown} />
        ) : null}
      </motion.div>
    </section>
  );
}

export const Window = memo(WindowComponent);

function isMinimizeDefinition(definition: unknown): boolean {
  return (
    typeof definition === 'object' &&
    definition !== null &&
    'opacity' in definition &&
    definition.opacity === 0
  );
}

function focusElement(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}

function isFocusableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('button, a, input, select, textarea') !== null
  );
}

/** Center of the taskbar button minus the center of the frame, in viewport pixels. */
function taskbarOffset(
  frame: HTMLElement,
  id: WindowProps['instance']['id'],
): MotionOffset | null {
  const anchor = getTaskbarAnchorRect(id);
  if (!anchor || anchor.width === 0 || anchor.height === 0) return null;
  const rect = frame.getBoundingClientRect();
  return {
    x: anchor.left + anchor.width / 2 - (rect.left + rect.width / 2),
    y: anchor.top + anchor.height / 2 - (rect.top + rect.height / 2),
  };
}

function focusTaskbarItem(id: WindowProps['instance']['id']) {
  const anchor = getTaskbarAnchorRect(id);
  if (!anchor || anchor.width === 0 || anchor.height === 0) return;
  const hit = document.elementFromPoint(
    anchor.left + anchor.width / 2,
    anchor.top + anchor.height / 2,
  );
  const button = hit?.closest('button');
  if (button instanceof HTMLElement) focusElement(button);
}
