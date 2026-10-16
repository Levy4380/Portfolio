export type Phase = 'visible' | 'minimizing' | 'hidden';

export type MotionMode = 'open' | 'restore';

/** Last persisted minimize transition. Painting reads a derived copy of this. */
export interface PhaseSnapshot {
  minimized: boolean;
  concealed: boolean;
  motionMode: MotionMode;
}

export interface ResolvedPhase {
  phase: Phase;
  motionMode: MotionMode;
}

/**
 * Phase to paint this render. Does not mutate `snapshot`.
 * A restore (`minimized` true → false) is `visible` with motion mode
 * `restore` on this same call.
 */
export function resolvePhase(
  snapshot: PhaseSnapshot,
  minimized: boolean,
): ResolvedPhase {
  const next = phaseOnMinimizedChange(snapshot, minimized);
  return { phase: phaseOf(next), motionMode: next.motionMode };
}

/** Next snapshot after `minimized` changes. Same reference when nothing changed. */
export function phaseOnMinimizedChange(
  snapshot: PhaseSnapshot,
  minimized: boolean,
): PhaseSnapshot {
  if (snapshot.minimized === minimized) {
    if (!minimized && snapshot.concealed) {
      return { minimized, concealed: false, motionMode: snapshot.motionMode };
    }
    return snapshot;
  }
  if (minimized) {
    return {
      minimized: true,
      concealed: false,
      motionMode: snapshot.motionMode,
    };
  }
  return { minimized: false, concealed: false, motionMode: 'restore' };
}

/** Hide a minimized window after the minimize motion. No-op once restored. */
export function phaseOnConcealed(snapshot: PhaseSnapshot): PhaseSnapshot {
  if (!snapshot.minimized || snapshot.concealed) return snapshot;
  return { ...snapshot, concealed: true };
}

function phaseOf(snapshot: PhaseSnapshot): Phase {
  if (!snapshot.minimized) return 'visible';
  return snapshot.concealed ? 'hidden' : 'minimizing';
}
