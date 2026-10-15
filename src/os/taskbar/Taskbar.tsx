import { Layers } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { cn } from '../../lib/cn.ts';
import { taskbarItemPresence } from '../motion.ts';
import { useWindowActions, useWindowState } from '../state/useWindowActions.ts';
import { PinnedLinks } from './PinnedLinks.tsx';
import { StartButton, type StartMenuFocus } from './StartButton.tsx';
import { START_MENU_ID, StartMenu } from './StartMenu.tsx';
import { TaskbarWindowItem } from './TaskbarWindowItem.tsx';
import { TrayClock } from './TrayClock.tsx';
import { WINDOW_SWITCHER_ID, WindowSwitcher } from './WindowSwitcher.tsx';

/** Below Tailwind's `md` (768px). */
const MOBILE_QUERY = '(max-width: 767.98px)';

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
  const [startFocus, setStartFocus] = useState<StartMenuFocus | null>(null);
  const [switcherRequested, setSwitcherRequested] = useState(false);
  // The sheet only exists below `md`; resizing up closes it without an effect.
  const switcherOpen = switcherRequested && mobile;
  const startOpen = startFocus !== null;

  const closeStart = useCallback((restoreFocus: boolean) => {
    setStartFocus(null);
    if (restoreFocus) startRef.current?.focus();
  }, []);

  const closeSwitcher = useCallback((restoreFocus: boolean) => {
    setSwitcherRequested(false);
    if (restoreFocus) windowsRef.current?.focus();
  }, []);

  const openStart = (focus: StartMenuFocus) => {
    setSwitcherRequested(false);
    setStartFocus(focus);
  };

  const toggleStart = () => {
    if (startOpen) closeStart(false);
    else openStart('first');
  };

  const openStartFromKey = (focus: StartMenuFocus) => {
    if (!startOpen) {
      openStart(focus);
      return;
    }
    // Already open: move into it.
    const items = document.querySelectorAll<HTMLElement>(`#${START_MENU_ID} [role="menuitem"]`);
    (focus === 'last' ? items[items.length - 1] : items[0])?.focus();
  };

  const toggleSwitcher = () => {
    setStartFocus(null);
    setSwitcherRequested((open) => !open);
  };

  const itemMotion = taskbarItemPresence(reduced);
  const count = taskbarItems.length;

  return (
    <>
      <nav
        id="taskbar"
        tabIndex={-1}
        aria-label="Taskbar"
        data-surface="dark"
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
                className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent-on-dark px-1 font-mono text-meta font-semibold leading-4 tabular-nums text-ink-950"
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
        {startOpen ? (
          <StartMenu
            key="start-menu"
            mobile={mobile}
            initialFocus={startFocus}
            triggerRef={startRef}
            onClose={closeStart}
          />
        ) : null}
        {switcherOpen ? (
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
