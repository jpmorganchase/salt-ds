// Self-contained browser function: construction traces are evaluated separately
// from production SVG, and all exposure observations use the final exported paint.
export const paintAnalysisVersion = 1;
export async function inspectDeclaredJunctions({ body, svg, transform }) {
  const ns = "http://www.w3.org/2000/svg";
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-10000px;top:0;visibility:hidden";
  const scale = transform.scale * 0.6666666667;
  host.innerHTML = `<svg xmlns="${ns}" width="16" height="16" viewBox="0 0 16 16"><g transform="translate(${transform.translateX} ${transform.translateY}) scale(${scale})">${body}</g></svg>`;
  document.body.append(host);
  const round = (n) => Number(n.toFixed(6));
  const joins = [];
  try {
    for (const group of host.querySelectorAll("[data-salt-junctions]")) {
      const matrix = group.getCTM();
      const stroke = [...group.querySelectorAll("path")].find(
        (p) => getComputedStyle(p).stroke !== "none",
      );
      const determinant = Math.abs(matrix.a * matrix.d - matrix.b * matrix.c);
      const geometryScale = Math.sqrt(determinant);
      const uniform =
        Math.abs(
          Math.hypot(matrix.a, matrix.b) - Math.hypot(matrix.c, matrix.d),
        ) < 0.00001 &&
        Math.abs(matrix.a * matrix.c + matrix.b * matrix.d) < 0.00001;
      // Fitting compensates strokes, while local construction transforms remain
      // real. Read the actual stroke, including opticalScale's compensation.
      const referenceWidth = stroke
        ? ((parseFloat(getComputedStyle(stroke).strokeWidth) * geometryScale) /
            transform.scale) *
          0.67
        : 0;
      for (const feature of JSON.parse(
        group.getAttribute("data-salt-junctions"),
      )) {
        const guide = document.createElementNS(ns, "path");
        guide.setAttribute("d", feature.curve);
        group.append(guide);
        const length = guide.getTotalLength();
        const points = Array.from({ length: 41 }, (_, i) => {
          const p = guide.getPointAtLength((length * i) / 40);
          return [
            round(matrix.a * p.x + matrix.c * p.y + matrix.e),
            round(matrix.b * p.x + matrix.d * p.y + matrix.f),
          ];
        });
        guide.remove();
        joins.push({
          id: `j${String(joins.length + 1).padStart(3, "0")}`,
          ...feature,
          point: points[20],
          curvePoints: points,
          referenceWidth: round(referenceWidth),
          uniform,
          observations: [],
        });
      }
    }
  } finally {
    host.remove();
  }
  if (!joins.length) return joins;
  const pixelsPerUnit = 96;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16 * pixelsPerUnit;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const curvature = (a, b, c) => {
    const ax = a[0] - b[0],
      ay = a[1] - b[1],
      cx = c[0] - b[0],
      cy = c[1] - b[1];
    const det = 2 * (ax * cy - ay * cx);
    if (Math.abs(det) < 1e-10) return null;
    const aa = ax * ax + ay * ay,
      cc = cx * cx + cy * cy;
    const x = (aa * cy - cc * ay) / det,
      y = (ax * cc - cx * aa) / det;
    const radius = Math.hypot(x, y);
    return radius > 0 && radius < 100
      ? { radius, nx: x / radius, ny: y / radius }
      : null;
  };
  for (const weight of [0.67, 1, 4 / 3, 1.5]) {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    doc.documentElement.setAttribute("style", "color:black");
    for (const node of doc.querySelectorAll("[stroke-width]"))
      node.setAttribute(
        "stroke-width",
        String((Number(node.getAttribute("stroke-width")) * weight) / 0.67),
      );
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(doc)], {
        type: "image/svg+xml",
      }),
    );
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      const painted = (x, y) => {
        const px = Math.floor(x * pixelsPerUnit),
          py = Math.floor(y * pixelsPerUnit);
        return (
          px >= 0 &&
          py >= 0 &&
          px < canvas.width &&
          py < canvas.height &&
          pixels[(py * canvas.width + px) * 4 + 3] >= 128
        );
      };
      for (const join of joins) {
        let exposed = 0,
          covered = 0,
          sampled = 0,
          middleExposed = 0,
          middleSamples = 0;
        const radii = [];
        const half = (join.referenceWidth * weight) / 0.67 / 2;
        // Sample only this exact declared sector. Curvature from a neighboring
        // path or a different root cannot count towards its evidence.
        for (let i = 4; i <= 36; i += 2) {
          const b = join.curvePoints[i];
          const curve = curvature(
            join.curvePoints[i - 3],
            b,
            join.curvePoints[i + 3],
          );
          if (!curve) continue;
          radii.push(curve.radius - half);
          sampled++;
          const epsilon = 0.055;
          const near = painted(
            b[0] + curve.nx * (half - epsilon),
            b[1] + curve.ny * (half - epsilon),
          );
          const far = painted(
            b[0] + curve.nx * (half + epsilon),
            b[1] + curve.ny * (half + epsilon),
          );
          if (near && !far) exposed++;
          if (i >= 14 && i <= 26) {
            middleSamples++;
            if (near && !far) middleExposed++;
          }
          if (near && far) covered++;
        }
        // These are observations, not blanket style judgments. In a solid,
        // occlusion may be intended; its decision remains explicit in review.
        const radius = radii.length ? Math.min(...radii) : null;
        const status =
          !join.uniform || !sampled
            ? "uncertain"
            : radius <= 0.055
              ? "submerged"
              : exposed >= 3 &&
                  exposed / sampled >= 0.45 &&
                  middleSamples >= 3 &&
                  middleExposed / middleSamples >= 0.7
                ? "visible"
                : covered / sampled >= 0.8
                  ? "occluded"
                  : "uncertain";
        join.observations.push({
          weight,
          status,
          exposedRadius: radius === null ? null : round(radius),
          exposedSamples: exposed,
          samples: sampled,
          middleExposed,
          middleSamples,
        });
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return joins;
}
