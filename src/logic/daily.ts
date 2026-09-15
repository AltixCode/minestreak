import { dayIndex, type DateKey } from './dateKey';
import { generateBoard, shapeForPhase, type GeneratedBoard } from './generate';
import { seedFromKey } from './rng';

/**
 * The day's board.
 *
 * A pure function of the date, so every device produces the identical board for
 * a given day with no backend and nothing to keep in sync.
 */
export function boardFor(key: DateKey): GeneratedBoard {
  const phase = ((dayIndex(key) % 7) + 7) % 7;
  return generateBoard(shapeForPhase(phase), seedFromKey(`minestreak:${key}`));
}
