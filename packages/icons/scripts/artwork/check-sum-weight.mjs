// Measure the filled export across the paint, perpendicular to each run.
// Coordinate deltas alone overstate the thickness of a diagonal band.
export async function checkSumWeight(page, records) {
  const record = records.find(({ name }) => name === "sum_solid.svg");
  if (!record) throw new Error("Missing sum_solid.svg weight-check artwork");
  return page.evaluate(async (svg) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const url = URL.createObjectURL(
      new Blob([svg.replace("<svg ", '<svg style="color:black" ')], {
        type: "image/svg+xml",
      }),
    );
    let pixels;
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Could not render SumSolid"));
        image.src = url;
      });
      context.drawImage(image, 0, 0, side, side);
      pixels = context.getImageData(0, 0, side, side).data;
    } finally {
      URL.revokeObjectURL(url);
    }
    const painted = (x, y) => {
      const col = Math.floor(x * scale);
      const row = Math.floor(y * scale);
      return (
        col >= 0 &&
        row >= 0 &&
        col < side &&
        row < side &&
        pixels[(row * side + col) * 4 + 3] >= 128
      );
    };
    const runs = (start, end, at) => {
      const intervals = [];
      let runStart;
      for (let t = start; t <= end + 1 / scale; t += 1 / scale) {
        const filled = t <= end && painted(...at(t));
        if (filled && runStart === undefined) runStart = t;
        if (!filled && runStart !== undefined) {
          intervals.push([runStart, t]);
          runStart = undefined;
        }
      }
      return intervals;
    };
    const width = (run) => (run ? run[1] - run[0] : 0);
    const middle = (run) => (run[0] + run[1]) / 2;
    const results = [];
    const failures = [];
    const check = (feature, values, pass) => {
      const result = { name: "sum_solid.svg", feature, ...values, pass };
      results.push(result);
      if (!pass) failures.push(result);
    };
    // These scan lines cross only the bars, away from their turned terminals.
    const bars = runs(0, 16, (y) => [11, y]);
    const top = width(bars[0]);
    const bottom = width(bars[1]);
    check(
      "equal, substantial horizontal bars",
      { widths: [top, bottom], runs: bars },
      bars.length === 2 &&
        top > 1.85 &&
        top < 2.05 &&
        Math.abs(top - bottom) < 0.025,
    );
    const barWidth = (top + bottom) / 2;
    const diagonals = [];
    for (const [feature, y] of [
      ["upper diagonal", 5.5],
      ["lower diagonal", 10.5],
    ]) {
      // Infer each edge's direction from the final raster instead of assuming
      // that the recipe's authored angle survived export fitting.
      const edgeA = runs(0, 16, (x) => [x, y - 0.5])[0];
      const edgeB = runs(0, 16, (x) => [x, y + 0.5])[0];
      const centerRun = runs(0, 16, (x) => [x, y])[0];
      if (!edgeA || !edgeB || !centerRun) {
        check(feature, { error: "Missing diagonal paint" }, false);
        continue;
      }
      const slope = edgeB[0] - edgeA[0];
      const length = Math.hypot(1, slope);
      const centerX = middle(centerRun);
      const band = runs(-3, 3, (t) => [
        centerX + t / length,
        y - (t * slope) / length,
      ]).find(([a, b]) => a <= 0 && b >= 0);
      const measured = width(band);
      diagonals.push(measured);
      const ratio = measured / barWidth;
      check(
        `${feature} matches horizontal weight`,
        { perpendicularWidth: measured, barWidth, ratio, slope },
        Math.abs(Math.abs(slope) - 8 / 9) < 0.025 &&
          ratio >= 0.96 &&
          ratio <= 1.04,
      );
    }
    check(
      "upper and lower diagonal balance",
      { perpendicularWidths: diagonals },
      diagonals.length === 2 && Math.abs(diagonals[0] - diagonals[1]) < 0.025,
    );
    return { results, failures };
  }, record.svg);
}
