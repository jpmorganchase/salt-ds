import { S } from "./primitives.mjs";

const point = ([x, y]) => `${Number(x.toFixed(6))} ${Number(y.toFixed(6))}`;
const paint = (path) => `<path d="${path}" fill="currentColor" stroke="none"/>`;

// Round only selected inward silhouette vertices. Exterior points and flat
// terminals remain exact. Limit tangent run locally so adjacent short teeth
// keep a straight member rather than consuming their identifying shape.
export function concavePolygon(points, radius, selected, runLimits) {
  const area = points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0);
  const corners = points.map((p, i) => {
    const previous = points[(i + points.length - 1) % points.length];
    const next = points[(i + 1) % points.length];
    const before = [previous[0] - p[0], previous[1] - p[1]];
    const after = [next[0] - p[0], next[1] - p[1]];
    const cross = before[0] * after[1] - before[1] * after[0];
    if ((selected && !selected.has(i)) || (!selected && cross * area <= 0))
      return { start: p, end: p };
    const aLength = Math.hypot(...before), bLength = Math.hypot(...after);
    const a = before.map((value) => value / aLength);
    const b = after.map((value) => value / bLength);
    const halfAngle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) / 2;
    const requestedRadius = typeof radius === "function" ? radius(i) : radius;
    const limit = runLimits?.get(i) ?? .4;
    const run = Math.min(requestedRadius / Math.tan(halfAngle), aLength * limit, bLength * limit);
    const localRadius = run * Math.tan(halfAngle);
    return {
      start: p.map((value, axis) => value + a[axis] * run),
      end: p.map((value, axis) => value + b[axis] * run),
      radius: localRadius,
      sweep: cross < 0 ? 1 : 0,
    };
  });
  return corners.map((corner, i) =>
    `${i ? "L" : "M"}${point(corner.start)}` +
    (corner.radius ? `A${corner.radius} ${corner.radius} 0 0 ${corner.sweep} ${point(corner.end)}` : ""),
  ).join("") + "Z";
}

// A bar arriving at the inside of a circular ring. These exact fillets
// touch both the unchanged ring and radial member, then fill the enclosed
// patch so a thin stroke cannot leave a pinhole.
export function innerRadialJoin(cx, cy, radius, reach, angle, width) {
  const a = angle * Math.PI / 180;
  const transform = (x, y) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)];
  const distance = radius - reach;
  const x = Math.sqrt(radius * radius - 2 * radius * reach);
  return [-1, 1].map((side) => {
    const arc = `M${point(transform(x, 0))}A${reach} ${reach} 0 0 ${side === 1 ? 1 : 0} ${point(transform(radius * x / distance, side * radius * reach / distance))}`;
    return paint(`${arc}A${radius} ${radius} 0 0 ${side === 1 ? 0 : 1} ${point(transform(radius, 0))}Z`) + S(arc, width);
  }).join("");
}

// Tangent quadratic bridge from a head arm to a curved shaft. 'back' is
// the original shaft segment from its curve tangent point to the tip.
// It supplies the filled union, while only the new exposed bridge is stroked.
export function curvedHeadJoin(tip, arm, curvePoint, curveTangent, back, width) {
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const delta = [curvePoint[0] - tip[0], curvePoint[1] - tip[1]];
  const distance = cross(delta, curveTangent) / cross(arm, curveTangent);
  const control = tip.map((value, axis) => value + arm[axis] * distance);
  const end = tip.map((value, axis) => value + arm[axis]);
  const arc = `M${point(end)}Q${point(control)} ${point(curvePoint)}`;
  return paint(`${arc}${back}Z`) + S(arc, width);
}


export function circularHeadJoins(cx, cy, radius, angle, direction, arms, turn = .34, width) {
  const endAngle = angle + direction * turn;
  const tip = [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  const end = [cx + radius * Math.cos(endAngle), cy + radius * Math.sin(endAngle)];
  const tangent = [-Math.sin(endAngle), Math.cos(endAngle)];
  const back = `A${radius} ${radius} 0 0 ${direction > 0 ? 0 : 1} ${point(tip)}`;
  return arms.map((arm) => curvedHeadJoin(tip, arm, end, tangent, back, width)).join("");
}

export function cubicHeadJoins(points, arms, t = .35, width) {
  const lerp = (a, b) => a.map((value, i) => value * (1 - t) + b[i] * t);
  const [p0, p1, p2, p3] = points;
  const a = lerp(p0, p1), b = lerp(p1, p2), c = lerp(p2, p3);
  const d = lerp(a, b), e = lerp(b, c), end = lerp(d, e);
  const tangent = end.map((value, i) => value - e[i]);
  const back = `C${point(d)} ${point(a)} ${point(p0)}`;
  return arms.map((arm) => curvedHeadJoin(p0, arm, end, tangent, back, width)).join("");
}
