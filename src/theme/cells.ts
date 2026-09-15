/**
 * Cell surfaces for the grid.
 *
 * **Why these are not `surface` and `surfaceAlt`.** The grid previously painted
 * a hidden cell with `surfaceAlt` and a revealed one with `surface`, which on
 * the dark theme is rgb(41,24,24) against rgb(30,17,17) — a contrast ratio of
 * **1.08:1**. The number on a revealed cell was perfectly legible; the ground
 * underneath it was not distinguishable from unexplored ground.
 *
 * That is a functional defect in this game specifically, not a cosmetic one.
 * Revealing a zero cascades open a whole region of *blank* cells, and a blank
 * revealed cell carries no number at all — so the only thing separating
 * explored from unexplored ground was a difference nobody can see, on a board
 * where reading which regions are resolved is the entire skill.
 *
 * Colour literals belong here because this is `src/theme/`. The ratios below
 * are asserted by a unit test so they cannot drift back.
 */
export interface CellColours {
  /** Unexplored. Deliberately the lighter, raised-looking surface. */
  hidden: string;
  /** Explored. Deliberately recessed, and darker than the page behind it. */
  revealed: string;
  /**
   * The flag marker, which is only ever drawn on a hidden cell.
   *
   * It has its own colour rather than reusing the `danger` token because the
   * two requirements pull against each other: separating the cell states means
   * moving the hidden surface away from the revealed one, and every step in
   * that direction costs the flag contrast against it. Using `danger` capped
   * the light theme's state separation at about 1.5:1 before the flag dropped
   * under 3:1. A flag colour chosen for the surface it actually sits on lets
   * both be right at once.
   */
  flag: string;
}

// 3:1 is the WCAG threshold for a non-text UI component, and "which cells have
// I already cleared" is exactly that — a state read at a glance across a whole
// board. An earlier pass stopped at 1.90:1, which was a large improvement on
// 1.08:1 and still under the bar; the only reason it stopped there was that the
// flag had been sharing the `danger` token, and giving the flag its own colour
// had already removed that ceiling. These clear 3:1 in both themes.
//
// Where the next constraint actually binds, for whoever pushes further: in the
// light theme the revealed cell is already white, so only the hidden surface can
// move, and darkening it eats the flag's contrast against it. In the dark theme
// the revealed cell is nearly black, so the adjacency numbers have room to
// spare — the worst of the eight still measures above 10:1.
export const darkCells: CellColours = {
  hidden: '#8A5050',
  revealed: '#0D0606',
  flag: '#FEE2E2',
};

export const lightCells: CellColours = {
  hidden: '#98907F',
  revealed: '#FFFFFF',
  flag: '#450A0A',
};

export const cellsFor = (isDark: boolean): CellColours => (isDark ? darkCells : lightCells);
