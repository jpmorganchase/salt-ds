// Final-export regressions for the independent Clock/Cookie/Crops/Bank review.
// All measurements sample complete painted SVGs at their shipped coordinates.
export async function checkReviewABank(page, records) {
  const names = [
    "clock.svg",
    "clock_solid.svg",
    "cookie.svg",
    "cookie_solid.svg",
    "crops.svg",
    "crops_solid.svg",
    "bank.svg",
  ];
  const selected = names.map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record) throw new Error(`Missing review artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (selected) => {
    const scale = 64;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const report = (result, passed) => {
      results.push(result);
      if (!passed) failures.push(result);
    };
    const render = async (svg, weight) => {
      const source = svg
        .replace("<svg ", '<svg style="color:black" ')
        .replace(
          /stroke-width="([\d.]+)"/g,
          (_, w) => `stroke-width="${(Number(w) * weight) / 0.67}"`,
        );
      const url = URL.createObjectURL(
        new Blob([source], { type: "image/svg+xml" }),
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
        return Uint8Array.from(
          { length: side * side },
          (_, i) => pixels[4 * i + 3],
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const value = (paint, x, y, inverse = false) => {
      const alpha =
        paint[Math.floor(y * scale) * side + Math.floor(x * scale)] / 255;
      return inverse ? 1 - alpha : alpha;
    };
    const inRegion = (region, visit) => {
      for (let y = Math.ceil(region[1] * scale); y < region[3] * scale; y++)
        for (let x = Math.ceil(region[0] * scale); x < region[2] * scale; x++)
          visit((x + 0.5) / scale, (y + 0.5) / scale);
    };
    const bounds = (paint, region) => {
      const found = [Infinity, Infinity, -Infinity, -Infinity];
      inRegion(region, (x, y) => {
        if (value(paint, x, y) < 0.5) return;
        found[0] = Math.min(found[0], x);
        found[1] = Math.min(found[1], y);
        found[2] = Math.max(found[2], x);
        found[3] = Math.max(found[3], y);
      });
      return found;
    };
    const section = (paint, axis, at, start, end, inverse = false) => {
      let mass = 0;
      let moment = 0;
      for (let p = Math.ceil(start * scale); p < end * scale; p++) {
        const position = (p + 0.5) / scale;
        const alpha =
          axis === "x"
            ? value(paint, position, at, inverse)
            : value(paint, at, position, inverse);
        mass += alpha;
        moment += alpha * position;
      }
      return { width: mass / scale, center: mass ? moment / mass : null };
    };
    const gap = (paint, y, start, end) => {
      let empty = 0;
      for (let x = Math.ceil(start * scale); x < end * scale; x++)
        if (value(paint, (x + 0.5) / scale, y) < 0.5) empty++;
      return empty / scale;
    };
    const tolerance = 2 / scale;
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = new Map();
      for (const { name, svg } of selected)
        paint.set(name, await render(svg, weight));
      const hands = [false, true].map((inverse) => {
        const pixels = paint.get(inverse ? "clock_solid.svg" : "clock.svg");
        let top = Infinity;
        let tip = -Infinity;
        // This disk lies inside the face's heaviest rim. It isolates positive
        // hands or the inverse opening without including the exterior field.
        inRegion([2, 2, 14, 14], (x, y) => {
          if (
            Math.hypot(x - 8, y - 8) > 5.9 ||
            value(pixels, x, y, inverse) < 0.5
          )
            return;
          top = Math.min(top, y);
          if (x > 8.8 && y > 7.25)
            tip = Math.max(tip, (3 * (x - 8) + 2 * (y - 8)) / Math.sqrt(13));
        });
        return {
          top,
          tip,
          stem: section(pixels, "x", 5, 6.7, 9.3, inverse),
          short: section(pixels, "y", 10, 7.8, 10.8, inverse),
        };
      });
      for (const landmark of ["top", "tip"])
        report(
          {
            name: "clock",
            weight,
            feature: `${landmark} terminal plane`,
            outline: hands[0][landmark],
            solid: hands[1][landmark],
          },
          Number.isFinite(hands[0][landmark]) &&
            Math.abs(hands[0][landmark] - hands[1][landmark]) <= tolerance,
        );
      for (const landmark of ["stem", "short"])
        report(
          {
            name: "clock",
            weight,
            feature: `${landmark} centerline`,
            outline: hands[0][landmark],
            solid: hands[1][landmark],
          },
          hands[0][landmark].center !== null &&
            hands[1][landmark].center !== null &&
            Math.abs(hands[0][landmark].center - hands[1][landmark].center) <=
              tolerance,
        );

      for (const [index, [cx, cy]] of [
        [4.77, 5.31],
        [4.23, 9.62],
        [8, 8],
        [8, 12.31],
        [11.77, 10.69],
      ].entries()) {
        const chips = [false, true].map((inverse) => {
          const pixels = paint.get(inverse ? "cookie_solid.svg" : "cookie.svg");
          let mass = 0,
            mx = 0,
            my = 0;
          inRegion([cx - 1.2, cy - 1.2, cx + 1.2, cy + 1.2], (x, y) => {
            const alpha = value(pixels, x, y, inverse);
            mass += alpha;
            mx += alpha * x;
            my += alpha * y;
          });
          return { x: mx / mass, y: my / mass, area: mass / scale ** 2 };
        });
        const delta = Math.hypot(
          chips[0].x - chips[1].x,
          chips[0].y - chips[1].y,
        );
        report(
          {
            name: "cookie",
            weight,
            feature: `chip ${index + 1} center`,
            outline: chips[0],
            solid: chips[1],
            delta,
          },
          chips.every(({ area }) => area > 1) && delta <= tolerance,
        );
      }

      const cropPair = [paint.get("crops.svg"), paint.get("crops_solid.svg")];
      // Crops is solid-first: leaf paint stays intrinsic rather than growing
      // with an added rim. Only the shared exposed stem must match exactly.
      for (const [feature, region, axes, expected] of [
        [
          "exposed upper stem",
          [7.4, 1.1, 8.3, 1.8],
          [0, 1],
          [8.287036 - weight / 2, 1.398148],
        ],
        [
          "exposed lower stem",
          [7.4, 14.7, 9.1, 16],
          [0, 2, 3],
          [8.287036 - weight / 2, 8.287036 + weight / 2, 15.75],
        ],
      ]) {
        const pairBounds = cropPair.map((pixels) => bounds(pixels, region));
        const delta = Math.max(
          ...axes.flatMap((axis, index) => [
            Math.abs(pairBounds[0][axis] - pairBounds[1][axis]),
            ...pairBounds.map((boundary) =>
              Math.abs(boundary[axis] - expected[index]),
            ),
          ]),
        );
        report(
          {
            name: "crops",
            weight,
            feature,
            outline: pairBounds[0],
            solid: pairBounds[1],
            expected,
            delta,
          },
          Number.isFinite(delta) && delta <= tolerance,
        );
      }
      // Measure the exterior opening containing an independently chosen point
      // between leaves, not the sum of all transparent pixels in a region.
      // Including leaf counters here could conceal an unintended leaf merger.
      for (const [feature, x, y, top, bottom] of [
        ["left leaves", 5.5, 7.05, 6.1, 8.2],
        ["upper right leaves", 10.4, 4.7, 3.5, 5.8],
        ["lower right leaves", 10.4, 9.45, 8.6, 10.3],
      ]) {
        const openings = cropPair.map((pixels) => {
          const seed = Math.floor(y * scale);
          if (value(pixels, x, (seed + 0.5) / scale) >= 0.5) return 0;
          let first = seed;
          let last = seed;
          while (
            first > Math.ceil(top * scale) &&
            value(pixels, x, (first - 0.5) / scale) < 0.5
          )
            first--;
          while (
            last + 1 < bottom * scale &&
            value(pixels, x, (last + 1.5) / scale) < 0.5
          )
            last++;
          return (last - first + 1) / scale;
        });
        report(
          {
            name: "crops",
            weight,
            feature: `${feature} remain separate`,
            outline: openings[0],
            solid: openings[1],
          },
          openings[0] > (weight <= 4 / 3 ? 0.5 : 0.35) && openings[1] > 0.75,
        );
      }

      // The top leaf is smaller than its siblings. Guard its enclosed counter
      // independently from their exterior separations; a pinprick is not an
      // adequate opening at the themed width. This is a Crops optical target.
      const counterRegion = [8.3, 0.8, 11.3, 4.4];
      const seedX = Math.floor(9.75 * scale);
      const seedY = Math.floor(2.65 * scale);
      const queue = [[seedX, seedY]];
      const visited = new Set();
      let counterArea = 0;
      let escaped = false;
      for (let i = 0; i < queue.length; i++) {
        const [x, y] = queue[i];
        const key = y * side + x;
        if (visited.has(key)) continue;
        visited.add(key);
        if (value(cropPair[0], (x + 0.5) / scale, (y + 0.5) / scale) >= 0.5)
          continue;
        if (
          x <= counterRegion[0] * scale ||
          x >= counterRegion[2] * scale ||
          y <= counterRegion[1] * scale ||
          y >= counterRegion[3] * scale
        ) {
          escaped = true;
          continue;
        }
        counterArea += 1 / scale ** 2;
        queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
      }
      report(
        {
          name: "crops",
          weight,
          feature: "upper outline leaf has a useful enclosed counter",
          counterArea,
          escaped,
        },
        !escaped && counterArea > (weight <= 4 / 3 ? 1 : 0.65),
      );

      const bank = paint.get("bank.svg");
      // Inspect the four narrow channels, independently of the fillet recipe.
      // A curved exposed boundary opens progressively away from each rail;
      // a short curve buried under thick paint opens almost immediately.
      for (const [index, [left, right]] of [
        [1.9573, 3.8456],
        [3.8456, 5.7338],
        [10.2662, 12.1544],
        [12.1544, 14.0427],
      ].entries()) {
        const open = gap(bank, 9, left, right);
        for (const [rail, y, direction] of [
          ["roof", 4.972382, 1],
          ["plinth", 13.28116, -1],
        ]) {
          const near = gap(
            bank,
            y + direction * (weight * .375 + 0.08),
            left,
            right,
          );
          const shoulder = gap(
            bank,
            y + direction * (weight * .375 + 0.24),
            left,
            right,
          );
          report(
            {
              name: "bank.svg",
              weight,
              feature: `${rail} channel ${index + 1} exposed curved attachment`,
              near,
              shoulder,
              open,
            },
            near > 0.08 &&
              shoulder - near > 0.15 &&
              open - near > 0.25 &&
              open - shoulder > 0.015 &&
              open > 0.65,
          );
        }
      }
      const arch = gap(bank, 10, 5.793, 10.207);
      report(
        {
          name: "bank.svg",
          weight,
          feature: "open central arch",
          opening: arch,
        },
        arch > 3.2,
      );
    }
    return { results, failures };
  }, selected);
}
