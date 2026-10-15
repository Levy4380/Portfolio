import type { WindowKind } from '../state/types.ts';

export interface WindowPreset {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  /**
   * `Number.POSITIVE_INFINITY` means the desktop area height.
   * Geometry still caps every preset by the area minus the gutter.
   */
  maxHeight: number;
  resizable: boolean;
  maximizable: boolean;
}

const folder: WindowPreset = {
  defaultWidth: 720,
  defaultHeight: 480,
  minWidth: 400,
  minHeight: 280,
  maxWidth: 1040,
  maxHeight: 760,
  resizable: true,
  maximizable: true,
};

const documentPreset: WindowPreset = {
  defaultWidth: 880,
  defaultHeight: 640,
  minWidth: 480,
  minHeight: 360,
  maxWidth: 1280,
  maxHeight: Number.POSITIVE_INFINITY,
  resizable: true,
  maximizable: true,
};

const profile: WindowPreset = {
  defaultWidth: 760,
  defaultHeight: 600,
  minWidth: 440,
  minHeight: 360,
  maxWidth: 960,
  maxHeight: 880,
  resizable: true,
  maximizable: true,
};

const dialog: WindowPreset = {
  defaultWidth: 420,
  defaultHeight: 220,
  minWidth: 420,
  minHeight: 220,
  maxWidth: 420,
  maxHeight: 220,
  resizable: false,
  maximizable: false,
};

export function presetFor(kind: WindowKind): WindowPreset {
  switch (kind) {
    case 'folder':
      return folder;
    case 'project':
    case 'experiment':
      return documentPreset;
    case 'profile':
      return profile;
    case 'system':
      return dialog;
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}
