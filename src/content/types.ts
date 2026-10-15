import type { ComponentType } from 'react';

export type ContentKind = 'folder' | 'project' | 'experiment' | 'profile' | 'link' | 'system';

/** Computed by the registry as `${kind}:${slug}`. Authors never write this. */
export type ContentKey = `${ContentKind}:${string}`;

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

export type ParentId = 'desktop' | `folder:${string}`;

export interface ImageAsset {
  src: string;
  alt: string;
  /** Intrinsic px; required to prevent layout shift. */
  width: number;
  height: number;
}

interface BaseContent<K extends ContentKind> {
  kind: K;
  /** Unique within kind; also the URL segment. */
  slug: string;
  /** Human title: icon label, window title, taskbar. */
  title: string;
  /** Developer flavour shown in mono, for example `readme.md`. */
  fileName?: string;
  /** One-liner for tooltips, meta description, and cards. */
  summary?: string;
  icon: IconId;
  /** Where it appears. Folder contents are derived from this. */
  parent: ParentId;
  /** Ascending. Ties fall back to title. */
  order?: number;
}

export interface FolderItem extends BaseContent<'folder'> {
  accent: 'about' | 'projects' | 'experiments';
  /** Shown when the folder has no children. */
  emptyText: string;
}

export type ProjectStatus = 'live' | 'in-progress' | 'archived';

export interface ProjectItem extends BaseContent<'project'> {
  origin: 'client' | 'personal';
  category: 'E-commerce' | 'Web application' | 'Website';
  /** Paragraphs separated by a blank line. */
  description: string;
  technologies: readonly string[];
  year?: number;
  status?: ProjectStatus;
  /** For example `Frontend lead` or `Solo build`. */
  role?: string;
  /** About Me "Selected work". */
  featured?: boolean;
  cover?: ImageAsset;
  gallery?: readonly ImageAsset[];
  liveUrl?: string;
  repositoryUrl?: string;
}

export interface ExperimentItem extends BaseContent<'experiment'> {
  description: string;
  technologies: readonly string[];
  year?: number;
  status?: 'in-progress' | 'archived';
  cover?: ImageAsset;
  repositoryUrl?: string;
  /** Lazy demo, mounted only after "Run". */
  demo?: () => Promise<{ default: ComponentType }>;
}

export interface ProfileItem extends BaseContent<'profile'> {
  section: 'profile' | 'experience' | 'skills' | 'contact';
}

export interface LinkItem extends BaseContent<'link'> {
  /** Absolute URL. The value lives in site configuration. */
  href: string;
}

// System items (the not-found window) add no fields of their own.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SystemItem extends BaseContent<'system'> {}

export type ContentItem =
  | FolderItem
  | ProjectItem
  | ExperimentItem
  | ProfileItem
  | LinkItem
  | SystemItem;
