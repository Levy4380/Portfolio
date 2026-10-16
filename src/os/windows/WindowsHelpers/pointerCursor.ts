/** Keeps one cursor on every element until the returned function runs. */
export function holdCursor(cursor: string): () => void {
  const root = document.documentElement;
  root.dataset.pointerCursor = cursor;
  root.style.setProperty('--pointer-cursor', cursor);
  let released = false;

  return () => {
    if (released) return;
    released = true;
    if (root.dataset.pointerCursor !== cursor) return;
    delete root.dataset.pointerCursor;
    root.style.removeProperty('--pointer-cursor');
  };
}
