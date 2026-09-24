// Inspect the complete final export, including retained borders and overlays.
// These rays cross a single painted boundary in fitted 16-unit coordinates;
// they are deliberately away from unrelated foreground paint at every width.
export async function checkCutoutContours(page, records) {
  const cases = [
    {
      name: "cloud-sync_solid.svg",
      // The upper arrow's two diagonal offsets are measured from its final
      // centerlines, independently of the subtracted SVG contour. Midpoint
      // secondary arrow paint is .8 * 7/6 wide, with a 0.75-unit normal clearance.
      probes: [
        ...[7.45, 7.65, 7.85, 8.05].map((y) => ({
          feature: `upper diagonal at y${y}`,
          y,
          expectedX:
            14.1 * 1.023191 -
            0.185529 +
            0.538091 -
            Math.SQRT2 * ((0.8 * 7) / 12 + 0.75) -
            y,
        })),
        ...[10.3, 10.55, 10.8].map((y) => ({
          feature: `lower diagonal at y${y}`,
          y,
          expectedX:
            y -
            (3.1 * 1.023191 +
              0.538091 +
              0.185529 +
              Math.SQRT2 * ((0.8 * 7) / 12 + 0.75)),
        })),
      ].map(({ feature, y, expectedX }) => ({
        feature,
        origin: [3.7, y],
        direction: [1, 0],
        length: expectedX - 3.7 + 0.3,
        transition: "exit",
        expectedDistance: expectedX - 3.7,
        tolerance: 0.02,
      })),
    },
    {
      name: "notification-read_solid.svg",
      // Cross the crown on both sides of the old retained stroke's endpoint.
      // The last ray remains above the opening in the reviewed 0.95-gap body.
      probes: [-28, -25, -22, -21].map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const direction = [Math.cos(radians), Math.sin(radians)];
        const center = [8.010768, 5.891948];
        const centerlineRadius = 4.043784;
        return {
          feature: `bell crown at ${angle} degrees`,
          origin: center.map(
            (value, axis) =>
              value + direction[axis] * (centerlineRadius - 0.15),
          ),
          direction,
          length: 1.2,
          transition: "exit",
          expectedDistance: 0.9,
          tolerance: 0.03,
        };
      }),
    },
    ...[
      "music.svg",
      "music_solid.svg",
      "music-disabled.svg",
      "music-disabled_solid.svg",
    ].map((name) => {
      // The complete perimeter follows the same beam and note contours in
      // every state. Probe either side of the stem endpoint: a bare filled
      // note leaves a shelf here, while a frozen maximum-width surface only
      // agrees at W=1.5. All rays inspect final paint at every tested width.
      const probes = [
        ...[3.6, 4.2].map((y) => ({
          feature: `music beam left edge at y${y}`,
          origin: [5.2, y],
          direction: [1, 0],
          length: 1.6,
          transition: "entry",
          expectedDistance: 1.506397,
          weightFactor: -0.5,
          tolerance: 0.025,
        })),
        ...[10, 10.1].map((y) => ({
          feature: `music note and stem outer edge at y${y}`,
          origin: [15.3, y],
          direction: [-1, 0],
          length: 1.6,
          transition: "entry",
          expectedDistance: 1.349415,
          weightFactor: -0.5,
          tolerance: 0.035,
        })),
        {
          feature: "music exposed stem left edge",
          origin: [12.5, 7],
          direction: [1, 0],
          length: 1.45,
          transition: "entry",
          expectedDistance: 1.450585,
          weightFactor: -0.5,
          tolerance: 0.02,
        },
        {
          feature: "music exposed stem right edge",
          origin: [15.3, 7],
          direction: [-1, 0],
          length: 1.35,
          transition: "entry",
          expectedDistance: 1.349415,
          weightFactor: -0.5,
          tolerance: 0.02,
        },
      ];
      if (name === "music-disabled_solid.svg") {
        // Equal normal distances along the beam and note cut ensure that a
        // retained stroke cannot introduce a shelf beside the slash.
        const finalScale = (2 / 3) * 1.034884;
        const diagonal = -2.347375;
        const direction = [Math.SQRT1_2, -Math.SQRT1_2];
        for (const x of [10.25, 10.75, 11.1, 17, 18]) {
          const t = x + (diagonal - 1.5) / 2;
          const point = [
            t * finalScale - 0.020349,
            (t + 1.5) * finalScale - 0.303416,
          ];
          probes.push({
            feature: `music diagonal clearance at construction x${x}`,
            origin: point.map((value, axis) => value + direction[axis] * 0.9),
            direction,
            length: 1.6,
            transition: "entry",
            expectedDistance:
              ((1.5 - diagonal) / Math.SQRT2) * finalScale - 0.9,
            weightFactor: -0.5,
            tolerance: 0.03,
          });
        }
      }
      return { name, probes };
    }),
    ...[
      ["headphones.svg", 1.166667, -1.333333, -0.75],
      ["headphones_solid.svg", 1.166667, -1.333333, -0.75],
      ["headphones-disabled.svg", 1.137845, -1.102757, -0.706767],
      ["headphones-disabled_solid.svg", 1.137845, -1.102757, -0.706767],
    ].map(([name, scale, translateX, translateY]) => {
      // These are the reviewed final frames; map only the probe specifications,
      // never the SVG under test. Every raster still uses the complete export.
      const finalScale = (2 / 3) * scale;
      const point = ([x, y]) => [
        x * finalScale + translateX,
        y * finalScale + translateY,
      ];
      const probes = [14.5, 17.1].map((y) => {
        const [x, finalY] = point([3.75, y]);
        return {
          feature: `headphone cup left edge at construction y${y}`,
          origin: [x + 0.2, finalY],
          direction: [-1, 0],
          length: 1.1,
          transition: "exit",
          expectedDistance: 0.2,
          weightFactor: 0.5,
          tolerance: 0.02,
        };
      });
      if (name === "headphones-disabled_solid.svg") {
        const direction = [Math.SQRT1_2, -Math.SQRT1_2];
        for (const x of [17.75, 18.5, 19.25]) {
          const t = x - 4.78511767 / 2;
          const slashPoint = point([t, t]);
          probes.push({
            feature: `headphone diagonal clearance at construction x${x}`,
            // Start beyond the slash even at W1.5; the short ray enters the
            // cup before encountering its opposite outer boundary.
            origin: slashPoint.map(
              (value, axis) => value + direction[axis] * 0.9,
            ),
            direction,
            length: 1.6,
            transition: "entry",
            expectedDistance: (4.78511767 / Math.SQRT2) * finalScale - 0.9,
            weightFactor: -0.5,
            tolerance: 0.03,
          });
        }
      }
      return { name, probes };
    }),
  ];
  const artwork = cases.map(({ name, probes }) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing final cutout artwork: ${name}`);
    return { name, svg: record.svg, probes };
  });

  return page.evaluate(async (artwork) => {
    const pixelsPerUnit = 128;
    const side = 16 * pixelsPerUnit;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];

    // Interpolate pixel alpha instead of snapping a narrow boundary to one
    // raster sample. Tolerances remain in final 16-unit coordinates.
    function alphaAt(pixels, [x, y]) {
      const px = x * pixelsPerUnit - 0.5;
      const py = y * pixelsPerUnit - 0.5;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      if (ix < 0 || iy < 0 || ix + 1 >= side || iy + 1 >= side)
        throw new Error("Cutout boundary probe leaves the final canvas");
      const fx = px - ix;
      const fy = py - iy;
      const alpha = (dx, dy) =>
        pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
      return (
        alpha(0, 0) * (1 - fx) * (1 - fy) +
        alpha(1, 0) * fx * (1 - fy) +
        alpha(0, 1) * (1 - fx) * fy +
        alpha(1, 1) * fx * fy
      );
    }

    // A direction need not be horizontal: use a unit normal or radial vector
    // to inspect curved cuts. Requiring exactly one transition also catches a
    // retained stroke painted back into the clearance after the first edge.
    function measureBoundary(pixels, probe) {
      const magnitude = Math.hypot(...probe.direction);
      if (!magnitude || !(probe.length > 0))
        throw new Error(`Invalid cutout boundary ray: ${probe.feature}`);
      const direction = probe.direction.map((value) => value / magnitude);
      const pointAt = (distance) =>
        probe.origin.map((value, axis) => value + direction[axis] * distance);
      const steps = Math.ceil(probe.length * pixelsPerUnit * 2);
      const startAlpha = alphaAt(pixels, pointAt(0));
      let previousAlpha = startAlpha;
      let previousDistance = 0;
      const transitions = [];
      for (let step = 1; step <= steps; step++) {
        const distance = (probe.length * step) / steps;
        const alpha = alphaAt(pixels, pointAt(distance));
        const previousPainted = previousAlpha >= 0.5;
        const painted = alpha >= 0.5;
        if (previousPainted !== painted) {
          const fraction = (0.5 - previousAlpha) / (alpha - previousAlpha);
          const boundaryDistance =
            previousDistance + (distance - previousDistance) * fraction;
          transitions.push({
            transition: previousPainted ? "exit" : "entry",
            distance: boundaryDistance,
            point: pointAt(boundaryDistance),
          });
        }
        previousAlpha = alpha;
        previousDistance = distance;
      }
      const expectedTransition = probe.transition ?? "exit";
      const startsPainted = startAlpha >= 0.5;
      const endsPainted = previousAlpha >= 0.5;
      const boundary = transitions.find(
        ({ transition }) => transition === expectedTransition,
      );
      const signedError = boundary
        ? boundary.distance - probe.expectedDistance
        : null;
      return {
        direction,
        startAlpha,
        endAlpha: previousAlpha,
        transitions,
        distance: boundary?.distance ?? null,
        point: boundary?.point ?? null,
        signedError,
        absoluteError: signedError === null ? null : Math.abs(signedError),
        pass:
          startsPainted === (expectedTransition === "exit") &&
          endsPainted === (expectedTransition === "entry") &&
          transitions.length === 1 &&
          boundary !== undefined &&
          Math.abs(signedError) <= probe.tolerance,
      };
    }

    for (const { name, svg, probes } of artwork) {
      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      const source = document.documentElement;
      source.setAttribute("width", String(side));
      source.setAttribute("height", String(side));
      source.setAttribute("style", "color:black");
      const widths = [source, ...source.querySelectorAll("[stroke-width]")]
        .filter((element) => element.hasAttribute("stroke-width"))
        .map((element) => [
          element,
          Number(element.getAttribute("stroke-width")),
        ]);
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        for (const [element, referenceWidth] of widths)
          element.setAttribute(
            "stroke-width",
            String((referenceWidth * weight) / 0.67),
          );
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(document)], {
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
          const pixels = context.getImageData(0, 0, side, side).data;
          for (const probe of probes) {
            const resolvedProbe = {
              ...probe,
              expectedDistance:
                probe.expectedDistance + (probe.weightFactor ?? 0) * weight,
            };
            const measured = measureBoundary(pixels, resolvedProbe);
            const result = {
              name,
              weight,
              feature: probe.feature,
              coordinateSpace: "final-16-unit-canvas",
              origin: probe.origin,
              direction: measured.direction,
              length: probe.length,
              expectedTransition: probe.transition ?? "exit",
              expectedDistance: resolvedProbe.expectedDistance,
              weightFactor: probe.weightFactor ?? 0,
              tolerance: probe.tolerance,
              pixelsPerUnit,
              measured,
            };
            results.push(result);
            if (!measured.pass) failures.push(result);
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, artwork);
}
