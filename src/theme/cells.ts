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

export const darkCells: CellColours = {
  hidden: '#5C3535',
  revealed: '#100808',
  flag: '#FCA5A5',
};

export const lightCells: CellColours = {
  hidden: '#C6C0B3',
  revealed: '#FFFFFF',
  flag: '#991B1B',
};

export const cellsFor = (isDark: boolean): CellColours => (isDark ? darkCells : lightCells);
