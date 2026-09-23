// Inspect complete final paint, including variable rims and antialiased joins.
// The corner and paired edges are visual landmarks, independent of SVG paths.
export async function checkFeedbackHome(page, records) {
  const selected = [
    "feedback.svg",
    "feedback_solid.svg",
    "home.svg",
    "home_solid.svg",
  ].map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record) throw new Error(`Missing Feedback/Home artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (selected) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const report = (result, pass) => {
      results.push(result);
      if (!pass) failures.push(result);
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
        image.src = url;
        await image.decode();
        context.clearRect(0, 0, side, side);
        context.drawImage(image, 0, 0, side, side);
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const alphaAt = (rgba, x, y) =>
      rgba[4 * (Math.floor(y * scale) * side + Math.floor(x * scale)) + 3];
    const rowEdges = (rgba, y) => {
      const xs = [];
      for (let x = 0; x < side; x++) {
        if (alphaAt(rgba, (x + 0.5) / scale, y) >= 128)
          xs.push((x + 0.5) / scale);
      }
      return [
        xs[0],
        xs.at(-1),
        xs.filter((x) => x < 8).at(-1),
        xs.find((x) => x > 8),
      ];
    };
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = new Map();
      for (const { name, svg } of selected)
        paint.set(name, await render(svg, weight));
      for (const name of ["feedback.svg", "feedback_solid.svg"]) {
        // Sweep the painted band across the accepted tangent shoulder. The
        // former sharp-corner wedge is outside this curve at narrow widths.
        // Fixed final-frame landmarks keep this independent of SVG path
        // splitting; a gap or two butt caps still leave samples unpainted.
        const start = [4.36, 10.8];
        const control = [3.8, 10.8];
        const end = [3.362752, 11.149776];
        let minimumAlpha = 255;
        let weakestPoint;
        let sampleCount = 0;
        for (let step = 0; step <= 64; step++) {
          const t = step / 64;
          const point = start.map(
            (value, axis) =>
              (1 - t) ** 2 * value +
              2 * (1 - t) * t * control[axis] +
              t ** 2 * end[axis],
          );
          const tangent = start.map(
            (value, axis) =>
              2 * (1 - t) * (control[axis] - value) +
              2 * t * (end[axis] - control[axis]),
          );
          const length = Math.hypot(...tangent);
          for (const offset of [-0.35, -0.175, 0, 0.175, 0.35]) {
            const x = point[0] - (tangent[1] / length) * offset * weight;
            const y = point[1] + (tangent[0] / length) * offset * weight;
            const alpha = alphaAt(paint.get(name), x, y);
            sampleCount++;
            if (alpha < minimumAlpha) {
              minimumAlpha = alpha;
              weakestPoint = [x, y];
            }
          }
        }
        report(
          {
            name,
            weight,
            feature: "continuous speech-tail bend",
            minimumAlpha,
            sampleCount,
            weakestPoint,
          },
          minimumAlpha >= 240,
        );
      }
      const outline = rowEdges(paint.get("home.svg"), 12.5);
      const solid = rowEdges(paint.get("home_solid.svg"), 12.5);
      for (const [index, feature] of [
        "left outer wall",
        "right outer wall",
        "left doorway edge",
        "right doorway edge",
      ].entries()) {
        const difference = Math.abs(outline[index] - solid[index]);
        report(
          {
            name: "home_solid.svg",
            weight,
            feature,
            outline: outline[index],
            solid: solid[index],
            difference,
          },
          difference <= 2 / scale,
        );
      }
      // The open doorway must reach beyond the house base without a floor
      // stroke or coincident counter edge being repainted across the opening.
      let maximumAlpha = 0;
      for (let y = 12.5 * scale; y < side; y++) {
        for (const x of [7.8, 8, 8.2])
          maximumAlpha = Math.max(
            maximumAlpha,
            alphaAt(paint.get("home_solid.svg"), x, (y + 0.5) / scale),
          );
      }
      report(
        {
          name: "home_solid.svg",
          weight,
          feature: "doorway open through bottom",
          maximumAlpha,
        },
        maximumAlpha === 0,
      );
    }
    return { results, failures };
  }, selected);
}
