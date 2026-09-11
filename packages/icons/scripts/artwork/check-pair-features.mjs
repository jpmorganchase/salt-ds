// Verify reported missing or misplaced features in the exported artwork.
// Rasterization measures actual paint at the fixed authored stroke widths.
export async function checkPairFeatures(page, records) {
  const samples = [
    "accessible.svg",
    "accessible_solid.svg",
    "travel.svg",
    "travel_solid.svg",
  ].map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing pair-feature artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (samples) => {
    const size = 256;
    const scale = size / 16;
    const expectedMinAlpha = 128;
    const results = [];
    const failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    for (const { name, svg } of samples) {
      for (const weight of [0.67]) {
        const markup = svg.replace("<svg ", '<svg style="color:black" ');
        const url = URL.createObjectURL(
          new Blob([markup], { type: "image/svg+xml" }),
        );
        const img = new Image();
        try {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Could not render ${name}`));
            img.src = url;
          });
          context.clearRect(0, 0, size, size);
          context.drawImage(img, 0, 0, size, size);
          if (name.startsWith("accessible")) {
            // The patch lies safely inside the arm at the authored width.
            const point = [10, 6.5];
            const pixels = context.getImageData(
              point[0] * scale - 1,
              point[1] * scale - 1,
              3,
              3,
            ).data;
            let minAlpha = 255;
            for (let offset = 3; offset < pixels.length; offset += 4)
              minAlpha = Math.min(minAlpha, pixels[offset]);
            const result = {
              name,
              weight,
              feature: "arm",
              point,
              minAlpha,
              expectedMinAlpha,
            };
            results.push(result);
            if (minAlpha < expectedMinAlpha) failures.push(result);
          } else {
            // Scan below each case's painted body. Count
            // separate wheels and measure their symmetry without prescribing
            // their individual positions or depending on path construction.
            for (const wheel of [
              {
                feature: "large suitcase wheels",
                left: 1,
                right: 8.75,
                y: 13.625,
                center: 4.75,
              },
              {
                feature: "small suitcase wheels",
                left: 9.5,
                right: 15.75,
                y: 14.375,
                center: 12.5,
              },
            ]) {
              const left = Math.round(wheel.left * scale);
              const width = Math.round((wheel.right - wheel.left) * scale);
              const pixels = context.getImageData(
                left,
                Math.round(wheel.y * scale),
                width,
                1,
              ).data;
              const centers = [];
              let start = null;
              for (let x = 0; x <= width; x++) {
                const painted =
                  x < width && pixels[x * 4 + 3] >= expectedMinAlpha;
                if (painted && start === null) start = x;
                if (!painted && start !== null) {
                  if (x - start >= 4)
                    centers.push((left + (start + x) / 2) / scale);
                  start = null;
                }
              }
              const center =
                centers.length === 2 ? (centers[0] + centers[1]) / 2 : null;
              const result = {
                name,
                weight,
                feature: wheel.feature,
                wheelCount: centers.length,
                centers,
                center,
                expectedCenter: wheel.center,
              };
              results.push(result);
              if (
                centers.length !== 2 ||
                Math.abs(center - wheel.center) > 1 / scale
              )
                failures.push(result);
            }
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, samples);
}
