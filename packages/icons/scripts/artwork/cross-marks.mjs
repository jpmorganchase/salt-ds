import { S } from "./primitives.mjs";
import { angledJunction } from "./structural-junctions.mjs";

// Preserve each established X's endpoints and local band, including the
// narrower signature cue and the taller speaker mute mark. Only the four
// concave roots are eased; this does not join the mark to its object.
export function weldedCross(x, y, dx, dy, radius, width) {
  const vectors = [
    [dx, dy],
    [-dx, dy],
    [-dx, -dy],
    [dx, -dy],
  ];
  return (
    S(
      `M${x - dx} ${y - dy}L${x + dx} ${y + dy}M${x + dx} ${y - dy}L${x - dx} ${y + dy}`,
      width,
    ) +
    vectors
      .map((v, i) =>
        angledJunction(x, y, v, vectors[(i + 1) % 4], radius, width),
      )
      .join("")
  );
}

// Fixed final-canvas cross for positive/inverse status marks. This is the
// same circular inside-corner construction as the plus, rotated 45 degrees.
export function weldedXContour(x, y, halfLength, width, radius) {
  const h = width / 2;
  if (!(halfLength > h + radius && radius > 0 && width > 0))
    throw new Error("A welded X requires useful straight arms");
  const p = (u, v) =>
    `${Number((x + (u - v) / Math.SQRT2).toFixed(6))} ${Number((y + (u + v) / Math.SQRT2).toFixed(6))}`;
  const L = (u, v) => `L${p(u, v)}`;
  const A = (u, v) => `A${radius} ${radius} 0 0 0 ${p(u, v)}`;
  return (
    `M${p(-h, -halfLength)}` +
    L(h, -halfLength) +
    L(h, -h - radius) +
    A(h + radius, -h) +
    L(halfLength, -h) +
    L(halfLength, h) +
    L(h + radius, h) +
    A(h, h + radius) +
    L(h, halfLength) +
    L(-h, halfLength) +
    L(-h, h + radius) +
    A(-h - radius, h) +
    L(-halfLength, h) +
    L(-halfLength, -h) +
    L(-h - radius, -h) +
    A(-h, -h - radius) +
    "Z"
  );
}
