// Measure the opening between the filled mortarboard and its lower cap.
// Both sides must follow the foreground's slope with the same normal gap.
export async function checkSchoolCutout(page, records) {
  const record = records.find(({ name }) => name === "school_solid.svg");
  if (!record) throw new Error("Missing school cutout artwork");
  return page.evaluate(async ({ name, svg }) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const slope = 5.5 / 9.25;
    const expected = ((16.1 - 14.25) * 2) / (3 * Math.hypot(1, slope));
    const tolerance = 0.025;
    for (const weight of [0.67]) {
      const source = svg.replace("<svg ", '<svg style="color:black" ');
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
        const pixels = context.getImageData(0, 0, side, side).data;
        for (const x of [4, 6, 10, 12]) {
          const pixelX = Math.floor(x * scale);
          const actualX = (pixelX + 0.5) / scale;
          const foregroundY = 9.5 - slope * Math.abs(actualX - 8);
          const start = Math.floor((foregroundY - 0.3) * scale);
          const end = Math.ceil((foregroundY + 2) * scale);
          let upper = null;
          let lower = null;
          let previous = pixels[(start * side + pixelX) * 4 + 3] / 255;
          for (let y = start + 1; y < end; y++) {
            const alpha = pixels[(y * side + pixelX) * 4 + 3] / 255;
            const crossing =
              (y - 0.5 + (0.5 - previous) / (alpha - previous)) / scale;
            if (upper === null && previous >= 0.5 && alpha < 0.5)
              upper = crossing;
            else if (upper !== null && previous < 0.5 && alpha >= 0.5) {
              lower = crossing;
              break;
            }
            previous = alpha;
          }
          const gap =
            upper === null || lower === null
              ? null
              : (lower - upper) / Math.hypot(1, slope);
          const result = {
            name,
            weight,
            feature: "parallel mortarboard cutout",
            x,
            upper,
            lower,
            gap,
            expected,
            tolerance,
          };
          results.push(result);
          if (
            gap === null ||
            !Number.isFinite(gap) ||
            Math.abs(gap - expected) > tolerance
          )
            failures.push(result);
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    return { results, failures };
  }, record);
}
