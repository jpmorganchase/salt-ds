import { optimize } from "svgo";

// Inspect exported geometry in its final canvas. Comparing local differences
// keeps the mathematical gesture stable without forcing its equality bar to
// share the standalone symbol's vertical placement.
export async function checkScalingControls(page, records) {
  const names = [
    "minimize.svg",
    "remove.svg",
    "greater-than.svg",
    "less-than.svg",
    "greater-than-equal-to.svg",
    "less-than-equal-to.svg",
    "first.svg",
    "last.svg",
    "chevron-left.svg",
    "chevron-right.svg",
  ];
  const samples = names.map((name) => {
    const record = records.find((record) => record.name === name);
    if (!record) throw new Error(`Missing control scaling specimen: ${name}`);
    return {
      name,
      svg: optimize(record.svg, {
        plugins: [
          {
            name: "convertPathData",
            params: {
              forceAbsolutePath: true,
              floatPrecision: 12,
              lineShorthands: false,
              collapseRepeated: false,
            },
          },
        ],
      }).data,
    };
  });
  return page.evaluate((samples) => {
    const results = [];
    const failures = [];
    const report = (result, passed) => {
      results.push(result);
      if (!passed) failures.push(result);
    };
    const geometry = new Map();
    for (const { name, svg } of samples) {
      const holder = document.createElement("div");
      holder.style.cssText = "position:absolute;left:-10000px;top:0";
      holder.innerHTML = svg;
      document.body.appendChild(holder);
      try {
        const root = holder.querySelector("svg");
        const parts = [];
        for (const source of [...root.querySelectorAll("path")]) {
          for (const d of source.getAttribute("d").match(/M[^M]*/g) ?? []) {
            const path = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
            path.setAttribute("d", d);
            root.appendChild(path);
            const box = path.getBBox();
            const length = path.getTotalLength();
            const points = [0, 0.5, 1].map((t) => {
              const p = path.getPointAtLength(length * t);
              return [p.x, p.y];
            });
            parts.push({
              bounds: [box.x, box.y, box.width, box.height],
              points,
            });
          }
        }
        geometry.set(name, parts);
      } finally {
        holder.remove();
      }
    }
    const minimize = geometry.get("minimize.svg")[0].bounds;
    const remove = geometry.get("remove.svg")[0].bounds;
    report(
      {
        name: "minimize.svg",
        check: "compact-lowered-window-edge",
        bounds: minimize,
        remove,
      },
      minimize[2] >= 10.8 &&
        minimize[2] <= 11.2 &&
        Math.abs(minimize[1] - 12.5) < 0.03 &&
        minimize[2] < remove[2] - 1 &&
        minimize[1] > remove[1] + 3,
    );
    const gesture = (name) =>
      geometry.get(name).find(({ bounds }) => bounds[2] > 1 && bounds[3] > 1);
    for (const [name, companion] of [
      ["greater-than.svg", "greater-than-equal-to.svg"],
      ["less-than.svg", "less-than-equal-to.svg"],
    ]) {
      const a = gesture(name);
      const b = gesture(companion);
      const deltas = a.points.flatMap((point, i) =>
        point.map(
          (value, j) =>
            value - a.points[1][j] - (b.points[i][j] - b.points[1][j]),
        ),
      );
      const maxDelta = Math.max(...deltas.map(Math.abs));
      report(
        {
          name,
          companion,
          check: "stable-compact-comparison-gesture",
          maxDelta,
          height: a.bounds[3],
        },
        maxDelta < 0.03 && a.bounds[3] > 8 && a.bounds[3] < 9.5,
      );
      const bar = geometry
        .get(companion)
        .find(({ bounds }) => bounds[3] < 0.01);
      const clearance = bar.bounds[1] - (b.bounds[1] + b.bounds[3]);
      report(
        { name: companion, check: "separate-equality-bar", clearance },
        clearance > 2.7 && clearance < 3.6,
      );
    }
    const greater = gesture("greater-than.svg");
    const less = gesture("less-than.svg");
    const mirroredDelta = Math.max(
      ...greater.points.flatMap((p, i) => [
        Math.abs(p[0] + less.points[i][0] - 16),
        Math.abs(p[1] - less.points[i][1]),
      ]),
    );
    report(
      {
        name: "greater-than.svg",
        companion: "less-than.svg",
        check: "mirrored-comparison-pair",
        mirroredDelta,
      },
      mirroredDelta < 0.03,
    );
    for (const [name, companion] of [
      ["first.svg", "chevron-left.svg"],
      ["last.svg", "chevron-right.svg"],
    ]) {
      const a = gesture(name);
      const b = gesture(companion);
      const ratio = a.bounds[2] / (a.bounds[3] / 2);
      const peerRatio = b.bounds[2] / (b.bounds[3] / 2);
      const bar = geometry.get(name).find(({ bounds }) => bounds[2] < 0.01);
      const gap =
        name === "first.svg"
          ? a.bounds[0] - bar.bounds[0]
          : bar.bounds[0] - (a.bounds[0] + a.bounds[2]);
      report(
        {
          name,
          companion,
          check: "navigation-chevron-with-separated-boundary",
          ratio,
          peerRatio,
          gap,
        },
        Math.abs(ratio - peerRatio) < 0.01 &&
          Math.abs(ratio - 1) < 0.01 &&
          gap > 2.5,
      );
    }
    return { results, failures };
  }, samples);
}
