import { checkChartPairs } from "./check-chart-pairs.mjs";

// Review the shipped compact dismissal and simplified chart details as paint.
// Bounds and connected regions are measured independently of recipe strings.
export async function checkPolishFeatures(page, records) {
  const names = ["close.svg", "close_small.svg", "chart-bullet.svg"];
  const samples = names.map((name) => {
    const sample = records.find((record) => record.name === name);
    if (!sample) throw new Error(`Missing polish feature specimen: ${name}`);
    return sample;
  });
  const polish = await page.evaluate(async (samples) => {
    const results = [];
    const failures = [];
    const record = (details, pass) => {
      results.push(details);
      if (!pass) failures.push(details);
    };
    const scale = 64;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const render = async (svg, weight, select = "all") => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.documentElement;
      root.setAttribute("style", "color:black");
      for (const path of doc.querySelectorAll("path")) {
        const filled = path.getAttribute("fill") !== "none";
        if ((select === "fill" && !filled) || (select === "stroke" && filled))
          path.remove();
      }
      for (const element of doc.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
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
            reject(new Error("Could not render polish specimen"));
          image.src = url;
        });
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
      const rgba = context.getImageData(0, 0, size, size).data;
      const alpha = new Uint8Array(size * size);
      for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
      return alpha;
    };
    const bounds = (alpha) => {
      let left = size;
      let top = size;
      let right = -1;
      let bottom = -1;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
          if (alpha[y * size + x] >= 128) {
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
          }
      return [left, top, right + 1, bottom + 1].map((value) => value / scale);
    };
    const components = (alpha) => {
      const active = Uint8Array.from(alpha, (value) => Number(value >= 128));
      const found = [];
      const queue = new Int32Array(active.length);
      for (let start = 0; start < active.length; start++) {
        if (!active[start]) continue;
        active[start] = 0;
        queue[0] = start;
        let head = 0;
        let tail = 1;
        let left = size;
        let top = size;
        let right = 0;
        let bottom = 0;
        while (head < tail) {
          const position = queue[head++];
          const x = position % size;
          const y = Math.floor(position / size);
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          for (const next of [
            position - size,
            position + size,
            ...(x ? [position - 1] : []),
            ...(x < size - 1 ? [position + 1] : []),
          ]) {
            if (next < 0 || next >= active.length || !active[next]) continue;
            active[next] = 0;
            queue[tail++] = next;
          }
        }
        if (tail > 4)
          found.push({
            area: tail / scale ** 2,
            left: left / scale,
            top: top / scale,
            right: (right + 1) / scale,
            bottom: (bottom + 1) / scale,
            width: (right + 1 - left) / scale,
            height: (bottom + 1 - top) / scale,
            center: [
              (left + right + 1) / (2 * scale),
              (top + bottom + 1) / (2 * scale),
            ],
          });
      }
      return found;
    };
    const byName = (name) => samples.find((sample) => sample.name === name).svg;
    const normal = byName("close.svg");
    const compact = byName("close_small.svg");
    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      const normalPaint = await render(normal, weight);
      const compactPaint = await render(compact, weight);
      const normalBounds = bounds(normalPaint);
      const compactBounds = bounds(compactPaint);
      const ratio =
        (compactBounds[2] - compactBounds[0]) /
        (normalBounds[2] - normalBounds[0]);
      const center = [
        (compactBounds[0] + compactBounds[2]) / 2,
        (compactBounds[1] + compactBounds[3]) / 2,
      ];
      record(
        {
          name: "close_small.svg",
          check: "compact-dismissal-size-and-center",
          weight,
          ratio,
          center,
          bounds: compactBounds,
        },
        ratio >= 0.77 &&
          ratio <= 0.82 &&
          center.every((value) => Math.abs(value - 8) < 0.02),
      );
      const widths = [normalPaint, compactPaint].map((alpha) => {
        let coverage = 0;
        const step = 1 / 256;
        // Sample an upper diagonal away from the central crossing and caps.
        for (let offset = -1.5; offset < 1.5; offset += step) {
          const x = 6 - offset * Math.SQRT1_2;
          const y = 6 + offset * Math.SQRT1_2;
          coverage +=
            (alpha[Math.floor(y * scale) * size + Math.floor(x * scale)] /
              255) *
            step;
        }
        return coverage;
      });
      record(
        {
          name: "close_small.svg",
          check: "compact-dismissal-retained-primary-weight",
          weight,
          widths,
        },
        widths.every((width) => Math.abs(width - weight) < 0.035) &&
          Math.abs(widths[0] - widths[1]) < 0.025,
      );
    }
    const bullet = byName("chart-bullet.svg");
    const bars = components(await render(bullet, 0.67, "fill")).sort(
      (a, b) => a.top - b.top,
    );
    const rowGaps = bars
      .slice(1)
      .map((bar, index) => bar.top - bars[index].bottom);
    record(
      {
        name: "chart-bullet.svg",
        check: "readable-bullet-row-rhythm",
        bars,
        rowGaps,
      },
      bars.length === 3 &&
        bars.every((bar) => bar.height >= 1.45 && bar.height <= 1.8) &&
        rowGaps.every((gap) => gap >= 3),
    );
    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      const strokes = components(await render(bullet, weight, "stroke"));
      const axis = strokes.find((part) => part.height > 10);
      const targets = strokes
        .filter((part) => part !== axis)
        .sort((a, b) => a.top - b.top);
      const gaps = bars.map((bar, index) => ({
        target: targets[index] ? targets[index].left - bar.right : -1,
        axis: axis ? bar.left - axis.right : -1,
        alignment: targets[index]
          ? Math.abs(targets[index].center[1] - bar.center[1])
          : Number.POSITIVE_INFINITY,
      }));
      record(
        {
          name: "chart-bullet.svg",
          check: "separated-bullet-targets",
          weight,
          gaps,
          targets,
        },
        Boolean(axis) &&
          targets.length === 3 &&
          gaps.every(
            (gap) =>
              gap.target >= 1.7 && gap.axis >= 1.2 && gap.alignment < 0.04,
          ) &&
          targets.every(
            (target) =>
              Math.abs(target.width - weight) < 0.035 && target.height > 2.8,
          ),
      );
      const combined = components(await render(bullet, weight));
      record(
        {
          name: "chart-bullet.svg",
          check: "bullet-features-do-not-merge",
          weight,
          components: combined.length,
        },
        combined.length === 7,
      );
    }
    return { results, failures };
  }, samples);
  const charts = await checkChartPairs(page, records);
  return {
    results: [...polish.results, ...charts.results],
    failures: [...polish.failures, ...charts.failures],
  };
}
