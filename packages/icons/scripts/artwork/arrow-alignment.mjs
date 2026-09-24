import { parseContours } from "./path-segments.mjs";

const unit = (v) => v.map((n) => n / Math.hypot(...v));
const sub = (a, b) => a.map((n, i) => n - b[i]);
const same = (a, b) => Math.hypot(...sub(a, b)) < 0.0001;

// Inspect final exported paths independently of the construction helper.
// A two-arm head has two straight members meeting a curved shaft endpoint.
// No per-icon coordinates, path numbers, or source metadata are required.
export function inspectCurvedArrowAlignment(svg) {
  const contours = [...svg.matchAll(/<path\b[^>]*>/g)].flatMap(([tag]) => {
    if (!/\bfill="none"/.test(tag) || !/\bstroke=/.test(tag)) return [];
    const d = tag.match(/\bd="([^"]*)"/)?.[1];
    return d ? parseContours(d) : [];
  });
  const curves = contours.flatMap((contour) =>
    contour.segments
      .filter((s) => s.kind !== "L")
      .map((curve) => ({ curve, contour })),
  );
  const results = [];
  for (const { segments, closed } of contours) {
    if (closed || segments.length !== 2 || segments.some((s) => s.kind !== "L"))
      continue;
    const tip = segments[0].end;
    const rays = [sub(segments[0].start, tip), sub(segments[1].end, tip)].map(
      unit,
    );
    const axis = unit(rays[0].map((n, i) => -n - rays[1][i]));
    if (!axis.every(Number.isFinite)) continue;
    for (const { curve, contour } of curves) {
      const atStart = same(curve.start, tip),
        atEnd = same(curve.end, tip);
      if (!atStart && !atEnd) continue;
      const tangent = unit(
        curve.derivative(atStart ? 0 : 1).map((n) => (atStart ? -n : n)),
      );
      const cosine = Math.max(
        -1,
        Math.min(1, axis[0] * tangent[0] + axis[1] * tangent[1]),
      );
      results.push({
        tip,
        armDirections: rays,
        armLengths: [
          Math.hypot(...sub(segments[0].start, tip)),
          Math.hypot(...sub(segments[1].end, tip)),
        ],
        circle: circleOfShaft(contour),
        tail: atStart ? contour.segments.at(-1).end : contour.segments[0].start,
        axis,
        tangent,
        angleDegrees: (Math.acos(cosine) * 180) / Math.PI,
      });
    }
  }
  return results;
}

export const curvedArrowExports = [
  ...["forward", "replay"].flatMap((direction) =>
    [5, 10, 15, 30].map((n) => direction + "-" + n + ".svg"),
  ),
  "history.svg",
  "refresh.svg",
  "undo.svg",
  "redo.svg",
  "sync.svg",
  "sparkle-refresh.svg",
  "sparkle-refresh_solid.svg",
];

export function checkCurvedArrowAlignment(records) {
  const results = curvedArrowExports.map((name) => {
    const svg = records.find((r) => r.name === name)?.svg;
    if (!svg) throw new Error("Missing curved-arrow artwork: " + name);
    const heads = inspectCurvedArrowAlignment(svg);
    const expectedHeads = name === "sync.svg" ? 2 : 1;
    return {
      name,
      expectedHeads,
      heads,
      pass:
        heads.length === expectedHeads &&
        heads.every((h) => h.angleDegrees <= 0.1),
    };
  });
  return { results, failures: results.filter((r) => !r.pass) };
}

// Recover the retained circle from three points on its longest arc. This
// measures the final export, independently of the author's circle parameters.
function circleOfShaft(contour) {
  const arcs = contour.segments.filter((s) => s.kind === "A");
  arcs.sort(
    (a, b) =>
      Math.hypot(...a.derivative(0.5)) - Math.hypot(...b.derivative(0.5)),
  );
  const arc = arcs.at(-1);
  if (!arc) return null;
  const [a, b, c] = [0, 0.5, 1].map((t) => arc.at(t));
  const v = sub(b, a),
    w = sub(c, a);
  const determinant = 2 * (v[0] * w[1] - v[1] * w[0]);
  if (Math.abs(determinant) < 1e-8) return null;
  const vv = v[0] ** 2 + v[1] ** 2,
    ww = w[0] ** 2 + w[1] ** 2;
  const offset = [
    (vv * w[1] - ww * v[1]) / determinant,
    (v[0] * ww - w[0] * vv) / determinant,
  ];
  return {
    center: a.map((n, i) => n + offset[i]),
    radius: Math.hypot(...offset),
  };
}

export function checkCircularArrowProportions(records) {
  const results = checkCurvedArrowAlignment(records).results.map((row) => {
    const reasons = [];
    const near = (a, b) => Math.abs(a - b) < 0.001;
    if (!row.pass) reasons.push("shaft-to-head alignment");
    for (const head of row.heads) {
      if (
        !head.circle ||
        !near(head.circle.radius, 7) ||
        head.circle.center.some((n) => !near(n, 8))
      )
        reasons.push("shared circle and centre");
      if (head.armLengths.some((n) => !near(n, 35 / 12)))
        reasons.push("shared arrowhead arm length");
      const sync = row.name === "sync.svg";
      const counterclockwise = /^(replay-|history\.svg$|undo\.svg$)/.test(
        row.name,
      );
      const sign = sync
        ? Math.sign(8 - head.tip[1])
        : counterclockwise
          ? -1
          : 1;
      if (!near(Math.sign(head.tip[0] - 8), sign) || (!sync && head.tip[1] > 8))
        reasons.push("action direction");
      const expectedDirections = [
        [0, sync && sign < 0 ? 1 : -1],
        [-sign, 0],
      ];
      if (
        head.armDirections.some(
          (ray) =>
            !expectedDirections.some((expected) =>
              ray.every((n, i) => near(n, expected[i])),
            ),
        )
      )
        reasons.push("head arm directions");
      // Mirroring and Sync's half turn preserve the same tip offset.
      if (
        !near(Math.abs(head.tip[0] - 8), (Math.sqrt(81 - 5.25 ** 2) * 7) / 9) ||
        !near(Math.abs(head.tip[1] - 8), 49 / 12)
      )
        reasons.push("shared head placement");
      const returning = /^(undo|redo)\.svg$/.test(row.name);
      const expectedTail = returning
        ? [8, 15]
        : [8 + (sync ? -1 : 1) * Math.sign(head.tip[0] - 8) * 7, 8];
      if (head.tail.some((n, i) => !near(n, expectedTail[i])))
        reasons.push("documented arc opening");
    }
    return {
      ...row,
      pass: reasons.length === 0,
      reasons: [...new Set(reasons)],
    };
  });
  return { results, failures: results.filter((r) => !r.pass) };
}
