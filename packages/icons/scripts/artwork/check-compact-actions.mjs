// Check compact modifiers in fitted exports, independent of recipe/path order.
// The action must stay subordinate to a retained cloud or bell, share the
// primary stroke, and preserve the same gesture and position in both variants.
export async function checkCompactActions(page, records) {
  const names = [
    "cloud-success.svg",
    "cloud-success_solid.svg",
    "notification-read.svg",
    "notification-read_solid.svg",
  ];
  const samples = names.map((name) => {
    const sample = records.find((candidate) => candidate.name === name);
    if (!sample) throw new Error(`Missing compact action specimen: ${name}`);
    return sample;
  });
  return page.evaluate(async (samples) => {
    const scale = 64;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const record = (details, pass) => {
      results.push(details);
      if (!pass) failures.push(details);
    };
    const render = async (svg, weight) => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      for (const element of doc.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
        if (Number.isFinite(width))
          element.setAttribute("stroke-width", String((width * weight) / 0.67));
      }
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        }),
      );
      const image = new Image();
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () =>
            reject(new Error("Could not render compact action"));
          image.src = url;
        });
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
      const rgba = context.getImageData(0, 0, size, size).data;
      return Uint8Array.from(
        { length: size * size },
        (_, i) => rgba[i * 4 + 3],
      );
    };
    const regions = (alpha) => {
      const labels = new Uint32Array(alpha.length);
      const queue = new Uint32Array(alpha.length);
      const components = [];
      for (let start = 0; start < labels.length; start++) {
        if (labels[start] || alpha[start] < 128) continue;
        const id = components.length + 1;
        let read = 0;
        let length = 1;
        queue[0] = start;
        labels[start] = id;
        let left = size;
        let top = size;
        let right = 0;
        let bottom = 0;
        let uMin = Number.POSITIVE_INFINITY;
        let uMax = Number.NEGATIVE_INFINITY;
        let vMin = Number.POSITIVE_INFINITY;
        let vMax = Number.NEGATIVE_INFINITY;
        while (read < length) {
          const index = queue[read++];
          const x = index % size;
          const y = Math.floor(index / size);
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          const u = ((x + y + 1) * Math.SQRT1_2) / scale;
          const v = ((x - y) * Math.SQRT1_2) / scale;
          uMin = Math.min(uMin, u);
          uMax = Math.max(uMax, u);
          vMin = Math.min(vMin, v);
          vMax = Math.max(vMax, v);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
              const next = ny * size + nx;
              if (!labels[next] && alpha[next] >= 128) {
                labels[next] = id;
                queue[length++] = next;
              }
            }
        }
        components.push({
          id,
          area: length / scale ** 2,
          bounds: [
            left / scale,
            top / scale,
            (right + 1) / scale,
            (bottom + 1) / scale,
          ],
          projection: [uMin, uMax, vMin, vMax],
        });
      }
      return {
        labels,
        components: components.filter(({ area }) => area > 0.002),
      };
    };
    const at = (alpha, x, y) =>
      alpha[Math.floor(y * scale) * size + Math.floor(x * scale)] / 255;
    const specs = {
      cloud: {
        components: 2,
        region: [4, 3, 14, 11],
        probe: [6.2041, 8.1228],
        // Native final arm lengths, distinct from a standalone/status tick.
        shortArm: 3.9285,
        points: [
          [4.81516, 6.7338],
          [7.59305, 9.51169],
          [13.14881, 3.95592],
        ],
        host: [
          [3, 12.6611],
          [8, 12.6611],
          [12, 12.6611],
          [0.9934, 9.1578],
        ],
      },
      bell: {
        components: 3,
        region: [8.5, 3.5, 15.6, 9],
        probe: [10.2894, 6.951],
        shortArm: 2.6325,
        points: [
          [9.3587, 6.02032],
          [11.22012, 7.88175],
          [14.94297, 4.1589],
        ],
        host: [
          [3, 12.2465],
          [8, 12.2465],
          [13, 12.2465],
          [6.5, 14.5572],
          [9.5, 14.5572],
          [8.0108, 1.2],
        ],
      },
    };
    const pairs = new Map();
    for (const { name, svg } of samples) {
      const family = name.startsWith("cloud-") ? "cloud" : "bell";
      const spec = specs[family];
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const alpha = await render(svg, weight);
        const { labels, components } = regions(alpha);
        if (name === "cloud-success_solid.svg") {
          // Inspect visible gaps in the fitted paint, including the short cap.
          // A fill-only check misses a retained border intruding into the cut.
          const [start, elbow, end] = spec.points;
          const along = (a, b, fraction) =>
            a.map((value, axis) => value + fraction * (b[axis] - value));
          const diagonal = Math.SQRT1_2;
          const short = along(start, elbow, 0.4);
          const long = along(elbow, end, 0.45);
          const probes = [
            { origin: start, direction: [-diagonal, -diagonal], cap: true },
            { origin: short, direction: [-diagonal, diagonal] },
            { origin: short, direction: [diagonal, -diagonal] },
            { origin: long, direction: [diagonal, diagonal] },
            { origin: long, direction: [-diagonal, -diagonal] },
          ];
          const gaps = probes.map(({ origin, direction, cap = false }) => {
            const edge = cap ? 0 : weight / 2;
            let gap = 2;
            for (let distance = 0.1; distance < 2; distance += 1 / 256) {
              const x = origin[0] + direction[0] * (edge + distance);
              const y = origin[1] + direction[1] * (edge + distance);
              if (at(alpha, x, y) >= 0.5) {
                gap = distance;
                break;
              }
            }
            // Flat caps stay at their endpoints as stroke width changes.
            const expected = cap ? 0.683333 : 0.6 + (1.333333 - weight) / 2;
            return { cap, measured: gap, expected };
          });
          record(
            { name, weight, check: "cloud-cutout-visible-clearance", gaps },
            gaps.every(
              ({ measured, expected }) => Math.abs(measured - expected) < 0.035,
            ),
          );
        }
        record(
          {
            name,
            weight,
            check: "compact-action-components",
            measured: components.length,
            target: spec.components,
          },
          components.length === spec.components,
        );
        const retained = spec.host.map(([x, y]) => at(alpha, x, y));
        record(
          {
            name,
            weight,
            check: "retained-host-silhouette",
            coverage: retained,
          },
          retained.every((coverage) => coverage > 0.9),
        );
        const candidates = components.filter(({ bounds }) =>
          bounds.every((value, i) =>
            i < 2 ? value >= spec.region[i] : value <= spec.region[i],
          ),
        );
        record(
          {
            name,
            weight,
            check: "compact-tick-position",
            candidates: candidates.length,
          },
          candidates.length === 1,
        );
        if (candidates.length !== 1) continue;
        const tick = candidates[0];
        // Compare the isolated painted component with the independently drawn
        // reviewed gesture, catching extra hooks, gaps and malformed corners.
        context.clearRect(0, 0, size, size);
        context.save();
        context.scale(scale, scale);
        context.lineWidth = weight;
        context.lineCap = "butt";
        context.lineJoin = "miter";
        context.beginPath();
        spec.points.forEach(([x, y], i) => {
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
        context.restore();
        const expected = context.getImageData(0, 0, size, size).data;
        let differences = 0;
        for (let i = 0; i < labels.length; i++)
          differences += Number(
            (labels[i] === tick.id) !== expected[i * 4 + 3] >= 128,
          );
        const differenceArea = differences / scale ** 2;
        record(
          { name, weight, check: "compact-complete-contour", differenceArea },
          differenceArea < 0.04,
        );
        // In diagonal coordinates, flat caps and the mitered elbow have known
        // half-stroke extents. Measure both arms without reading path syntax.
        const [uMin, uMax, vMin, vMax] = tick.projection;
        const shortArm = uMax - weight / 2 - uMin;
        const longArm = vMax - vMin - weight / 2;
        const ratio = longArm / shortArm;
        record(
          {
            name,
            weight,
            check: "compact-two-to-one-gesture",
            shortArm,
            longArm,
            ratio,
          },
          Math.abs(ratio - 2) < 0.04 &&
            Math.abs(shortArm - spec.shortArm) < 0.05,
        );
        let thickness = 0;
        const step = 1 / 256;
        for (let offset = -1.25 + step / 2; offset < 1.25; offset += step)
          thickness +=
            at(
              alpha,
              spec.probe[0] - offset * Math.SQRT1_2,
              spec.probe[1] + offset * Math.SQRT1_2,
            ) * step;
        record(
          {
            name,
            weight,
            check: "compact-primary-stroke",
            measured: thickness,
            target: weight,
          },
          Math.abs(thickness - weight) < 0.035,
        );
        const key = `${family}:${weight}`;
        const reference = pairs.get(key);
        if (reference) {
          let changed = 0;
          for (let i = 0; i < labels.length; i++)
            changed += Number(
              (labels[i] === tick.id) !==
                (reference.labels[i] === reference.id),
            );
          record(
            {
              name,
              weight,
              check: "paired-compact-tick-geometry",
              comparedWith: reference.name,
              changed,
            },
            changed === 0,
          );
        } else pairs.set(key, { name, labels, id: tick.id });
      }
    }
    return { results, failures };
  }, samples);
}
