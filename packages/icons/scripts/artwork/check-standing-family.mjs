// Inspect final paint across standalone and combined figures. This checks
// family relationships rather than trusting common source helpers or fits.
export async function checkStandingFamily(page, records) {
  const selected = ["man", "woman", "man-woman"].flatMap((name) =>
    [".svg", "_solid.svg"].map((suffix) => {
      const r = records.find((r) => r.name === name + suffix);
      if (!r) throw Error("Missing standing figure: " + name + suffix);
      return r;
    }),
  );
  return page.evaluate(async (records) => {
    const scale = 64,
      side = 16 * scale,
      results = [],
      failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const report = (r, pass) => {
      results.push(r);
      if (!pass) failures.push(r);
    };
    const render = async (svg, weight, shift = 0, clip = [0, 16]) => {
      const source = svg.replace(
        /stroke-width="([\d.]+)"/g,
        (_, n) => 'stroke-width="' + (Number(n) * weight) / 0.67 + '"',
      );
      const url = URL.createObjectURL(
        new Blob([source], { type: "image/svg+xml" }),
      );
      try {
        const im = new Image();
        im.src = url;
        await im.decode();
        ctx.clearRect(0, 0, side, side);
        ctx.save();
        ctx.translate(shift * scale, 0);
        ctx.beginPath();
        ctx.rect(clip[0] * scale, 0, (clip[1] - clip[0]) * scale, side);
        ctx.clip();
        ctx.drawImage(im, 0, 0, side, side);
        ctx.restore();
        return ctx.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const bounds = (pixels, roi) => {
      let x0 = side,
        y0 = side,
        x1 = -1,
        y1 = -1;
      for (
        let y = Math.ceil(roi[1] * scale);
        y < Math.floor(roi[3] * scale);
        y++
      )
        for (
          let x = Math.ceil(roi[0] * scale);
          x < Math.floor(roi[2] * scale);
          x++
        )
          if (pixels[(y * side + x) * 4 + 3] >= 128) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x + 1);
            y1 = Math.max(y1, y + 1);
          }
      return x1 < 0 ? null : [x0, y0, x1, y1].map((n) => n / scale);
    };
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const figures = [];
      for (const record of records) {
        const pixels = await render(record.svg, weight);
        const combined = record.name.startsWith("man-woman");
        for (const [kind, from, to] of combined
          ? [
              ["man", 0, 8],
              ["woman", 8, 16],
            ]
          : [[record.name.split(/[_.]/)[0], 0, 16]]) {
          const head = bounds(pixels, [from, 0, to, 5]),
            body = bounds(pixels, [from, 5, to, 16]);
          if (!head || !body) {
            report(
              { name: record.name, weight, feature: "complete head and body" },
              false,
            );
            continue;
          }
          const center = (head[0] + head[2]) / 2;
          const aligned = await render(record.svg, weight, 8 - center, [
            from,
            to,
          ]);
          figures.push({
            name: record.name,
            kind,
            solid: record.name.includes("_solid"),
            combined,
            head,
            body,
            center,
            aligned,
          });
        }
      }
      for (const f of figures) {
        const anchor = figures.find((x) => x.name === "woman.svg");
        const delta = Math.max(
          Math.abs(f.head[1] - anchor.head[1]),
          Math.abs(f.head[3] - anchor.head[3]),
          Math.abs(f.head[2] - f.head[0] - (anchor.head[2] - anchor.head[0])),
          Math.abs(f.body[1] - anchor.body[1]),
          Math.abs(f.body[3] - anchor.body[3]),
        );
        report(
          {
            name: f.name,
            kind: f.kind,
            weight,
            feature: "head, shoulder and foot alignment",
            maximumDelta: delta,
          },
          delta <= 2 / scale,
        );
        if (!f.combined) continue;
        const alone = figures.find(
          (x) => !x.combined && x.kind === f.kind && x.solid === f.solid,
        );
        let xor = 0,
          paint = 0;
        for (let y = 0; y < side; y++)
          for (let x = 3 * scale; x < 13 * scale; x++) {
            const a = f.aligned[(y * side + x) * 4 + 3] >= 128,
              b = alone.aligned[(y * side + x) * 4 + 3] >= 128;
            if (a || b) paint++;
            if (a !== b) xor++;
          }
        const mismatch = xor / Math.max(paint, 1);
        report(
          {
            name: f.name,
            kind: f.kind,
            weight,
            feature: "same complete figure after translation",
            mismatch,
          },
          mismatch <= 0.025,
        );
      }
    }
    return { results, failures };
  }, selected);
}
