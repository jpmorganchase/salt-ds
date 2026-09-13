// These checks use the final exported canvas, without reversing the fit.
// They protect the landmarks and continuous rails that ordinary occupancy
// checks missed when surfaces filled and each variant was reframed.
export async function checkStabilizationA(page, records) {
  const names = ["accessible", "add-to-grid", "cart", "credit-card"];
  const samples = names.map((name) => ({
    name,
    artwork: [".svg", "_solid.svg"].map((suffix) => {
      const file = name + suffix;
      const record = records.find((candidate) => candidate.name === file);
      if (!record) throw new Error(`Missing stabilization specimen: ${file}`);
      return record.svg;
    }),
  }));
  return page.evaluate(async (samples) => {
    const scale = 64;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const report = (result, passed) => {
      results.push(result);
      if (!passed) failures.push(result);
    };
    const bounds = (pixels, region = [0, 0, 16, 16]) => {
      const box = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];
      for (let y = Math.ceil(region[1] * scale); y < region[3] * scale; y++) {
        for (let x = Math.ceil(region[0] * scale); x < region[2] * scale; x++) {
          if (pixels[(y * side + x) * 4 + 3] < 128) continue;
          box[0] = Math.min(box[0], x / scale);
          box[1] = Math.min(box[1], y / scale);
          box[2] = Math.max(box[2], (x + 1) / scale);
          box[3] = Math.max(box[3], (y + 1) / scale);
        }
      }
      return box;
    };
    const compareRegion = (a, b, region) => {
      let differentArea = 0;
      for (let y = Math.ceil(region[1] * scale); y < region[3] * scale; y++) {
        for (let x = Math.ceil(region[0] * scale); x < region[2] * scale; x++) {
          const i = (y * side + x) * 4 + 3;
          differentArea += Math.abs(a[i] - b[i]) / 255 / scale ** 2;
        }
      }
      return differentArea;
    };
    for (const { name, artwork } of samples) {
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const paint = [];
        for (const svg of artwork) {
          const markup = svg
            .replace("<svg ", '<svg style="color:black" ')
            .replace(
              /stroke-width="([\d.]+)"/g,
              (_, value) => `stroke-width="${(Number(value) * weight) / 0.67}"`,
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
            paint.push(context.getImageData(0, 0, side, side).data);
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        if (name === "accessible" || name === "add-to-grid") {
          const region =
            name === "accessible" ? [0, 5.4, 16, 16] : [9, 9, 16, 16];
          const differentArea = compareRegion(...paint, region);
          report(
            {
              name,
              weight,
              check:
                name === "accessible"
                  ? "stable-seated-pose-and-wheel"
                  : "stable-grid-add-action",
              differentArea,
            },
            differentArea < 0.04,
          );
        }
        if (name === "cart") {
          for (const [wheel, region] of [
            ["left", [3, 11.5, 8, 16]],
            ["right", [10, 11.5, 16, 16]],
          ]) {
            const [outline, solid] = paint.map((pixels) =>
              bounds(pixels, region),
            );
            const maxDelta = Math.max(
              ...outline.map((v, i) => Math.abs(v - solid[i])),
            );
            report(
              {
                name,
                weight,
                check: "stable-wheel-position-and-outer-rim",
                wheel,
                outline,
                solid,
                maxDelta,
              },
              Number.isFinite(maxDelta) && maxDelta < 0.04,
            );
          }
          const differentArea = compareRegion(...paint, [0, 0, 2.8, 5]);
          report(
            {
              name,
              weight,
              check: "stable-exposed-cart-handle",
              differentArea,
            },
            differentArea < 0.04,
          );
        }
        if (name === "credit-card") {
          const [outline, solid] = paint.map((pixels) => bounds(pixels));
          const maxDelta = Math.max(
            ...outline.map((v, i) => Math.abs(v - solid[i])),
          );
          report(
            {
              name,
              weight,
              check: "stable-card-perimeter",
              outline,
              solid,
              maxDelta,
            },
            Number.isFinite(maxDelta) && maxDelta < 0.04,
          );
          // The stripe crosses this row. Its central opening must remain clear
          // while a connected rail survives at both outer edges of the card.
          const y = Math.floor(6.4 * scale);
          const intervals = [];
          let start;
          for (let x = 0; x <= side; x++) {
            const painted = x < side && paint[1][(y * side + x) * 4 + 3] >= 128;
            if (painted && start === undefined) start = x;
            if (!painted && start !== undefined) {
              intervals.push([start / scale, x / scale]);
              start = undefined;
            }
          }
          const railWidths = intervals.map(([left, right]) => right - left);
          const opening =
            intervals.length === 2 ? intervals[1][0] - intervals[0][1] : 0;
          report(
            {
              name,
              weight,
              check: "continuous-side-rails-around-transparent-stripe",
              intervals,
              railWidths,
              opening,
            },
            intervals.length === 2 &&
              railWidths.every((width) => width > 1 && width < 2) &&
              opening > 10,
          );
        }
      }
    }
    return { results, failures };
  }, samples);
}
