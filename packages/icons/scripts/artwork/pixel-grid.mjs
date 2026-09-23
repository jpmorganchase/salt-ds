import { parseContours } from "./path-segments.mjs";

// Only exposed horizontal/vertical runs are measured. A fractional coordinate
// is not itself a defect: curves, diagonals, short details and layout phase need
// visual review. Scores assume an integer CSS origin at 100% zoom and DPR 1.
export function gridRecord({ name, svg }) {
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)].map(
    (match) =>
      parseContours(match[1], { fill: !/fill="none"/.test(match[0]) }).flatMap(
        (contour) =>
          contour.segments
            .filter((segment) => segment.kind === "L")
            .map((segment) => ({ a: segment.start, b: segment.end })),
      ),
  );
  return { name, svg, paths };
}

// This self-contained function runs in the browser. Test the union of visible
// paint on both sides so a covered construction line is not treated as an edge.
export function inspectPixelGrid(records) {
  const output = [];
  for (const record of records) {
    const host = document.createElement("div");
    host.innerHTML = record.svg;
    document.body.append(host);
    const svg = host.querySelector("svg");
    const nodes = [...svg.querySelectorAll("path")];
    const original = [svg, ...svg.querySelectorAll("[stroke-width]")]
      .filter((e, i, a) => a.indexOf(e) === i && e.hasAttribute("stroke-width"))
      .map((e) => [e, +e.getAttribute("stroke-width")]);
    const samples = [];
    for (const [size, weight] of [
      [12, 4 / 3],
      [16, 1],
      [16, 4 / 3],
    ]) {
      for (const [e, w] of original)
        e.setAttribute("stroke-width", (w / 0.67) * weight);
      const painted = nodes.map((n) => ({
        n,
        fill: getComputedStyle(n).fill !== "none",
        stroke: getComputedStyle(n).stroke !== "none",
        width: parseFloat(getComputedStyle(n).strokeWidth),
      }));
      const ink = (x, y) => {
        const p = new DOMPoint(x, y);
        return painted.some(
          ({ n, fill, stroke }) =>
            (fill && n.isPointInFill(p)) || (stroke && n.isPointInStroke(p)),
        );
      };
      const edges = [];
      const seen = new Set();
      record.paths.forEach((lines, i) => {
        const { fill, stroke, width } = painted[i];
        for (const { a, b } of lines) {
          const axis =
            Math.abs(a[0] - b[0]) < 1e-5
              ? 0
              : Math.abs(a[1] - b[1]) < 1e-5
                ? 1
                : -1;
          if (axis < 0) continue;
          const other = 1 - axis,
            length = Math.abs(a[other] - b[other]);
          if ((length * size) / 16 < 2) continue;
          const offsets = stroke ? [-width / 2, width / 2] : fill ? [0] : [];
          for (const offset of offsets) {
            const coord = a[axis] + offset;
            let exposed = 0;
            for (const t of [0.25, 0.5, 0.75]) {
              const p = [0, 0];
              p[axis] = coord - 0.01;
              p[other] = a[other] + t * (b[other] - a[other]);
              const left = ink(...p);
              p[axis] = coord + 0.01;
              if (left !== ink(...p)) exposed++;
            }
            if (!exposed) continue;
            const lo = Math.min(a[other], b[other]),
              hi = Math.max(a[other], b[other]);
            const key = [
              axis,
              coord.toFixed(3),
              lo.toFixed(3),
              hi.toFixed(3),
            ].join(":");
            if (seen.has(key)) continue;
            seen.add(key);
            const pixel = (coord * size) / 16,
              error = Math.abs(pixel - Math.round(pixel));
            edges.push({
              axis,
              coordinate: coord,
              from: lo,
              to: hi,
              length: (length * exposed) / 3,
              error,
            });
          }
        }
      });
      const total = edges.reduce((s, e) => s + e.length, 0);
      samples.push({
        size,
        weight,
        total,
        error: total
          ? edges.reduce((s, e) => s + e.error * e.length, 0) / total
          : null,
        aligned: total
          ? edges
              .filter((e) => e.error < 0.05)
              .reduce((s, e) => s + e.length, 0) / total
          : null,
        edges,
      });
    }
    output.push({ name: record.name, samples });
    host.remove();
  }
  return output;
}

export async function checkPixelGrid(page, records) {
  return page.evaluate(inspectPixelGrid, records.map(gridRecord));
}
