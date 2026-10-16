export type AnnouncementListener = (message: string) => void;

const listeners = new Set<AnnouncementListener>();

/** Notify every subscriber. Order is insertion order. */
export function announce(message: string): void {
  for (const listener of [...listeners]) {
    listener(message);
  }
}

/** Subscribe to announcements. The returned function unsubscribes. */
export function subscribeAnnouncements(listener: AnnouncementListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
