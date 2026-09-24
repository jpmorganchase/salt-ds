// Inspect the actual doorway throat through the ground line. A closed floor
// or a stray threshold seam must fail even when the opening above it is clear.
export async function checkStorefrontDoor(page, records) {
  const selected = ["storefront.svg", "storefront_solid.svg"].map((name) => {
    const r = records.find((r) => r.name === name);
    if (!r) throw Error("Missing " + name);
    return r;
  });
  return page.evaluate(async (selected) => {
    const scale = 128,
      side = 16 * scale,
      results = [],
      failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    for (const { name, svg } of selected)
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const source = svg.replace(
          /stroke-width="([\d.]+)"/g,
          (_, v) => 'stroke-width="' + (Number(v) * weight) / 0.67 + '"',
        );
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        try {
          const im = new Image();
          im.src = url;
          await im.decode();
          ctx.clearRect(0, 0, side, side);
          ctx.drawImage(im, 0, 0, side, side);
          const pixels = ctx.getImageData(0, 0, side, side).data;
          let maximumAlpha = 0;
          for (
            let y = Math.floor(11.8 * scale);
            y < Math.ceil(14.7 * scale);
            y++
          )
            for (
              let x = Math.floor(10.15 * scale);
              x < Math.ceil(10.59 * scale);
              x++
            )
              maximumAlpha = Math.max(
                maximumAlpha,
                pixels[(y * side + x) * 4 + 3],
              );
          const r = {
            name,
            weight,
            feature: "continuous open entrance through ground",
            maximumAlpha,
          };
          results.push(r);
          if (maximumAlpha > 4) failures.push(r);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { results, failures };
  }, selected);
}
