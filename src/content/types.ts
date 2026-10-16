export interface ImageAsset {
  src: string;
  alt: string;
  /** Intrinsic px; required to prevent layout shift. */
  width: number;
  height: number;
}

export type IconId =
  | 'folder-about'
  | 'folder-projects'
  | 'folder-experiments'
  | 'file-project'
  | 'file-experiment'
  | 'file-profile'
  | 'file-missing'
  | 'brand-github'
  | 'brand-linkedin'
  | 'brand-instagram';
