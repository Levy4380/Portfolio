import { createContext, createElement, useEffect, type ReactNode } from 'react';
import type { WindowId } from '../../state/StateHelpers/types.ts';

/**
 * One mutable map for the desktop. It lives outside React state so registering
 * a taskbar button does not render. The provider publishes this same map.
 */
const anchors = new Map<WindowId, HTMLElement>();

const TaskbarAnchorContext = createContext<Map<WindowId, HTMLElement>>(anchors);

export function TaskbarAnchorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => {
      anchors.clear();
    };
  }, []);

  return createElement(TaskbarAnchorContext.Provider, { value: anchors }, children);
}

/** Register the taskbar button for a window, or remove it when `element` is null. */
export function registerTaskbarAnchor(id: WindowId, element: HTMLElement | null): void {
  if (element) anchors.set(id, element);
  else anchors.delete(id);
}

/** Viewport rect of the taskbar button, or null when it is not registered. */
export function getTaskbarAnchorRect(id: WindowId): DOMRect | null {
  const element = anchors.get(id);
  if (!element?.isConnected) return null;
  return element.getBoundingClientRect();
}
