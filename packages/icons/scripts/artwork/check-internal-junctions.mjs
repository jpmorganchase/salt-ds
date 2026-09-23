// Guard a few reviewed exposed transitions on the final fitted geometry.
// These windows select visible relationships, not path indices or commands.
// A curve whose local radius is swallowed by half the themed stroke is not
// an exposed weld. Complete raster paint also has to end at that boundary.
export async function checkInternalJunctions(page, records) {
  const paired = (base, features) =>
    [".svg", "_solid.svg"].map((suffix) => ({
      name: base + suffix,
      features,
    }));
  const requests = [
    ...paired("call", [
      {
        feature: "upper receiver inner root",
        box: [4.2, 6.45, 4.95, 8.12],
        minimumRadius: 0.25,
      },
      {
        feature: "lower receiver inner root",
        box: [7.87, 10.98, 9.54, 11.84],
        minimumRadius: 0.25,
      },
    ]),
    ...paired("pin", [
      {
        feature: "upper head to neck root",
        box: [8.54, 3.15, 9.23, 4.65],
        minimumRadius: 0.2,
      },
      {
        feature: "right head to neck root",
        box: [11.35, 6.8, 12.84, 7.48],
        minimumRadius: 0.2,
      },
      {
        feature: "upper flange to neck root",
        box: [5.14, 7.32, 5.96, 7.77],
        minimumRadius: 0.3,
      },
      {
        feature: "right flange to neck root",
        box: [8.23, 10.05, 8.69, 10.86],
        minimumRadius: 0.3,
      },
    ]),
    // A continuous ground rail has roots on its interior-facing sides too.
    // The solid building masses hide these four sectors, so guard the outline.
    {
      name: "buildings.svg",
      features: [
        {
          feature: "tall building left inner foot",
          box: [1.06, 13.9, 2.12, 14.94],
          minimumRadius: 0.3,
        },
        {
          feature: "tall building right inner foot",
          box: [7.98, 13.9, 9.02, 14.94],
          minimumRadius: 0.3,
        },
        {
          feature: "short building left inner foot",
          box: [11.29, 13.9, 12.39, 14.94],
          minimumRadius: 0.3,
        },
        {
          feature: "short building right inner foot",
          box: [13.9, 13.9, 14.94, 14.94],
          minimumRadius: 0.3,
        },
      ],
    },
    ...paired("building", [
      {
        feature: "left doorway header opening",
        box: [6.43, 11.82, 7.48, 12.86],
        minimumRadius: 0.25,
      },
      {
        feature: "right doorway header opening",
        box: [8.52, 11.82, 9.56, 12.86],
        minimumRadius: 0.25,
      },
    ]),
    ...paired("battery", [
      {
        feature: "left recessed terminal shoulder",
        box: [4.73, 1.52, 5.8, 2.57],
        minimumRadius: 0.25,
      },
      {
        feature: "right recessed terminal shoulder",
        box: [10.2, 1.52, 11.25, 2.57],
        minimumRadius: 0.25,
      },
    ]),
    ...["chat", "chatting", "commentary"].flatMap((base) =>
      paired(base, [
        {
          feature: "left tail attachment",
          box: [1.26, 11.35, 2.23, 12.31],
          minimumRadius: 0.16,
        },
      ]),
    ),
    ...paired("chat-group", [
      {
        feature: "foreground left tail attachment",
        box: [1.12, 11.4, 2.025, 12.3],
        minimumRadius: 0.16,
      },
    ]),
    ...paired("settings", [
      { feature: "left gear valley", box: [2, 7, 3.8, 9], minimumRadius: 0.2 },
      {
        feature: "right gear valley",
        box: [12.2, 7, 14, 9],
        minimumRadius: 0.2,
      },
    ]),
    ...paired("thumbs-up", [
      { feature: "thumb web", box: [9.2, 4.5, 11.5, 6.5], minimumRadius: 0.2 },
    ]),
    ...paired("thumbs-down", [
      { feature: "thumb web", box: [4.5, 9.5, 6.8, 11.5], minimumRadius: 0.2 },
    ]),
    ...paired("print", [
      {
        feature: "upper sheet left root",
        box: [3.52, 4.71, 4.65, 5.97],
        minimumRadius: 0.15,
      },
    ]),
    ...paired("type", [
      {
        feature: "upper-left handle to top rail",
        box: [3.18, 2.1, 4.06, 2.99],
        minimumRadius: 0.12,
      },
    ]),
    {
      name: "grid.svg",
      features: [
        {
          feature: "upper-left tile inner corner",
          box: [1.07, 1.07, 2.2, 2.2],
          minimumRadius: 0.2,
        },
      ],
    },
    ...paired("storage", [
      {
        feature: "left lid to body exterior root",
        box: [1.12, 5.34, 2.04, 6.24],
        minimumRadius: 0.12,
      },
    ]),
  ];
  const selected = requests.map((request) => {
    const record = records.find(({ name }) => name === request.name);
    if (!record)
      throw new Error(`Missing internal-junction artwork: ${request.name}`);
    return { ...request, svg: record.svg };
  });
  return page.evaluate(async (selected) => {
    const weight = 1.5;
    const scale = 128,
      side = 16 * scale;
    const results = [],
      failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const render = async (doc) => {
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        }),
      );
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        context.clearRect(0, 0, side, side);
        context.drawImage(image, 0, 0, side, side);
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const inside = (p, box) =>
      p.x > box[0] && p.y > box[1] && p.x < box[2] && p.y < box[3];
    const circle = (a, b, c) => {
      // Circumcircle from three actual SVG path samples. A straight member
      // has no finite curvature and must not masquerade as a curved join.
      const ax = a.x - b.x,
        ay = a.y - b.y;
      const cx = c.x - b.x,
        cy = c.y - b.y;
      const determinant = 2 * (ax * cy - ay * cx);
      if (Math.abs(determinant) < 0.0000001) return null;
      const aa = ax * ax + ay * ay,
        cc = cx * cx + cy * cy;
      const x = (aa * cy - cc * ay) / determinant;
      const y = (ax * cc - cx * aa) / determinant;
      const radius = Math.hypot(x, y);
      return radius < 5 ? { radius, normal: [x / radius, y / radius] } : null;
    };
    for (const { name, svg, features } of selected) {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      for (const node of doc.querySelectorAll("[stroke-width]"))
        node.setAttribute(
          "stroke-width",
          String((Number(node.getAttribute("stroke-width")) * weight) / 0.67),
        );
      const pixels = await render(doc);
      const painted = (x, y) => {
        const px = Math.floor(x * scale),
          py = Math.floor(y * scale);
        return (
          px >= 0 &&
          py >= 0 &&
          px < side &&
          py < side &&
          pixels[(py * side + px) * 4 + 3] >= 128
        );
      };
      const host = document.createElement("div");
      host.style.cssText =
        "position:absolute;left:-10000px;top:0;visibility:hidden";
      host.append(document.importNode(doc.documentElement, true));
      document.body.append(host);
      try {
        const allPaths = [...host.querySelectorAll("path")];
        const strokes = allPaths.filter(
          (path) => getComputedStyle(path).stroke !== "none",
        );
        // Filled-only contours (the solid thumbs) have no stroke offset.
        // Where a rim is retained, its centerline owns the exposed boundary;
        // triangular weld-fill patches must not affect curvature measurement.
        const paths = strokes.length ? strokes : allPaths;
        for (const { feature, box, minimumRadius } of features) {
          const radii = [];
          let exposedSamples = 0;
          for (const path of paths) {
            const style = getComputedStyle(path);
            const halfStroke =
              style.stroke === "none"
                ? 0
                : Number.parseFloat(style.strokeWidth) / 2;
            const length = path.getTotalLength();
            // The 0.12-unit chord half-length is long enough to suppress SVG
            // path sampling noise yet shorter than the accepted local radii.
            for (let at = 0.12; at < length - 0.12; at += 0.03) {
              const b = path.getPointAtLength(at);
              if (!inside(b, box)) continue;
              const a = path.getPointAtLength(at - 0.12),
                c = path.getPointAtLength(at + 0.12);
              if (!inside(a, box) || !inside(c, box)) continue;
              const fit = circle(a, b, c);
              if (!fit) continue;
              const visibleRadius = fit.radius - halfStroke;
              radii.push(visibleRadius);
              const [nx, ny] = fit.normal;
              // Verify that the candidate concave boundary is really exposed
              // in the union of all final paint, rather than hidden by a fill
              // or another stroke. Two pixels of tolerance avoid AA noise.
              if (
                painted(
                  b.x + nx * (halfStroke - 0.03),
                  b.y + ny * (halfStroke - 0.03),
                ) &&
                !painted(
                  b.x + nx * (halfStroke + 0.04),
                  b.y + ny * (halfStroke + 0.04),
                )
              )
                exposedSamples++;
            }
          }
          radii.sort((a, b) => a - b);
          // A lower quantile rejects a partly submerged transition while
          // tolerating isolated numerical noise at path/line tangencies.
          const exposedRadius = radii.length
            ? radii[Math.floor(radii.length * 0.2)]
            : null;
          const result = {
            name,
            feature,
            weight,
            curveSamples: radii.length,
            exposedSamples,
            exposedRadius,
            minimumRadius,
            minimumSamples: 5,
          };
          results.push(result);
          if (
            radii.length < 5 ||
            exposedSamples < 5 ||
            exposedRadius < minimumRadius
          )
            failures.push(result);
        }
      } finally {
        host.remove();
      }
    }
    return { results, failures };
  }, selected);
}
