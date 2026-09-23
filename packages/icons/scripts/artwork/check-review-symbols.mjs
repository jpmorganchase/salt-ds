// Inspect the painted silhouettes in final exports. These checks protect the
// sun's visible ray lengths and retained pair perimeters, rather than locking
// the recipe to particular path commands or constructor coordinates.
export async function checkReviewSymbols(page, records) {
  const names = [
    "globe.svg",
    "globe_solid.svg",
    "light.svg",
    "light_solid.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing reviewed symbol: ${name}`);
    return record;
  });
  return page.evaluate(async (artwork) => {
    const results = [];
    const failures = [];
    const check = (details, pass) => {
      results.push(details);
      if (!pass) failures.push(details);
    };
    const scale = 96;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const render = async (svg, weight) => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      for (const element of doc.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
        if (Number.isFinite(width))
          element.setAttribute("stroke-width", String((width * weight) / 0.67));
      }
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        }),
      );
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
      return context.getImageData(0, 0, size, size).data;
    };
    const alpha = (pixels, x, y) => {
      const px = x * scale - 0.5;
      const py = y * scale - 0.5;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      const fx = px - ix;
      const fy = py - iy;
      const a = (dx, dy) => {
        const x = ix + dx;
        const y = iy + dy;
        return x < 0 || y < 0 || x >= size || y >= size
          ? 0
          : pixels[(y * size + x) * 4 + 3];
      };
      return (
        a(0, 0) * (1 - fx) * (1 - fy) +
        a(1, 0) * fx * (1 - fy) +
        a(0, 1) * (1 - fx) * fy +
        a(1, 1) * fx * fy
      );
    };
    // Measure from the shared centered canvas toward the outside. The last
    // threshold crossing is the actual outer paint, regardless of interior fill.
    const outsideRadius = (pixels, angle) => {
      const at = (r) =>
        alpha(pixels, 8 + Math.cos(angle) * r, 8 + Math.sin(angle) * r);
      let last = null;
      const step = 1 / scale;
      for (let r = step; r <= Math.SQRT2 * 8 + step; r += step) {
        if (at(r) >= 127.5) last = r;
      }
      if (last === null) return null;
      let lo = last;
      let hi = last + step;
      for (let i = 0; i < 14; i++) {
        const middle = (lo + hi) / 2;
        if (at(middle) >= 127.5) lo = middle;
        else hi = middle;
      }
      return (lo + hi) / 2;
    };
    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      const paint = new Map();
      for (const { name, svg } of artwork)
        paint.set(name, await render(svg, weight));
      for (const base of ["globe", "light"]) {
        const angles = Array.from(
          { length: 128 },
          (_, i) => (i * Math.PI) / 64,
        );
        const outline = angles.map((angle) =>
          outsideRadius(paint.get(`${base}.svg`), angle),
        );
        const solid = angles.map((angle) =>
          outsideRadius(paint.get(`${base}_solid.svg`), angle),
        );
        const difference = Math.max(
          ...outline.map((r, i) => Math.abs(r - solid[i])),
        );
        check(
          {
            name: `${base}_solid.svg`,
            feature: "retained outer painted perimeter",
            weight,
            maximumDifference: difference,
            limit: 0.025,
          },
          outline.every(Number.isFinite) &&
            solid.every(Number.isFinite) &&
            difference <= 0.025,
        );
      }
      for (const name of ["light.svg", "light_solid.svg"]) {
        const pixels = paint.get(name);
        const rays = Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4;
          const tip = outsideRadius(pixels, angle);
          const body =
            (outsideRadius(pixels, angle - Math.PI / 8) +
              outsideRadius(pixels, angle + Math.PI / 8)) /
            2;
          return { angle, tip, body, extension: tip - body };
        });
        const minimum = Math.min(...rays.map((ray) => ray.extension));
        const spread = Math.max(...rays.map((ray) => ray.extension)) - minimum;
        check(
          {
            name,
            feature: "eight rays extend clearly beyond the circular field",
            weight,
            minimumExtension: minimum,
            minimumRequired: 2.5,
            spread,
            maximumSpread: 0.04,
            rays,
          },
          rays.every((ray) => Number.isFinite(ray.extension)) &&
            minimum >= 2.5 &&
            spread <= 0.04,
        );
      }
    }
    return { results, failures };
  }, artwork);
}
