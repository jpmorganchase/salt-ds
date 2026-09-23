// Retained landmarks are compared in the complete fitted exports. A separate
// fit of a filled cloud can preserve its bounds while moving the foreground
// action; check both the painted frame and every sampled action anchor.
export async function checkCloudPairs(page, records) {
  const names = [
    "cloud",
    "cloud-upload",
    "cloud-download",
    "cloud-sync",
    "cloud-disabled",
    "cloud-success",
  ];
  const artwork = names.map((name) => ({
    name,
    pair: [name + ".svg", name + "_solid.svg"].map((file) => {
      const record = records.find((entry) => entry.name === file);
      if (!record) throw new Error(`Missing cloud pair artwork: ${file}`);
      return record.svg;
    }),
  }));
  return page.evaluate(async (artwork) => {
    const ppu = 64,
      side = 16 * ppu;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const results = [],
      failures = [];
    const record = (result) => {
      results.push(result);
      if (!result.pass) failures.push(result);
    };
    for (const { name, pair } of artwork) {
      const bounds = [];
      for (const svg of pair) {
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml"),
          root = doc.documentElement;
        root.setAttribute("width", side);
        root.setAttribute("height", side);
        for (const el of [root, ...root.querySelectorAll("[stroke-width]")])
          if (el.hasAttribute("stroke-width"))
            el.setAttribute(
              "stroke-width",
              (+el.getAttribute("stroke-width") * 1.5) / 0.67,
            );
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(doc)], {
            type: "image/svg+xml",
          }),
        );
        try {
          const im = new Image();
          await new Promise((resolve, reject) => {
            im.onload = resolve;
            im.onerror = reject;
            im.src = url;
          });
          ctx.clearRect(0, 0, side, side);
          ctx.drawImage(im, 0, 0);
          const pixels = ctx.getImageData(0, 0, side, side).data;
          let loX = side,
            loY = side,
            hiX = 0,
            hiY = 0;
          for (let y = 0; y < side; y++)
            for (let x = 0; x < side; x++)
              if (pixels[(y * side + x) * 4 + 3] >= 128) {
                loX = Math.min(loX, x);
                loY = Math.min(loY, y);
                hiX = Math.max(hiX, x + 1);
                hiY = Math.max(hiY, y + 1);
              }
          bounds.push([loX, loY, hiX, hiY].map((v) => v / ppu));
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const boundDrift = Math.max(
        ...bounds[0].map((v, i) => Math.abs(v - bounds[1][i])),
      );
      record({
        name,
        check: "complete-painted-pair-frame",
        weight: 1.5,
        bounds,
        maximumDrift: boundDrift,
        tolerance: 0.045,
        pass: boundDrift <= 0.045,
      });
      if (name === "cloud") continue;
      const paths = pair.map((svg) => {
        const root = new DOMParser().parseFromString(
          svg,
          "image/svg+xml",
        ).documentElement;
        const paths = [...root.querySelectorAll("path")];
        return paths.at(-1);
      });
      const drift = [];
      for (let i = 0; i <= 32; i++) {
        const points = paths.map((path) =>
          path.getPointAtLength((path.getTotalLength() * i) / 32),
        );
        drift.push(
          Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
        );
      }
      const maximumDrift = Math.max(...drift);
      record({
        name,
        check: "retained-action-anchors",
        samples: 33,
        maximumDrift,
        tolerance: 0.002,
        pass: maximumDrift <= 0.002,
      });
    }
    return { results, failures };
  }, artwork);
}
