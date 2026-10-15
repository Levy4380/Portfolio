import { useCallback, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

const OPTION_SELECTOR = '[role="option"]';

type Flow = 'row' | 'column';

export interface UseRovingGridOptions {
  /** Number of options currently rendered. */
  count: number;
  /** Arrow, Home or End moved focus. Selection follows focus. */
  onMove: (index: number) => void;
  /** Space: select without opening. */
  onSelect: (index: number) => void;
  /** Enter: open. */
  onActivate: (index: number) => void;
}

export interface UseRovingGridResult {
  /** Attach to the `role="listbox"` element. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The single tab stop. Always a valid index when `count > 0`. */
  activeIndex: number;
  /** Call from an option's `onFocus` so mouse and Tab focus keep the tab stop in sync. */
  setActiveIndex: (index: number) => void;
  /** Attach to the `role="listbox"` element. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

interface Center {
  x: number;
  y: number;
  w: number;
  h: number;
}

function centerOf(el: HTMLElement): Center {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

/**
 * Reads the visual flow from the DOM so the same hook serves the column-major
 * desktop grid, the row-major tablet/mobile grid and folder windows, whatever
 * Tailwind breakpoint is active.
 */
function detectFlow(centers: readonly Center[]): Flow {
  const first = centers[0];
  const second = centers[1];
  if (!first || !second) return 'row';
  const below = second.y > first.y + first.h / 2;
  const sameColumn = Math.abs(second.x - first.x) < first.w / 2;
  return below && sameColumn ? 'column' : 'row';
}

type ArrowKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

function nextIndex(current: number, key: ArrowKey, centers: readonly Center[]): number {
  const here = centers[current];
  if (!here) return current;

  const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
  const forward = key === 'ArrowRight' || key === 'ArrowDown';

  let best = -1;
  let bestDistance = Infinity;

  centers.forEach((c, i) => {
    if (i === current) return;
    const crossOffset = horizontal ? Math.abs(c.y - here.y) : Math.abs(c.x - here.x);
    const crossLimit = (horizontal ? here.h : here.w) / 2;
    if (crossOffset >= crossLimit) return;

    const delta = horizontal ? c.x - here.x : c.y - here.y;
    if (forward ? delta <= 1 : delta >= -1) return;

    const distance = Math.abs(delta);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });

  if (best !== -1) return best;

  // Nothing further along that line. Along the flow axis the grid continues in
  // DOM order (the next column on the desktop, the next row elsewhere).
  // Across the flow axis there is nowhere to go, so focus stays put.
  const flow = detectFlow(centers);
  const alongFlow = (flow === 'column') !== horizontal;
  if (!alongFlow) return current;

  const step = forward ? current + 1 : current - 1;
  return Math.min(Math.max(step, 0), centers.length - 1);
}

export function useRovingGrid({
  count,
  onMove,
  onSelect,
  onActivate,
}: UseRovingGridOptions): UseRovingGridResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rawActive, setRawActive] = useState(0);

  const activeIndex = Math.min(Math.max(rawActive, 0), Math.max(count - 1, 0));

  const setActiveIndex = useCallback((index: number) => {
    setRawActive(index);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const container = containerRef.current;
      const target = event.target instanceof Element ? event.target.closest(OPTION_SELECTOR) : null;
      if (!container || !(target instanceof HTMLElement)) return;

      const options = Array.from(container.querySelectorAll<HTMLElement>(OPTION_SELECTOR));
      const current = options.indexOf(target);
      if (current === -1 || options.length === 0) return;

      const moveTo = (index: number) => {
        event.preventDefault();
        const el = options[index];
        if (!el) return;
        setRawActive(index);
        el.focus();
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        onMove(index);
      };

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          moveTo(nextIndex(current, event.key, options.map(centerOf)));
          break;
        case 'Home':
          moveTo(0);
          break;
        case 'End':
          moveTo(options.length - 1);
          break;
        case 'Enter':
          event.preventDefault();
          onActivate(current);
          break;
        case ' ':
        case 'Spacebar':
          // Prevents the page from scrolling; selects without opening.
          event.preventDefault();
          onSelect(current);
          break;
        default:
          break;
      }
    },
    [onActivate, onMove, onSelect],
  );

  return { containerRef, activeIndex, setActiveIndex, onKeyDown };
}
