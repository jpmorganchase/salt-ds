// Filled interiors can differ; exposed exterior paint and retained surfaces
// must not shrink, grow or move when these repaired pairs change treatment.
export async function checkPairedSurfaceExteriors(page, records) {
  const cases = [
    { name: "build-report", regions: [["case", 0, 5, 16, 16]] },
    { name: "chat-group", regions: [["foreground bubble", 0, 8, 12, 16]] },
    { name: "copy", regions: [["foreground page", 0, 5, 12, 16]] },
    {
      name: "signpost",
      regions: [
        ["upper sign", 5, 2.5, 16, 8.1],
        ["lower sign", 0, 8.2, 11, 13],
      ],
    },
    {
      name: "tree",
      regions: [
        ["parent node", 5.5, 0, 10.5, 6],
        ["left child node", 0, 10.5, 6, 16],
        ["right child node", 10.5, 10.5, 16, 16],
      ],
    },
    { name: "receipt" },
    { name: "school" },
    { name: "microphone", regions: [["capsule crown", 5, 0, 11, 5]] },
    { name: "microphone-disabled" },
    { name: "travel" },
    { name: "woodland" },
    { name: "stop" },
  ];
  const artwork = cases.flatMap(({ name }) =>
    ["", "_solid"].map((suffix) => {
      const filename = `${name}${suffix}.svg`;
      const record = records.find((entry) => entry.name === filename);
      if (!record) throw new Error(`Missing paired surface: ${filename}`);
      return { name: filename, svg: record.svg };
    }),
  );
  return page.evaluate(
    async ({ artwork, cases }) => {
      const pixelsPerUnit = 64;
      const side = 16 * pixelsPerUnit;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const results = [];
      const failures = [];
      const bounds = (pixels, region) => {
        const measured = [
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
        ];
        for (
          let y = Math.ceil(region[1] * pixelsPerUnit);
          y < region[3] * pixelsPerUnit;
          y++
        ) {
          for (
            let x = Math.ceil(region[0] * pixelsPerUnit);
            x < region[2] * pixelsPerUnit;
            x++
          ) {
            if (pixels[(y * side + x) * 4 + 3] < 128) continue;
            measured[0] = Math.min(measured[0], x / pixelsPerUnit);
            measured[1] = Math.min(measured[1], y / pixelsPerUnit);
            measured[2] = Math.max(measured[2], (x + 1) / pixelsPerUnit);
            measured[3] = Math.max(measured[3], (y + 1) / pixelsPerUnit);
          }
        }
        return measured;
      };
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const paint = {};
        for (const { name, svg } of artwork) {
          const markup = svg
            .replace("<svg ", '<svg style="color:black" ')
            .replace(
              /stroke-width="([\d.]+)"/g,
              (_, width) => `stroke-width="${(Number(width) * weight) / 0.67}"`,
            );
          const url = URL.createObjectURL(
            new Blob([markup], { type: "image/svg+xml" }),
          );
          try {
            const image = new Image();
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = () =>
                reject(new Error(`Could not render ${name}`));
              image.src = url;
            });
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            paint[name] = context.getImageData(0, 0, side, side).data;
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        for (const { name, regions = [] } of cases) {
          for (const [feature, ...region] of [
            ["complete exterior", 0, 0, 16, 16],
            ...regions,
          ]) {
            const outline = bounds(paint[`${name}.svg`], region);
            const solid = bounds(paint[`${name}_solid.svg`], region);
            const maximumDelta = Math.max(
              ...outline.map((value, index) => Math.abs(value - solid[index])),
            );
            const result = {
              name,
              feature,
              weight,
              coordinateSpace: "final-16-unit-canvas",
              region,
              outline,
              solid,
              maximumDelta,
              tolerance: 0.04,
              pass: Number.isFinite(maximumDelta) && maximumDelta <= 0.04,
            };
            results.push(result);
            if (!result.pass) failures.push(result);
          }
        }
      }
      return { results, failures };
    },
    { artwork, cases },
  );
}
