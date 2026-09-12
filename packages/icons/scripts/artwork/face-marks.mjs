import { enclosedDot } from "./enclosed-marks.mjs";
import { box } from "./primitives.mjs";

// Facial details live on the final 16-unit canvas, independent of the circle fit.
// Every pair shares its eye anchors and mouth contour; the broad smile alone
// fills its open mouth while preserving the same outer lip and closed eyes.
const number = (value) => Number(value.toFixed(6));
const point = (x, y, radius, angle) => {
  const radians = (angle * Math.PI) / 180;
  return [
    number(x + radius * Math.cos(radians)),
    number(y + radius * Math.sin(radians)),
  ].join(" ");
};
// A circular band has an exact radial thickness and flat terminals.
const arcBand = (x, y, radius, from, to, width = 1.5) => {
  const outer = radius + width / 2;
  const inner = radius - width / 2;
  return `M${point(x, y, outer, from)}A${outer} ${outer} 0 0 1 ${point(x, y, outer, to)}L${point(x, y, inner, to)}A${inner} ${inner} 0 0 0 ${point(x, y, inner, from)}Z`;
};
const brow = (x1, y1, x2, y2) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const dx = ((y2 - y1) * 0.55) / length;
  const dy = ((x2 - x1) * 0.55) / length;
  return `M${number(x1 - dx)} ${number(y1 + dy)}L${number(x2 - dx)} ${number(y2 + dy)}L${number(x2 + dx)} ${number(y2 - dy)}L${number(x1 + dx)} ${number(y1 - dy)}Z`;
};
const eyes = (y = 6.25) => enclosedDot(5.25, y) + enclosedDot(10.75, y);
const dissatisfied = eyes() + arcBand(8, 14.5, 4.5, 225, 315);
const neutral = eyes() + box(4, 10.5, 8, 1.5);
const satisfied = eyes() + arcBand(8, 7.5, 4.5, 45, 135);
// Lower the angry pupils slightly to keep a visible gap beneath their brows.
const angry =
  eyes(6.75) +
  brow(4.25, 3.9, 6.5, 4.8) +
  brow(9.5, 4.8, 11.75, 3.9) +
  arcBand(8, 13.5, 3.5, 210, 330);
// Secondary eye arches keep an open underside at native size.
const happyEyes =
  arcBand(5.25, 6.75, 1.375, 210, 330, 1.1) +
  arcBand(10.75, 6.75, 1.375, 210, 330, 1.1);
const openSmile = "M4 9.5H12A4 4 0 0 1 4 9.5Z";
// This inner chord is 1.5 units below the lip on its concentric 2.5-unit arc.
const smileOpening = "M6 11H10A2.5 2.5 0 0 1 6 11Z";
export const faceMarks = {
  dissatisfied: [dissatisfied, dissatisfied],
  neutral: [neutral, neutral],
  satisfied: [satisfied, satisfied],
  "very-dissatisfied": [angry, angry],
  "very-satisfied": [
    happyEyes + openSmile + smileOpening,
    happyEyes + openSmile,
  ],
};
