// Absolute SVG segments with exact points/tangents. Used by authoring helpers,
// not by the independent painted-edge audit.
const add = (a, b) => a.map((v, i) => v + b[i]);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const mul = (a, n) => a.map((v) => v * n);
const mix = (a, b, t) => add(mul(a, 1 - t), mul(b, t));
const p = (a) => a.map((v) => +v.toFixed(6)).join(" ");
function line(a, b) {
  return {
    kind: "L",
    start: a,
    end: b,
    at: (t) => mix(a, b, t),
    derivative: () => sub(b, a),
    portion: (_a, t) => `L${p(mix(a, b, t))}`,
  };
}
function cubic(a, b, c, d) {
  const at = (t) =>
    mix(
      mix(mix(a, b, t), mix(b, c, t), t),
      mix(mix(b, c, t), mix(c, d, t), t),
      t,
    );
  const derivative = (t) =>
    mul(mix(mix(sub(b, a), sub(c, b), t), mix(sub(c, b), sub(d, c), t), t), 3);
  return {
    kind: "C",
    start: a,
    end: d,
    at,
    derivative,
    portion: (s, t) =>
      `C${p(add(at(s), mul(derivative(s), (t - s) / 3)))} ${p(sub(at(t), mul(derivative(t), (t - s) / 3)))} ${p(at(t))}`,
  };
}
function arc(a, values, b) {
  let [rx, ry, rotation, large, sweep] = values;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!rx || !ry || Math.hypot(...sub(a, b)) < 1e-8) return line(a, b);
  const phi = (rotation * Math.PI) / 180,
    cos = Math.cos(phi),
    sin = Math.sin(phi),
    half = mul(sub(a, b), 0.5);
  const x = cos * half[0] + sin * half[1],
    y = -sin * half[0] + cos * half[1];
  const stretch = (x * x) / (rx * rx) + (y * y) / (ry * ry);
  if (stretch > 1) {
    rx *= Math.sqrt(stretch);
    ry *= Math.sqrt(stretch);
  }
  const c =
    (large === sweep ? -1 : 1) *
    Math.sqrt(
      Math.max(
        0,
        (rx * rx * ry * ry - rx * rx * y * y - ry * ry * x * x) /
          (rx * rx * y * y + ry * ry * x * x),
      ),
    );
  const cx = (c * rx * y) / ry,
    cy = (-c * ry * x) / rx,
    mid = mul(add(a, b), 0.5),
    center = [cos * cx - sin * cy + mid[0], sin * cx + cos * cy + mid[1]];
  const start = Math.atan2((y - cy) / ry, (x - cx) / rx);
  let delta = Math.atan2((-y - cy) / ry, (-x - cx) / rx) - start;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  const at = (t) => {
    const theta = start + delta * t;
    return [
      center[0] + cos * rx * Math.cos(theta) - sin * ry * Math.sin(theta),
      center[1] + sin * rx * Math.cos(theta) + cos * ry * Math.sin(theta),
    ];
  };
  const derivative = (t) => {
    const theta = start + delta * t;
    return [
      (-cos * rx * Math.sin(theta) - sin * ry * Math.cos(theta)) * delta,
      (-sin * rx * Math.sin(theta) + cos * ry * Math.cos(theta)) * delta,
    ];
  };
  return {
    kind: "A",
    start: a,
    end: b,
    at,
    derivative,
    portion: (s, t) =>
      `A${+rx.toFixed(6)} ${+ry.toFixed(6)} ${rotation} ${Math.abs((t - s) * delta) > Math.PI ? 1 : 0} ${(t - s) * delta > 0 ? 1 : 0} ${p(at(t))}`,
  };
}
export function parseContours(d, { fill = false } = {}) {
  const tokens =
    d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) ?? [];
  const counts = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  const contours = [];
  let at = [0, 0],
    start = [0, 0],
    command,
    previous = "",
    control,
    contour;
  for (let i = 0; i < tokens.length; ) {
    if (/^[a-z]$/i.test(tokens[i])) command = tokens[i++];
    const upper = command?.toUpperCase(),
      relative = command !== upper;
    if (!(upper in counts)) throw Error("Unsupported SVG command");
    if (upper === "Z") {
      if (Math.hypot(...sub(at, start)) > 1e-8)
        contour.segments.push(line(at, start));
      contour.closed = true;
      at = start;
      command = undefined;
      previous = upper;
      continue;
    }
    const v = tokens.slice(i, i + counts[upper]).map(Number);
    if (v.length !== counts[upper] || v.some((n) => !Number.isFinite(n)))
      throw Error("Invalid SVG parameters");
    i += counts[upper];
    const point = (x, y) => (relative ? [at[0] + x, at[1] + y] : [x, y]);
    let end, segment, nextControl;
    if (upper === "M") {
      at = point(v[0], v[1]);
      start = at;
      contour = { segments: [], closed: false };
      contours.push(contour);
      command = relative ? "l" : "L";
      previous = "M";
      control = undefined;
      continue;
    }
    if (!contour) throw Error("SVG path must start with moveto");
    if (["L", "H", "V"].includes(upper)) {
      end =
        upper === "L"
          ? point(v[0], v[1])
          : upper === "H"
            ? [v[0] + (relative ? at[0] : 0), at[1]]
            : [at[0], v[0] + (relative ? at[1] : 0)];
      segment = line(at, end);
    } else if (upper === "C" || upper === "S") {
      const reflected =
        ["C", "S"].includes(previous) && control
          ? sub(mul(at, 2), control)
          : at;
      const first = upper === "C" ? point(v[0], v[1]) : reflected,
        second = upper === "C" ? point(v[2], v[3]) : point(v[0], v[1]);
      end = upper === "C" ? point(v[4], v[5]) : point(v[2], v[3]);
      segment = cubic(at, first, second, end);
      nextControl = second;
    } else if (upper === "Q" || upper === "T") {
      const first =
        upper === "Q"
          ? point(v[0], v[1])
          : ["Q", "T"].includes(previous) && control
            ? sub(mul(at, 2), control)
            : at;
      end = upper === "Q" ? point(v[2], v[3]) : point(v[0], v[1]);
      segment = cubic(at, mix(at, first, 2 / 3), mix(end, first, 2 / 3), end);
      nextControl = first;
    } else {
      end = point(v[5], v[6]);
      segment = arc(at, v, end);
    }
    if (Math.hypot(...sub(at, end)) > 1e-8 || segment.kind !== "L")
      contour.segments.push(segment);
    at = end;
    control = nextControl;
    previous = upper;
  }
  if (fill)
    for (const c of contours)
      if (c.segments.length && !c.closed) {
        const first = c.segments[0].start,
          last = c.segments.at(-1).end;
        if (Math.hypot(...sub(first, last)) > 1e-8)
          c.segments.push(line(last, first));
        c.closed = true;
      }
  return contours;
}
const unit = (v) => mul(v, 1 / Math.hypot(...v));
// Solve the two tangent offsets for a circular fillet. Both tangencies must
// stay on their adjacent members; failure is explicit and never approval.
export function tangentFillet(before, after, radius, maxFraction = 0.4) {
  const a = unit(mul(before.derivative(1), -1)),
    b = unit(after.derivative(0));
  if ([...a, ...b].some((v) => !Number.isFinite(v))) return null;
  const cross = a[0] * b[1] - a[1] * b[0],
    angle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1])));
  if (Math.abs(cross) < 1e-6 || Math.PI - angle < 0.035) return null;
  const sign = Math.sign(cross),
    length = (segment) =>
      Array.from({ length: 16 }, (_, i) =>
        Math.hypot(...sub(segment.at((i + 1) / 16), segment.at(i / 16))),
      ).reduce((a, b) => a + b, 0);
  const la = length(before),
    lb = length(after),
    run = Math.min(
      radius / Math.tan(angle / 2),
      maxFraction * la,
      maxFraction * lb,
    );
  const r = run * Math.tan(angle / 2);
  if (r < 0.08) return null;
  const offset = (segment, t, reverse, side) => {
    const parameter = reverse ? 1 - t : t,
      q = segment.at(parameter),
      v = unit(mul(segment.derivative(parameter), reverse ? -1 : 1));
    return add(q, [-v[1] * r * side, v[0] * r * side]);
  };
  const first = (t) => offset(before, t, true, sign),
    second = (t) => offset(after, t, false, -sign);
  let t = run / la,
    u = run / lb;
  for (let i = 0; i < 24; i++) {
    const delta = sub(first(t), second(u));
    if (Math.hypot(...delta) < 1e-6) break;
    const epsilon = 1e-5,
      dt = mul(sub(first(t + epsilon), first(t - epsilon)), 1 / (2 * epsilon)),
      du = mul(
        sub(second(u + epsilon), second(u - epsilon)),
        -1 / (2 * epsilon),
      );
    const determinant = dt[0] * du[1] - dt[1] * du[0];
    if (Math.abs(determinant) < 1e-8) return null;
    t -= (delta[0] * du[1] - delta[1] * du[0]) / determinant;
    u -= (dt[0] * delta[1] - dt[1] * delta[0]) / determinant;
    if (t <= 0 || u <= 0 || t > maxFraction * 1.2 || u > maxFraction * 1.2)
      return null;
  }
  if (Math.hypot(...sub(first(t), second(u))) > 1e-4) return null;
  const start = before.at(1 - t),
    end = after.at(u);
  const curve = `M${p(start)}A${+r.toFixed(6)} ${+r.toFixed(6)} 0 0 ${cross < 0 ? 1 : 0} ${p(end)}`;
  const patch = curve + after.portion(u, 0) + before.portion(1, 1 - t) + "Z";
  return {
    curve,
    patch,
    radius: r,
    point: before.end,
    sectorPoint: add(before.end, mul(add(a, b), 0.001)),
  };
}
