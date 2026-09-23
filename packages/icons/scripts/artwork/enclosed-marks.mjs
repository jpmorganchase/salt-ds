import { box, circ } from "./primitives.mjs";
import { tickPaths } from "./tick.mjs";

// Repeated enclosed symbols are authored directly on the final 16-unit grid.
// Positive marks and transparent counters use these exact same contours.
// Container fitting must not rescale their weight or proportions.
// Optical placement may differ between containers; paired variants share it.
export const enclosedDot = (x, y) => circ(x, y, 1);
// Primary status punctuation needs more presence than eyes and ellipsis dots.
// Its 8/3-unit diameter is 2 CSS pixels in a 12px icon.
const statusDot = (x, y) => circ(x, y, 4 / 3);
const tickPoints = [
  [3.5, 7.75],
  [6.5, 10.75],
  [12.5, 4.75],
];
export const enclosedTick = tickPaths(tickPoints, 2).counter;
// Share the gesture, then fit its proportions to the available interior.
// Error retains the established 2 x 5px stem at 12px. Warning uses a shorter
// 1.6875 x 2.5125px stem to preserve separation inside the tapered triangle.
const exclamation = (top, height, dotY) =>
  box(20 / 3, top, 8 / 3, height) + statusDot(8, dotY);
export const enclosedError = exclamation(8 / 3, 20 / 3, 12);
// The locally narrower stem opens the upper triangular counter through W1.5,
// while preserving its baseline, the punctuation dot and the pair contour.
export const enclosedWarning = box(6.875, 7, 2.25, 3.35) + statusDot(8, 12.375);
export const enclosedInfo =
  statusDot(8, 4) + box(20 / 3, 20 / 3, 8 / 3, 20 / 3);
export const enclosedEllipsis = [4, 8, 12]
  .map((x) => enclosedDot(x, 6.5))
  .join("");
// Preserve the existing question contour and share the punctuation dot.
export const enclosedQuestion =
  "M4.74216 5.251232q0-2.647003 3.257841-2.647003t3.25784 2.647003q0 1.62886-1.62898 2.545116-1.018022.570156-1.018022 1.628981H7.389164q0-1.710345 1.425328-2.545237 1.221675-.692202 1.221675-1.62886 0-1.425328-2.036166-1.425328T5.963835 5.251232Z" +
  enclosedDot(8, 12);
