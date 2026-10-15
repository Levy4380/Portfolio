import { experiments } from './experiments.ts';
import { folders } from './folders.ts';
import { links } from './links.ts';
import { profileFiles } from './profile.ts';
import { projects } from './projects.ts';
import { startMenu } from './startMenu.ts';
import type {
  ContentItem,
  ContentKey,
  ImageAsset,
  ParentId,
  ProjectItem,
} from './types.ts';

/** `${kind}:${slug}`. Authors never write content keys. */
export function keyOf(item: ContentItem): ContentKey {
  return `${item.kind}:${item.slug}`;
}

const items: readonly ContentItem[] = [
  ...folders,
  ...projects,
  ...experiments,
  ...profileFiles,
  ...links,
];

if (import.meta.env.DEV) {
  assertRegistry(items);
}

const byKey = new Map<ContentKey, ContentItem>();
const childrenByParent = new Map<ParentId, readonly ContentItem[]>();
const grouped = new Map<ParentId, ContentItem[]>();

for (const item of items) {
  const key = keyOf(item);
  byKey.set(key, item);
  const siblings = grouped.get(item.parent);
  if (siblings) {
    siblings.push(item);
  } else {
    grouped.set(item.parent, [item]);
  }
}

for (const [parent, siblings] of grouped) {
  siblings.sort(compareByOrderThenTitle);
  childrenByParent.set(parent, Object.freeze(siblings));
}

const featuredProjects: readonly ProjectItem[] = Object.freeze(
  projects
    .filter((project) => project.featured === true)
    .sort(compareByOrderThenTitle),
);

const noChildren: readonly ContentItem[] = Object.freeze([]);

export function getContent(key: ContentKey): ContentItem | undefined {
  return byKey.get(key);
}

/** Children of a folder or the desktop, sorted by `order` then title. */
export function getChildren(parent: ParentId): readonly ContentItem[] {
  return childrenByParent.get(parent) ?? noChildren;
}

export function getFeaturedProjects(): readonly ProjectItem[] {
  return featuredProjects;
}

/** Missing `order` sorts after every finite order. Title breaks ties. */
function compareByOrderThenTitle(a: ContentItem, b: ContentItem): number {
  const orderA = a.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA - orderB;
  return a.title.localeCompare(b.title);
}

function assertRegistry(content: readonly ContentItem[]): void {
  const keys = new Set<ContentKey>();

  for (const item of content) {
    const key = keyOf(item);
    if (keys.has(key)) {
      throw new Error(
        `Content registry: duplicate key "${key}". Slugs must be unique within each kind.`,
      );
    }
    keys.add(key);
    assertImages(item);
  }

  for (const item of content) {
    if (item.parent === 'desktop') continue;
    if (!keys.has(item.parent)) {
      throw new Error(
        `Content registry: "${keyOf(item)}" has parent "${item.parent}", but that folder does not exist.`,
      );
    }
  }

  for (const group of startMenu) {
    for (const key of group.items) {
      if (!keys.has(key)) {
        throw new Error(
          `Content registry: start menu group "${group.label}" references "${key}", which does not exist.`,
        );
      }
    }
  }
}

function assertImages(item: ContentItem): void {
  if (item.kind !== 'project' && item.kind !== 'experiment') return;

  const key = keyOf(item);
  if (item.cover) assertDimensions(key, 'cover', item.cover);
  if (item.kind === 'project') {
    item.gallery?.forEach((image, index) => {
      assertDimensions(key, `gallery[${index}]`, image);
    });
  }
}

function assertDimensions(
  key: ContentKey,
  label: string,
  image: ImageAsset,
): void {
  if (
    Number.isFinite(image.width) &&
    image.width > 0 &&
    Number.isFinite(image.height) &&
    image.height > 0
  ) {
    return;
  }

  throw new Error(
    `Content registry: "${key}" ${label} (${image.src}) must declare positive width and height.`,
  );
}
