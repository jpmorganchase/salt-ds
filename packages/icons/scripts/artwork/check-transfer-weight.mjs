// Inspect the final painted union: equal stroke attributes alone cannot detect
// a filled band over a retained line. Legacy variants keep the same open arrow.
export async function checkTransferWeight(page, records) {
  const artwork = ["import", "export"].flatMap((base) =>
    ["", "_solid"].map((variant) => {
      const name = `${base}${variant}.svg`;
      const record = records.find((candidate) => candidate.name === name);
      if (!record) throw new Error(`Missing transfer artwork: ${name}`);
      return { name, svg: record.svg };
    }),
  );
  return page.evaluate(async (artwork) => {
    const pixelsPerUnit = 64;
    const side = 16 * pixelsPerUnit;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const check = (result) => {
      results.push(result);
      if (!result.pass) failures.push(result);
    };
    const profiles = {
      import: {
        sections: [
          { feature: "bracket top", x: 8, y: 1, from: 0, to: 3.5 },
          { feature: "bracket bottom", x: 8, y: 15, from: 12.5, to: 16 },
          {
            feature: "bracket spine",
            x: 14.94318,
            y: 8,
            from: 12.75,
            to: 16,
            horizontal: true,
          },
          { feature: "exposed shaft", x: 3, y: 8, from: 6.5, to: 9.5 },
        ],
        bracketRegions: [
          [5.5, 0, 16, 2],
          [13, 3, 16, 13],
          [5.5, 14, 16, 16],
        ],
      },
      export: {
        sections: [
          { feature: "bracket top", x: 3, y: 1.71224, from: 0, to: 4 },
          { feature: "bracket bottom", x: 3, y: 14.28776, from: 12, to: 16 },
          {
            feature: "bracket spine",
            x: 1,
            y: 8,
            from: 0,
            to: 3,
            horizontal: true,
          },
          { feature: "exposed shaft", x: 7, y: 8, from: 6.5, to: 9.5 },
        ],
        bracketRegions: [
          [0, 0, 6, 3],
          [0, 3, 2.6, 13],
          [0, 13, 6, 16],
        ],
      },
    };
    const section = (pixels, sample) => {
      const fixed = Math.floor(
        (sample.horizontal ? sample.y : sample.x) * pixelsPerUnit,
      );
      let first = Number.POSITIVE_INFINITY;
      let last = Number.NEGATIVE_INFINITY;
      for (
        let i = Math.ceil(sample.from * pixelsPerUnit);
        i < sample.to * pixelsPerUnit;
        i++
      ) {
        const offset = sample.horizontal ? fixed * side + i : i * side + fixed;
        if (pixels[offset * 4 + 3] < 128) continue;
        first = Math.min(first, i / pixelsPerUnit);
        last = Math.max(last, (i + 1) / pixelsPerUnit);
      }
      return { width: last - first, center: (first + last) / 2 };
    };
    const area = (pixels, region, other) => {
      let value = 0;
      for (
        let y = Math.ceil(region[1] * pixelsPerUnit);
        y < region[3] * pixelsPerUnit;
        y++
      )
        for (
          let x = Math.ceil(region[0] * pixelsPerUnit);
          x < region[2] * pixelsPerUnit;
          x++
        ) {
          const offset = (y * side + x) * 4 + 3;
          value +=
            Math.abs(pixels[offset] - (other?.[offset] ?? 0)) /
            255 /
            pixelsPerUnit ** 2;
        }
      return value;
    };
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = {};
      for (const { name, svg } of artwork) {
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
      for (const [base, profile] of Object.entries(profiles)) {
        const measured = [];
        for (const variant of ["", "_solid"]) {
          const name = `${base}${variant}.svg`;
          for (const sample of profile.sections) {
            const measurement = section(paint[name], sample);
            const expectedCenter = sample.horizontal ? sample.x : sample.y;
            measured.push({ name, feature: sample.feature, ...measurement });
            check({
              name,
              feature: `${sample.feature} painted width and anchor`,
              coordinateSpace: "final-16-unit-canvas",
              weight,
              measurement,
              expectedCenter,
              widthTolerance: 2 / pixelsPerUnit,
              centerTolerance: 0.025,
              pass:
                Math.abs(measurement.width - weight) <= 2 / pixelsPerUnit &&
                Math.abs(measurement.center - expectedCenter) <= 0.025,
            });
          }
        }
        const widths = measured.map((measurement) => measurement.width);
        const maximumWeightDifference =
          Math.max(...widths) - Math.min(...widths);
        check({
          name: `${base}_solid.svg`,
          feature:
            "equal painted bracket and exposed shaft weight across both variants",
          coordinateSpace: "final-16-unit-canvas",
          weight,
          measured,
          maximumWeightDifference,
          tolerance: 2 / pixelsPerUnit,
          pass: maximumWeightDifference <= 2 / pixelsPerUnit,
        });
        const outline = paint[`${base}.svg`];
        const solid = paint[`${base}_solid.svg`];
        const bracketDifference = profile.bracketRegions.reduce(
          (sum, region) => sum + area(outline, region, solid),
          0,
        );
        check({
          name: `${base}_solid.svg`,
          feature: "unchanged open bracket paint",
          coordinateSpace: "final-16-unit-canvas",
          weight,
          regions: profile.bracketRegions,
          differentArea: bracketDifference,
          maximumArea: 0.01,
          pass: bracketDifference <= 0.01,
        });
        const difference = area(outline, [0, 0, 16, 16], solid);
        check({
          name: `${base}_solid.svg`,
          feature: "legacy Solid variant preserves the established open arrow",
          coordinateSpace: "final-16-unit-canvas",
          weight,
          differentArea: difference,
          maximumArea: 0.005,
          pass: difference <= 0.005,
        });
      }
    }
    return { results, failures };
  }, artwork);
}
