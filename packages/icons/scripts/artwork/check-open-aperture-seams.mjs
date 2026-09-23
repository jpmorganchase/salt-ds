// Touching even-odd fill edges can paint a seam in the ordinary renderer while
// a readback-optimized canvas hides it. Compare fresh renderers at fractional
// pixel phases and reject paint isolated inside an otherwise clear aperture.
export async function checkOpenApertureSeams(page, records) {
  const selected = [
    "man_solid.svg",
    "man-woman_solid.svg",
    "paste_solid.svg",
    "woman_solid.svg",
  ].map((name) => {
    const record = records.find((item) => item.name === name);
    if (!record) throw new Error(`Missing open-aperture artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (selected) => {
    const results = [],
      failures = [];
    const side = 256;
    for (const { name, svg } of selected) {
      for (const width of [0.67, 1, 4 / 3, 1.5]) {
        const source = svg.replace(
          /stroke-width="([\d.]+)"/g,
          (_, value) => `stroke-width="${(Number(value) * width) / 0.67}"`,
        );
        for (const phase of [0, 0.25, 0.5, 0.75]) {
          const renders = [];
          for (const readback of [false, true]) {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = side;
            const context = canvas.getContext("2d", {
              willReadFrequently: readback,
            });
            const url = URL.createObjectURL(
              new Blob([source], { type: "image/svg+xml" }),
            );
            try {
              const image = new Image();
              image.src = url;
              await image.decode();
              context.drawImage(image, 0, phase, side, side);
              const rgba = context.getImageData(0, 0, side, side).data;
              renders.push(
                Uint8Array.from(
                  { length: side * side },
                  (_, i) => rgba[4 * i + 3],
                ),
              );
            } finally {
              URL.revokeObjectURL(url);
            }
          }
          let isolatedPixels = 0,
            maximumAlpha = 0;
          const [ordinary, readback] = renders;
          for (let y = 2; y < side - 2; y++)
            for (let x = 2; x < side - 2; x++) {
              const i = y * side + x;
              if (ordinary[i] < 24 || readback[i] > 4) continue;
              // Exclude normal edge antialiasing: the readback renderer must be
              // clear for two pixels on both axes around the unexpected paint.
              if (
                [-2, -1, 1, 2, -side, -2 * side, side, 2 * side].some(
                  (offset) => readback[i + offset] > 4,
                )
              )
                continue;
              isolatedPixels++;
              maximumAlpha = Math.max(maximumAlpha, ordinary[i]);
            }
          const result = {
            name,
            feature: "no isolated paint in open aperture",
            width,
            phase,
            pixels: side,
            isolatedPixels,
            maximumAlpha,
          };
          results.push(result);
          if (isolatedPixels) failures.push(result);
        }
      }
    }
    return { results, failures };
  }, selected);
}
