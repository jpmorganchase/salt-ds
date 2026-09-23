import { S } from "./primitives.mjs";
import { traceJunctions } from "./junction-trace.mjs";

const point = (x, y) => `${Number(x.toFixed(6))} ${Number(y.toFixed(6))}`;
const quadrant = (horizontal, vertical) =>
  `${horizontal === -1 ? "left" : "right"}-${vertical === -1 ? "up" : "down"}`;

// Blend a structural cross without rounding its exposed terminals. Reach is
// chosen by the owning family: short branches disappear under themed paint.
export function crossJunction(x, y, reach, width) {
  const features = [-1, 1].flatMap((horizontal) =>
    [-1, 1].map((vertical) => ({
      construction: "crossJunction",
      sector: quadrant(horizontal, vertical),
      curve: `M${point(x + horizontal * reach, y)}Q${point(x, y)} ${point(x, y + vertical * reach)}`,
    })),
  );
  return traceJunctions(
    S(features.map(({ curve }) => curve).join(""), width),
    features,
  );
}

// Circular concave fillets for an orthogonal crossing. After fitting, the
// visible inner radius is finalReach - paintedWidth / 2. This is different
// from crossJunction's quadratic blend; calibrate final paint, not this reach.
export function circularCrossJunction(
  x,
  y,
  reach,
  width,
  quadrants = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ],
  expected = "weld",
) {
  // Fill the region between the arc and the original members. An arc alone
  // can enclose a pinhole when thin strokes no longer cover that interior.
  // Only the arc is stroked; its outer painted transition remains configurable.
  const features = [];
  const body = quadrants
    .map(([horizontal, vertical]) => {
      const arc = `M${point(x + horizontal * reach, y)}A${reach} ${reach} 0 0 ${horizontal * vertical === 1 ? 0 : 1} ${point(x, y + vertical * reach)}`;
      features.push({
        construction: expected === "softened-opening" ? "isolatedOpening" : "circularCrossJunction",
        sector: quadrant(horizontal, vertical),
        curve: arc,
        expected,
      });
      return (
        `<path d="${arc}L${point(x, y)}Z" fill="currentColor" stroke="none"/>` +
        S(arc, width)
      );
    })
    .join("");
  return traceJunctions(body, features);
}

// Endpoints lie on the actual ellipse. The control is the intersection of its
// endpoint tangent with the horizontal member, avoiding exposed branch caps.
export function ellipseJunction({
  cx,
  cy,
  rx,
  ry,
  y,
  side,
  reach,
  directions = [-1, 1],
  width,
}) {
  const xAt = (ordinate) =>
    cx + side * rx * Math.sqrt(1 - ((ordinate - cy) / ry) ** 2);
  const x = xAt(y);
  const features = [-1, 1].flatMap((vertical) => {
    const endY = y + vertical * reach;
    const endX = xAt(endY);
    const normalizedY = (endY - cy) / ry;
    const tangent =
      (-side * rx * normalizedY) / (ry * Math.sqrt(1 - normalizedY ** 2));
    const controlX = endX + tangent * (y - endY);
    return directions.map((horizontal) => ({
      construction: "ellipseJunction",
      sector: quadrant(horizontal, vertical),
      curve: `M${point(x + horizontal * reach, y)}Q${point(controlX, y)} ${point(endX, endY)}`,
    }));
  });
  return traceJunctions(
    S(features.map(({ curve }) => curve).join(""), width),
    features,
  );
}

// A ray is part of its sun. Tangent branches ease its root, keeping tips flat.
export function rayJunctions(cx, cy, radius, reach, angles, width) {
  const delta = reach / radius;
  const at = (angle, distance) =>
    point(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance);
  const features = angles.flatMap((angle) =>
    [-1, 1].map((side) => ({
      construction: "rayJunctions",
      sector: `ray-${angle}-${side === -1 ? "counterclockwise" : "clockwise"}`,
      curve: `M${at(angle, radius + reach)}Q${at(angle, radius / Math.cos(delta))} ${at(angle + side * delta, radius)}`,
    })),
  );
  return traceJunctions(
    S(features.map(({ curve }) => curve).join(""), width),
    features,
  );
}
