/**
 * How an archive row is coloured, locked or not.
 *
 * The row used to be drawn at `opacity: 0.5` when locked. Opacity composites
 * the whole row toward the page behind it, text included: measured, the date
 * fell to 3.76:1 in the light theme and the "PRO" badge to 2.21:1. The one
 * element explaining why the row was locked was the least legible thing on the
 * screen, and it appeared in the App Store screenshot that way.
 *
 * Dimming is a signal for a DISABLED control. A locked day is not disabled --
 * tapping it opens the paywall, which is the whole point of showing it -- so it
 * is information, and information meets AA.
 *
 * Locked-ness is carried by a distinct surface and a full-contrast badge
 * instead, so the two states differ by something other than "one is faded".
 */
import type { Palette } from './tokens';

export interface ArchiveRowColors {
  background: string;
  text: string;
  badge: string;
  /** Always 1. Kept explicit so a future edit cannot quietly reintroduce a wash. */
  opacity: 1;
}

export function archiveRow(palette: Palette, playable: boolean): ArchiveRowColors {
  return {
    background: playable ? palette.surface : palette.surfaceAlt,
    text: palette.text,
    badge: playable ? palette.textMuted : palette.accent,
    opacity: 1,
  };
}
