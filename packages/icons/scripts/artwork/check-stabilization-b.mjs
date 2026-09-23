// Stabilization regressions use the final 16-unit exports. They protect the
// reported retained landmarks and open silhouettes, not recipe string syntax.
export async function checkStabilizationB(page, records) {
  const bases = ["inbox", "import", "export", "hidden", "hierarchy"];
  const artwork = bases.flatMap((base) =>
    ["", "_solid"].map((variant) => {
      const name = `${base}${variant}.svg`;
      const record = records.find((candidate) => candidate.name === name);
      if (!record) throw new Error(`Missing stabilization artwork: ${name}`);
      return { name, svg: record.svg };
    }),
  );
  return page.evaluate(async (artwork) => {
    const results = [];
    const failures = [];
    const check = (result) => {
      results.push(result);
      if (!result.pass) failures.push(result);
    };
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-10000px;top:0;color:black";
    document.body.append(host);
    // These are reviewed native-canvas anchors from the unchanged outline.
    // Sampling several points along each feature catches movement or a changed
    // gesture even when its whole-icon bounds still pass framing validation.
    const landmarks = {
      inbox: {
        feature: "retained downward arrow",
        points: [
          [8, 0.25],
          [8, 5.5],
          [8, 8.85417],
          [4.3125, 5.16667],
          [11.6875, 5.16667],
        ],
      },
      import: {
        feature: "retained positive entry arrow and open receiving bracket",
        points: [
          [0.30682, 8],
          [10.48864, 8],
          [6.67045, 4.18182],
          [6.67045, 11.81818],
          [6.03409, 1],
          [14.94318, 8],
          [6.03409, 15],
        ],
      },
      export: {
        feature: "retained positive exit arrow and open departure bracket",
        points: [
          [3.85807, 8],
          [14.71875, 8],
          [10.71745, 3.9987],
          [10.71745, 12.0013],
          [5.0013, 1.71224],
          [1, 8],
          [5.0013, 14.28776],
        ],
      },
      hidden: {
        feature: "retained disabled slash endpoints and center",
        points: [
          [1.41796, 1.54177],
          [7.87619, 8],
          [14.33442, 14.45823],
        ],
      },
      hierarchy: {
        feature: "retained trunk, lower elbow and child connections",
        points: [
          [3.52, 6.6],
          [3.52, 10.52],
          [3.52, 13.32],
          [8.56, 7.72],
          [8.56, 13.32],
        ],
      },
    };
    const boundaries = {};
    const samplesFor = (paths) =>
      paths.flatMap((path) => {
        const length = path.getTotalLength();
        const count = Math.max(1, Math.ceil(length / 0.00625));
        return Array.from({ length: count + 1 }, (_, index) => {
          const point = path.getPointAtLength((length * index) / count);
          return [point.x, point.y];
        });
      });
    const nearestDistance = (point, samples) => {
      let distance = Number.POSITIVE_INFINITY;
      for (const sample of samples)
        distance = Math.min(
          distance,
          Math.hypot(sample[0] - point[0], sample[1] - point[1]),
        );
      return distance;
    };
    try {
      for (const { name, svg } of artwork) {
        const base = name.replace(/_solid\.svg$|\.svg$/g, "");
        host.innerHTML = svg;
        const paths = [...host.querySelectorAll("path")];
        const strokes = paths.filter(
          (path) => getComputedStyle(path).stroke !== "none",
        );
        const samples = samplesFor(strokes);
        const distances = landmarks[base].points.map((point) => ({
          point,
          distance: nearestDistance(point, samples),
        }));
        const maximumDistance = Math.max(
          ...distances.map((sample) => sample.distance),
        );
        check({
          name,
          feature: landmarks[base].feature,
          coordinateSpace: "final-16-unit-canvas",
          distances,
          maximumDistance,
          tolerance: 0.025,
          pass: maximumDistance <= 0.025,
        });
        if (base === "hidden") {
          const diagonal = strokes.find((path) => {
            const bounds = path.getBBox();
            return (
              bounds.width > 10 &&
              bounds.height > 10 &&
              Math.abs(bounds.width - bounds.height) < 0.025
            );
          });
          const slashBounds = diagonal?.getBBox();
          const expectedBounds = [1.41796, 1.54177, 14.33442, 14.45823];
          const measuredBounds = slashBounds
            ? [
                slashBounds.x,
                slashBounds.y,
                slashBounds.x + slashBounds.width,
                slashBounds.y + slashBounds.height,
              ]
            : [];
          const maximumEndpointMovement = measuredBounds.length
            ? Math.max(
                ...measuredBounds.map((value, axis) =>
                  Math.abs(value - expectedBounds[axis]),
                ),
              )
            : Number.POSITIVE_INFINITY;
          check({
            name,
            feature: "unchanged slash extent and anchors",
            coordinateSpace: "final-16-unit-canvas",
            expectedBounds,
            measuredBounds,
            maximumEndpointMovement,
            tolerance: 0.025,
            pass: maximumEndpointMovement <= 0.025,
          });
          // The shared pupil is a compact filled contour; the filled eyelids
          // span almost the whole eye. Compare both directions so missing or
          // enlarged pupil fragments cannot pass through incidental overlap.
          const pupils = paths.filter((path) => {
            const bounds = path.getBBox();
            return (
              getComputedStyle(path).fill !== "none" &&
              bounds.x >= 5 && bounds.y >= 5 &&
              bounds.x + bounds.width <= 11 &&
              bounds.y + bounds.height <= 11
            );
          });
          boundaries[name] = samplesFor(pupils);
        }
      }
      const outlinePupil = boundaries["hidden.svg"];
      const solidPupil = boundaries["hidden_solid.svg"];
      let pupilDistance = Number.POSITIVE_INFINITY;
      if (outlinePupil.length && solidPupil.length)
        pupilDistance = Math.max(
          ...outlinePupil.map((point) => nearestDistance(point, solidPupil)),
          ...solidPupil.map((point) => nearestDistance(point, outlinePupil)),
        );
      check({
        name: "hidden_solid.svg",
        feature: "identical retained pupil fragments",
        coordinateSpace: "final-16-unit-canvas",
        maximumDistance: pupilDistance,
        tolerance: 0.025,
        pass: pupilDistance <= 0.025,
      });

      const pixelsPerUnit = 64;
      const side = 16 * pixelsPerUnit;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const paint = {};
        for (const { name, svg } of artwork.filter((record) =>
          /^(inbox|import|export)/.test(record.name),
        )) {
          const xml = new DOMParser().parseFromString(svg, "image/svg+xml");
          const root = xml.documentElement;
          root.setAttribute("width", side);
          root.setAttribute("height", side);
          root.setAttribute("style", "color:black");
          for (const element of [
            root,
            ...root.querySelectorAll("[stroke-width]"),
          ])
            if (element.hasAttribute("stroke-width"))
              element.setAttribute(
                "stroke-width",
                (Number(element.getAttribute("stroke-width")) * weight) / 0.67,
              );
          const url = URL.createObjectURL(
            new Blob([new XMLSerializer().serializeToString(xml)], {
              type: "image/svg+xml",
            }),
          );
          try {
            const image = new Image();
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
              image.src = url;
            });
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            paint[name] = context.getImageData(0, 0, side, side).data;
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        const rowEdges = (pixels, y) => {
          const row = Math.floor(y * pixelsPerUnit);
          let first = side;
          let last = 0;
          for (let x = 0; x < side; x++)
            if (pixels[(row * side + x) * 4 + 3] >= 128) {
              first = Math.min(first, x);
              last = Math.max(last, x + 1);
            }
          return [first / pixelsPerUnit, last / pixelsPerUnit];
        };
        for (const name of ["inbox.svg", "inbox_solid.svg"]) {
          // Cross-sections above the tray shoulder and in its lower body must
          // share the same exterior edges. The former short-stroke/fill join
          // differed by half the configured width at both sides.
          const upper = rowEdges(paint[name], 7);
          const lower = rowEdges(paint[name], 13.5);
          const maximumStep = Math.max(
            ...upper.map((edge, axis) => Math.abs(edge - lower[axis])),
          );
          check({
            name,
            feature: "continuous tray exterior at the shoulder",
            coordinateSpace: "final-16-unit-canvas",
            weight,
            upper,
            lower,
            maximumStep,
            tolerance: 1 / pixelsPerUnit,
            pass: maximumStep <= 1 / pixelsPerUnit,
          });
        }
        for (const base of ["import", "export"]) {
          // Empty space beyond the bracket opening is part of the meaning.
          // A full square backplate fails even if inverse line positions match.
          const region =
            base === "import" ? [0.75, 1.25, 4.5, 4.5] : [8, 1.25, 14, 3.5];
          for (const variant of ["", "_solid"]) {
            const name = `${base}${variant}.svg`;
            const pixels = paint[name];
            let area = 0;
            for (
              let y = Math.round(region[1] * pixelsPerUnit);
              y < Math.round(region[3] * pixelsPerUnit);
              y++
            )
              for (
                let x = Math.round(region[0] * pixelsPerUnit);
                x < Math.round(region[2] * pixelsPerUnit);
                x++
              )
                area +=
                  pixels[(y * side + x) * 4 + 3] /
                  255 /
                  (pixelsPerUnit * pixelsPerUnit);
            check({
              name,
              feature: "open exterior without a square backplate",
              coordinateSpace: "final-16-unit-canvas",
              weight,
              region,
              paintedArea: area,
              maximumArea: 0.02,
              pass: area <= 0.02,
            });
          }
        }
      }
    } finally {
      host.remove();
    }
    return { results, failures };
  }, artwork);
}
