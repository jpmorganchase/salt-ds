import { box, circ } from "./primitives.mjs";
import { tickPaths } from "./tick.mjs";

// Repeated enclosed symbols are authored directly on the final 16-unit grid.
// Positive marks and transparent counters use these exact same contours.
// Container fitting must not rescale their weight or proportions.
// Optical placement may differ between containers; paired variants share it.
export const enclosedDot = (x, y) => circ(x, y, 1);
const tickPoints = [
  [3.5, 7.75],
  [6.5, 10.75],
  [12.5, 4.75],
];
export const enclosedTick = tickPaths(tickPoints, 2).counter;
// Only vertical placement varies: Error centers the same mark in its octagon.
export const enclosedExclamation = (y = 6.25) =>
  box(7, y, 2, 3.75) + enclosedDot(8, y + 5.75);
export const enclosedInfo = `${enclosedDot(8, 3.75)}M6.5 6.75H9V11.75H10.25V13H5.75V11.75H7V8H6.5Z`;
export const enclosedEllipsis = [4, 8, 12]
  .map((x) => enclosedDot(x, 6.5))
  .join("");
// Preserve the existing question contour and share the punctuation dot.
export const enclosedQuestion =
  "M4.74216 5.251232q0-2.647003 3.257841-2.647003t3.25784 2.647003q0 1.62886-1.62898 2.545116-1.018022.570156-1.018022 1.628981H7.389164q0-1.710345 1.425328-2.545237 1.221675-.692202 1.221675-1.62886 0-1.425328-2.036166-1.425328T5.963835 5.251232Z" +
  enclosedDot(8, 12);
