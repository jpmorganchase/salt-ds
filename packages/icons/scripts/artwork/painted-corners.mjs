// Analyze the composed paint, independently of recipe paths and declared joins.
// Pixel contours retain holes and concave silhouette notches. Source-path
// contacts hidden by another shape never become visible-corner candidates.
export async function inspectPaintedCorners({
  svg,
  weights = [0.67, 1, 4 / 3, 1.5],
  pixelsPerUnit = 96,
}) {
  const round = (n) => +n.toFixed(5);
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const turn = (a, b, c) =>
    (Math.atan2(
      (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]),
      (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]),
    ) *
      180) /
    Math.PI;
  function simplify(points, epsilon) {
    if (points.length < 3) return points;
    const first = points[0],
      last = points.at(-1),
      dx = last[0] - first[0],
      dy = last[1] - first[1],
      den = dx * dx + dy * dy;
    let index = 0,
      maximum = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i],
        t = den
          ? Math.max(
              0,
              Math.min(
                1,
                ((p[0] - first[0]) * dx + (p[1] - first[1]) * dy) / den,
              ),
            )
          : 0;
      const d = Math.hypot(p[0] - first[0] - t * dx, p[1] - first[1] - t * dy);
      if (d > maximum) {
        maximum = d;
        index = i;
      }
    }
    if (maximum <= epsilon) return [first, last];
    return [
      ...simplify(points.slice(0, index + 1), epsilon).slice(0, -1),
      ...simplify(points.slice(index), epsilon),
    ];
  }
  const observations = [];
  const canvas = document.createElement("canvas");
  const size = 16 * pixelsPerUnit;
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  for (const weight of weights) {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    if (doc.querySelector("parsererror")) throw Error("Invalid SVG");
    doc.documentElement.setAttribute("style", "color:black");
    for (const e of doc.querySelectorAll("[stroke-width]"))
      e.setAttribute(
        "stroke-width",
        String((+e.getAttribute("stroke-width") * weight) / 0.67),
      );
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(doc)], {
        type: "image/svg+xml",
      }),
    );
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
      context.clearRect(0, 0, size, size);
      context.drawImage(img, 0, 0, size, size);
    } finally {
      URL.revokeObjectURL(url);
    }
    const data = context.getImageData(0, 0, size, size).data;
    const ink = (x, y) =>
      x >= 0 &&
      y >= 0 &&
      x < size &&
      y < size &&
      data[(y * size + x) * 4 + 3] >= 128;
    const stride = size + 1,
      edges = new Map();
    const edge = (x, y, nx, ny) => {
      const k = y * stride + x;
      const a = edges.get(k) || [];
      a.push(ny * stride + nx);
      edges.set(k, a);
    };
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (ink(x, y)) {
          if (!ink(x, y - 1)) edge(x, y, x + 1, y);
          if (!ink(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
          if (!ink(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
          if (!ink(x - 1, y)) edge(x, y + 1, x, y);
        }
    const contours = [];
    let incomplete = 0;
    while (edges.size) {
      const start = edges.keys().next().value;
      let key = start,
        previous = null;
      let points = [];
      for (let guard = 0; guard < size * size; guard++) {
        const p = [key % stride, Math.floor(key / stride)];
        points.push(p);
        const outgoing = edges.get(key);
        if (!outgoing?.length) {
          incomplete++;
          break;
        }
        let selected = 0;
        if (outgoing.length > 1 && previous) {
          let best = -Infinity;
          for (let i = 0; i < outgoing.length; i++) {
            const n = [outgoing[i] % stride, Math.floor(outgoing[i] / stride)];
            const angle = turn(previous, p, n);
            if (angle > best) {
              best = angle;
              selected = i;
            }
          }
        }
        const next = outgoing.splice(selected, 1)[0];
        if (!outgoing.length) edges.delete(key);
        previous = p;
        key = next;
        if (key === start) break;
      }
      if (points.length < 4) continue;
      const raw = points;
      points = raw.map((p, i) =>
        [0, 1].map(
          (axis) =>
            [-2, -1, 0, 1, 2].reduce(
              (sum, k) => sum + raw[(i + k + raw.length) % raw.length][axis],
              0,
            ) / 5,
        ),
      );
      let split = 1;
      for (let i = 2; i < points.length; i++)
        if (distance(points[0], points[i]) > distance(points[0], points[split]))
          split = i;
      const reduced = [
        ...simplify(points.slice(0, split + 1), 0.15).slice(0, -1),
        ...simplify([...points.slice(split), points[0]], 0.15).slice(0, -1),
      ].map((p) => p.map((v) => v / pixelsPerUnit));
      const area =
        reduced.reduce((sum, p, i) => {
          const q = reduced[(i + 1) % reduced.length];
          return sum + p[0] * q[1] - q[0] * p[1];
        }, 0) / 2;
      if (Math.abs(area) < 0.0005) continue;
      const atDistance = (index, amount, direction) => {
        let p = reduced[index];
        for (let step = 0; step < reduced.length; step++) {
          const next = (index + direction + reduced.length) % reduced.length,
            q = reduced[next],
            length = distance(p, q);
          if (length >= amount)
            return p.map((v, j) => v + ((q[j] - v) * amount) / length);
          amount -= length;
          index = next;
          p = q;
        }
        return p;
      };
      const corners = [];
      for (let i = 0; i < reduced.length; i++) {
        const p = reduced[i];
        const small = turn(atDistance(i, 0.09, -1), p, atDistance(i, 0.09, 1));
        const broad = turn(atDistance(i, 0.24, -1), p, atDistance(i, 0.24, 1));
        // Abrupt changes persist as the measurement window contracts. Smooth
        // arcs turn proportionally less in the smaller window.
        if (
          Math.abs(small) < 28 ||
          Math.abs(small) < 0.67 * Math.abs(broad) ||
          small * broad <= 0
        )
          continue;
        const candidate = {
          x: round(p[0]),
          y: round(p[1]),
          turn: round(small),
          broadTurn: round(broad),
          kind:
            Math.abs(small) > 1.35 * Math.abs(broad)
              ? "uncertain"
              : small < 0
                ? "inner"
                : "outer",
          contour: contours.length + 1,
        };
        const nearby = corners.find((c) => distance([c.x, c.y], p) < 0.11);
        if (!nearby) corners.push(candidate);
        else if (Math.abs(small) > Math.abs(nearby.turn))
          Object.assign(nearby, candidate);
      }
      contours.push({
        area: round(area),
        hole: area < 0,
        points: reduced.map((p) => p.map(round)),
        corners,
      });
    }
    observations.push({
      weight,
      contours,
      corners: contours.flatMap((c) => c.corners),
      warnings: incomplete ? [`${incomplete} open pixel contours`] : [],
    });
  }
  return { version: "painted-corners/1", pixelsPerUnit, observations };
}
