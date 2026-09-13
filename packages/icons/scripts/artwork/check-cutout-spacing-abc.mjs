// Measure the complete final paint, not source path identity or centreline gaps.
// W=7/6 balances fixed cap positions between the W=1 and W=4/3 themes.
export async function checkCutoutSpacingAbc(page, records) {
  const cases = [
    {
      name: "dataset-manager.svg",
      frame: [1.037037, -0.296296, -0.555556],
      calibrationGap: 1.38,
      slopeSpread: 0.28,
      circle: [15.75, 11.625, 3.375],
      curves: [
        [
          [9.75, 22.5],
          [9.75, 20.25],
        ],
        [
          [9.75, 20.25],
          [9.75, 18],
          [15.75, 18],
        ],
        [
          [15.75, 18],
          [21.75, 18],
          [21.75, 20.25],
        ],
        [
          [21.75, 20.25],
          [21.75, 22.5],
        ],
      ],
      features: [
        ["crown cap", 18.55, 5.97, 1],
        ["upper ellipse cap", 10.2, 8.248, 1],
        ["middle tier cap", 9.87, 14.25, 1],
        ["bottom wall cap", 6.83, 20.21, 1],
      ],
    },
    {
      name: "feedback.svg",
      frame: [1.12, -1.24, -0.96],
      calibrationGap: 1.31,
      slopeSpread: 0.13,
      circle: [15.75, 11.25, 2.4],
      curves: [
        [
          [10.5, 21],
          [10.5, 19.25],
        ],
        [
          [10.5, 19.25],
          [10.5, 17.65],
          [12.5, 16.75],
          [15.75, 16.75],
        ],
        [
          [15.75, 16.75],
          [19, 16.75],
          [21, 17.65],
          [21, 19.25],
        ],
        [
          [21, 19.25],
          [21, 21],
        ],
      ],
      features: [
        ["left horizontal panel cap", 8.985, 15.75, 1],
        ["right vertical panel cap", 21.75, 15.217, 1],
      ],
    },
    {
      name: "hidden.svg",
      frame: [1.076372, -0.734785, -0.610979],
      calibrationGap: 0.852,
      slopeSpread: 0.35,
      features: [
        ["upper-left eye cap", 4.786, 8.447, 1.12],
        ["upper eye cap", 8.767, 5.006, 1.12],
        ["lower-right eye cap", 19.214, 15.553, 1.12],
        ["lower eye cap", 15.233, 18.994, 1.12],
        ["upper pupil cut side", 13.414214, 10.585786, 0.44],
        ["lower pupil cut side", 10.585786, 13.414214, 0.44],
      ],
    },
    ...[false, true].map((solid) => ({
      name: `headphones-disabled${solid ? "_solid" : ""}.svg`,
      frame: [1.137845, -1.102757, -0.706767],
      calibrationGap: 1.4,
      slopeSpread: solid ? 0.43 : 0.25,
      features: [
        ["left curved headband cap", 4.03, 8.358, 1],
        ["upper curved headband cap", 7.658, 3.487, 1],
        ...(solid
          ? [
              ["cup diagonal near upper exit", 17.8, 13.015, 0.95],
              ["cup diagonal centre", 18.6, 13.815, 0.95],
              ["cup diagonal near lower exit", 19.75, 14.965, 0.95],
            ]
          : [
              ["cup horizontal cap", 17.193, 12.75, 0.88],
              ["cup vertical cap", 20.25, 15.807, 0.88],
            ]),
      ],
    })),
    {
      name: "microphone-disabled.svg",
      frame: [1.076923, -0.615385, -0.615385],
      calibrationGap: 1.22,
      slopeSpread: 0.3,
      features: [
        ["upper-left capsule cap", 8.494, 4.334, 0.85],
        ["right capsule cap", 15.75, 11.446, 0.85],
        ["lower capsule left cap", 8.28, 12.628, 0.85],
        ["lower capsule right cap", 11.372, 15.72, 0.85],
        ["lower support cap", 14.232, 18.372, 0.9],
        ["right support cap", 18.372, 14.232, 0.9],
      ],
    },
    {
      name: "microphone-disabled_solid.svg",
      frame: [1.076923, -0.615385, -0.615385],
      // The filled interior and retained exterior use the outline's corridor.
      calibrationGap: 1.22,
      slopeSpread: 0.4,
      features: [
        ["upper-left capsule cap", 8.494, 4.334, 0.85],
        ["right capsule cap", 15.75, 11.446, 0.85],
        ["lower capsule left cap", 8.28, 12.628, 0.85],
        ["lower capsule right cap", 11.372, 15.72, 0.85],
        ["upper capsule cut side", 12.055221, 8.503019, 0.55],
        ["lower capsule cut side", 10.222595, 13.774797, 0.55],
        ["lower support cap", 14.232, 18.372, 0.9],
        ["right support cap", 18.372, 14.232, 0.9],
      ],
    },
    {
      name: "music-disabled.svg",
      frame: [1.034884, -0.020349, -0.303416],
      calibrationGap: 1.2,
      slopeSpread: 0.42,
      // The unchanged isolated left note is not an offset boundary. Its
      // attached stem endpoint lies inside that normal note construction.
      features: [
        ["vertical beam cap", 9.75, 6.878, 0.9],
        ["lower beam cap", 11.881, 9.141, 0.9],
        ["right-note lower cap", 19.388, 16.898, 1],
        ["right-note upper cap", 15.736, 13.078, 1],
      ],
    },
  ];
  const artwork = cases.map((test) => {
    const record = records.find((r) => r.name === test.name);
    if (!record)
      throw new Error(`Missing cutout spacing artwork: ${test.name}`);
    return { ...test, svg: record.svg };
  });
  return page.evaluate(async (artwork) => {
    const pixelsPerUnit = 160;
    const side = 16 * pixelsPerUnit;
    const calibrationWidth = 7 / 6;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    // Foreground landmarks are independent of the gap tests. Only Hidden's
    // continuous bevel tip changes its automatic fit, by 0.006901 final units
    // at most on either axis; no other slash may move with a clearance edit.
    const slashLandmarks = {
      "hidden.svg": [
        [1.411058, 1.538461],
        [14.334134, 14.461537],
      ],
      "headphones-disabled.svg": [
        [1.172933, 1.568923],
        [14.827073, 15.223063],
      ],
      "headphones-disabled_solid.svg": [
        [1.172933, 1.568923],
        [14.827073, 15.223063],
      ],
      "microphone-disabled.svg": [
        [1.538461, 1.538461],
        [14.461537, 14.461537],
      ],
      "microphone-disabled_solid.svg": [
        [1.538461, 1.538461],
        [14.461537, 14.461537],
      ],
      "music-disabled.svg": [
        [1.531977, 2.283794],
        [14.468027, 15.219844],
      ],
    };
    const pointOnCurve = (curve, t) => {
      let layer = curve;
      while (layer.length > 1)
        layer = layer
          .slice(0, -1)
          .map((a, i) => a.map((v, k) => v + (layer[i + 1][k] - v) * t));
      return layer[0];
    };
    const segmentDistance = (point, a, b) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = dx * dx + dy * dy;
      const t = Math.max(
        0,
        Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / l),
      );
      return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
    };
    for (const test of artwork) {
      const xml = new DOMParser().parseFromString(test.svg, "image/svg+xml");
      const source = xml.documentElement;
      source.setAttribute("width", String(side));
      source.setAttribute("height", String(side));
      source.setAttribute("style", "color:black");
      const widths = [source, ...source.querySelectorAll("[stroke-width]")]
        .filter((e) => e.hasAttribute("stroke-width"))
        .map((e) => [e, Number(e.getAttribute("stroke-width"))]);
      const s = (test.frame[0] * 2) / 3;
      const map = ([x, y]) => [x * s + test.frame[1], y * s + test.frame[2]];
      let foregroundDistance;
      let foregroundMaxAxisDrift = 0;
      const foregroundDriftTolerance =
        test.name === "hidden.svg" ? 0.0071 : 0.0001;
      if (test.circle) {
        const center = map(test.circle);
        const radius = test.circle[2] * s;
        const segments = [];
        for (const curve of test.curves) {
          let previous = map(curve[0]);
          for (let i = 1; i <= 80; i++) {
            const p = map(pointOnCurve(curve, i / 80));
            segments.push([previous, p]);
            previous = p;
          }
        }
        foregroundDistance = (p) => {
          let distance = Math.abs(
            Math.hypot(p[0] - center[0], p[1] - center[1]) - radius,
          );
          for (const [a, b] of segments)
            distance = Math.min(distance, segmentDistance(p, a, b));
          return distance;
        };
      } else {
        // Read the unchanged foreground slash from the actual export under
        // test. No layer is removed from the canvas raster below.
        const host = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        const slash = [...source.querySelectorAll("path")].at(-1).cloneNode();
        host.appendChild(slash);
        document.body.appendChild(host);
        const length = slash.getTotalLength();
        const a = slash.getPointAtLength(0);
        const b = slash.getPointAtLength(length);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const expectedSlash = slashLandmarks[test.name];
        foregroundMaxAxisDrift = Math.max(
          ...[
            [a.x, a.y],
            [b.x, b.y],
          ].flatMap((point, i) =>
            point.map((value, axis) =>
              Math.abs(value - expectedSlash[i][axis]),
            ),
          ),
        );
        const origin = [a.x, a.y];
        const normal = [-dy / length, dx / length];
        host.remove();
        foregroundDistance = (p) =>
          Math.abs(
            (p[0] - origin[0]) * normal[0] + (p[1] - origin[1]) * normal[1],
          );
      }
      // Pixel centres cover each entire cap, including both corners and the
      // adjacent curve/side. A tiny exclusion removes only the known
      // foreground stroke; rear paint entering the gap still lowers the
      // measured value and fails. Raster sampling error is under0.01 units.
      const windows = test.features.map(([feature, x, y, radius]) => {
        const center = map([x, y]);
        const samples = [];
        for (
          let py = Math.max(
            0,
            Math.floor((center[1] - radius) * pixelsPerUnit),
          );
          py < Math.min(side, Math.ceil((center[1] + radius) * pixelsPerUnit));
          py++
        )
          for (
            let px = Math.max(
              0,
              Math.floor((center[0] - radius) * pixelsPerUnit),
            );
            px <
            Math.min(side, Math.ceil((center[0] + radius) * pixelsPerUnit));
            px++
          ) {
            const point = [
              (px + 0.5) / pixelsPerUnit,
              (py + 0.5) / pixelsPerUnit,
            ];
            if (Math.hypot(point[0] - center[0], point[1] - center[1]) > radius)
              continue;
            samples.push({
              index: (py * side + px) * 4 + 3,
              distance: foregroundDistance(point),
              point,
            });
          }
        return { feature, center, radius, samples };
      });
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        for (const [element, w] of widths)
          element.setAttribute("stroke-width", String((w * weight) / 0.67));
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(xml)], {
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
          const pixels = context.getImageData(0, 0, side, side).data;
          const gaps = windows.map((window) => {
            let gap = Number.POSITIVE_INFINITY;
            let nearestPaint = null;
            for (const sample of window.samples) {
              if (
                sample.distance <= weight / 2 + 0.02 ||
                pixels[sample.index] < 128
              )
                continue;
              const candidate = sample.distance - weight / 2;
              if (candidate < gap) {
                gap = candidate;
                nearestPaint = sample.point;
              }
            }
            return {
              feature: window.feature,
              gap,
              nearestPaint,
              window: { center: window.center, radius: window.radius },
            };
          });
          const finite = gaps.every((g) => Number.isFinite(g.gap));
          const minimum = Math.min(...gaps.map((g) => g.gap));
          const maximum = Math.max(...gaps.map((g) => g.gap));
          const spread = maximum - minimum;
          // Fixed cap planes cannot exactly compensate all configurable
          // stroke angles. The orientation envelope gives a minimax spread
          // of slopeSpread*|W-7/6|. Add0.018 final units for raster/SVGO error,
          // equivalent to at most0.014px at native12px.
          const tolerance =
            0.018 + test.slopeSpread * Math.abs(weight - calibrationWidth);
          const mean = gaps.reduce((n, g) => n + g.gap, 0) / gaps.length;
          const expectedMean =
            test.calibrationGap + 0.75 * (calibrationWidth - weight);
          const meanTolerance =
            0.15 + 0.15 * Math.abs(weight - calibrationWidth);
          const measured = {
            gaps,
            minimum,
            maximum,
            spread,
            mean,
            expectedMean,
            meanTolerance,
            foregroundMaxAxisDrift,
            foregroundDriftTolerance,
            pass:
              foregroundMaxAxisDrift <= foregroundDriftTolerance &&
              finite &&
              minimum > 0.4 &&
              spread <= tolerance &&
              Math.abs(mean - expectedMean) <= meanTolerance,
          };
          const result = {
            name: test.name,
            weight,
            feature: "complete painted cut-end spacing",
            coordinateSpace: "final-16-unit-canvas",
            pixelsPerUnit,
            calibrationWidth,
            tolerance,
            measured,
          };
          results.push(result);
          if (!measured.pass) failures.push(result);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, artwork);
}
