import { S } from "./primitives.mjs";
import { tangentCircularHeadJoins } from "./cd-junctions.mjs";
import { circularCrossJunction } from "./junctions.mjs";
import { radialCircleJunction } from "./structural-junctions.mjs";
const n = (value) => Number(value.toFixed(6));
const p = (x, y) => `${n(x)} ${n(y)}`;
// Light's circle-to-ray tangent construction at a compact owner-chosen scale.
export function compactSunRays(cx, cy, radius, tipRadius, rootRadius, width) {
  const angles = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  const point = (a, x, y = 0) =>
    p(
      cx + x * Math.cos(a) - y * Math.sin(a),
      cy + x * Math.sin(a) + y * Math.cos(a),
    );
  return (
    S(
      angles
        .map((angle) => `M${point(angle, radius)}L${point(angle, tipRadius)}`)
        .join(""),
      width,
    ) +
    angles
      .map((angle) =>
        radialCircleJunction(
          cx,
          cy,
          radius,
          rootRadius,
          (angle * 180) / Math.PI,
          width,
        ),
      )
      .join("")
  );
}
// Ease only explicit concave vertices; preserve the mark's convex flat tips.
export function concaveMark(points, radii) {
  return (
    points
      .map(([x, y], i) => {
        const r = radii[i];
        if (!r) return `${i ? "L" : "M"}${p(x, y)}`;
        const prev = points[(i + points.length - 1) % points.length],
          next = points[(i + 1) % points.length];
        const lu = Math.hypot(prev[0] - x, prev[1] - y),
          lv = Math.hypot(next[0] - x, next[1] - y);
        const u = [(prev[0] - x) / lu, (prev[1] - y) / lu],
          v = [(next[0] - x) / lv, (next[1] - y) / lv];
        const a = Math.acos(
            Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])),
          ),
          reach = r / Math.tan(a / 2);
        const sweep = u[0] * v[1] - u[1] * v[0] > 0 ? 0 : 1;
        return `${i ? "L" : "M"}${p(x + u[0] * reach, y + u[1] * reach)}A${r} ${r} 0 0 ${sweep} ${p(x + v[0] * reach, y + v[1] * reach)}`;
      })
      .join("") + "Z"
  );
}

// Isolated square tiles retain their crisp exterior while their open cavity
// corners use the same restrained circular transition as connected frames.
export function insideBoxCorners(x, y, width, height, radius = 1.5) {
  return [
    [x, y, 1, 1],
    [x + width, y, -1, 1],
    [x + width, y + height, -1, -1],
    [x, y + height, 1, -1],
  ]
    .map(([cx, cy, h, v]) =>
      circularCrossJunction(cx, cy, radius, undefined, [[h, v]], "softened-opening"),
    )
    .join("");
}

// History's arrow joins an actual circular shaft. Derive both tangent fillets
// against that circle, rather than extending a straight-shaft patch over it.
// The source A9 arc and the head's original endpoints stay unchanged.
export function historyArrowRoots() {
  const tip = [3.75, 8.25],
    end = [12, 21],
    radius = 9;
  const dx = end[0] - tip[0],
    dy = end[1] - tip[1],
    chord = Math.hypot(dx, dy);
  const offset = Math.sqrt(radius * radius - (chord * chord) / 4);
  const cx = (tip[0] + end[0]) / 2 + (dy / chord) * offset;
  const cy = (tip[1] + end[1]) / 2 - (dx / chord) * offset;
  return tangentCircularHeadJoins(cx, cy, radius, tip, 1,
    [[0, -5.5], [5.5, 0]], 1.25);
}
