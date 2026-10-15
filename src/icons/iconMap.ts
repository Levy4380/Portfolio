import { createElement, type ComponentType } from 'react';

import type { IconId } from '../content/types';
import { GitHubMark, InstagramMark, LinkedInMark } from './brand';
import { FileIcon } from './FileIcon';
import { FolderIcon } from './FolderIcon';

export interface IconMapComponentProps {
  className?: string;
  /** Folder icons tilt open when their window is visible. */
  open?: boolean;
}

function FolderAboutIcon(props: IconMapComponentProps) {
  return createElement(FolderIcon, { accent: 'about', ...props });
}

function FolderProjectsIcon(props: IconMapComponentProps) {
  return createElement(FolderIcon, { accent: 'projects', ...props });
}

function FolderExperimentsIcon(props: IconMapComponentProps) {
  return createElement(FolderIcon, { accent: 'experiments', ...props });
}

function FileProjectIcon(props: IconMapComponentProps) {
  return createElement(FileIcon, { kind: 'project', className: props.className });
}

function FileExperimentIcon(props: IconMapComponentProps) {
  return createElement(FileIcon, { kind: 'experiment', className: props.className });
}

function FileProfileIcon(props: IconMapComponentProps) {
  return createElement(FileIcon, { kind: 'profile', className: props.className });
}

function FileMissingIcon(props: IconMapComponentProps) {
  return createElement(FileIcon, { kind: 'system', className: props.className });
}

function BrandGithubIcon({ className }: IconMapComponentProps) {
  return createElement(GitHubMark, { size: 48, className });
}

function BrandLinkedInIcon({ className }: IconMapComponentProps) {
  return createElement(LinkedInMark, { size: 48, className });
}

function BrandInstagramIcon({ className }: IconMapComponentProps) {
  return createElement(InstagramMark, { size: 48, className });
}

export const iconMap: Record<IconId, ComponentType<IconMapComponentProps>> = {
  'folder-about': FolderAboutIcon,
  'folder-projects': FolderProjectsIcon,
  'folder-experiments': FolderExperimentsIcon,
  'file-project': FileProjectIcon,
  'file-experiment': FileExperimentIcon,
  'file-profile': FileProfileIcon,
  'file-missing': FileMissingIcon,
  'brand-github': BrandGithubIcon,
  'brand-linkedin': BrandLinkedInIcon,
  'brand-instagram': BrandInstagramIcon,
};
