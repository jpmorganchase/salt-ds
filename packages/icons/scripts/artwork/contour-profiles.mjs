import { parseContours, tangentFillet } from "./path-segments.mjs";
import { traceJunctions } from "./junction-trace.mjs";
import { box, F, S } from "./primitives.mjs";

const point = ([x, y]) => `${+x.toFixed(6)} ${+y.toFixed(6)}`;
const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6;

// Parse authored paths solely to locate consecutive straight runs. Existing
// curves, moveto gaps and free terminals never acquire an inferred corner.
export function contourTurns(d, { fill = false } = {}) {
  const tokens =
    d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) ?? [];
  const count = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  const contours = [];
  let current = [0, 0];
  let start;
  let command;
  let contour;
  for (let i = 0; i < tokens.length; ) {
    if (/^[a-z]$/i.test(tokens[i])) command = tokens[i++];
    const upper = command?.toUpperCase();
    const relative = upper !== command;
    if (!(upper in count)) throw Error("Unsupported contour command");
    if (upper === "Z") {
      if (!contour) throw Error("Close without contour");
      if (!same(current, start))
        contour.segments.push({ from: current, to: start, line: true });
      contour.closed = true;
      current = start;
      command = undefined;
      continue;
    }
    const values = tokens.slice(i, i + count[upper]).map(Number);
    if (
      values.length !== count[upper] ||
      values.some((v) => !Number.isFinite(v))
    )
      throw Error("Incomplete contour command");
    i += count[upper];
    let end;
    if (upper === "H")
      end = [values[0] + (relative ? current[0] : 0), current[1]];
    else if (upper === "V")
      end = [current[0], values[0] + (relative ? current[1] : 0)];
    else
      end = values
        .slice(-2)
        .map((v, axis) => v + (relative ? current[axis] : 0));
    if (upper === "M") {
      contour = { segments: [], closed: false };
      contours.push(contour);
      start = end;
      command = relative ? "l" : "L";
    } else {
      if (!contour) throw Error("Path must start with moveto");
      contour.segments.push({
        from: current,
        to: end,
        line: ["L", "H", "V"].includes(upper),
      });
    }
    current = end;
  }
  return contours.flatMap(({ segments, closed }, contourIndex) => {
    if (fill && !closed && segments.length) {
      const first = segments[0].from,
        last = segments.at(-1).to;
      if (!same(first, last))
        segments.push({ from: last, to: first, line: true });
      closed = true;
    }
    return segments.flatMap((before, i) => {
      const after = segments[i + 1] ?? (closed ? segments[0] : null);
      if (!before.line || !after?.line || !same(before.to, after.from))
        return [];
      const p = before.to;
      const a = before.from.map((v, j) => v - p[j]);
      const b = after.to.map((v, j) => v - p[j]);
      const la = Math.hypot(...a);
      const lb = Math.hypot(...b);
      if (la < 1e-6 || lb < 1e-6) return [];
      const cross = a[0] * b[1] - a[1] * b[0];
      // Both the inside of a frame and the recessed side of a notch expose
      // an inner sector. Outward-facing points retain the original contour.
      if (Math.abs(cross) < 1e-6) return [];
      const angle = Math.acos(
        Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / la / lb)),
      );
      return [
        {
          p,
          contourIndex,
          a: a.map((v) => v / la),
          b: b.map((v) => v / lb),
          la,
          lb,
          angle,
          cross,
        },
      ];
    });
  });
}

// Shared authored-path profile: add inner paint only. Original outward
// corners, bounds and terminals remain. Owners use this during construction;
// it is not a post-export rounding filter.
export function innerContour(
  d,
  { radius = 1.5, width, turns = "all", keep = [], at } = {},
) {
  const pieces = [];
  const features = [];
  for (const turn of contourTurns(d)) {
    const { p, a, b, la, lb, angle, cross } = turn;
    if (keep.some((q) => same(q, p)) || (at && !at.some((q) => same(q, p))))
      continue;
    if (turns === "orthogonal" && Math.abs(angle - Math.PI / 2) > 1e-5)
      continue;
    // Use at most half each adjoining run; neighboring fillets cannot overlap.
    // A curve submerged by the supported stroke remains an unresolved review item.
    const run = Math.min(radius / Math.tan(angle / 2), 0.5 * la, 0.5 * lb);
    const localRadius = run * Math.tan(angle / 2);
    if (localRadius < (width ?? 1.5) * 0.7) continue;
    const first = p.map((v, j) => v + a[j] * run);
    const last = p.map((v, j) => v + b[j] * run);
    const curve = `M${point(first)}A${+localRadius.toFixed(6)} ${+localRadius.toFixed(6)} 0 0 ${cross < 0 ? 1 : 0} ${point(last)}`;
    pieces.push(
      `<path d="${curve}L${point(p)}Z" fill="currentColor" stroke="none"/>` +
        S(curve, width),
    );
    features.push({
      construction: "innerContour",
      sector: `turn-${features.length + 1}`,
      curve,
      expected: "softened-opening",
    });
  }
  return features.length ? traceJunctions(pieces.join(""), features) : "";
}
export const softenedFrame = (d, options = {}) =>
  S(d, options.width) +
  innerContour(d, options) +
  curvedContour(d, options) +
  joinedLineContours(d, options);
// Geometric frame exteriors stay sharp. Curved object silhouettes belong in
// their own paths; this helper never rounds the outside of a rectangle.
export const softenedRect = (x, y, w, h) => softenedFrame(box(x, y, w, h));

// Default for authored linework: straight strokes are unchanged; every
// connected straight turn receives the same inner profile, at any angle.
export const softenedStroke = (d, width) =>
  softenedFrame(d, { width, radius: width ?? 1.5 });

// For entirely polygonal filled contours, classify the small corner sector
// against the complete even-odd fill. Only unpainted sectors acquire paint:
// outward-facing corners retain their exact original endpoints. Curved fills
// use actual segment tangents and sampled containment, then require the same
// independent final-paint review as other compound contours.
export function softenedFill(d, { radius = 0.5 } = {}) {
  if (/[acqst]/i.test(d))
    return F(d) + curvedContour(d, { radius, fill: true });
  const turns = contourTurns(d, { fill: true });
  const polygons = [...new Set(turns.map((t) => t.contourIndex))].map((index) =>
    turns.filter((t) => t.contourIndex === index).map((t) => t.p),
  );
  const inside = (p, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i],
        b = polygon[j];
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        result = !result;
    }
    return result;
  };
  const pieces = [],
    features = [];
  for (const { p, a, b, la, lb, angle, cross } of turns) {
    const test = p.map((v, j) => v + (a[j] + b[j]) * 0.001);
    if (
      polygons.reduce(
        (paint, polygon) => paint !== inside(test, polygon),
        false,
      )
    )
      continue;
    const run = Math.min(radius / Math.tan(angle / 2), 0.3 * la, 0.3 * lb);
    const localRadius = run * Math.tan(angle / 2);
    if (localRadius < 0.08) continue;
    const first = p.map((v, j) => v + a[j] * run),
      last = p.map((v, j) => v + b[j] * run);
    const curve = `M${point(first)}A${+localRadius.toFixed(6)} ${+localRadius.toFixed(6)} 0 0 ${cross < 0 ? 1 : 0} ${point(last)}`;
    pieces.push(
      `<path d="${curve}L${point(p)}Z" fill="currentColor" stroke="none"/>`,
    );
    features.push({
      construction: "softenedFill",
      sector: `turn-${features.length + 1}`,
      curve,
      expected: "softened-opening",
    });
  }
  return F(d) + traceJunctions(pieces.join(""), features);
}

function curvedContour(
  d,
  { radius = 1.5, width, fill = false, keep = [], at } = {},
) {
  const contours = parseContours(d, { fill });
  const polygons = contours.map((c) =>
    c.segments.flatMap((s) =>
      Array.from({ length: s.kind === "L" ? 1 : 48 }, (_, i) =>
        s.at(i / (s.kind === "L" ? 1 : 48)),
      ),
    ),
  );
  const inside = (p, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i],
        b = polygon[j];
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        result = !result;
    }
    return result;
  };
  const pieces = [],
    features = [];
  for (const contour of contours)
    for (let i = 0; i < contour.segments.length; i++) {
      const before = contour.segments[i],
        after =
          contour.segments[i + 1] ??
          (contour.closed ? contour.segments[0] : null);
      if (!after || (!fill && before.kind === "L" && after.kind === "L"))
        continue;
      if (
        keep.some((q) => same(q, before.end)) ||
        (at && !at.some((q) => same(q, before.end)))
      )
        continue;
      const fillet = tangentFillet(before, after, radius);
      if (!fillet || (!fill && fillet.radius < (width ?? 1.5) * 0.7)) continue;
      if (
        fill &&
        polygons.reduce(
          (paint, p) => paint !== inside(fillet.sectorPoint, p),
          false,
        )
      )
        continue;
      pieces.push(
        `<path d="${fillet.patch}" fill="currentColor" stroke="none"/>` +
          (fill ? "" : S(fillet.curve, width)),
      );
      features.push({
        construction: fill ? "filledContour" : "curvedContour",
        sector: `turn-${features.length + 1}`,
        curve: fillet.curve,
        expected: "softened-opening",
      });
    }
  return traceJunctions(pieces.join(""), features);
}

// Explicit contacts within one authored structure. A moveto does not create a
// segment, but two real members meeting across subpaths still expose roots.
function joinedLineContours(d, { radius = 1.5, width, keep = [] } = {}) {
  const lines = parseContours(d)
    .flatMap((c) => c.segments)
    .filter((s) => s.kind === "L");
  const subtract = (a, b) => a.map((v, i) => v - b[i]),
    cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const contacts = new Map();
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i],
        b = lines[j],
        u = subtract(a.end, a.start),
        v = subtract(b.end, b.start),
        delta = subtract(b.start, a.start),
        den = cross(u, v);
      if (Math.abs(den) < 1e-7) continue;
      const t = cross(delta, v) / den,
        z = cross(delta, u) / den;
      if (t < -0.000001 || t > 1.000001 || z < -0.000001 || z > 1.000001)
        continue;
      const p = a.at(Math.max(0, Math.min(1, t)));
      contacts.set(point(p), p);
    }
  const pieces = [],
    features = [];
  for (const p of contacts.values()) {
    if (keep.some((q) => same(q, p))) continue;
    const rays = [];
    for (const s of lines) {
      const d = subtract(s.end, s.start),
        length = Math.hypot(...d),
        v = subtract(p, s.start),
        dot = (v[0] * d[0] + v[1] * d[1]) / (length * length);
      if (
        Math.abs(cross(d, v)) / length > 1e-5 ||
        dot < -0.000001 ||
        dot > 1.000001
      )
        continue;
      for (const q of [s.start, s.end]) {
        const v = subtract(q, p),
          length = Math.hypot(...v);
        if (length < 1e-5) continue;
        const angle = (Math.atan2(v[1], v[0]) + 2 * Math.PI) % (2 * Math.PI),
          existing = rays.find((r) => Math.abs(r.angle - angle) < 1e-5);
        if (existing) existing.length = Math.max(existing.length, length);
        else rays.push({ angle, length, v: v.map((n) => n / length) });
      }
    }
    if (rays.length < 3) continue;
    rays.sort((a, b) => a.angle - b.angle);
    for (let i = 0; i < rays.length; i++) {
      const a = rays[i],
        b = rays[(i + 1) % rays.length],
        angle = (b.angle - a.angle + 2 * Math.PI) % (2 * Math.PI);
      if (angle >= Math.PI - 1e-5 || angle < 1e-5) continue;
      const run = Math.min(
          radius / Math.tan(angle / 2),
          0.5 * a.length,
          0.5 * b.length,
        ),
        r = run * Math.tan(angle / 2);
      if (r < (width ?? 1.5) * 0.7) continue;
      const first = p.map((n, i) => n + a.v[i] * run),
        last = p.map((n, i) => n + b.v[i] * run);
      const curve = `M${point(first)}A${+r.toFixed(6)} ${+r.toFixed(6)} 0 0 0 ${point(last)}`;
      pieces.push(
        `<path d="${curve}L${point(p)}Z" fill="currentColor" stroke="none"/>` +
          S(curve, width),
      );
      features.push({
        construction: "joinedLineContours",
        sector: `sector-${features.length + 1}`,
        curve,
        expected: "weld",
      });
    }
  }
  return traceJunctions(pieces.join(""), features);
}
