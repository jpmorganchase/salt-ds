// Guard the review's user-visible defects in final exported paint. These
// checks deliberately do not assume the recipe's paths or fitting strategy.
export async function checkReviewAb(page, records) {
  const pairs = [
    "chart-bubble",
    "dataset-manager",
    "group",
    "feedback",
    "holiday",
  ];
  const markPairs = [
    { name: "add-document", roi: [5.1, 6.6, 10.9, 12.6] },
    { name: "hospital", roi: [5.5, 2.65, 10.5, 7.7] },
    { name: "medical-kit", roi: [4.75, 6.45, 11.25, 12.95] },
  ];
  const names = new Set(
    [...pairs, ...markPairs.map(({ name }) => name)].flatMap((name) => [
      `${name}.svg`,
      `${name}_solid.svg`,
    ]),
  );
  const compactMarks = [
    { name: "add-document.svg", x: 8, y: 9.615385, halfLength: 2.692308 },
    {
      name: "add-document_solid.svg",
      x: 8,
      y: 9.615385,
      halfLength: 2.692308,
      inverse: true,
    },
    { name: "add-to-grid.svg", x: 12.375, y: 12.375, halfLength: 2.625 },
    { name: "add-to-grid_solid.svg", x: 12.375, y: 12.375, halfLength: 2.625 },
    { name: "add-user.svg", x: 13.244562, y: 7.086955, halfLength: 2.434782 },
  ];
  for (const { name } of compactMarks) names.add(name);
  const selected = records.filter(({ name }) => names.has(name));
  if (selected.length !== names.size)
    throw new Error("Missing review AB artwork");
  return page.evaluate(
    async ({ selected, pairs, markPairs, compactMarks }) => {
      const results = [];
      const failures = [];
      const size = 512;
      const scale = size / 16;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const add = (result, pass) => {
        results.push(result);
        if (!pass) failures.push(result);
      };
      const render = async (svg, weight) => {
        const source = svg.replace(
          /stroke-width="([\d.]+)"/g,
          (_, value) => `stroke-width="${(Number(value) * weight) / 0.67}"`,
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
          context.clearRect(0, 0, size, size);
          context.drawImage(image, 0, 0, size, size);
          return context.getImageData(0, 0, size, size).data;
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      const alpha = (paint, x, y) =>
        paint[(Math.floor(y * scale) * size + Math.floor(x * scale)) * 4 + 3];
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const paints = {};
        for (const { name, svg } of selected)
          paints[name] = await render(svg, weight);
        for (const name of pairs) {
          const outline = paints[`${name}.svg`];
          const solid = paints[`${name}_solid.svg`];
          let outlinePixels = 0;
          let lost = 0;
          for (let i = 3; i < outline.length; i += 4) {
            if (outline[i] < 128) continue;
            outlinePixels++;
            if (solid[i] < 128) lost++;
          }
          const ratio = lost / outlinePixels;
          add(
            {
              name,
              weight,
              feature: "solid retains outline painted rims and landmarks",
              lostPixels: lost,
              outlinePixels,
              ratio,
            },
            ratio <= 0.002,
          );
        }
        for (const { name, roi } of markPairs) {
          const positive = paints[`${name}.svg`];
          const inverse = paints[`${name}_solid.svg`];
          let mismatch = 0;
          let count = 0;
          for (let y = Math.ceil(roi[1] * scale); y < roi[3] * scale; y++)
            for (let x = Math.ceil(roi[0] * scale); x < roi[2] * scale; x++) {
              const i = (y * size + x) * 4 + 3;
              if (Math.abs(positive[i] + inverse[i] - 255) > 64) mismatch++;
              count++;
            }
          add(
            {
              name,
              weight,
              feature:
                "positive and inverse modifier retain identical painted contour",
              mismatch,
              count,
              ratio: mismatch / count,
            },
            mismatch / count < 0.002,
          );
        }
        for (const mark of compactMarks) {
          const paint = paints[mark.name];
          const value = (x, y) =>
            mark.inverse ? 255 - alpha(paint, x, y) : alpha(paint, x, y);
          const probeY = mark.y - mark.halfLength + 0.3;
          let widthPixels = 0;
          for (
            let x = Math.floor((mark.x - 1.2) * scale);
            x < Math.ceil((mark.x + 1.2) * scale);
            x++
          )
            if (value((x + 0.5) / scale, probeY) >= 128) widthPixels++;
          const stemWidth = widthPixels / scale;
          add(
            {
              name: mark.name,
              weight,
              feature: "compact addition retains fixed readable stem",
              stemWidth,
            },
            Math.abs(stemWidth - 4 / 3) <= 0.063,
          );
          for (const horizontal of [-1, 1])
            for (const vertical of [-1, 1]) {
              const inner = value(
                mark.x + horizontal * (2 / 3 + 0.1),
                mark.y + vertical * (2 / 3 + 0.1),
              );
              const outer = value(
                mark.x + horizontal * (2 / 3 + 0.55),
                mark.y + vertical * (2 / 3 + 0.55),
              );
              add(
                {
                  name: mark.name,
                  weight,
                  feature:
                    "compact addition keeps visible inner weld and open counter",
                  quadrant: [horizontal, vertical],
                  inner,
                  outer,
                },
                inner >= 128 && outer < 128,
              );
            }
        }
        for (const name of ["medical-kit.svg", "medical-kit_solid.svg"]) {
          const paint = paints[name];
          // A visible, transparent handle above the case; decorative side bars
          // alone cannot satisfy these probes as the previous kit did not.
          const present =
            alpha(paint, 5.157, 3.7) > 128 &&
            alpha(paint, 10.84, 3.7) > 128 &&
            alpha(paint, 8, 1.18) > 128 &&
            alpha(paint, 8, 3.1) < 32;
          add(
            {
              name,
              weight,
              feature: "open handle above first-aid case",
              present,
            },
            present,
          );
        }
      }
      return { results, failures };
    },
    { selected, pairs, markPairs, compactMarks },
  );
}
