import { parseContours, tangentFillet } from "./path-segments.mjs";
import { S } from "./primitives.mjs";
import { traceJunctions } from "./junction-trace.mjs";

const point = (p) => p.map((n) => +n.toFixed(6)).join(" ");
const unit = (v) => v.map((n) => n / Math.hypot(...v));
const delta = (a, b) => a.map((n, i) => n - b[i]);

// The shaft starts at the head tip and travels away from it. Retain the tip,
// arms and distant curve; replace only the approach with a tangent cubic.
export function alignedCurvedArrow(
  shaft,
  arms,
  { radius = 1.15, approach = 5, width } = {},
) {
  const contours = parseContours(shaft);
  if (contours.length !== 1 || contours[0].closed || arms.length !== 2)
    throw new Error("A curved arrow needs one open shaft and two head arms");
  const [first, ...rest] = contours[0].segments;
  if (!first || first.kind === "L" || arms.some((a) => Math.hypot(...a) < 1))
    throw new Error("A curved arrow needs a curved approach and usable arms");
  const tip = first.start;
  const rays = arms.map(unit);
  const backward = unit(rays[0].map((n, i) => n + rays[1][i]));
  if (!backward.every(Number.isFinite) || !(approach > 0))
    throw new Error("Invalid curved-arrow head direction");
  // These authored approaches move monotonically away from the tip.
  // A bounded chord keeps the new approach local and its distant tangent exact.
  const limit = first.kind === "A" ? 0.5 : 0.85;
  if (Math.hypot(...delta(first.at(limit), tip)) < approach)
    throw new Error("Curved shaft is too short for the requested approach");
  let low = 0,
    high = limit;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (Math.hypot(...delta(first.at(mid), tip)) < approach) low = mid;
    else high = mid;
  }
  const t = (low + high) / 2;
  const join = first.at(t),
    tangent = unit(first.derivative(t));
  const control1 = tip.map((n, i) => n + (backward[i] * approach) / 3);
  const control2 = join.map((n, i) => n - (tangent[i] * approach) / 3);
  const lead =
    "M" +
    point(tip) +
    "C" +
    point(control1) +
    " " +
    point(control2) +
    " " +
    point(join);
  const curve = parseContours(lead)[0].segments[0];
  const body =
    lead + first.portion(t, 1) + rest.map((s) => s.portion(0, 1)).join("");
  const ends = arms.map((arm) => tip.map((n, i) => n + arm[i]));
  const head = "M" + point(ends[0]) + "L" + point(tip) + "L" + point(ends[1]);
  const fillets = ends.map((end) => {
    const incoming = parseContours("M" + point(end) + "L" + point(tip))[0]
      .segments[0];
    const fillet = tangentFillet(incoming, curve, radius, 0.95);
    if (!fillet) throw new Error("Aligned curved head lacks tangent clearance");
    return fillet;
  });
  const joins = fillets
    .map(
      (f) =>
        '<path d="' +
        f.patch +
        '" fill="currentColor" stroke="none"/>' +
        S(f.curve, width),
    )
    .join("");
  return (
    S(body + head, width) +
    traceJunctions(
      joins,
      fillets.map((f, i) => ({
        construction: "alignedCurvedArrow",
        sector: "head-arm-" + (i + 1),
        curve: f.curve,
        expected: "weld",
      })),
    )
  );
}
