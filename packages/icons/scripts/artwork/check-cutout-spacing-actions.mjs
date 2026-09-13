// Measure the complete fitted paint, including the short cap corners. Fixed
// pockets balance both themed weights; exact equality at every width would
// require changing the cutout itself when the foreground stroke changes.
export async function checkCutoutSpacingActions(page, records) {
  const names = [
    "cloud-success.svg",
    "cloud-success_solid.svg",
    "notification-read.svg",
    "notification-read_solid.svg",
  ];
  const artwork = names.map((name) => {
    const item = records.find((record) => record.name === name);
    if (!item) throw new Error(`Missing compact cutout: ${name}`);
    return item;
  });
  return page.evaluate(async (artwork) => {
    const resolution = 192;
    const size = resolution * 16;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const diagonal = Math.SQRT1_2;
    const along = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const plus = (p, n, d) => p.map((v, i) => v + n[i] * d);
    const distance = (p, a, b) => {
      const d = b.map((v, i) => v - a[i]);
      const t = Math.max(
        0,
        Math.min(
          1,
          d.reduce((s, v, i) => s + v * (p[i] - a[i]), 0) /
            d.reduce((s, v) => s + v * v, 0),
        ),
      );
      return Math.hypot(...p.map((v, i) => v - a[i] - d[i] * t));
    };
    const record = (row, pass) => {
      results.push(row);
      if (!pass) failures.push(row);
    };
    for (const { name, svg } of artwork)
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const cloud = name.startsWith("cloud");
        const points = cloud
          ? [
              [4.81516, 6.7338],
              [7.59305, 9.51169],
              [13.14881, 3.95592],
            ]
          : [
              [9.358735, 6.02031],
              [11.22003, 7.88172],
              [14.942969, 4.158897],
            ];
        const [start, elbow, end] = points;
        const half = weight / 2;
        const upper = [diagonal, -diagonal];
        const back = [-diagonal, -diagonal];
        const polygon = [
          plus(start, upper, half),
          plus(elbow, [0, -Math.SQRT2], half),
          plus(end, back, half),
          plus(end, back, -half),
          plus(elbow, [0, Math.SQRT2], half),
          plus(start, upper, -half),
        ];
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        const root = doc.documentElement;
        root.setAttribute("width", size);
        root.setAttribute("height", size);
        root.setAttribute("style", "color:black");
        for (const element of root.querySelectorAll("[stroke-width]"))
          element.setAttribute(
            "stroke-width",
            (+element.getAttribute("stroke-width") * weight) / 0.67,
          );
        root.setAttribute("stroke-width", weight);
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(root)], {
            type: "image/svg+xml",
          }),
        );
        try {
          const image = new Image();
          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = url;
          });
          context.clearRect(0, 0, size, size);
          context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, size, size).data;
          const painted = (p) => {
            const x = Math.floor(p[0] * resolution);
            const y = Math.floor(p[1] * resolution);
            return (
              x >= 0 &&
              y >= 0 &&
              x < size &&
              y < size &&
              pixels[(y * size + x) * 4 + 3] >= 128
            );
          };
          const solid = name.endsWith("_solid.svg");
          const gaps = [];
          if (solid) {
            const probes = [
              {
                feature: "short cap centre",
                origin: plus(start, back, -0.15),
                direction: back,
              },
            ];
            probes.push({
              feature: "convex tick elbow relief",
              origin: elbow,
              direction: [0, 1],
            });
            for (const side of [-1, 1]) {
              const normal = upper.map((v) => v * side);
              probes.push({
                feature: `short cap corner ${side}`,
                origin: plus(plus(start, normal, half - 0.018), back, -0.15),
                direction: back,
              });
              // A diagonal ray around the outer corner tests curved relief, not
              // the naturally longer distance to an unrelated miter bisector.
              const corner = plus(start, normal, half - 0.018);
              const direction = normal.map((v, i) => (v + back[i]) * diagonal);
              probes.push({
                feature: `corner relief ${side}`,
                origin: plus(corner, direction, -0.08),
                direction,
              });
              probes.push({
                feature: `short side ${side}`,
                origin: along(
                  start,
                  elbow,
                  cloud
                    ? 0.4
                    : 0.8 / Math.hypot(...elbow.map((v, i) => v - start[i])),
                ),
                direction: normal,
              });
              // Stay inside the retained body on the inner side of the long arm.
              const fraction = cloud ? 0.45 : side === -1 ? 0.057 : 0.437;
              probes.push({
                feature: `long side ${side}`,
                origin: along(elbow, end, fraction),
                direction: back.map((v) => v * side),
              });
            }
            for (const probe of probes) {
              let exit = null;
              let gap = null;
              for (let i = 0; i <= 4 * resolution * 2; i++) {
                const t = i / (resolution * 2);
                const on = painted(plus(probe.origin, probe.direction, t));
                if (exit === null && !on) exit = t;
                else if (exit !== null && on) {
                  gap = t - exit;
                  break;
                }
              }
              gaps.push({ feature: probe.feature, gap });
            }
            const finite = gaps.every((p) => p.gap !== null);
            const values = gaps.map((p) => p.gap ?? 0);
            const spread = Math.max(...values) - Math.min(...values);
            const themed = weight === 1 || weight === 1.333333;
            // The miter tip moves by sqrt(2)/12 between calibration and either
            // default. Allow .027 final units for raster/corner sampling.
            const maximumSpread = themed ? 0.145 : 0.37;
            const target = cloud ? 0.683333 : 1.033333;
            record(
              {
                name,
                weight,
                check: "compact-cap-side-corner-spacing",
                coordinateSpace: "final-16-unit-canvas",
                gaps,
                spread,
                maximumSpread,
              },
              finite &&
                Math.min(...values) > 0.425 &&
                spread <= maximumSpread &&
                Math.abs(values[0] - target) < 0.025,
            );
          } else {
            const transform = cloud
              ? { s: 1.061611, tx: -0.492891, ty: -0.343602 }
              : { s: (1.155367 * 2) / 3, tx: -1.232168, ty: -1.040254 };
            const endpoints = (
              cloud
                ? [
                    [10.130734, 3.999408],
                    [12.838159, 6.932882],
                  ]
                : [
                    [16.850702, 6.988138],
                    [17.87735, 13.69103],
                  ]
            ).map((p) => [
              p[0] * transform.s + transform.tx,
              p[1] * transform.s + transform.ty,
            ]);
            for (const [index, endpoint] of endpoints.entries()) {
              let gap = Number.POSITIVE_INFINITY;
              let nearest = null;
              const radius = 0.95;
              for (
                let y = Math.floor((endpoint[1] - radius) * resolution);
                y <= Math.ceil((endpoint[1] + radius) * resolution);
                y++
              )
                for (
                  let x = Math.floor((endpoint[0] - radius) * resolution);
                  x <= Math.ceil((endpoint[0] + radius) * resolution);
                  x++
                ) {
                  const p = [(x + 0.5) / resolution, (y + 0.5) / resolution];
                  if (
                    Math.hypot(...p.map((v, i) => v - endpoint[i])) > radius ||
                    !painted(p)
                  )
                    continue;
                  const d = Math.min(
                    ...polygon.map((a, i) =>
                      distance(p, a, polygon[(i + 1) % polygon.length]),
                    ),
                  );
                  if (d < gap) {
                    gap = d;
                    nearest = p;
                  }
                }
              gaps.push({
                feature: index ? "lower/lobe cap" : "upper/crown cap",
                gap,
                nearest,
              });
            }
            const spread = Math.abs(gaps[0].gap - gaps[1].gap);
            const themed = weight === 1 || weight === 1.333333;
            // Cloud ends closely match; the small bell correction preserves its
            // original fitted tick and skirt instead of moving those landmarks.
            const maximumSpread = cloud
              ? themed
                ? 0.035
                : 0.065
              : themed
                ? 0.09
                : 0.12;
            record(
              {
                name,
                weight,
                check: "compact-outline-cap-spacing",
                coordinateSpace: "final-16-unit-canvas",
                gaps,
                spread,
                maximumSpread,
              },
              gaps.every((p) => Number.isFinite(p.gap) && p.gap > 0.9) &&
                spread < maximumSpread,
            );
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { results, failures };
  }, artwork);
}
