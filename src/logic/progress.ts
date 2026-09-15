import { addDays, daysBetween, type DateKey } from './dateKey';

/**
 * Per-day results and the streak derived from them.
 *
 * One board a day, so a day is simply won or not — much simpler than a
 * multi-puzzle day, and the streak rules are the part worth testing hard.
 */

export interface DayResult {
  won: boolean;
  /** Seconds taken, for the stats screen. */
  seconds: number;
}

export type ResultMap = Record<DateKey, DayResult>;

export const isDayWon = (day: DayResult | undefined): boolean => day?.won === true;

/**
 * The current streak, counted backwards from today.
 *
 * Today being unfinished does **not** break it — the day is still running until
 * midnight. Counting from an unfinished today would tell a player on a 40-day
 * run that they had lost it at breakfast.
 */
export function currentStreak(results: ResultMap, today: DateKey): number {
  let cursor = isDayWon(results[today]) ? today : addDays(today, -1);
  let streak = 0;
  while (isDayWon(results[cursor])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(results: ResultMap): number {
  const won = Object.keys(results).filter((key) => isDayWon(results[key])).sort();
  let best = 0;
  let run = 0;
  let previous: DateKey | null = null;
  for (const key of won) {
    run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    previous = key;
  }
  return best;
}

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  bestStreak: number;
  /** Fastest win in seconds, or null when nothing has been won. */
  bestTime: number | null;
}

export function statsFrom(results: ResultMap, today: DateKey): Stats {
  const days = Object.values(results);
  const wins = days.filter((d) => d.won);
  return {
    played: days.length,
    won: wins.length,
    currentStreak: currentStreak(results, today),
    bestStreak: bestStreak(results),
    bestTime: wins.length === 0 ? null : Math.min(...wins.map((d) => d.seconds)),
  };
}

/** Free players may reach back this many days; the unlock opens the rest. */
export const FREE_ARCHIVE_DAYS = 7;

export function canPlay(key: DateKey, today: DateKey, isPremium: boolean): boolean {
  const age = daysBetween(key, today);
  if (age < 0) return false; // The future is never playable.
  if (isPremium) return true;
  return age < FREE_ARCHIVE_DAYS;
}
