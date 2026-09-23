import { circularCrossJunction } from "./junctions.mjs";
import { S } from "./primitives.mjs";

const n = (value) => Number(value.toFixed(6));
// A closed final-canvas modifier: positive paint and inverse counters use the
// same flat-ended contour. Radius is the visible concave fillet, not a stroked
// centerline reach. Compact marks keep fixed weight as their containers vary.
export function weldedPlusContour(
  x,
  y,
  halfLength,
  width = 4 / 3,
  radius = 0.6,
) {
  const h = width / 2;
  if (
    ![x, y, halfLength, width, radius].every(Number.isFinite) ||
    width <= 0 ||
    radius <= 0 ||
    halfLength <= h + radius
  )
    throw new Error(
      "Welded plus requires positive dimensions and straight arms",
    );
  const p = (a, b) => `${n(a)} ${n(b)}`;
  const arc = (a, b) => `A${n(radius)} ${n(radius)} 0 0 0 ${p(a, b)}`;
  return (
    `M${p(x - h, y - halfLength)}H${n(x + h)}V${n(y - h - radius)}` +
    arc(x + h + radius, y - h) +
    `H${n(x + halfLength)}V${n(y + h)}H${n(x + h + radius)}` +
    arc(x + h, y + h + radius) +
    `V${n(y + halfLength)}H${n(x - h)}V${n(y + h + radius)}` +
    arc(x - h - radius, y + h) +
    `H${n(x - halfLength)}V${n(y - h)}H${n(x - h - radius)}` +
    arc(x - h, y - h - radius) +
    "Z"
  );
}

// The standalone Add is a primary control, so its stems remain configurable.
// Its longer arms allow an AI-01-like fillet at the high/medium default weight.
export function standaloneAddition(x = 12, y = 12, halfLength = 9.75) {
  return (
    S(
      `M${x - halfLength} ${y}h${2 * halfLength}M${x} ${y - halfLength}v${2 * halfLength}`,
    ) + circularCrossJunction(x, y, 2.55)
  );
}
