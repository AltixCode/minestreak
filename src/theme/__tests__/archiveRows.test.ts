/**
 * A locked archive row must stay readable.
 *
 * It was drawn at `opacity: 0.5`, which composites the whole row -- text
 * included -- toward the page background. Measured, the date fell to 3.76:1 in
 * the light theme, and the "PRO" badge, the one element that explains WHY the
 * row is locked, to 2.21:1. The least legible thing on screen was the thing the
 * screen existed to say.
 *
 * Dimming is for a disabled control. A locked day is not disabled -- it is
 * tappable and takes the player to the paywall -- so it is information, and
 * information has to meet AA.
 */
import { contrastRatio } from '../color';
import { archiveRow } from '../archiveRows';
import { darkPalette, lightPalette } from '../tokens';

describe.each([
  ['light', lightPalette],
  ['dark', darkPalette],
] as const)('%s archive rows', (_name, palette) => {
  const unlocked = archiveRow(palette, true);
  const locked = archiveRow(palette, false);

  it('keeps the date readable when the day is locked', () => {
    expect(contrastRatio(locked.text, locked.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the PRO badge readable — it is the reason the row is locked', () => {
    expect(contrastRatio(locked.badge, locked.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('tells the two states apart by the badge, which is the real signal', () => {
    // Deliberately NOT a threshold on the two fills. The surfaces differ by
    // 1.13:1 in light and 1.08:1 in dark, and a number like that is exactly the
    // proxy that produced a run of false "contrast defects" across this
    // portfolio -- a fill pair is not what a reader uses when a stronger cue is
    // present. What actually separates a locked row from an unlocked one is the
    // badge: a different colour, at full readable contrast, saying PRO.
    expect(locked.badge).not.toBe(unlocked.badge);
    expect(contrastRatio(locked.badge, locked.background)).toBeGreaterThanOrEqual(4.5);
    expect(locked.background).not.toBe(unlocked.background);
  });

  it('never returns a translucent row, which is what caused this', () => {
    expect(locked.opacity).toBe(1);
    expect(unlocked.opacity).toBe(1);
  });
});
