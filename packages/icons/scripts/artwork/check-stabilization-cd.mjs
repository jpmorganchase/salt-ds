// These regressions inspect complete final exports, without reversing fitting.
// They protect stable retained features and the reviewed local math balance.
export async function checkStabilizationCd(page, records) {
  const pairs = ["notification", "presentation", "video"];
  const arithmetic = [
    "add",
    "remove",
    "multiply",
    "divide",
    "equal",
    "does-not-equal",
  ];
  const names = [
    ...pairs.flatMap((name) => [`${name}.svg`, `${name}_solid.svg`]),
    ...[...arithmetic, "greater-than", "less-than", "exponentiation"].map(
      (name) => `${name}.svg`,
    ),
  ];
  const artwork = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing stabilization artwork: ${name}`);
    return { name, svg: record.svg };
  });
  return page.evaluate(
    async ({ artwork, arithmetic }) => {
      const scale = 64;
      const side = 16 * scale;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const results = [];
      const failures = [];
      const check = (result, pass) => {
        const item = { ...result, pass };
        results.push(item);
        if (!pass) failures.push(item);
      };
      const bounds = (pixels, region = [0, 0, 16, 16]) => {
        const box = [
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
        ];
        for (let y = Math.ceil(region[1] * scale); y < region[3] * scale; y++) {
          for (
            let x = Math.ceil(region[0] * scale);
            x < region[2] * scale;
            x++
          ) {
            if (pixels[(y * side + x) * 4 + 3] < 128) continue;
            box[0] = Math.min(box[0], x / scale);
            box[1] = Math.min(box[1], y / scale);
            box[2] = Math.max(box[2], (x + 1) / scale);
            box[3] = Math.max(box[3], (y + 1) / scale);
          }
        }
        return box;
      };
      const differentArea = (a, b, region) => {
        let area = 0;
        for (let y = Math.ceil(region[1] * scale); y < region[3] * scale; y++)
          for (
            let x = Math.ceil(region[0] * scale);
            x < region[2] * scale;
            x++
          ) {
            const i = (y * side + x) * 4 + 3;
            area += Math.abs(a[i] - b[i]) / 255 / scale ** 2;
          }
        return area;
      };
      const intervalsAt = (pixels, position, vertical = false) => {
        const fixed = Math.floor(position * scale);
        const intervals = [];
        let start;
        for (let i = 0; i <= side; i++) {
          const pixel = vertical ? i * side + fixed : fixed * side + i;
          const painted = i < side && pixels[pixel * 4 + 3] >= 128;
          if (painted && start === undefined) start = i;
          if (!painted && start !== undefined) {
            intervals.push([start / scale, i / scale]);
            start = undefined;
          }
        }
        return intervals;
      };
      const outerEdges = (intervals) =>
        intervals.length
          ? [intervals[0][0], intervals.at(-1)[1]]
          : [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
      const maxDelta = (a, b) =>
        Math.max(...a.map((value, index) => Math.abs(value - b[index])));
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        const paint = {};
        for (const { name, svg } of artwork) {
          const markup = svg
            .replace("<svg ", '<svg style="color:black" ')
            .replace(
              /stroke-width="([\d.]+)"/g,
              (_, value) => `stroke-width="${(Number(value) * weight) / 0.67}"`,
            );
          const url = URL.createObjectURL(
            new Blob([markup], { type: "image/svg+xml" }),
          );
          try {
            const image = new Image();
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = () =>
                reject(new Error(`Could not render ${name}`));
              image.src = url;
            });
            context.clearRect(0, 0, side, side);
            context.drawImage(image, 0, 0, side, side);
            paint[name] = context.getImageData(0, 0, side, side).data;
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        for (const [feature, region] of [
          ["retained crown anchor", [7, 0, 9, 1]],
          ["retained clapper position and length", [0, 13.5, 16, 16]],
        ]) {
          const outline = bounds(paint["notification.svg"], region);
          const solid = bounds(paint["notification_solid.svg"], region);
          const delta = maxDelta(outline, solid);
          check(
            {
              name: "notification",
              weight,
              feature,
              outline,
              solid,
              maximumDelta: delta,
            },
            Number.isFinite(delta) && delta <= 0.025,
          );
        }
        // Filling the bell must preserve its border, not merely the interior path.
        for (const y of [6.5, 9.5, 11.5]) {
          const outline = outerEdges(intervalsAt(paint["notification.svg"], y));
          const solid = outerEdges(
            intervalsAt(paint["notification_solid.svg"], y),
          );
          const delta = maxDelta(outline, solid);
          check(
            {
              name: "notification",
              weight,
              feature: "stable bell exterior",
              y,
              outline,
              solid,
              maximumDelta: delta,
            },
            Number.isFinite(delta) && delta <= 0.025,
          );
        }
        const easelDifference = differentArea(
          paint["presentation.svg"],
          paint["presentation_solid.svg"],
          [0, 12.9, 16, 16],
        );
        check(
          {
            name: "presentation",
            weight,
            feature: "retained easel legs",
            differentArea: easelDifference,
          },
          easelDifference < 0.04,
        );
        // The transparent header divider needs connected side rails. Several rows
        // prevent a remaining strip at just one cutout edge from satisfying this.
        const boardEdges = outerEdges(
          intervalsAt(paint["presentation_solid.svg"], 5),
        );
        for (const y of [3.85, 4.05, 4.25]) {
          const intervals = intervalsAt(paint["presentation_solid.svg"], y);
          const widths = intervals.map(([a, b]) => b - a);
          const opening =
            intervals.length === 2 ? intervals[1][0] - intervals[0][1] : 0;
          const exteriorDelta = maxDelta(boardEdges, outerEdges(intervals));
          check(
            {
              name: "presentation_solid.svg",
              weight,
              feature: "continuous side rails around header divider",
              y,
              intervals,
              widths,
              opening,
              exteriorDelta,
            },
            intervals.length === 2 &&
              widths.every((width) => width >= 1.25 && width <= 2.1) &&
              opening > 10 &&
              exteriorDelta <= 0.025,
          );
        }
        const slopes = {};
        for (const variant of ["", "_solid"]) {
          const name = `video${variant}.svg`;
          const left = outerEdges(intervalsAt(paint[name], 13, true));
          const right = outerEdges(intervalsAt(paint[name], 14, true));
          const top = right[0] - left[0];
          const bottom = right[1] - left[1];
          slopes[name] = [top, bottom];
          // Both variants retain the original 3:8 flank slope even though the
          // solid wedge is detached and therefore starts farther to the right.
          check(
            {
              name,
              weight,
              feature: "retained symmetric camera wedge slopes",
              left,
              right,
              topSlope: top,
              bottomSlope: bottom,
            },
            Math.abs(top + 3 / 8) <= 0.025 && Math.abs(bottom - 3 / 8) <= 0.025,
          );
        }
        const wedgeDelta = maxDelta(
          slopes["video.svg"],
          slopes["video_solid.svg"],
        );
        check(
          {
            name: "video",
            weight,
            feature: "same outline and solid wedge gesture",
            maximumSlopeDelta: wedgeDelta,
          },
          wedgeDelta <= 0.025,
        );
        const boxes = Object.fromEntries(
          [...arithmetic, "greater-than", "less-than", "exponentiation"].map(
            (name) => [name, bounds(paint[`${name}.svg`])],
          ),
        );
        const span = (box) => Math.max(box[2] - box[0], box[3] - box[1]);
        if (weight === 1.5) {
          // This target belongs to these six reviewed arithmetic symbols only.
          // Compact comparisons, the raised caret and other math roles keep
          // their own proportions rather than inheriting a blanket equal box.
          for (const name of arithmetic) {
            const longest = span(boxes[name]);
            check(
              {
                name,
                weight,
                feature: "reviewed arithmetic optical span",
                bounds: boxes[name],
                longest,
                target: 12.5,
              },
              Math.abs(longest - 12.5) <= 0.04,
            );
          }
        }
        if (weight === 1 || weight === 4 / 3) {
          const comparisonWidth =
            boxes["greater-than"][2] - boxes["greater-than"][0];
          const arithmeticWidth = boxes.add[2] - boxes.add[0];
          const ratio = arithmeticWidth / comparisonWidth;
          check(
            {
              name: "math",
              weight,
              feature: "arithmetic balanced beside compact comparisons",
              arithmeticWidth,
              comparisonWidth,
              ratio,
            },
            ratio >= 1.2 && ratio <= 1.5,
          );
          for (const name of ["remove", "divide", "equal", "does-not-equal"]) {
            const width = boxes[name][2] - boxes[name][0];
            check(
              {
                name,
                weight,
                feature: "shared arithmetic bar length",
                width,
                addWidth: arithmeticWidth,
              },
              Math.abs(width - arithmeticWidth) <= 0.025,
            );
          }
          for (const name of ["greater-than", "less-than"]) {
            const box = boxes[name];
            const aspect = (box[3] - box[1]) / (box[2] - box[0]);
            check(
              {
                name,
                weight,
                feature: "compact comparison angle and height",
                bounds: box,
                aspect,
              },
              aspect > 1 && aspect < 1.25 && span(box) < 11,
            );
          }
          const exponent = boxes.exponentiation;
          const centerY = (exponent[1] + exponent[3]) / 2;
          check(
            {
              name: "exponentiation",
              weight,
              feature: "compact raised power operator",
              bounds: exponent,
              centerY,
            },
            span(exponent) <= 8.1 && exponent[3] < 8.5 && centerY < 5,
          );
        }
      }
      return { results, failures };
    },
    { artwork, arithmetic },
  );
}
