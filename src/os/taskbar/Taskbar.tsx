import { Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { RefObject } from 'react';

import { useLanguage, useTranslation } from '../../content/i18n/useTranslation.ts';
import { cn } from '../../lib/cn.ts';
import { taskbarItemPresence } from '../motion.ts';
import type { WindowId, WindowInstance } from '../state/StateHelpers/types.ts';
import type { TaskbarPanel } from './panelState.ts';
import {
  StartButton,
  type StartMenuFocus,
} from './TaskbarComponents/StartButton.tsx';
import { START_MENU_ID } from './TaskbarComponents/StartMenu.tsx';
import { StartMenuBehavior } from './TaskbarComponents/StartMenuBehavior.tsx';
import { PinnedLinks } from './TaskbarComponents/PinnedLinks.tsx';
import { TaskbarWindowItem } from './TaskbarComponents/TaskbarWindowItem.tsx';
import { TrayClock } from './TaskbarComponents/TrayClock.tsx';
import { WINDOW_SWITCHER_ID } from './TaskbarComponents/WindowSwitcher.tsx';
import { WindowSwitcherBehavior } from './TaskbarComponents/WindowSwitcherBehavior.tsx';

export interface TaskbarProps {
  /** True when `layoutMode` is mobile. */
  mobile: boolean;
  reduced: boolean;
  panel: TaskbarPanel;
  taskbarItems: readonly WindowInstance[];
  activeId: WindowId | null;
  startRef: RefObject<HTMLButtonElement | null>;
  windowsRef: RefObject<HTMLButtonElement | null>;
  onToggleStart: () => void;
  onOpenStartFromKey: (focus: StartMenuFocus) => void;
  /** `restoreFocus` returns focus to the Start button. Must be referentially stable. */
  onCloseStart: (restoreFocus: boolean) => void;
  onToggleSwitcher: () => void;
  /** `restoreFocus` returns focus to the Windows button. Must be referentially stable. */
  onCloseSwitcher: (restoreFocus: boolean) => void;
  onFocusWindow: (id: WindowId) => void;
  onMinimizeWindow: (id: WindowId) => void;
  onCloseWindow: (id: WindowId) => void;
}

/**
 * Bottom bar. It owns no window list: items come from `taskbarItems`.
 * Desktop: Start | pinned links | divider | window list | clock and date.
 * Mobile: Start | Windows button (count badge) | clock, with the switcher sheet.
 */
export function Taskbar({
  mobile,
  reduced,
  panel,
  taskbarItems,
  activeId,
  startRef,
  windowsRef,
  onToggleStart,
  onOpenStartFromKey,
  onCloseStart,
  onToggleSwitcher,
  onCloseSwitcher,
  onFocusWindow,
  onMinimizeWindow,
  onCloseWindow,
}: TaskbarProps) {
  const { language } = useLanguage();
  const translation = useTranslation(language);
  const startOpen = panel?.kind === 'start';
  const switcherOpen = panel?.kind === 'switcher';
  const itemMotion = taskbarItemPresence(reduced);
  const count = taskbarItems.length;

  return (
    <>
      <nav
        id="taskbar"
        tabIndex={-1}
        aria-label={translation('os.taskbar')}
        className={cn(
          'fixed inset-x-0 bottom-0 z-1000 flex items-center gap-1 px-8 text-fg-inverse',
          'bg-taskbar shadow-taskbar backdrop-blur-md',
          'h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] md:h-12 md:pb-0',
        )}
      >
        <StartButton
          ref={startRef}
          open={startOpen}
          onToggle={onToggleStart}
          onOpenFrom={onOpenStartFromKey}
          controlsId={START_MENU_ID}
        />

        {mobile ? (
          <button
            ref={windowsRef}
            type="button"
            aria-label={translation('os.openWindowsCount', { count })}
            aria-haspopup="dialog"
            aria-expanded={switcherOpen}
            aria-controls={WINDOW_SWITCHER_ID}
            onClick={onToggleSwitcher}
            className="relative grid h-11 w-12 shrink-0 place-items-center rounded-control text-fg-inverse select-none touch-manipulation transition-colors duration-120 focus-ring focus-visible:-outline-offset-2 hover:bg-glass-hover active:scale-97 active:bg-glass-active aria-expanded:bg-glass-active motion-reduce:active:scale-100"
          >
            <Layers aria-hidden className="size-5" />
            {count > 0 ? (
              <span
                aria-hidden
                className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent-on-dark px-1 font-mono text-meta font-semibold leading-4 tabular-nums text-on-accent"
              >
                {count}
              </span>
            ) : null}
          </button>
        ) : (
          <>
            <PinnedLinks />
            <span
              aria-hidden
              className="mx-1 h-6 shrink-0 border-l border-edge-dark"
            />
            <ul
              aria-label={translation('os.openWindows')}
              className="flex min-w-0 flex-1 items-center gap-1"
            >
              <AnimatePresence initial={false}>
                {taskbarItems.map((instance) => (
                  <motion.li
                    key={instance.id}
                    initial={itemMotion.initial}
                    animate={itemMotion.animate}
                    exit={itemMotion.exit}
                    className="min-w-10 max-w-48 shrink"
                  >
                    <TaskbarWindowItem
                      instance={instance}
                      isActive={activeId === instance.id && !instance.minimized}
                      onFocus={onFocusWindow}
                      onMinimize={onMinimizeWindow}
                      onClose={onCloseWindow}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center">
          <TrayClock />
        </div>
      </nav>

      <AnimatePresence>
        {panel?.kind === 'start' ? (
          <StartMenuBehavior
            key="start-menu"
            mobile={mobile}
            initialFocus={panel.focus}
            focusRequest={panel.focusRequest}
            triggerRef={startRef}
            onClose={onCloseStart}
          />
        ) : null}
        {panel?.kind === 'switcher' ? (
          <WindowSwitcherBehavior
            key="window-switcher"
            items={taskbarItems}
            activeId={activeId}
            triggerRef={windowsRef}
            onFocusWindow={onFocusWindow}
            onCloseWindow={onCloseWindow}
            onClose={onCloseSwitcher}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
