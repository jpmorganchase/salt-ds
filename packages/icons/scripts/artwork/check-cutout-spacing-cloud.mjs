// Check spacing in complete, fitted exports. The stable foreground landmarks
// place the probes; no SVG transform is reversed and no paint is removed.
export async function checkCutoutSpacingCloud(page, records) {
  const names = [
    "cloud-sync.svg",
    "cloud-sync_solid.svg",
    "cloud-download_solid.svg",
    "cloud-upload_solid.svg",
    "cloud-disabled.svg",
    "cloud-disabled_solid.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record)
      throw new Error(`Missing final cloud spacing artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (artwork) => {
    const ppu = 128;
    const side = 16 * ppu;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const q = Math.SQRT1_2;
    const neutral = 7 / 6;
    const frames = {
      "cloud-disabled_solid.svg": [1.061611, -0.492891, -0.492891],
      "cloud-sync_solid.svg": [1.023191, -0.185529, 0.538091],
      "cloud-download_solid.svg": [1.061611, -0.492891, -0.921283],
      "cloud-upload_solid.svg": [1.061611, -0.492891, -1.030213],
    };
    function alphaAt(pixels, [x, y]) {
      const px = x * ppu - 0.5;
      const py = y * ppu - 0.5;
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
    function ray(pixels, feature, origin, direction, length = 4) {
      const mag = Math.hypot(...direction);
      const d = direction.map((v) => v / mag);
      const point = (t) => origin.map((v, i) => v + d[i] * t);
      const transitions = [];
      const steps = Math.ceil(length * ppu * 2);
      const startsPainted = alphaAt(pixels, origin) >= 0.5;
      let last = alphaAt(pixels, origin);
      let lastT = 0;
      for (let i = 1; i <= steps; i++) {
        const t = (length * i) / steps;
        const a = alphaAt(pixels, point(t));
        if (a >= 0.5 !== last >= 0.5) {
          const distance = lastT + ((t - lastT) * (0.5 - last)) / (a - last);
          transitions.push({
            kind: last >= 0.5 ? "exit" : "entry",
            distance,
            point: point(distance),
          });
        }
        last = a;
        lastT = t;
      }
      const exit = transitions.findIndex((t) => t.kind === "exit");
      const end = exit >= 0 ? transitions[exit + 1] : null;
      return {
        feature,
        origin,
        direction: d,
        startsPainted,
        transitions,
        gap:
          startsPainted && exit === 0 && end?.kind === "entry"
            ? end.distance - transitions[exit].distance
            : null,
      };
    }
    function shortestPair(pixels, feature, first, second) {
      // Boundary samples on two disjoint regions catch the closest cap corner,
      // even where a horizontal or centerline ray would miss a diagonal gap.
      function boundary([x0, y0, x1, y1]) {
        const points = [];
        for (let y = Math.ceil(y0 * ppu); y <= Math.floor(y1 * ppu); y++)
          for (let x = Math.ceil(x0 * ppu); x <= Math.floor(x1 * ppu); x++) {
            const index = (y * side + x) * 4 + 3;
            if (pixels[index] < 128) continue;
            if (
              pixels[index - 4] < 128 ||
              pixels[index + 4] < 128 ||
              pixels[index - side * 4] < 128 ||
              pixels[index + side * 4] < 128
            )
              points.push([(x + 0.5) / ppu, (y + 0.5) / ppu]);
          }
        return points;
      }
      let distance = Number.POSITIVE_INFINITY;
      let endpoints = null;
      const a = boundary(first);
      const b = boundary(second);
      for (const p of a)
        for (const r of b) {
          const v = Math.hypot(p[0] - r[0], p[1] - r[1]);
          if (v < distance) {
            distance = v;
            endpoints = [p, r];
          }
        }
      if (!endpoints) return { feature, gap: null, regions: [first, second] };
      // Recheck that the full image actually has a transparent interval between
      // these two components, with foreground paint at both ends.
      const d = endpoints[1].map((v, i) => (v - endpoints[0][i]) / distance);
      const origin = endpoints[0].map((v, i) => v - d[i] * 0.03);
      const measured = ray(pixels, feature, origin, d, distance + 0.08);
      return {
        ...measured,
        regions: [first, second],
        sampledDistance: distance,
      };
    }
    function solidProbes(pixels, name, weight) {
      const markRatio = name === "cloud-disabled_solid.svg" ? 1 : 0.8;
      const [s, tx, ty] = frames[name];
      const point = ([x, y]) => [x * s + tx, y * s + ty];
      const probes = [];
      const addSide = (label, p, d) =>
        probes.push({ ...ray(pixels, label, point(p), d), type: "side" });
      const cap = (label, p, v, normals) => {
        const c = point(p);
        probes.push({
          ...ray(
            pixels,
            `${label} terminal center`,
            c.map((x, i) => x - v[i] * 0.04),
            v,
          ),
          type: "terminal",
        });
        // Upload's inner corners merge into the shaft pocket after 45deg.
        // That open union has no opposing cloud boundary to measure.
        for (const n of normals)
          for (const degrees of name === "cloud-upload_solid.svg" && n[1] > 0
            ? [22.5, 45]
            : [22.5, 45, 67.5]) {
            const r = (degrees * Math.PI) / 180;
            const d = v.map((x, i) => x * Math.cos(r) + n[i] * Math.sin(r));
            const corner = c.map((x, i) => x + (n[i] * weight * markRatio) / 2);
            const origin = corner.map((x, i) => x - 0.04 * (v[i] + n[i]));
            probes.push({
              ...ray(
                pixels,
                `${label} corner ${n.join(",")} at ${degrees}deg`,
                origin,
                d,
              ),
              type: "corner",
            });
          }
      };
      if (name === "cloud-disabled_solid.svg") {
        for (const position of [6.5, 8.5]) {
          addSide(
            `slash lower side at ${position}`,
            [position, position],
            [-q, q],
          );
          addSide(
            `slash upper side at ${position}`,
            [position, position],
            [q, -q],
          );
        }
      } else if (name === "cloud-sync_solid.svg") {
        addSide("shaft upper side", [9.2, 8.6], [0, -1]);
        // The lower shaft pocket now opens outside; there is no opposing cloud boundary.
        addSide("upper diagonal side", [6.3, 7.8], [-q, -q]);
        addSide("lower diagonal side", [5.6, 8.7], [-q, q]);
        cap(
          "shaft right cap",
          [10.5, 8.6],
          [1, 0],
          [
            [0, -1],
            [0, 1],
          ],
        );
        cap("upper head cap", [7, 7.1], [q, -q], [[-q, -q]]);
        probes.push({
          ...ray(pixels, "left miter apex", point([5.5, 8.6]), [-1, 0]),
          type: "miter",
        });
      } else if (name === "cloud-download_solid.svg") {
        addSide("shaft left side", [8, 8.7], [-1, 0]);
        addSide("shaft right side", [8, 8.7], [1, 0]);
        cap(
          "shaft top cap",
          [8, 7],
          [0, -1],
          [
            [-1, 0],
            [1, 0],
          ],
        );
      } else {
        addSide("shaft left side", [8, 11.7], [-1, 0]);
        addSide("shaft right side", [8, 11.7], [1, 0]);
        addSide("head left diagonal side", [6.875, 8.375], [-q, -q]);
        addSide("head right diagonal side", [9.125, 8.375], [q, -q]);
        cap(
          "left head cap",
          [5.75, 9.5],
          [-q, q],
          [
            [-q, -q],
            [q, q],
          ],
        );
        cap(
          "right head cap",
          [10.25, 9.5],
          [q, q],
          [
            [q, -q],
            [-q, q],
          ],
        );
        probes.push({
          ...ray(pixels, "upper miter apex", point([8, 7.25]), [0, -1]),
          type: "miter",
        });
      }
      return probes;
    }
    for (const { name, svg } of artwork) {
      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = document.documentElement;
      root.setAttribute("width", String(side));
      root.setAttribute("height", String(side));
      root.setAttribute("style", "color:black");
      const widths = [root, ...root.querySelectorAll("[stroke-width]")]
        .filter((e) => e.hasAttribute("stroke-width"))
        .map((e) => [e, Number(e.getAttribute("stroke-width"))]);
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        for (const [element, w] of widths)
          element.setAttribute("stroke-width", String((w * weight) / 0.67));
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(document)], {
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
          ctx.clearRect(0, 0, side, side);
          ctx.drawImage(image, 0, 0, side, side);
          const pixels = ctx.getImageData(0, 0, side, side).data;
          let measurements = [];
          let bound;
          let kind;
          const theme = weight === 1 || weight === 1.333333;
          if (frames[name]) {
            measurements = solidProbes(pixels, name, weight);
            kind = "solid side / terminal / cap-corner spacing";
            // A fixed pocket centered between the two defaults sees +/-1/12
            // side movement. A preserved 90deg foreground miter moves sqrt(2)
            // times farther; its independently tested allowance is separate.
            bound = Math.abs(weight - neutral) / 2 + 0.011;
          } else if (name === "cloud-disabled.svg") {
            kind = "all four complete cloud/slash exits";
            bound = theme ? 0.06 : 0.18;
            for (const [label, lo, hi, d] of [
              ["left lower lobe", 3.5, 4.8, [-q, q]],
              ["upper crown", 4.6, 6, [q, -q]],
              ["right lower lobe", 11.7, 13.1, [q, -q]],
              ["bottom edge", 10, 11.3, [-q, q]],
            ]) {
              const rays = [];
              for (let x = lo; x <= hi; x += 1 / ppu) {
                const r = ray(pixels, label, [x, x], d, 4);
                if (r.gap !== null) rays.push(r);
              }
              rays.sort((a, b) => a.gap - b.gap);
              measurements.push(rays[0] ?? { feature: label, gap: null });
            }
          } else {
            kind = "opposing cloud/arrow cap clearance";
            // Left: the preserved arrow miter approaches a curved cloud cap.
            // Right: two parallel butt caps. Their different W derivatives
            // impose ~.163 spread at a theme endpoint after midpoint balance.
            bound = theme ? 0.175 : 0.5;
            measurements = [
              shortestPair(
                pixels,
                "left curved cap to arrow miter",
                [3.4, 10.5, 4.5, 11.5],
                [4.65, 8.8, 5.65, 9.7],
              ),
              shortestPair(
                pixels,
                "right flat cap to shaft end",
                [10.2, 8.7, 10.7, 10.0],
                [11.4, 10.0, 12.3, 11.6],
              ),
            ];
          }
          const finite = measurements.filter((m) => m.gap !== null);
          const regular = finite.filter((m) => m.type !== "miter");
          const gaps = regular.map((m) => m.gap);
          const spread = gaps.length
            ? Math.max(...gaps) - Math.min(...gaps)
            : null;
          const terminal = regular.filter((m) => m.type === "terminal");
          const terminalMean = terminal.length
            ? terminal.reduce((v, m) => v + m.gap, 0) / terminal.length
            : null;
          const miter = finite.filter((m) => m.type === "miter");
          const miterBound = Math.abs(weight - neutral) / Math.SQRT2 + 0.012;
          const miterResidual =
            miter.length && terminalMean !== null
              ? Math.max(...miter.map((m) => Math.abs(m.gap - terminalMean)))
              : 0;
          const minGap = finite.length
            ? Math.min(...finite.map((m) => m.gap))
            : null;
          // Fixed openings use an independently chosen local gap. Equal
          // spacing alone must not approve an arbitrarily enlarged cutout.
          // For arrow actions, measure flat terminal centers: butt caps do not
          // extend along the shaft when stroke weight changes. Side gaps vary
          // with weight and are checked separately by the spread bounds above.
          const expectedClearance =
            name === "cloud-disabled_solid.svg"
              ? 1.3 + (neutral - weight) / 2
              : frames[name]
                ? 0.75
                : null;
          const measuredClearance =
            name === "cloud-disabled_solid.svg"
              ? gaps.reduce((total, gap) => total + gap, 0) / gaps.length
              : terminalMean;
          const clearancePass =
            expectedClearance === null ||
            (measuredClearance !== null &&
              Math.abs(measuredClearance - expectedClearance) <= 0.025);
          const pass =
            clearancePass &&
            finite.length === measurements.length &&
            spread !== null &&
            spread <= bound &&
            minGap >= 0.45 &&
            miterResidual <= miterBound;
          const result = {
            name,
            weight,
            kind,
            coordinateSpace: "final-16-unit-canvas",
            pixelsPerUnit: ppu,
            measurements,
            spread,
            maximumSpread: bound,
            minGap,
            minimumGap: 0.45,
            expectedClearance,
            measuredClearance,
            miterResidual,
            maximumMiterResidual: miterBound,
            pass,
          };
          results.push(result);
          if (!pass) failures.push(result);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, artwork);
}
