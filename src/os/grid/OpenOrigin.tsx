import { createContext } from 'react';

import type { WindowId } from '../state/StateHelpers/types.ts';

/** Set by a folder body so files opened from it keep `originId`. */
export const OpenOriginContext = createContext<WindowId | undefined>(undefined);
