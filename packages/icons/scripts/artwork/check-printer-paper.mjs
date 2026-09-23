// Inspect complete rendered output: the foreground sheet must remain clear
// across the housing's lower edge, and solid/outline retain one housing rim.
export async function checkPrinterPaper(page, records) {
  const selected = ["print.svg", "print_solid.svg"].map((name) => {
    const record = records.find((r) => r.name === name);
    if (!record) throw new Error(`Missing printer artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (selected) => {
    const results = [],
      failures = [];
    const report = (value, pass) => {
      results.push(value);
      if (!pass) failures.push(value);
    };
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const rendered = new Map();
      for (const { name, svg } of selected) {
        const side = 1024,
          scale = side / 16;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = side;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const source = svg.replace(
          /stroke-width="([\d.]+)"/g,
          (_, w) => `stroke-width="${(Number(w) * weight) / 0.67}"`,
        );
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          context.drawImage(image, 0, 0, side, side);
          const pixels = context.getImageData(0, 0, side, side).data;
          const alpha = (x, y) =>
            pixels[
              4 * (Math.floor(y * scale) * side + Math.floor(x * scale)) + 3
            ];
          // Scan the full safe paper interior, including the former housing
          // bottom. Margins exclude the intended paper rim at maximum weight.
          let maximumAlpha = 0,
            paintedSamples = 0;
          for (
            let y = Math.ceil(10.9 * scale);
            y < Math.floor(13.1 * scale);
            y++
          )
            for (
              let x = Math.ceil(5.6 * scale);
              x < Math.floor(10.4 * scale);
              x++
            ) {
              const a = pixels[4 * (y * side + x) + 3];
              maximumAlpha = Math.max(maximumAlpha, a);
              if (a > 8) paintedSamples++;
            }
          report(
            {
              name,
              weight,
              feature: "uninterrupted clear output-paper interior",
              maximumAlpha,
              paintedSamples,
            },
            maximumAlpha <= 8,
          );
          const edges = [];
          for (let x = 0; x < side; x++)
            if (alpha((x + 0.5) / scale, 8) >= 128)
              edges.push((x + 0.5) / scale);
          rendered.set(name, { left: edges[0], right: edges.at(-1), pixels });
          // A coincident fill edge can produce a seam in Chrome's normal
          // raster path while its readback-optimized canvas path stays clear.
          // Use a fresh ordinary canvas for each phase: repeated readbacks can
          // also change the renderer and conceal the regression being tested.
          for (const phase of [0, 0.25, 0.5, 0.75]) {
            const phaseCanvas = document.createElement("canvas");
            phaseCanvas.width = phaseCanvas.height = 256;
            const phaseContext = phaseCanvas.getContext("2d", {
              willReadFrequently: false,
            });
            const phaseUrl = URL.createObjectURL(
              new Blob([source], { type: "image/svg+xml" }),
            );
            try {
              const phaseImage = new Image();
              phaseImage.src = phaseUrl;
              await phaseImage.decode();
              phaseContext.drawImage(phaseImage, 0, phase, 256, 256);
              const rgba = phaseContext.getImageData(0, 0, 256, 256).data;
              let maximumAlpha = 0;
              for (let y = 176; y < 208; y++)
                for (let x = 96; x < 160; x++)
                  maximumAlpha = Math.max(
                    maximumAlpha,
                    rgba[4 * (y * 256 + x) + 3],
                  );
              report(
                {
                  name,
                  weight,
                  feature: "no paper seam at fractional raster position",
                  pixels: 256,
                  phase,
                  maximumAlpha,
                },
                maximumAlpha <= 8,
              );
            } finally {
              URL.revokeObjectURL(phaseUrl);
            }
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const a = rendered.get("print.svg"),
        b = rendered.get("print_solid.svg");
      for (const edge of ["left", "right"]) {
        const drift = Math.abs(a[edge] - b[edge]);
        report(
          {
            name: "print_solid.svg",
            weight,
            feature: `retained housing ${edge} rim`,
            drift,
            tolerance: 1 / 64,
          },
          drift <= 1 / 64,
        );
      }
    }
    return { results, failures };
  }, selected);
}
