// Compare complete final paint, filling only enclosed outline counters. This
// catches a shrinking pie rim or enlarged solid data points without depending
// on recipe paths, component counts in source, or shared fitting metadata.
export async function checkChartPairs(page, records) {
  const names = [
    "chart-bubble",
    "chart-candlestick",
    "chart-line",
    "chart-pie",
    "chart-scatter",
  ];
  const selected = names.flatMap((name) =>
    ["", "_solid"].map((variant) => {
      const filename = `${name}${variant}.svg`;
      const record = records.find((entry) => entry.name === filename);
      if (!record) throw new Error(`Missing chart pair: ${filename}`);
      return record;
    }),
  );
  return page.evaluate(
    async ({ selected, names }) => {
      const scale = 64,
        side = 16 * scale;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const results = [],
        failures = [];
      const record = (details, pass) => {
        results.push(details);
        if (!pass) failures.push(details);
      };
      const render = async (svg, weight) => {
        const source = svg
          .replace("<svg ", '<svg style="color:black" ')
          .replace(
            /stroke-width="([\d.]+)"/g,
            (_, width) => `stroke-width="${(Number(width) * weight) / 0.67}"`,
          );
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
          const data = context.getImageData(0, 0, side, side).data;
          return Uint8Array.from({ length: side * side }, (_, i) =>
            Number(data[4 * i + 3] >= 128),
          );
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      const regions = (paint, value) => {
        const seen = new Uint8Array(paint.length),
          queue = new Uint32Array(paint.length),
          found = [];
        for (let start = 0; start < paint.length; start++) {
          if (seen[start] || paint[start] !== value) continue;
          let head = 0,
            tail = 1,
            left = side,
            right = 0,
            top = side,
            bottom = 0;
          seen[start] = 1;
          queue[0] = start;
          while (head < tail) {
            const i = queue[head++],
              x = i % side,
              y = Math.floor(i / side);
            left = Math.min(left, x);
            right = Math.max(right, x + 1);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y + 1);
            for (const next of [
              i - side,
              i + side,
              ...(x > 0 ? [i - 1] : []),
              ...(x < side - 1 ? [i + 1] : []),
            ]) {
              if (
                next < 0 ||
                next >= paint.length ||
                seen[next] ||
                paint[next] !== value
              )
                continue;
              seen[next] = 1;
              queue[tail++] = next;
            }
          }
          found.push({
            indices: queue.slice(0, tail),
            left: left / scale,
            right: right / scale,
            top: top / scale,
            bottom: bottom / scale,
            width: (right - left) / scale,
            height: (bottom - top) / scale,
            area: tail / scale ** 2,
            edge: left === 0 || top === 0 || right === side || bottom === side,
          });
        }
        return found;
      };
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        for (const name of names) {
          const outline = await render(
            selected.find((r) => r.name === `${name}.svg`).svg,
            weight,
          );
          const solid = await render(
            selected.find((r) => r.name === `${name}_solid.svg`).svg,
            weight,
          );
          const holes = regions(outline, 0).filter((region) => !region.edge);
          const expected = outline.slice();
          for (const hole of holes)
            for (const i of hole.indices) expected[i] = 1;
          let mismatch = 0,
            painted = 0;
          for (let i = 0; i < expected.length; i++) {
            if (expected[i] || solid[i]) painted++;
            if (expected[i] !== solid[i]) mismatch++;
          }
          record(
            {
              name,
              weight,
              check: "solid-fills-outline-without-moving-painted-boundaries",
              mismatch,
              painted,
              ratio: mismatch / painted,
            },
            mismatch / painted <= 0.002,
          );
          if (name !== "chart-line") continue;
          const roundHoles = holes.map(
            ({ left, right, top, bottom, width, height, area }) => ({
              left,
              right,
              top,
              bottom,
              width,
              height,
              area,
            }),
          );
          record(
            {
              name,
              weight,
              check: "four-open-circular-data-points",
              holes: roundHoles,
            },
            holes.length === 4 &&
              holes.every(
                (hole) =>
                  Math.abs(hole.width - hole.height) < 0.04 &&
                  hole.width >= 0.8 &&
                  hole.area / (hole.width * hole.height) > 0.75,
              ),
          );
          const solidHoles = regions(solid, 0).filter((region) => !region.edge);
          record(
            {
              name: `${name}_solid.svg`,
              weight,
              check: "filled-data-points-have-no-counters",
              holes: solidHoles.length,
            },
            solidHoles.length === 0,
          );
          for (const [variant, paint] of [
            ["", outline],
            ["_solid", solid],
          ]) {
            const parts = regions(paint, 1)
              .filter((region) => region.area > 0.01)
              .sort((a, b) => a.left - b.left);
            const [axis, trend] = parts;
            const gaps = trend
              ? [
                  trend.left - axis.left - weight,
                  axis.bottom - weight - trend.bottom,
                ]
              : [];
            record(
              {
                name: `${name}${variant}.svg`,
                weight,
                check: "continuous-trend-clear-of-axes",
                parts: parts.length,
                gaps,
              },
              parts.length === 2 && gaps.every((gap) => gap >= 0.35),
            );
          }
        }
      }
      return { results, failures };
    },
    { selected, names },
  );
}
