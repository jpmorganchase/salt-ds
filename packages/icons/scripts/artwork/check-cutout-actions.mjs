// Check painted foreground-to-background gaps, including the curved buffer
// around the tag-clear X's square terminal. SVG path spelling is irrelevant.
export async function checkCutoutActions(page, records) {
  const names = [
    "tag-clear.svg",
    "tag-clear_solid.svg",
    "clone.svg",
    "schedule.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing cutout artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (artwork) => {
    const scale = 128;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const tolerance = 3 / scale;

    function paintedGap(pixels, origin, direction, limit = 5) {
      const length = Math.hypot(...direction);
      const dx = direction[0] / length;
      const dy = direction[1] / length;
      const painted = (distance) => {
        const x = Math.floor((origin[0] + dx * distance) * scale);
        const y = Math.floor((origin[1] + dy * distance) * scale);
        return (
          x >= 0 &&
          y >= 0 &&
          x < size &&
          y < size &&
          pixels[(y * size + x) * 4 + 3] >= 128
        );
      };
      if (!painted(0)) return { gap: null, reason: "missing foreground" };
      let foregroundEdge = null;
      for (let step = 1; step <= limit * scale; step++) {
        const isPainted = painted(step / scale);
        const boundary = (step - 0.5) / scale;
        if (foregroundEdge === null && !isPainted) foregroundEdge = boundary;
        else if (foregroundEdge !== null && isPainted) {
          return {
            gap: boundary - foregroundEdge,
            foregroundEdge,
            backgroundEdge: boundary,
          };
        }
      }
      return { gap: null, reason: "missing gap or background" };
    }

    for (const { name, svg } of artwork)
      for (const weight of [0.67]) {
        const source = svg.replace("<svg ", '<svg style="color:black" ');
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          context.clearRect(0, 0, size, size);
          context.drawImage(img, 0, 0, size, size);
          const pixels = context.getImageData(0, 0, size, size).data;
          // Measure the fixed clearance boundary from the authored foreground.
          const straightGap = 1.25 - weight / 2;
          let probes;
          if (name.startsWith("tag-clear")) {
            // The solid probe sits just inside the diagonal tag edge; sampling
            // exactly on that antialiased boundary can miss the rear fill.
            const crossing = name.endsWith("_solid.svg") ? 10.6875 : 10.75;
            probes = [
              [
                "upper diagonal X clearance",
                [crossing, crossing],
                [1, -1],
                straightGap,
              ],
              [
                "lower diagonal X clearance",
                [crossing, crossing],
                [-1, 1],
                straightGap,
              ],
            ];
            if (name.endsWith("_solid.svg")) {
              // The butt terminal has a fixed buffer along the line direction.
              probes.push(["X terminal buffer", [10.25, 10.25], [-1, -1], 0.5]);
              // The existing .5-radius buffers are centered at these fixed
              // corners. Probe their apexes from the authored X edge.
              const corner = 0.75 / Math.SQRT2;
              const foregroundEdge = 10 + corner - weight / Math.SQRT2;
              const cornerGap = 0.5 + (1.5 - weight) / Math.SQRT2;
              probes.push(
                [
                  "upper rounded terminal corner",
                  [10 + corner, foregroundEdge + 0.15],
                  [0, -1],
                  cornerGap,
                ],
                [
                  "lower rounded terminal corner",
                  [foregroundEdge + 0.15, 10 + corner],
                  [-1, 0],
                  cornerGap,
                ],
              );
            }
          } else if (name === "clone.svg") {
            probes = [
              ["frame above arrow shaft", [5, 9.5], [0, -1], straightGap],
              ["frame below arrow shaft", [5, 9.5], [0, 1], straightGap],
            ];
          } else {
            // Calendar framing scales coordinates while preserving line widths.
            const frameGap = 1.25 * 1.1 - weight / 2;
            const fit = (point) => point.map((value) => 8 + (value - 8) * 1.1);
            probes = [
              [
                "right frame above plus arm",
                fit([14.25, 35 / 3]),
                [0, -1],
                frameGap,
              ],
              [
                "bottom frame beside plus arm",
                fit([12, 13]),
                [-1, 0],
                frameGap,
              ],
            ];
          }
          for (const [feature, origin, direction, expected] of probes) {
            const measured = paintedGap(pixels, origin, direction);
            const result = { name, weight, feature, measured, expected };
            results.push(result);
            if (
              measured.gap === null ||
              Math.abs(measured.gap - expected) > tolerance
            ) {
              failures.push(result);
            }
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { results, failures };
  }, artwork);
}
