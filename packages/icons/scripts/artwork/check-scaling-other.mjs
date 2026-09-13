// Pair landmarks are measured on the final exports, without reversing their
// fits. Complete painted probes complement the retained-path anchor checks.
export async function checkScalingOther(page, records) {
  const bases = ["signpost", "school", "receipt"];
  const artwork = bases.flatMap((base) =>
    ["", "_solid"].map((suffix) => {
      const name = `${base}${suffix}.svg`;
      const record = records.find((candidate) => candidate.name === name);
      if (!record) throw new Error(`Missing pair artwork: ${name}`);
      return { name, svg: record.svg };
    }),
  );
  return page.evaluate(async (artwork) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const add = (result) => {
      results.push(result);
      if (!result.pass) failures.push(result);
    };
    const names = ["signpost", "school", "receipt"];
    const sources = new Map(artwork.map(({ name, svg }) => [name, svg]));
    function retainedLine(svg) {
      const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
      const lines = [...parsed.querySelectorAll("path")].flatMap((path) => {
        const length = path.getTotalLength();
        const start = path.getPointAtLength(0);
        const end = path.getPointAtLength(length);
        // Both retained features are standalone vertical paths. The closed
        // surfaces and the School lower-cap contour cannot satisfy this test.
        if (
          Math.abs(end.x - start.x) > 0.002 ||
          end.y - start.y < 3 ||
          Math.abs(length - (end.y - start.y)) > 0.002
        )
          return [];
        return [{ start: [start.x, start.y], end: [end.x, end.y], length }];
      });
      return lines.length === 1 ? lines[0] : null;
    }
    for (const base of ["signpost", "school"]) {
      const outline = retainedLine(sources.get(`${base}.svg`));
      const solid = retainedLine(sources.get(`${base}_solid.svg`));
      const maximumDrift =
        outline && solid
          ? Math.max(
              ...[...outline.start, ...outline.end].map((value, index) =>
                Math.abs(value - [...solid.start, ...solid.end][index]),
              ),
            )
          : null;
      add({
        name: `${base}_solid.svg`,
        peer: `${base}.svg`,
        feature:
          base === "signpost"
            ? "retained pole endpoints"
            : "retained tassel endpoints",
        coordinateSpace: "final-16-unit-canvas",
        outline,
        solid,
        maximumDrift,
        tolerance: 0.015,
        pass: maximumDrift !== null && maximumDrift <= 0.015,
      });
    }
    async function paint(svg, weight) {
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
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    function bounds(pixels, region) {
      const [x0, y0, x1, y1] = region;
      let left = side;
      let top = side;
      let right = -1;
      let bottom = -1;
      for (let y = Math.ceil(y0 * scale); y < y1 * scale; y++)
        for (let x = Math.ceil(x0 * scale); x < x1 * scale; x++) {
          if (pixels[(y * side + x) * 4 + 3] < 128) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      return right < 0
        ? null
        : [left, top, right, bottom].map((v) => v / scale);
    }
    function runs(pixels, axis, fixed, from, to, inverse) {
      const segments = [];
      let start = null;
      for (
        let position = Math.ceil(from * scale);
        position <= to * scale;
        position++
      ) {
        const x = axis === "x" ? position : Math.round(fixed * scale);
        const y = axis === "x" ? Math.round(fixed * scale) : position;
        const selected =
          position < to * scale &&
          pixels[(y * side + x) * 4 + 3] >= 128 !== inverse;
        if (selected && start === null) start = position / scale;
        if (!selected && start !== null) {
          segments.push([start, position / scale]);
          start = null;
        }
      }
      return segments.length === 1 ? segments[0] : null;
    }
    const centre = (range) => (range[0] + range[1]) / 2;
    for (const base of names)
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const outline = await paint(sources.get(`${base}.svg`), weight);
        const solid = await paint(sources.get(`${base}_solid.svg`), weight);
        if (base !== "receipt") {
          // Probe complete surviving stems, including their two side edges and
          // exposed butt endpoints, while staying clear of either body surface.
          const regions =
            base === "signpost"
              ? [
                  [6, 0, 9, 2.3],
                  [6, 13, 9, 16],
                ]
              : [[13.45, 9.8, 16, 12]];
          const samples = regions.map((region, index) => {
            const a = bounds(outline, region);
            const b = bounds(solid, region);
            const axes =
              base === "signpost" && index === 0 ? [0, 1, 2] : [0, 2, 3];
            const drift =
              a && b
                ? Math.max(...axes.map((axis) => Math.abs(a[axis] - b[axis])))
                : null;
            return { region, outline: a, solid: b, drift };
          });
          add({
            name: `${base}_solid.svg`,
            peer: `${base}.svg`,
            feature:
              base === "signpost"
                ? "painted pole ends and sides"
                : "painted tassel end and sides",
            coordinateSpace: "final-16-unit-canvas",
            weight,
            samples,
            tolerance: 0.02,
            pass: samples.every(({ drift }) => drift !== null && drift <= 0.02),
          });
          continue;
        }
        const rows = [5.547617, 7.999997, 10.452377].map((y) => {
          const positive = {
            horizontal: runs(outline, "x", y, 4.7, 11.3, false),
            vertical: runs(outline, "y", 7, y - 1.1, y + 1.1, false),
          };
          const inverse = {
            horizontal: runs(solid, "x", y, 4.7, 11.3, true),
            vertical: runs(solid, "y", 7, y - 1.1, y + 1.1, true),
          };
          const valid = [
            ...Object.values(positive),
            ...Object.values(inverse),
          ].every(Boolean);
          const drift = valid
            ? Math.max(
                Math.abs(positive.horizontal[0] - inverse.horizontal[0]),
                Math.abs(positive.horizontal[1] - inverse.horizontal[1]),
                Math.abs(centre(positive.vertical) - centre(inverse.vertical)),
              )
            : null;
          const counterHeight = valid
            ? inverse.vertical[1] - inverse.vertical[0]
            : null;
          return { y, positive, inverse, drift, counterHeight };
        });
        add({
          name: "receipt_solid.svg",
          peer: "receipt.svg",
          feature: "three positive/inverse text anchors and counter weight",
          coordinateSpace: "final-16-unit-canvas",
          weight,
          rows,
          tolerance: 0.025,
          // The inverse bars are fixed filled counters, not configurable strokes.
          // This native-reviewed band preserves their useful weight and permits
          // a little optical adjustment without requiring identical polarity ink.
          counterHeightRange: [0.9, 1.1],
          pass: rows.every(
            ({ drift, counterHeight }) =>
              drift !== null &&
              drift <= 0.025 &&
              counterHeight >= 0.9 &&
              counterHeight <= 1.1,
          ),
        });
      }
    return { results, failures };
  }, artwork);
}
