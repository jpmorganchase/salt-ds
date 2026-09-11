// Measure the filled numeral paths from exported SVGs, independently of the
// lettering helpers. Stroke-only timer rings and numeral outlines are excluded.
export async function checkNumberCentering(page, records) {
  const names = ["forward", "replay"].flatMap((direction) =>
    [5, 10, 15, 30].map((seconds) => `${direction}-${seconds}.svg`),
  );
  const samples = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing number-centering artwork: ${name}`);
    return record;
  });
  return page.evaluate((samples) => {
    const expected = [8, 8.5];
    const tolerance = 0.02;
    const results = [];
    const failures = [];
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-10000px;visibility:hidden";
    document.body.append(host);
    try {
      for (const { name, svg } of samples) {
        host.innerHTML = svg;
        const artwork = host.querySelector("svg");
        const viewBox = artwork?.viewBox.baseVal;
        if (
          viewBox?.x !== 0 ||
          viewBox.y !== 0 ||
          viewBox.width !== 16 ||
          viewBox.height !== 16 ||
          artwork.hasAttribute("transform") ||
          artwork.querySelector("[transform]")
        )
          throw new Error(
            `Number-centering artwork is not normalized: ${name}`,
          );
        const bounds = [...artwork.querySelectorAll("path")]
          .filter((path) => getComputedStyle(path).fill !== "none")
          .map((path) => path.getBBox())
          .filter((box) => box.width > 0 && box.height > 0);
        if (!bounds.length)
          throw new Error(`Missing filled timer numerals: ${name}`);
        const left = Math.min(...bounds.map((box) => box.x));
        const top = Math.min(...bounds.map((box) => box.y));
        const right = Math.max(...bounds.map((box) => box.x + box.width));
        const bottom = Math.max(...bounds.map((box) => box.y + box.height));
        const center = [(left + right) / 2, (top + bottom) / 2];
        const result = { name, bounds: [left, top, right, bottom], center };
        results.push(result);
        if (
          Math.abs(center[0] - expected[0]) > tolerance ||
          Math.abs(center[1] - expected[1]) > tolerance
        )
          failures.push({ ...result, expected, tolerance });
      }
    } finally {
      host.remove();
    }
    return { results, failures };
  }, samples);
}
