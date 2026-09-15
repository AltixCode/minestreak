import { readableTextOn } from './color';
import { darkPalette, lightPalette } from './tokens';

/**
 * The classic minesweeper number colours, one per adjacency count.
 *
 * The DIGIT is the information; colour only makes scanning faster, so a player
 * who cannot separate two hues loses nothing. But the digit still has to be
 * legible, which is why there are two sets: a single palette cannot clear AA on
 * both a near-white and a near-black surface.
 *
 * This is a palette file, which is the one place colours are allowed to be
 * written down.
 */
const LIGHT = ['#1D4ED8', '#15803D', '#B91C1C', '#6D28D9', '#B45309', '#0E7490', '#334155', '#7C2D12'] as const;
const DARK = ['#93C5FD', '#86EFAC', '#FCA5A5', '#D8B4FE', '#FCD34D', '#67E8F9', '#CBD5E1', '#FDBA74'] as const;

export function numberTone(adjacent: number, isDark: boolean): string {
  const set = isDark ? DARK : LIGHT;
  return set[Math.min(Math.max(adjacent, 1), set.length) - 1] ?? readableTextOn(
    isDark ? darkPalette.surface : lightPalette.surface,
  );
}

export const NUMBER_TONES_LIGHT = LIGHT;
export const NUMBER_TONES_DARK = DARK;
