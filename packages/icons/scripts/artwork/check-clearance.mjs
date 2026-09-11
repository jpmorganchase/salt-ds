// Verify that independent marks stay separate at the authored width. These
// regressions catch the reported toggle, chart, compass and cloud collisions;
// they do not establish semantic correctness or general visual quality.
export async function checkClearance(page, records) {
  const expectations = new Map([
    // The circular arrow remains separate from every centered numeral.
    ["forward-5.svg", 2],
    ["forward-10.svg", 3],
    ["forward-15.svg", 3],
    ["forward-30.svg", 3],
    ["replay-5.svg", 2],
    ["replay-10.svg", 3],
    ["replay-15.svg", 3],
    ["replay-30.svg", 3],
    ["string-text.svg", 5], // three letters and two rules
    ["string-number.svg", 5], // three digits and two rules
    ["wifi-disabled.svg", 7], // five signal remnants, dot and slash
    ["csv.svg", 4], // page and three separate format letters
    ["csv_solid.svg", 4],
    ["pdf.svg", 4],
    ["pdf_solid.svg", 4],
    ["xls.svg", 4],
    ["xls_solid.svg", 4],
    ["zip.svg", 4],
    ["zip_solid.svg", 4],
    ["run-report.svg", 2], // page and play triangle
    ["schedule-time.svg", 3], // page, clock ring and hands
    ["add-user.svg", 3],
    ["remove-user.svg", 3],
    ["tails.svg", 4], // outer contour, two eye rings and the beak
    ["mouse.svg", 2], // wheel and the divided housing
    ["pivot.svg", 2], // frame and the bent arrow
    ["pivot_solid.svg", 1], // filled plate; its inverse arrow is checked below
    ["sparkle.svg", 2],
    ["sparkle_solid.svg", 2],
    ["sparkle-refresh.svg", 2], // connected arrow remains separate from sparkle
    ["sparkle-refresh_solid.svg", 2],
    ["stackoverflow.svg", 1], // the official 2026 brand mark is connected
    ["tag.svg", 2], // eyelet remains separate from the perimeter
    ["tag-clear.svg", 3],
    ["tag-clear_solid.svg", 2],
    ["user.svg", 2], // head and shoulders
    ["user-group.svg", 4],
    ["user-admin.svg", 2],
    ["unlocked.svg", 2], // housing/shackle and the keyhole
    ["locked.svg", 2],
    ["man.svg", 2],
    ["woman.svg", 2],
    ["man-woman.svg", 4],
    ["key-tab.svg", 2], // arrow and its stop
    ["boolean.svg", 4], // two track outlines and two independent thumb dots
    ["bar-chart.svg", 4], // axis and three bars
    ["chart-bar.svg", 4],
    ["devices.svg", 3], // monitor, phone housing and home dot
    ["compass.svg", 2], // ring and independent needle
    ["compass_solid.svg", 2],
    ["cloud-download.svg", 2], // cloud and arrow
    ["cloud-download_solid.svg", 2],
    ["cloud-upload.svg", 2],
    ["cloud-upload_solid.svg", 2],
    ["cloud-sync.svg", 3], // cloud and two independent arrows
    ["cloud-sync_solid.svg", 3],
    ["cloud-success.svg", 2], // continuous cloud contour and checkmark
    ["cloud-success_solid.svg", 2],
    ["cloud-disabled.svg", 3], // two cloud sections and a slash
    ["cloud-disabled_solid.svg", 3],
  ]);
  const samples = records
    .filter(({ name }) => expectations.has(name))
    .map(({ name, svg }) => ({ name, svg, expected: expectations.get(name) }));
  if (samples.length !== expectations.size)
    throw new Error("Missing clearance regression artwork");
  return page.evaluate(async (samples) => {
    const failures = [];
    const results = [];
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    function countRegions(pixels, painted) {
      const seen = new Uint8Array(size * size);
      let components = 0;
      let enclosed = 0;
      for (let start = 0; start < seen.length; start++) {
        if (seen[start] || pixels[start * 4 + 3] >= 128 !== painted) continue;
        const pending = [start];
        seen[start] = 1;
        let area = 0;
        let touchesEdge = false;
        while (pending.length) {
          const index = pending.pop();
          area++;
          const x = index % size;
          const y = Math.floor(index / size);
          if (x === 0 || y === 0 || x === size - 1 || y === size - 1)
            touchesEdge = true;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
              const next = ny * size + nx;
              if (!seen[next] && pixels[next * 4 + 3] >= 128 === painted) {
                seen[next] = 1;
                pending.push(next);
              }
            }
          }
        }
        if (area > 4) {
          components++;
          if (!touchesEdge) enclosed++;
        }
      }
      return { components, enclosed };
    }
    for (const { name, svg, expected } of samples) {
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
          const pixels = context.getImageData(0, 0, size, size).data;
          const { components } = countRegions(pixels, true);
          const sample = { name, weight, components, expected };
          results.push(sample);
          if (components !== expected) failures.push(sample);
          if (name === "pivot_solid.svg") {
            // The inverse arrow must remain a single enclosed opening; this
            // also catches it disappearing or breaking through the plate.
            const { enclosed } = countRegions(pixels, false);
            const counter = {
              name,
              weight,
              counters: enclosed,
              expectedCounters: 1,
            };
            results.push(counter);
            if (enclosed !== 1) failures.push(counter);
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, samples);
}
