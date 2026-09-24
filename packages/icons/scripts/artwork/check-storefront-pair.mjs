// Compare the transparent window and door in final paint, not their centers
// alone. The window is identical; the outline doorway is optically narrowed
// within the solid opening while retaining its right jamb and threshold.
export async function checkStorefrontPair(page, records) {
  const pair = ["storefront.svg", "storefront_solid.svg"].map((name) => {
    const r = records.find((r) => r.name === name);
    if (!r) throw Error("Missing storefront variant: " + name);
    return r;
  });
  return page.evaluate(async (pair) => {
    const scale = 64,
      side = 16 * scale,
      results = [],
      failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const hole = (pixels, x, y, doorway = false) => {
      const seed = Math.floor(y * scale) * side + Math.floor(x * scale);
      const seen = new Set(),
        queue = [seed];
      for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        if (
          seen.has(p) ||
          p < 0 ||
          p >= side * side ||
          pixels[p * 4 + 3] >= 128
        )
          continue;
        // The doorway now opens through the baseline. Compare its complete
        // interior above that mouth; the separate open-threshold check covers the exit.
        if (
          doorway &&
          (p % side < 8.8 * scale ||
            p % side > 12.3 * scale ||
            Math.floor(p / side) < 9 * scale ||
            Math.floor(p / side) > 13.7 * scale)
        )
          continue;
        seen.add(p);
        if (seen.size > (side * side) / 10) return null; // Leaked into the background.
        const col = p % side;
        if (col > 0) queue.push(p - 1);
        if (col < side - 1) queue.push(p + 1);
        if (p >= side) queue.push(p - side);
        if (p < side * (side - 1)) queue.push(p + side);
      }
      return seen;
    };
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = [];
      for (const { svg } of pair) {
        const source = svg.replace(
          /stroke-width="([\d.]+)"/g,
          (_, n) => 'stroke-width="' + (Number(n) * weight) / 0.67 + '"',
        );
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          ctx.clearRect(0, 0, side, side);
          ctx.drawImage(image, 0, 0, side, side);
          paint.push(ctx.getImageData(0, 0, side, side).data);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      for (const [feature, x, y] of [
        ["window aperture", 5.9, 10.9],
        ["door aperture", 10.8, 11.5],
      ]) {
        const a = hole(paint[0], x, y, feature === "door aperture"),
          b = hole(paint[1], x, y, feature === "door aperture");
        const difference =
          a && b
            ? [...a].filter((p) => !b.has(p)).length +
              [...b].filter((p) => !a.has(p)).length
            : Infinity;
        const mismatch = a && b ? difference / Math.max(a.size, b.size, 1) : 1;
        const result = {
          name: "storefront",
          feature,
          weight,
          mismatch,
          outlinePixels: a?.size ?? 0,
          solidPixels: b?.size ?? 0,
        };
        results.push(result);
        if (feature === "window aperture") {
          if (!a?.size || !b?.size || mismatch > 0.005) failures.push(result);
        } else {
          const outside = a && b ? [...a].filter((p) => !b.has(p)).length / Math.max(a.size, 1) : 1;
          const ratio = (a?.size ?? 0) / Math.max(b?.size ?? 0, 1);
          result.outlineOutsideSolid = outside;
          result.outlineToSolidArea = ratio;
          if (!a?.size || !b?.size || outside > 0.005 || ratio < 0.5 || ratio > 0.85) failures.push(result);
        }
      }
      for (const y of [10, 11, 12, 13.5]) {
        const extents = paint.map((p) => {
          const xs = [];
          for (let x = 0; x < side; x++)
            if (p[(Math.floor(y * scale) * side + x) * 4 + 3] >= 128)
              xs.push(x);
          return [xs[0], xs.at(-1)];
        });
        const result = {
          name: "storefront",
          feature: "shared wall/ground silhouette",
          weight,
          y,
          extents,
        };
        results.push(result);
        if (
          extents[0].some(
            (v, i) =>
              !Number.isFinite(v) ||
              !Number.isFinite(extents[1][i]) ||
              Math.abs(v - extents[1][i]) > 1,
          )
        )
          failures.push(result);
      }
    }
    return { results, failures };
  }, pair);
}
