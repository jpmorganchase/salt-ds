// Render on a padded canvas so clipped joins and pointed stroke ends remain
// observable. Geometric path boxes alone do not include these painted extents.
export async function checkPaintedBounds(page, records) {
  return page.evaluate(async (records) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 320;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const failures = [];
    for (const { name, svg } of records)
      for (const weight of [0.67]) {
        const source = svg
          .replace('viewBox="0 0 16 16"', 'viewBox="-2 -2 20 20"')
          .replace(/width="16"|height="16"/g, "")
          .replace(
            "<svg ",
            '<svg width="320" height="320" style="color:black" ',
          );
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        const img = new Image();
        try {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          ctx.clearRect(0, 0, 320, 320);
          ctx.drawImage(img, 0, 0);
          const pixels = ctx.getImageData(0, 0, 320, 320).data;
          let minX = 320;
          let minY = 320;
          let maxX = 0;
          let maxY = 0;
          for (let i = 0; i < 320 * 320; i++) {
            if (pixels[i * 4 + 3] < 128) continue;
            const x = i % 320;
            const y = Math.floor(i / 320);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + 1);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y + 1);
          }
          if (minX < 32 || minY < 32 || maxX > 288 || maxY > 288)
            failures.push({
              name,
              weight,
              bounds: [
                minX / 16 - 2,
                minY / 16 - 2,
                maxX / 16 - 2,
                maxY / 16 - 2,
              ],
            });
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { samples: records.length, failures };
  }, records);
}
