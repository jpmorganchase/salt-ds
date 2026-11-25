import svgpath from "svgpath";

/*
 * Font glyphs are filled using the nonzero winding rule and ignore `fill-rule`, so
 * holes drawn with `fill-rule="evenodd"` (used by most Salt icons) get filled in.
 * This rewrites each <path> so every filled region has a winding of +1 and every
 * hole a winding of 0, which renders identically under nonzero. It assumes
 * sub-paths don't intersect each other, which holds for Salt icons.
 */

const CURVE_STEPS = 8;

function toSubpaths(d) {
  const subpaths = [];
  let current;
  let point = [0, 0];
  let start = [0, 0];

  svgpath(d)
    .abs()
    .unarc()
    .unshort()
    .iterate(([command, ...args]) => {
      if (command === "M") {
        start = point = [args[0], args[1]];
        current = { start, segments: [], closed: false };
        subpaths.push(current);
        return;
      }
      if (!current || current.closed) {
        current = { start, segments: [], closed: false };
        subpaths.push(current);
      }
      if (command === "Z") {
        current.closed = true;
        point = start;
        return;
      }
      let segment;
      if (command === "H") segment = { type: "L", to: [args[0], point[1]] };
      else if (command === "V")
        segment = { type: "L", to: [point[0], args[0]] };
      else if (command === "L") segment = { type: "L", to: args };
      else if (command === "C")
        segment = {
          type: "C",
          c1: args.slice(0, 2),
          c2: args.slice(2, 4),
          to: args.slice(4),
        };
      else if (command === "Q")
        segment = { type: "Q", c1: args.slice(0, 2), to: args.slice(2) };
      else throw new Error(`Unsupported path command ${command}`);
      segment.from = point;
      current.segments.push(segment);
      point = segment.to;
    });

  return subpaths.filter((subpath) => subpath.segments.length > 0);
}

function flatten({ start, segments }) {
  const points = [start];
  for (const { type, from, c1, c2, to } of segments) {
    if (type === "L") {
      points.push(to);
      continue;
    }
    for (let i = 1; i <= CURVE_STEPS; i++) {
      const t = i / CURVE_STEPS;
      const m = 1 - t;
      points.push(
        type === "Q"
          ? [0, 1].map(
              (k) => m * m * from[k] + 2 * m * t * c1[k] + t * t * to[k],
            )
          : [0, 1].map(
              (k) =>
                m ** 3 * from[k] +
                3 * m * m * t * c1[k] +
                3 * m * t * t * c2[k] +
                t ** 3 * to[k],
            ),
      );
    }
  }
  return points;
}

// Positive means clockwise on screen (SVG's y axis points down).
function signedArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function containsPoint(polygon, [x, y]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Majority vote over the inner polygon's points, so shared or touching edges don't skew the result.
function isInside(inner, outer) {
  const votes = inner.filter((point) => containsPoint(outer, point)).length;
  return votes > inner.length / 2;
}

function reverse({ start, segments, closed }) {
  const all = [...segments];
  const end = all[all.length - 1].to;
  if (closed && (end[0] !== start[0] || end[1] !== start[1])) {
    all.push({ type: "L", from: end, to: start });
  }
  return {
    start: all[all.length - 1].to,
    closed,
    segments: all.reverse().map(({ type, from, c1, c2, to }) => ({
      type,
      from: to,
      to: from,
      c1: type === "C" ? c2 : c1,
      c2: type === "C" ? c1 : undefined,
    })),
  };
}

function serialize(subpaths) {
  const format = (n) => Number(n.toFixed(4));
  return subpaths
    .map(({ start, segments, closed }) => {
      const commands = [`M${start.map(format).join(" ")}`];
      for (const { type, c1, c2, to } of segments) {
        const coords =
          type === "C"
            ? [...c1, ...c2, ...to]
            : type === "Q"
              ? [...c1, ...to]
              : to;
        commands.push(`${type}${coords.map(format).join(" ")}`);
      }
      if (closed) commands.push("Z");
      return commands.join("");
    })
    .join("");
}

export function normalizePathWinding(d, fillRule = "nonzero") {
  const subpaths = toSubpaths(d);
  const polygons = subpaths.map(flatten);
  const areas = polygons.map(signedArea);
  const containers = polygons.map((polygon, i) =>
    polygons.flatMap((other, j) =>
      j !== i && isInside(polygon, other) ? [j] : [],
    ),
  );

  const normalized = subpaths.map((subpath, i) => {
    let shouldBeClockwise;
    if (fillRule === "evenodd") {
      // Alternate direction by nesting depth: outlines clockwise, holes anti-clockwise, islands clockwise…
      shouldBeClockwise = containers[i].length % 2 === 0;
    } else {
      // Preserve nonzero semantics within each outermost shape, but make that shape clockwise.
      const outermost =
        [i, ...containers[i]].find((j) => containers[j].length === 0) ?? i;
      shouldBeClockwise = areas[i] > 0 === areas[outermost] > 0;
    }
    return areas[i] > 0 === shouldBeClockwise ? subpath : reverse(subpath);
  });

  return serialize(normalized);
}

export function normalizeSvgWinding(svg) {
  return svg.replace(
    /<path\b([^>]*?)(?:\/>|>\s*<\/path>)/g,
    (_, attributes) => {
      const attrs = Object.fromEntries(
        [...attributes.matchAll(/([\w:-]+)="([^"]*)"/g)].map(
          ([, key, value]) => [key, value],
        ),
      );
      if (!attrs.d) return "";
      return `<path d="${normalizePathWinding(attrs.d, attrs["fill-rule"])}"/>`;
    },
  );
}
