// Guard the independent review's retained landmarks in complete final exports.
// Positive/inverse openings may have different sizes; their centers stay fixed.
export async function checkReviewBRetained(page, records) {
  const names = new Set(
    ["guide-open", "hidden", "key", "man", "man-woman"].flatMap((name) => [
      `${name}.svg`,
      `${name}_solid.svg`,
    ]),
  );
  const selected = records.filter(({ name }) => names.has(name));
  if (selected.length !== names.size)
    throw new Error("Missing retained B artwork");
  return page.evaluate(async (selected) => {
    const size = 512;
    const scale = size / 16;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const add = (result, pass) => {
      results.push(result);
      if (!pass) failures.push(result);
    };
    const render = async (svg, weight) => {
      const source = svg.replace(
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
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
        return context.getImageData(0, 0, size, size).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const featureCenter = (paint, roi, inverse) => {
      let left = size,
        right = -1,
        top = size,
        bottom = -1;
      for (
        let y = Math.max(0, Math.ceil(roi[1] * scale));
        y < Math.min(size, roi[3] * scale);
        y++
      )
        for (
          let x = Math.max(0, Math.ceil(roi[0] * scale));
          x < Math.min(size, roi[2] * scale);
          x++
        ) {
          const alpha = paint[(y * size + x) * 4 + 3];
          if ((inverse ? 255 - alpha : alpha) < 128) continue;
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      return right < left
        ? null
        : [(left + right + 1) / (2 * scale), (top + bottom + 1) / (2 * scale)];
    };
    const landmarks = [
      {
        name: "key",
        feature: "eyelet",
        center: [5.163953, 5.163953],
        roi: [3.4, 3.4, 6.9, 6.9],
        inverse: true,
      },
      {
        name: "man",
        feature: "head",
        center: [8, 2.615384],
        roi: [5.4, 0, 10.6, 5.2],
      },
      {
        name: "man-woman",
        feature: "left head",
        center: [4.048707, 2.61644],
        roi: [1.2, 0, 6.4, 5.2],
      },
      {
        name: "man-woman",
        feature: "right head",
        center: [11.951298, 2.61644],
        roi: [9.1, 0, 14.3, 5.2],
      },
      ...[4.399286, 11.600714].flatMap((x, column) =>
        [4.580505, 7.991673].map((y, row) => ({
          name: "guide-open",
          feature: `text ${column + 1}/${row + 1}`,
          center: [x, y],
          roi: [x - 2.15, y - 1, x + 2.15, y + 1],
          inverse: true,
        })),
      ),
    ];
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = {};
      for (const record of selected)
        paint[record.name] = await render(record.svg, weight);
      for (const landmark of landmarks) {
        const centers = [false, true].map((solid) =>
          featureCenter(
            paint[`${landmark.name}${solid ? "_solid" : ""}.svg`],
            landmark.roi,
            solid && landmark.inverse,
          ),
        );
        const error = centers.some((center) => !center)
          ? Infinity
          : Math.max(
              ...centers.flatMap((center) =>
                center.map((value, axis) =>
                  Math.abs(value - landmark.center[axis]),
                ),
              ),
              ...centers[0].map((value, axis) =>
                Math.abs(value - centers[1][axis]),
              ),
            );
        add(
          {
            name: landmark.name,
            weight,
            feature: `${landmark.feature} final anchor`,
            centers,
            expected: landmark.center,
            error,
          },
          error <= 0.047,
        );
      }
      // Exclude the unchanged slash/pupil and their intentional clearances.
      // Remaining outline pixels belong to the eye's outside rim, including
      // both tips. Their paint must survive the solid lens fill at every weight.
      const outline = paint["hidden.svg"];
      const solid = paint["hidden_solid.svg"];
      let rimPixels = 0,
        lostPixels = 0;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const px = (x + 0.5) / scale,
            py = (y + 0.5) / scale;
          if (
            Math.abs(py - px - 0.123806) < 2.25 ||
            Math.hypot(px - 7.876191, py - 8) < 3.5
          )
            continue;
          const index = (y * size + x) * 4 + 3;
          if (outline[index] < 128) continue;
          rimPixels++;
          if (solid[index] < 128) lostPixels++;
        }
      const ratio = lostPixels / rimPixels;
      add(
        {
          name: "hidden",
          weight,
          feature: "solid keeps complete lens rim",
          rimPixels,
          lostPixels,
          ratio,
        },
        rimPixels > 500 && ratio <= 0.01,
      );
    }
    return { results, failures };
  }, selected);
}
