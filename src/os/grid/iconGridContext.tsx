import { createContext, useContext } from 'react';

import type { IconGridVariant } from '../contracts.ts';

export interface IconGridContextValue {
  variant: IconGridVariant;
  hintId: string;
  selectedId: string | null;
  activeIndex: number;
  select: (id: string) => void;
  focusIndex: (index: number) => void;
}

export const IconGridContext = createContext<IconGridContextValue | null>(null);

export function useIconGrid(): IconGridContextValue {
  const value = useContext(IconGridContext);
  if (value === null) {
    throw new Error('FolderShortcut and FileShortcut must render inside a grid.');
  }
  return value;
}
