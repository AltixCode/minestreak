import { useMemo } from 'react';

import { boardFor } from '@/logic/daily';
import type { DateKey } from '@/logic/dateKey';
import type { GeneratedBoard } from '@/logic/generate';

/**
 * The day's board.
 *
 * Memoised per date because generation rejects every board the deduction solver
 * cannot finish, which can take many attempts — far too much to redo on a render.
 */
export function useDailyBoard(key: DateKey): GeneratedBoard {
  return useMemo(() => boardFor(key), [key]);
}
