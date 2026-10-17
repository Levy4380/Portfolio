import { createElement, type ReactNode } from 'react';

import type { FileBadge, FileKind } from '../icons/FileIcon.tsx';
import type { FolderAccent } from '../icons/FolderIcon.tsx';
import type { TranslationKey } from './i18n/useTranslation.ts';
import type {
  ContentId,
  PresetName,
  WindowId,
} from '../os/state/StateHelpers/types.ts';

export const NOT_FOUND_ID = 'system:not-found' satisfies ContentId;

export type ShellIcon =
  | { glyph: 'folder'; accent: FolderAccent }
  | { glyph: 'file'; kind: FileKind; badge?: FileBadge };

export interface OpenableProps {
  windowId: WindowId;
}

/**
 * A folder or document the author can open.
 * Static fields are the only facts the shell cannot read from the JSX.
 */
export interface Openable {
  (props: OpenableProps): ReactNode;
  id: ContentId;
  path: string;
  /** Catalog key, resolved with `useTranslation` where the title is shown. */
  title: TranslationKey;
  preset: PresetName;
  icon: ShellIcon;
  summary?: TranslationKey;
  fileName?: string;
  emptyText?: TranslationKey;
}

export interface OpenableConfig {
  id: ContentId;
  path: string;
  title: TranslationKey;
  preset: PresetName;
  icon: ShellIcon;
  summary?: TranslationKey;
  fileName?: string;
  emptyText?: TranslationKey;
}

const byId = new Map<ContentId, Openable>();
const byPath = new Map<string, Openable>();
let desktopFolders: readonly Openable[] = [];

export function defineOpenable(
  config: OpenableConfig,
  render: (props: OpenableProps) => ReactNode,
): Openable {
  const component = Object.assign(render, config);
  const existing = byId.get(component.id);
  if (existing && existing !== component) {
    throw new Error(`Duplicate content id "${component.id}".`);
  }
  const pathOwner = byPath.get(component.path);
  if (pathOwner && pathOwner !== component) {
    throw new Error(`Duplicate content path "${component.path}".`);
  }
  byId.set(component.id, component);
  byPath.set(component.path, component);
  return component;
}

/** Sidebar order. The desktop module sets this from the same folder components it renders. */
export function setDesktopFolders(folders: readonly Openable[]): void {
  desktopFolders = folders;
}

export function getDesktopFolders(): readonly Openable[] {
  return desktopFolders;
}

export function getOpenable(id: ContentId): Openable | undefined {
  return byId.get(id);
}

export function getOpenableByPath(path: string): Openable | undefined {
  return byPath.get(path);
}

/** Mounts the component registered for `id`. The reference is stable across renders. */
export function renderOpenable(id: ContentId, props: OpenableProps): ReactNode {
  const component = byId.get(id);
  return component ? createElement(component, props) : null;
}

export function titleFor(id: ContentId): TranslationKey {
  if (id === NOT_FOUND_ID) return 'os.fileNotFound';
  return byId.get(id)?.title ?? 'os.window';
}

export function iconFor(id: ContentId): ShellIcon {
  if (id === NOT_FOUND_ID) return { glyph: 'file', kind: 'system' };
  return byId.get(id)?.icon ?? { glyph: 'file', kind: 'system' };
}
