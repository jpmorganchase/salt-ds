import { S, group } from "./primitives.mjs";
import { traceJunctions } from "./junction-trace.mjs";

const patchFill = (d) => `<path d="${d}" fill="currentColor" stroke="none"/>`;

const point = (x, y) => `${Number(x.toFixed(6))} ${Number(y.toFixed(6))}`;

// Exact circular centerline fillets between a circle and an outward radial
// member. Their center is tangent to both curves; no endpoint cap projects
// beyond the existing circle. Radius is chosen locally, not a global token.
export function radialCircleJunction(cx, cy, radius, reach, angle = 0, width) {
  const distance = radius + reach;
  const tangent = Math.sqrt(radius * radius + 2 * radius * reach);
  const features = [];
  const branches = [-1, 1]
    .map((side) => {
      const arc = `M${point(cx + tangent, cy)}A${reach} ${reach} 0 0 ${side === 1 ? 0 : 1} ${point(cx + (radius * tangent) / distance, cy + (side * radius * reach) / distance)}`;
      features.push({
        construction: "radialCircleJunction",
        sector: side === -1 ? "counterclockwise" : "clockwise",
        curve: arc,
      });
      // Fill the region between existing members and the new arc. Stroked
      // bridges alone leave a small enclosed hole when a thin stroke is used.
      const patch = `${arc}A${radius} ${radius} 0 0 ${side === 1 ? 0 : 1} ${point(cx + radius, cy)}Z`;
      return patchFill(patch) + S(arc, width);
    })
    .join("");
  return group(
    traceJunctions(branches, features),
    `rotate(${angle} ${cx} ${cy})`,
  );
}

// A circular handle rests on a horizontal structural member. Fillets are
// tangent to the circle and that member, easing only the exposed neck.
export function circleOnBaseJunction(cx, cy, radius, reach, width) {
  const offsetX = 2 * Math.sqrt(radius * reach);
  const offsetY = radius - reach;
  const features = [];
  const body = [-1, 1]
    .map((side) => {
      const arc = `M${point(cx + side * offsetX, cy + radius)}A${reach} ${reach} 0 0 ${side === 1 ? 1 : 0} ${point(cx + (side * radius * offsetX) / (radius + reach), cy + (radius * offsetY) / (radius + reach))}`;
      features.push({
        construction: "circleOnBaseJunction",
        sector: side === -1 ? "left" : "right",
        curve: arc,
      });
      const patch = `${arc}A${radius} ${radius} 0 0 ${side === 1 ? 1 : 0} ${point(cx, cy + radius)}Z`;
      return patchFill(patch) + S(arc, width);
    })
    .join("");
  return traceJunctions(body, features);
}

// Fillet the concave sector between two straight members meeting at a point.
// The vectors point away from the junction; both tangencies stay on those
// members. Exterior corners and the free terminals remain untouched.
export function angledJunction(x, y, first, second, radius, width) {
  const unit = ([a, b]) => {
    const length = Math.hypot(a, b);
    return [a / length, b / length];
  };
  const a = unit(first),
    b = unit(second);
  const angle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1])));
  const tangent = radius / Math.tan(angle / 2);
  const cross = a[0] * b[1] - a[1] * b[0];
  const arc = `M${point(x + a[0] * tangent, y + a[1] * tangent)}A${radius} ${radius} 0 0 ${cross < 0 ? 1 : 0} ${point(x + b[0] * tangent, y + b[1] * tangent)}`;
  return traceJunctions(patchFill(`${arc}L${point(x, y)}Z`) + S(arc, width), [
    {
      construction: "angledJunction",
      sector: "between-members",
      curve: arc,
    },
  ]);
}
