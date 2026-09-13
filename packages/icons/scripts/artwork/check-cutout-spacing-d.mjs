// Final painted clearances around complete butt-cap corners. Each sampling
// region contains both the old and corrected terminal, but not unrelated art.
export async function checkCutoutSpacingD(page, records) {
  const names = [
    "tag-clear_solid.svg",
    "wifi-disabled.svg",
    "user-search.svg",
    "user-group.svg",
    "video-disabled.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing cutout artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (artwork) => {
    const scale = 128;
    const side = 16 * scale;
    const q = Math.SQRT1_2;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const add = (a, b, t = 1) => a.map((x, i) => x + b[i] * t);
    const normal = (a) => a.map((x) => x / Math.hypot(...a));
    function alpha(pixels, point) {
      const x = point[0] * scale - 0.5;
      const y = point[1] * scale - 0.5;
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      if (ix < 0 || iy < 0 || ix + 1 >= side || iy + 1 >= side) return 0;
      const a = (dx, dy) => pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
      return (
        a(0, 0) * (1 - fx) * (1 - fy) +
        a(1, 0) * fx * (1 - fy) +
        a(0, 1) * (1 - fx) * fy +
        a(1, 1) * fx * fy
      );
    }
    function gapRay(pixels, origin, direction, length = 2.1) {
      direction = normal(direction);
      const transitions = [];
      let previous = alpha(pixels, origin);
      let last = 0;
      for (let t = 1 / (scale * 2); t <= length; t += 1 / (scale * 2)) {
        const value = alpha(pixels, add(origin, direction, t));
        if (value >= 0.5 !== previous >= 0.5)
          transitions.push({
            kind: previous >= 0.5 ? "exit" : "entry",
            distance:
              last + ((t - last) * (0.5 - previous)) / (value - previous),
          });
        previous = value;
        last = t;
      }
      // Ignore only subpixel threshold chatter immediately on the starting cap.
      // The first entry after that cap is the background, including any overlay.
      const entry = transitions.find(
        (t) => t.kind === "entry" && t.distance > 0.1,
      );
      const exit =
        entry &&
        transitions
          .filter((t) => t.kind === "exit" && t.distance < entry.distance)
          .at(-1);
      return {
        gap: exit && entry ? entry.distance - exit.distance : null,
        origin,
        direction,
        transitions,
      };
    }
    function shoulderDistance(point) {
      const distance = (t) =>
        Math.hypot(
          point[0] - (5.5 + 9 * t - 4.5 * t * t),
          point[1] - (8.703125 + 3 * t * t),
        );
      let a = 0;
      let b = 1;
      for (let i = 0; i < 28; i++) {
        const t1 = a + (b - a) / 3;
        const t2 = b - (b - a) / 3;
        if (distance(t1) < distance(t2)) b = t2;
        else a = t1;
      }
      return distance((a + b) / 2);
    }
    function capGap(pixels, region, metric, weight) {
      const [x0, y0, x1, y1] = region;
      let minimum = Number.POSITIVE_INFINITY;
      let point = null;
      const painted = (x, y) => pixels[(y * side + x) * 4 + 3] >= 128;
      for (let y = Math.ceil(y0 * scale); y < y1 * scale; y++)
        for (let x = Math.ceil(x0 * scale); x < x1 * scale; x++) {
          if (
            !painted(x, y) ||
            (painted(x - 1, y) &&
              painted(x + 1, y) &&
              painted(x, y - 1) &&
              painted(x, y + 1))
          )
            continue;
          const p = [(x + 0.5) / scale, (y + 0.5) / scale];
          const distance = metric(p);
          // Foreground paint is excluded by its known retained centerline. A
          // collapsed background buffer still yields a near-zero gap and fails.
          if (distance < weight / 2 + 0.04) continue;
          const gap = distance - weight / 2;
          if (gap < minimum) {
            minimum = gap;
            point = p;
          }
        }
      return { gap: Number.isFinite(minimum) ? minimum : null, point, region };
    }
    const regions = {
      "wifi-disabled.svg": [
        ["upper-left arc", [0.7, 3.6, 1.95, 4.95]],
        ["upper-right arc", [4.35, 1.1, 5.7, 2.8]],
        ["middle-left arc", [3.15, 6, 4.5, 7.6]],
        ["middle-right arc", [7.4, 4.1, 9, 5.95]],
        ["lower-left arc", [5.7, 8.6, 7.25, 10.2]],
      ],
      "user-search.svg": [
        ["upper shoulder", [6.5, 8.15, 7.7, 9.6]],
        ["lower baseline", [7.25, 13, 8.8, 14.65]],
      ],
      "user-group.svg": [
        ["upper rear shoulder", [10.8, 8.7, 12.2, 10.3]],
        ["lower rear baseline", [11.7, 13.1, 12.65, 14.5]],
      ],
      "video-disabled.svg": [
        ["top frame", [5.35, 2.3, 6.95, 4]],
        ["upper right frame", [9.8, 6.8, 11.55, 8.25]],
        ["lower frame", [8.9, 12, 10.65, 13.65]],
        ["left frame", [0.2, 3.25, 1.8, 4.85]],
        ["camera wedge", [14.1, 10.7, 15.9, 13.2]],
      ],
    };
    const bounds = {
      "wifi-disabled.svg": {
        mean: 1.35,
        slope: 0.69,
        radius: 0.13,
        spreads: [0.19, 0.085, 0.085, 0.14],
      },
      "user-search.svg": {
        mean: 1.25,
        slope: 0.71,
        radius: 0.14,
        spreads: [0.2, 0.1, 0.1, 0.15],
      },
      "user-group.svg": {
        mean: 17 / 12,
        slope: 0.6,
        radius: 0.1,
        spreads: [0.14, 0.065, 0.065, 0.105],
      },
      "video-disabled.svg": {
        mean: 1.158034,
        slope: 0.9,
        radius: 0.1,
        spreads: [0.09, 0.055, 0.055, 0.075],
      },
      "tag-clear_solid.svg": {
        mean: 0.839286,
        slope: 0.25,
        radius: 0.16,
        spreads: [0.28, 0.105, 0.105, 0.19],
      },
    };
    for (const { name, svg } of artwork)
      for (const [widthIndex, weight] of [0.67, 1, 1.333333, 1.5].entries()) {
        const source = svg
          .replace(
            /stroke-width="([\d.]+)"/g,
            (_, value) => `stroke-width="${(Number(value) * weight) / 0.67}"`,
          )
          .replace("<svg ", '<svg style="color:black" ');
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
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
          const pixels = context.getImageData(0, 0, side, side).data;
          let lensEdges;
          if (name === "user-search.svg") {
            // Retain the exported lens and handle themselves, including their
            // complete arc joins; do not replace their paint with an ideal circle.
            const document = new DOMParser().parseFromString(
              source,
              "image/svg+xml",
            );
            [...document.querySelectorAll("path")].forEach((path, index) => {
              if (index !== 2 && index !== 3) path.remove();
            });
            const lensUrl = URL.createObjectURL(
              new Blob([new XMLSerializer().serializeToString(document)], {
                type: "image/svg+xml",
              }),
            );
            try {
              const lensImage = new Image();
              await new Promise((resolve, reject) => {
                lensImage.onload = resolve;
                lensImage.onerror = reject;
                lensImage.src = lensUrl;
              });
              context.clearRect(0, 0, side, side);
              context.drawImage(lensImage, 0, 0, side, side);
              const lensPixels = context.getImageData(0, 0, side, side).data;
              const painted = (x, y) =>
                lensPixels[(y * side + x) * 4 + 3] >= 128;
              lensEdges = [];
              for (let y = 1; y < side - 1; y++)
                for (let x = 1; x < side - 1; x++)
                  if (
                    painted(x, y) &&
                    !(
                      painted(x - 1, y) &&
                      painted(x + 1, y) &&
                      painted(x, y - 1) &&
                      painted(x, y + 1)
                    )
                  )
                    lensEdges.push([(x + 0.5) / scale, (y + 0.5) / scale]);
            } finally {
              URL.revokeObjectURL(lensUrl);
            }
          }
          const samples = [];
          if (name === "tag-clear_solid.svg") {
            const cap = [9.923807, 9.923807];
            const u = [q, q];
            const v = [q, -q];
            for (const sign of [-1, 1])
              samples.push({
                feature: `shaft side ${sign}`,
                ...gapRay(
                  pixels,
                  add(cap, u, 0.7),
                  v.map((x) => x * sign),
                ),
              });
            samples.push({
              feature: "complete flat terminal",
              ...gapRay(
                pixels,
                add(cap, u, 0.15),
                u.map((x) => -x),
              ),
            });
            for (const sign of [-1, 1])
              for (const degrees of [22.5, 45, 67.5]) {
                const angle = (degrees * Math.PI) / 180;
                const corner = add(cap, v, (sign * weight) / 2);
                const direction = add(
                  u.map((x) => -x * Math.cos(angle)),
                  v,
                  sign * Math.sin(angle),
                );
                samples.push({
                  feature: `cap corner ${sign} at ${degrees} degrees`,
                  ...gapRay(pixels, add(corner, direction, -0.05), direction),
                });
              }
          } else
            for (const [feature, region] of regions[name]) {
              const metric =
                name === "wifi-disabled.svg"
                  ? (p) => Math.abs(p[1] - p[0] - 0.111169) * q
                  : name === "video-disabled.svg"
                    ? (p) => Math.abs(p[1] - p[0]) * q
                    : name === "user-search.svg"
                      ? (p) => {
                          let distance = Number.POSITIVE_INFINITY;
                          for (const edge of lensEdges)
                            distance = Math.min(
                              distance,
                              Math.hypot(p[0] - edge[0], p[1] - edge[1]),
                            );
                          return distance + weight / 2;
                        }
                      : feature.startsWith("upper")
                        ? shoulderDistance
                        : (p) => p[0] - 10;
              samples.push({
                feature,
                ...capGap(pixels, region, metric, weight),
              });
            }
          const values = samples.map((sample) => sample.gap);
          const minimum = Math.min(...values);
          const maximum = Math.max(...values);
          const spread = maximum - minimum;
          const spec = bounds[name];
          const expectedMean = spec.mean - spec.slope * (weight - 7 / 6);
          const tolerance = 0.025;
          const pass =
            values.every((value) => value !== null && Number.isFinite(value)) &&
            minimum >= expectedMean - spec.radius - tolerance &&
            maximum <= expectedMean + spec.radius + tolerance &&
            spread <= spec.spreads[widthIndex];
          const result = {
            name,
            weight,
            feature: "complete local cutout spacing",
            coordinateSpace: "final-16-unit-canvas",
            samples,
            measured: { minimum, maximum, spread },
            expected: {
              mean: expectedMean,
              radius: spec.radius + tolerance,
              maximumSpread: spec.spreads[widthIndex],
            },
            pass,
          };
          results.push(result);
          if (!pass) failures.push(result);
          if (name === "user-search.svg") {
            // The retained lower-left corner must be joined, not two butt caps.
            const point = [1 - weight * 0.25, 13.81774 + weight * 0.25];
            const value = alpha(pixels, point);
            const joined = value >= 0.9;
            const seam = {
              name,
              weight,
              feature: "continuous lower-left body join",
              point,
              measured: { alpha: value },
              pass: joined,
            };
            results.push(seam);
            if (!joined) failures.push(seam);
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { results, failures };
  }, artwork);
}
