// Complete painted output guards for the dashboard, pencil pair and compact
// arrow repairs. Counts and probes describe visible outcomes, not path order.
export async function checkDetailRecognition(page, records, transforms) {
  const samples = [];
  for (const name of [
    "dashboard.svg",
    "dashboard_solid.svg",
    "edit.svg",
    "edit_solid.svg",
  ])
    samples.push({ name, topology: true });
  for (const [name, tip, direction, arm, radius] of [
    ["cloud-upload", [8, 7.25], [0, 1], 2.25 * Math.SQRT2, 0.82],
    ["cloud-download", [8, 14.75], [0, -1], 2 * Math.SQRT2, 0.78],
    ["cloud-sync", [5.5, 9], [1, 0], 1.75 * Math.SQRT2, 0.74],
    ["cloud-sync", [10.5, 13.5], [-1, 0], 1.75 * Math.SQRT2, 0.74],
  ])
    for (const suffix of [".svg", "_solid.svg"])
      samples.push({
        name: name + suffix,
        tip,
        direction,
        arm,
        radius,
        ratio: 0.8,
        constructionScale: 1,
      });
  for (const operation of ["open", "close"])
    for (const [side, degrees] of [
      ["left", 0],
      ["top", 90],
      ["right", 180],
      ["bottom", 270],
    ])
      for (const suffix of [".svg", "_solid.svg"]) {
        const angle = (degrees * Math.PI) / 180;
        const rotate = ([x, y]) => [
          x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle),
        ];
        const p = rotate([operation === "open" ? 6 : -0.5, 0]);
        samples.push({
          name: `panel-${operation}-${side}${suffix}`,
          tip: p.map((n) => n + 12),
          direction: rotate([operation === "open" ? -1 : 1, 0]),
          arm: 3.5 * Math.SQRT2,
          radius: 1.25,
          ratio: 1,
          constructionScale: 2 / 3,
        });
      }
  const artwork = samples.map((sample) => ({
    ...sample,
    svg: records.find((r) => r.name === sample.name).svg,
    frame: transforms[sample.name],
  }));
  return page.evaluate(async (artwork) => {
    const ppu = 96,
      side = 16 * ppu,
      canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }),
      results = [],
      failures = [];
    const record = (r) => {
      results.push(r);
      if (!r.pass) failures.push(r);
    };
    const pairBounds = new Map();
    function components(pixels, painted = true) {
      const seen = new Uint8Array(side * side),
        queue = new Int32Array(side * side);
      let count = 0;
      for (let i = 0; i < seen.length; i++) {
        if (seen[i] || pixels[4 * i + 3] >= 128 !== painted) continue;
        let head = 0,
          tail = 1;
        queue[0] = i;
        seen[i] = 1;
        while (head < tail) {
          const at = queue[head++],
            x = at % side;
          for (const n of [
            x ? at - 1 : -1,
            x + 1 < side ? at + 1 : -1,
            at - side,
            at + side,
          ])
            if (
              n >= 0 &&
              n < seen.length &&
              !seen[n] &&
              pixels[4 * n + 3] >= 128 === painted
            ) {
              seen[n] = 1;
              queue[tail++] = n;
            }
        }
        if (tail >= 8) count++;
      }
      return count;
    }
    for (const item of artwork)
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const doc = new DOMParser().parseFromString(item.svg, "image/svg+xml"),
          root = doc.documentElement;
        root.setAttribute("width", side);
        root.setAttribute("height", side);
        for (const el of [root, ...root.querySelectorAll("[stroke-width]")])
          if (el.hasAttribute("stroke-width"))
            el.setAttribute(
              "stroke-width",
              (+el.getAttribute("stroke-width") * weight) / 0.67,
            );
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(doc)], {
            type: "image/svg+xml",
          }),
        );
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        ctx.clearRect(0, 0, side, side);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const pixels = ctx.getImageData(0, 0, side, side).data;
        if (item.topology) {
        if (item.name === "dashboard.svg") {
          // Read the complete painted top tick across its middle. It must
          // retain primary weight; separation alone cannot approve a weak tick.
          const {scale, translateX, translateY} = item.frame;
          const cx = 8 * scale + translateX, cy = 5 * scale + translateY;
          let painted = 0;
          for (let x = cx - 1; x <= cx + 1; x += 1 / ppu)
            if (pixels[(Math.floor(cy * ppu) * side + Math.floor(x * ppu)) * 4 + 3] >= 128) painted++;
          const measured = painted / ppu;
          record({name:item.name, weight, feature:"primary-weight gauge ticks", measured, expected:weight, pass:Math.abs(measured-weight)<.025});
        }

          const solid = item.name.includes("_solid");
          const expected = item.name.startsWith("edit") ? 1 : solid ? 2 : 6;
          const count = components(pixels);
          record({
            name: item.name,
            weight,
            feature: "separate painted parts",
            expected,
            actual: count,
            pass: count === expected,
          });
          if (item.name === "dashboard_solid.svg") {
            const holes = components(pixels, false) - 1;
            record({
              name: item.name,
              weight,
              feature: "four ticks and one needle opening",
              expected: 5,
              actual: holes,
              pass: holes === 5,
            });
          }
          let bounds = [side, side, 0, 0];
          for (let i = 0; i < side * side; i++)
            if (pixels[4 * i + 3] >= 128) {
              const x = i % side,
                y = Math.floor(i / side);
              bounds = [
                Math.min(bounds[0], x),
                Math.min(bounds[1], y),
                Math.max(bounds[2], x),
                Math.max(bounds[3], y),
              ];
            }
          const key = item.name.replace("_solid", "") + weight;
          if (!solid) pairBounds.set(key, bounds);
          else {
            const drift =
              Math.max(
                ...bounds.map((v, i) => Math.abs(v - pairBounds.get(key)[i])),
              ) / ppu;
            record({
              name: item.name,
              weight,
              feature: "retained pair silhouette bounds",
              drift,
              pass: drift <= 0.025,
            });
          }
          continue;
        }
        const { scale, translateX, translateY } = item.frame,
          s = scale * item.constructionScale;
        const tip = [
            item.tip[0] * s + translateX,
            item.tip[1] * s + translateY,
          ],
          w = weight * item.ratio;
        const alpha = (p) =>
          pixels[
            (Math.floor(p[1] * ppu) * side + Math.floor(p[0] * ppu)) * 4 + 3
          ] / 255;
        const [dx, dy] = item.direction;
        for (const sign of [-1, 1]) {
          const arm = [
            (dx - sign * dy) / Math.SQRT2,
            (dy + sign * dx) / Math.SQRT2,
          ];
          const inward = [
            (dx - arm[0] / Math.SQRT2) * Math.SQRT2,
            (dy - arm[1] / Math.SQRT2) * Math.SQRT2,
          ];
          const p = tip.map(
            (v, i) =>
              v + arm[i] * item.arm * 0.7 * s + inward[i] * (w / 2 + 0.045),
          );
          record({
            name: item.name,
            weight,
            feature: `straight head arm ${sign}`,
            alpha: alpha(p),
            pass: alpha(p) < 0.25,
          });
          const length = Math.hypot(dx + arm[0], dy + arm[1]),
            bisector = [(dx + arm[0]) / length, (dy + arm[1]) / length];
          const bare = w / (2 * Math.sin(Math.PI / 8)),
            weld = item.radius * s * (1 / Math.sin(Math.PI / 8) - 1) + w / 2;
          const exposed = weld - bare;
          const q = tip.map((v, i) => v + bisector[i] * (bare + exposed * 0.5));
          record({
            name: item.name,
            weight,
            feature: `visible inner weld ${sign}`,
            exposed,
            alpha: alpha(q),
            pass: exposed > 0.025 && alpha(q) > 0.6,
          });
        }
      }
    return { results, failures };
  }, artwork);
}
