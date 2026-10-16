import { Layers } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import { cn } from '../../lib/cn.ts';
import { taskbarItemPresence } from '../motion.ts';
import { useWindowActions, useWindowState } from '../state/StateHelpers/useWindowActions.ts';
import { PinnedLinks } from './TaskbarComponents/PinnedLinks.tsx';
import { StartButton, type StartMenuFocus } from './TaskbarComponents/StartButton.tsx';
import { START_MENU_ID, StartMenu } from './TaskbarComponents/StartMenu.tsx';
import { TaskbarWindowItem } from './TaskbarComponents/TaskbarWindowItem.tsx';
import { TrayClock } from './TaskbarComponents/TrayClock.tsx';
import { WINDOW_SWITCHER_ID, WindowSwitcher } from './TaskbarComponents/WindowSwitcher.tsx';

/** Below Tailwind's `md` (768px). */
const MOBILE_QUERY = '(max-width: 767.98px)';

/** One surface at a time. Start and the switcher cannot both be open. */
type TaskbarPanel =
  | { kind: 'start'; focus: StartMenuFocus; focusRequest: number }
  | { kind: 'switcher' };

function subscribeMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getMobileServerSnapshot = () => false;

/**
 * Bottom bar. It owns no window list: items come from `taskbarItems`.
 * Desktop: Start | pinned links | divider | window list | clock.
 * Mobile: Start | Windows button (count badge) | clock, with the switcher sheet.
 */
export function Taskbar() {
  const { state, taskbarItems } = useWindowState();
  const { focusWindow, minimizeWindow, closeWindow } = useWindowActions();
  const reduced = useReducedMotion() ?? false;
  const mobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);

  const startRef = useRef<HTMLButtonElement>(null);
  const windowsRef = useRef<HTMLButtonElement>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  const [panel, setPanel] = useState<TaskbarPanel | null>(null);
  const [trackedMobile, setTrackedMobile] = useState(mobile);

  // The sheet only exists below `md`. Clearing it with the viewport change
  // means a later resize back down does not reopen it.
  if (mobile !== trackedMobile) {
    setTrackedMobile(mobile);
    if (!mobile && panel?.kind === 'switcher') setPanel(null);
  }

  const startOpen = panel?.kind === 'start';
  const switcherOpen = panel?.kind === 'switcher';

  useLayoutEffect(() => {
    if (panel !== null) return;
    const node = focusReturn.current;
    focusReturn.current = null;
    node?.focus();
  }, [panel]);

  const closeStart = useCallback((restoreFocus: boolean) => {
    focusReturn.current = restoreFocus ? startRef.current : null;
    setPanel((current) => (current?.kind === 'start' ? null : current));
  }, []);

  const closeSwitcher = useCallback((restoreFocus: boolean) => {
    focusReturn.current = restoreFocus ? windowsRef.current : null;
    setPanel((current) => (current?.kind === 'switcher' ? null : current));
  }, []);

  const toggleStart = () => {
    setPanel((current) =>
      current?.kind === 'start' ? null : { kind: 'start', focus: 'first', focusRequest: 0 },
    );
  };

  const openStartFromKey = (focus: StartMenuFocus) => {
    setPanel((current) => ({
      kind: 'start',
      focus,
      focusRequest: current?.kind === 'start' ? current.focusRequest + 1 : 0,
    }));
  };

  const toggleSwitcher = () => {
    setPanel((current) => (current?.kind === 'switcher' ? null : { kind: 'switcher' }));
  };

  const itemMotion = taskbarItemPresence(reduced);
  const count = taskbarItems.length;

  return (
    <>
      <nav
        id="taskbar"
        tabIndex={-1}
        aria-label="Taskbar"
        className={cn(
          'fixed inset-x-0 bottom-0 z-1000 flex items-center gap-1 px-2 text-fg-inverse',
          'bg-taskbar shadow-taskbar backdrop-blur-md',
          'h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] md:h-12 md:pb-0',
        )}
      >
        <StartButton
          ref={startRef}
          open={startOpen}
          onToggle={toggleStart}
          onOpenFrom={openStartFromKey}
          controlsId={START_MENU_ID}
        />

        {mobile ? (
          <button
            ref={windowsRef}
            type="button"
            aria-label={`Open windows, ${count}`}
            aria-haspopup="dialog"
            aria-expanded={switcherOpen}
            aria-controls={WINDOW_SWITCHER_ID}
            onClick={toggleSwitcher}
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
            <span aria-hidden className="mx-1 h-6 shrink-0 border-l border-edge-dark" />
            <ul aria-label="Open windows" className="flex min-w-0 flex-1 items-center gap-1">
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
                      isActive={state.activeId === instance.id && !instance.minimized}
                      onFocus={focusWindow}
                      onMinimize={minimizeWindow}
                      onClose={closeWindow}
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
          <StartMenu
            key="start-menu"
            mobile={mobile}
            initialFocus={panel.focus}
            focusRequest={panel.focusRequest}
            triggerRef={startRef}
            onClose={closeStart}
          />
        ) : null}
        {panel?.kind === 'switcher' ? (
          <WindowSwitcher
            key="window-switcher"
            items={taskbarItems}
            activeId={state.activeId}
            triggerRef={windowsRef}
            onFocusWindow={focusWindow}
            onCloseWindow={closeWindow}
            onClose={closeSwitcher}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
