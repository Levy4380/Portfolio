import type { ReactNode } from 'react';

/**
 * Shell for every file document.
 * The bottom inset lives here so file content never sits flush on the window edge.
 */
export function FileRenderer({ children }: { children: ReactNode }) {
  return <div className="pb-6">{children}</div>;
}
