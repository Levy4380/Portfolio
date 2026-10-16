import type {
  CSSProperties,
  FocusEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
} from 'react';
import { motion, type TargetAndTransition } from 'motion/react';

import { cn } from '../../lib/cn.ts';
import type {
  LayoutMode,
  WindowInstance,
} from '../state/StateHelpers/types.ts';
import type { Phase } from './windowPhase.ts';
import { OpenedDocument, WindowBody } from './WindowsComponents/WindowBody.tsx';
import { WindowResizeHandle } from './WindowsComponents/WindowResizeHandle.tsx';
import { WindowTitleBar } from './WindowsComponents/WindowTitleBar.tsx';
import { RESIZE_EDGES } from './WindowsHelpers/geometry.ts';

export interface WindowShellProps {
  instance: WindowInstance;
  title: string;
  titleId: string;
  isActive: boolean;
  layoutMode: LayoutMode;
  isFront: boolean;
  phase: Phase;
  style: CSSProperties;
  flat: boolean;
  showMaximize: boolean;
  canResize: boolean;
  /** Maximize tween is running; chrome must not also ease its shadow. */
  zooming: boolean;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  frameRef: RefObject<HTMLElement | null>;
  onFramePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onFrameFocus: (event: FocusEvent<HTMLElement>) => void;
  onTitlePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onDoubleClick: (event: MouseEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onMinimizeAnimationComplete: (definition: unknown) => void;
}

export function Window({
  instance,
  title,
  titleId,
  isActive,
  layoutMode,
  isFront,
  phase,
  style,
  flat,
  showMaximize,
  canResize,
  zooming,
  initial,
  animate,
  exit,
  frameRef,
  onFramePointerDown,
  onFrameFocus,
  onTitlePointerDown,
  onDoubleClick,
  onResizePointerDown,
  onMinimize,
  onToggleMaximize,
  onClose,
  onMinimizeAnimationComplete,
}: WindowShellProps) {
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
      style={style}
      className={cn(
        'absolute top-0 left-0 pointer-events-auto focus-ring',
        flat ? 'rounded-none' : 'rounded-window',
        unavailable && 'pointer-events-none',
      )}
      onPointerDown={onFramePointerDown}
      onFocus={onFrameFocus}
    >
        <motion.div
        data-window-chrome=""
        className={cn(
          'relative flex h-full min-h-0 flex-col overflow-hidden border border-edge bg-window',
          zooming
            ? 'transition-none'
            : 'transition-[box-shadow,background-color,color] duration-fast ease-os-out motion-reduce:transition-none',
          flat ? 'rounded-none shadow-none' : 'rounded-window',
          !flat && (isActive ? 'shadow-window-active' : 'shadow-window'),
        )}
        initial={initial}
        animate={animate}
        exit={exit}
        onAnimationComplete={(definition) => {
          onMinimizeAnimationComplete(definition);
        }}
      >
        <WindowTitleBar
          titleId={titleId}
          title={title}
          isActive={isActive}
          layoutMode={layoutMode}
          showMaximize={showMaximize}
          maximized={instance.maximized}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
          onClose={onClose}
          onPointerDown={onTitlePointerDown}
          onDoubleClick={onDoubleClick}
        >
          {title}
        </WindowTitleBar>
        <div className="flex min-h-0 flex-1 flex-col">
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
        {canResize
          ? RESIZE_EDGES.map((edge) => (
              <WindowResizeHandle
                key={edge}
                edge={edge}
                onPointerDown={onResizePointerDown}
              />
            ))
          : null}
      </motion.div>
    </section>
  );
}
