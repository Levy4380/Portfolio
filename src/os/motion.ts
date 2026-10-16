import type { TargetAndTransition, Transition } from 'motion/react';

/** Milliseconds (§10.1). Motion transitions below convert these to seconds. */
export const duration = {
  instant: 80,
  fast: 120,
  base: 180,
  slow: 240,
} as const;

export const easeOut = [0.2, 0, 0, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;

export type DurationToken = keyof typeof duration;

export interface PresenceMotion {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
}

export interface MotionOffset {
  x: number;
  y: number;
}

/**
 * Duration and easing for one interaction.
 * Reduced motion collapses every transition to the 80ms fade.
 */
export function osTransition(token: DurationToken, easing: 'in' | 'out', reduced = false): Transition {
  if (reduced) {
    return { duration: duration.instant / 1000, ease: easeOut };
  }
  return {
    duration: duration[token] / 1000,
    ease: easing === 'in' ? easeIn : easeOut,
  };
}

const reducedEnter: TargetAndTransition = {
  opacity: 0,
  transition: osTransition('instant', 'out', true),
};

const reducedSettle: TargetAndTransition = {
  opacity: 1,
  transition: osTransition('instant', 'out', true),
};

const reducedExit: TargetAndTransition = {
  opacity: 0,
  transition: osTransition('instant', 'in', true),
};

/** Opacity only, 80ms. Shared by every reduced-motion presence. */
export const reducedPresence: PresenceMotion = {
  initial: reducedEnter,
  animate: reducedSettle,
  exit: reducedExit,
};

const windowPresenceFull: PresenceMotion = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: osTransition('base', 'out'),
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: osTransition('fast', 'in'),
  },
};

const menuPresenceFull: PresenceMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: osTransition('base', 'out') },
  exit: { opacity: 0, y: 4, transition: osTransition('fast', 'in') },
};

const menuSheetPresenceFull: PresenceMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: osTransition('base', 'out') },
  exit: { opacity: 0, y: 4, transition: osTransition('fast', 'in') },
};

const taskbarItemPresenceFull: PresenceMotion = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: osTransition('fast', 'out') },
  exit: { opacity: 0, transition: osTransition('fast', 'in') },
};

const mobilePanelPresenceFull: PresenceMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: osTransition('base', 'out') },
  exit: { opacity: 0, transition: osTransition('fast', 'in') },
};

const windowSettledOpen: TargetAndTransition = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  transition: osTransition('base', 'out'),
};

const windowSettledRestore: TargetAndTransition = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  transition: osTransition('slow', 'out'),
};

const minimizeFallback: TargetAndTransition = {
  opacity: 0,
  y: 24,
  transition: osTransition('slow', 'in'),
};

export function windowPresence(reduced: boolean): PresenceMotion {
  return reduced ? reducedPresence : windowPresenceFull;
}

/** `mobileSheet` uses the 24px rise. Close is the same 4px drop either way. */
const dropPresenceFull: PresenceMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: osTransition('base', 'out') },
  exit: { opacity: 0, y: -4, transition: osTransition('fast', 'in') },
};

export function menuPresence(reduced: boolean, mobileSheet: boolean): PresenceMotion {
  if (reduced) return reducedPresence;
  return mobileSheet ? menuSheetPresenceFull : menuPresenceFull;
}

/** Menu that opens downward from the menu bar. */
export function dropPresence(reduced: boolean): PresenceMotion {
  return reduced ? reducedPresence : dropPresenceFull;
}

export function taskbarItemPresence(reduced: boolean): PresenceMotion {
  return reduced ? reducedPresence : taskbarItemPresenceFull;
}

export function mobilePanelPresence(reduced: boolean): PresenceMotion {
  return reduced ? reducedPresence : mobilePanelPresenceFull;
}

/** End state after open (`base`) or restore (`slow`). Reduced motion is opacity only. */
export function windowSettled(reduced: boolean, mode: 'open' | 'restore'): TargetAndTransition {
  if (reduced) return reducedSettle;
  return mode === 'open' ? windowSettledOpen : windowSettledRestore;
}

/**
 * Minimize destination. `offset` is itemCenter − windowCenter.
 * Null offset falls back to a 24px drop. Reduced motion does not travel.
 */
export function minimizeTarget(reduced: boolean, offset: MotionOffset | null): TargetAndTransition {
  if (reduced) return reducedExit;
  if (offset === null) return minimizeFallback;
  return {
    opacity: 0,
    x: offset.x,
    y: offset.y,
    scale: 0.25,
    transition: osTransition('slow', 'in'),
  };
}
