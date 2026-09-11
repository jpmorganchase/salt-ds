import { optimize } from "svgo";

// Inspect actual painted pixels: dense normal rays for curved/filled margins,
// and Euclidean foreground distance at the interrupted outline terminals.
export async function checkCutoutComposites(page, records) {
  const names = [
    "dataset-manager.svg",
    "dataset-manager_solid.svg",
    "document-draft.svg",
    "document-edit.svg",
    "document-search.svg",
    "filter-clear.svg",
    "filter-clear_solid.svg",
    "storefront_solid.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((item) => item.name === name);
    if (!record) throw new Error(`Missing composite cutout artwork: ${name}`);
    // Absolute moves let the two X strokes be isolated even when an older SVG
    // combined them with the rear funnel in one path. This preserves painting.
    return {
      name,
      svg:
        name === "filter-clear.svg"
          ? optimize(record.svg, {
              floatPrecision: 8,
              plugins: [
                {
                  name: "convertPathData",
                  params: { forceAbsolutePath: true },
                },
              ],
            }).data
          : record.svg,
    };
  });
  return page.evaluate(async (artwork) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const native = (point) => point.map((n) => (n * 2) / 3);
    const unit = ([x, y]) => {
      const length = Math.hypot(x, y);
      return [x / length, y / length];
    };
    function report(row, pass) {
      results.push(row);
      if (!pass) failures.push(row);
    }
    function alphaAt(pixels, x, y) {
      const px = x * scale - 0.5;
      const py = y * scale - 0.5;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      const fx = px - ix;
      const fy = py - iy;
      if (ix < 0 || iy < 0 || ix + 1 >= side || iy + 1 >= side) return 0;
      const a = (dx, dy) => pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
      return (
        a(0, 0) * (1 - fx) * (1 - fy) +
        a(1, 0) * fx * (1 - fy) +
        a(0, 1) * (1 - fx) * fy +
        a(1, 1) * fx * fy
      );
    }
    function normalGap(pixels, origin, normal) {
      let previous = alphaAt(pixels, ...origin);
      let exit = null;
      let enter = null;
      if (previous < 0.5) return null;
      for (let i = 1; i <= 3.5 * scale; i++) {
        const distance = i / scale;
        const alpha = alphaAt(
          pixels,
          origin[0] + normal[0] * distance,
          origin[1] + normal[1] * distance,
        );
        const boundary =
          (i - 1 + (0.5 - previous) / (alpha - previous)) / scale;
        if (exit === null && previous >= 0.5 && alpha < 0.5) exit = boundary;
        else if (exit !== null && previous < 0.5 && alpha >= 0.5) {
          enter = boundary;
          break;
        }
        previous = alpha;
      }
      return exit === null || enter === null ? null : enter - exit;
    }
    function squaredDistance(pixels) {
      const data = new Float32Array(side * side);
      const temp = new Float32Array(side * side);
      for (let i = 0; i < data.length; i++)
        data[i] = pixels[i * 4 + 3] >= 128 ? 0 : 1e8;
      const v = new Int32Array(side);
      const z = new Float64Array(side + 1);
      const f = new Float32Array(side);
      const transformed = new Float32Array(side);
      function line() {
        let k = 0;
        v[0] = 0;
        z[0] = Number.NEGATIVE_INFINITY;
        z[1] = Number.POSITIVE_INFINITY;
        for (let q = 1; q < side; q++) {
          let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));
          while (s <= z[k]) {
            k--;
            s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * (q - v[k]));
          }
          k++;
          v[k] = q;
          z[k] = s;
          z[k + 1] = Number.POSITIVE_INFINITY;
        }
        k = 0;
        for (let q = 0; q < side; q++) {
          while (z[k + 1] < q) k++;
          transformed[q] = (q - v[k]) ** 2 + f[v[k]];
        }
      }
      for (let y = 0; y < side; y++) {
        f.set(data.subarray(y * side, (y + 1) * side));
        line();
        temp.set(transformed, y * side);
      }
      for (let x = 0; x < side; x++) {
        for (let y = 0; y < side; y++) f[y] = temp[y * side + x];
        line();
        for (let y = 0; y < side; y++) data[y * side + x] = transformed[y];
      }
      return data;
    }
    function terminalGap(rear, distance, [x0, y0, x1, y1]) {
      let best = Number.POSITIVE_INFINITY;
      let pixels = 0;
      for (let y = Math.floor(y0 * scale); y <= Math.ceil(y1 * scale); y++)
        for (let x = Math.floor(x0 * scale); x <= Math.ceil(x1 * scale); x++) {
          const i = y * side + x;
          if (rear[i * 4 + 3] < 128) continue;
          pixels++;
          best = Math.min(best, distance[i]);
        }
      return {
        gap: Number.isFinite(best)
          ? Math.max(0, Math.sqrt(best) / scale - 1 / scale)
          : null,
        paintedPixels: pixels,
      };
    }
    for (const { name, svg } of artwork) {
      const holder = document.createElement("div");
      holder.style.cssText = "position:absolute;left:-9999px;top:0";
      holder.innerHTML = svg;
      document.body.appendChild(holder);
      try {
        const source = holder.querySelector("svg");
        if (name === "filter-clear.svg")
          for (const path of [...source.querySelectorAll("path")]) {
            const pieces = path.getAttribute("d").match(/M[^M]*/g);
            if (pieces?.length > 1) {
              for (const d of pieces) {
                const clone = path.cloneNode(true);
                clone.setAttribute("d", d);
                path.before(clone);
              }
              path.remove();
            }
          }
        const paths = [...source.querySelectorAll("path")].map(
          (element, index) => ({ index, bounds: element.getBBox() }),
        );
        async function render(indices) {
          const isolated = source.cloneNode(true);
          isolated.setAttribute("width", side);
          isolated.setAttribute("height", side);
          isolated.setAttribute("style", "color:black");
          if (indices)
            for (const [index, path] of [
              ...isolated.querySelectorAll("path"),
            ].entries())
              if (!indices.includes(index)) path.remove();
          const url = URL.createObjectURL(
            new Blob([new XMLSerializer().serializeToString(isolated)], {
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
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            return context.getImageData(0, 0, side, side).data;
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        for (const weight of [0.67]) {
          const normalProbes = [];
          if (name === "storefront_solid.svg") {
            const segments = [
              [
                [21.75, 9.75],
                [18.75, 12.75],
                [15.75, 9.75],
              ],
              [
                [15.75, 9.75],
                [12, 12.75],
                [8.25, 9.75],
              ],
              [
                [8.25, 9.75],
                [5.25, 12.75],
                [2.25, 9.75],
              ],
            ];
            segments.forEach(([a, b, c], segment) => {
              for (let i = 9; i <= 41; i++) {
                const t = i / 50;
                const p = a.map(
                  (n, j) =>
                    (1 - t) ** 2 * n + 2 * (1 - t) * t * b[j] + t * t * c[j],
                );
                const tangent = a.map(
                  (n, j) => 2 * (1 - t) * (b[j] - n) + 2 * t * (c[j] - b[j]),
                );
                const normal = unit([tangent[1], -tangent[0]]);
                const targetX = p[0] + 1.125 * normal[0];
                if (targetX < 3.8 || targetX > 20.2) continue;
                normalProbes.push({
                  feature: `awning scallop ${segment + 1}`,
                  t,
                  point: native(p),
                  normal,
                  expected: 0.75,
                  seed: 0.2,
                });
              }
            });
          } else if (name === "dataset-manager_solid.svg") {
            for (let degrees = 180; degrees <= 300; degrees += 5) {
              const angle = (degrees * Math.PI) / 180;
              const normal = [Math.cos(angle), Math.sin(angle)];
              normalProbes.push({
                feature: "head contour",
                degrees,
                point: native([
                  15.75 + 3.375 * normal[0],
                  11.625 + 3.375 * normal[1],
                ]),
                normal,
                expected: 0.75,
                seed: 0.2,
              });
            }
            for (let i = 1; i <= 19; i++) {
              const t = i / 20;
              const point = native([
                9.75 + 6 * t * t,
                20.25 - 4.5 * t + 2.25 * t * t,
              ]);
              const normal = unit([-4.5 + 4.5 * t, -12 * t]);
              normalProbes.push({
                feature: "shoulder contour",
                t,
                point,
                normal,
                expected: 0.75,
                seed: 0.2,
              });
            }
          } else if (name === "filter-clear_solid.svg") {
            for (const p of [8.8, 9.1, 9.4, 9.7]) {
              normalProbes.push({
                feature: "upper left X edge",
                position: p,
                point: native([p, p]),
                normal: unit([1, -1]),
                expected: 1.25 - weight / 2,
                seed: 0,
              });
              normalProbes.push({
                feature: "upper right X edge",
                position: p,
                point: native([24 - p, p]),
                normal: unit([-1, -1]),
                expected: 1.25 - weight / 2,
                seed: 0,
              });
            }
            for (const p of [9.8, 10, 10.2]) {
              normalProbes.push({
                feature: "lower left X edge",
                position: p,
                point: native([p, 24 - p]),
                normal: unit([1, 1]),
                expected: 1.25 - weight / 2,
                seed: 0,
              });
              normalProbes.push({
                feature: "lower right X edge",
                position: p,
                point: native([24 - p, 24 - p]),
                normal: unit([-1, 1]),
                expected: 1.25 - weight / 2,
                seed: 0,
              });
            }
          }
          if (normalProbes.length) {
            const pixels = await render(null);
            for (const probe of normalProbes) {
              const origin = probe.point.map(
                (n, i) => n - probe.normal[i] * probe.seed,
              );
              const gap = normalGap(pixels, origin, probe.normal);
              const tolerance = 0.03;
              report(
                { name, weight, ...probe, gap, tolerance },
                gap !== null && Math.abs(gap - probe.expected) <= tolerance,
              );
            }
            continue;
          }
          let foreground;
          let rear;
          let probes;
          if (name === "dataset-manager.svg") {
            foreground = paths
              .filter(({ bounds: b }) => b.y >= 5.4)
              .map((p) => p.index);
            rear = paths.filter(({ bounds: b }) => b.y < 3).map((p) => p.index);
            probes = [
              {
                feature: "head-facing middle cylinder stop",
                rect: [6.2, 9, 7.2, 10],
                minimum: 0.49,
                maximum: 1.85,
              },
              {
                feature: "shoulder-facing lower cylinder stop",
                rect: [4.1, 12.9, 5.0, 14.1],
                minimum: 0.49,
                maximum: 1.85,
              },
            ];
          } else if (name === "filter-clear.svg") {
            foreground = paths
              .filter(
                ({ bounds: b }) =>
                  b.x >= 5.4 &&
                  b.y >= 5.4 &&
                  b.x + b.width <= 10.6 &&
                  b.y + b.height <= 10.6,
              )
              .map((p) => p.index);
            rear = paths
              .filter((p) => !foreground.includes(p.index))
              .map((p) => p.index);
            probes = [
              {
                feature: "left funnel stop at X",
                rect: [3.2, 4.9, 4.9, 6.0],
                minimum: 0.49,
                maximum: 1.8,
              },
              {
                feature: "right funnel stop at X",
                rect: [11.1, 4.9, 12.8, 6.0],
                minimum: 0.49,
                maximum: 1.8,
              },
            ];
          } else if (name === "document-search.svg") {
            foreground = paths
              .filter(({ bounds: b }) => b.x >= 7.4 && b.y >= 7.4)
              .map((p) => p.index);
            rear = paths.filter(({ bounds: b }) => b.x < 3).map((p) => p.index);
            const expectedBottom =
              ((Math.hypot(11.64208 - 15.75, 21.75 - 0.75 * weight - 15.75) -
                (4.5 + 0.75 * weight)) *
                2) /
              3;
            const expectedRight =
              ((Math.hypot(20.25 - 0.75 * weight - 15.75, 10.34167 - 15.75) -
                (4.5 + 0.75 * weight)) *
                2) /
              3;
            probes = [
              {
                feature: "lower page stop at lens",
                rect: [7.2, 13.6, 8.1, 15.1],
                expected: expectedBottom,
              },
              {
                feature: "right page stop at lens",
                rect: [12.7, 6.3, 14.2, 7.5],
                expected: expectedRight,
              },
            ];
          } else {
            foreground = paths
              .filter(({ bounds: b }) => b.x >= 7.4 && b.y < 2)
              .map((p) => p.index);
            rear = paths.filter(({ bounds: b }) => b.x < 3).map((p) => p.index);
            const expected = 1.8 - (0.5 + 1 / (2 * Math.sqrt(2))) * weight;
            probes = [
              {
                feature: "top page stop at pencil",
                rect: [8.6, 1, 10.1, 2.2],
                expected,
              },
              {
                feature: "right page stop at pencil",
                rect: [12.7, 6.0, 14.2, 7.5],
                expected,
              },
            ];
          }
          if (!foreground.length || !rear.length)
            throw new Error(`Cannot isolate painted layers for ${name}`);
          const fg = await render(foreground);
          const distance = squaredDistance(fg);
          const back = await render(rear);
          for (const probe of probes) {
            const measured = terminalGap(back, distance, probe.rect);
            const tolerance = 0.035;
            const pass =
              measured.gap !== null &&
              (probe.expected !== undefined
                ? Math.abs(measured.gap - probe.expected) <= tolerance
                : measured.gap >= probe.minimum - tolerance &&
                  measured.gap <= probe.maximum + tolerance);
            report({ name, weight, ...probe, ...measured, tolerance }, pass);
          }
        }
      } finally {
        holder.remove();
      }
    }
    return { results, failures };
  }, artwork);
}
