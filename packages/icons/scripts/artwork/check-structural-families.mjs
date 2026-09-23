// Guard the visible relationships repaired in the structural-family review.
// These checks render complete final exports: no path counts, recipe helpers,
// or reversed fit coordinates participate in the acceptance criteria.
export async function checkStructuralFamilies(page, records) {
  const paired = [
    "group",
    "chat-group",
    "coffee",
    "delete",
    "locked",
    "display",
    "devices",
    "schedule-time",
  ];
  const names = [
    ...paired.flatMap((name) => [`${name}.svg`, `${name}_solid.svg`]),
    "add.svg",
    "light.svg",
    "add-user.svg",
    "remove-user.svg",
  ];
  const selected = names.map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record) throw new Error(`Missing structural-family artwork: ${name}`);
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
    const report = (result, pass) => {
      results.push(result);
      if (!pass) failures.push(result);
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
        const rgba = context.getImageData(0, 0, side, side).data;
        return Uint8Array.from(
          { length: side * side },
          (_, i) => rgba[4 * i + 3],
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const painted = (alpha, x, y) =>
      alpha[Math.floor(y * scale) * side + Math.floor(x * scale)] >= 128;
    // Measure a complete empty run bounded by paint on both sides. A fused
    // overlap produces no such run, even if it is split into multiple paths.
    const gapAlong = (alpha, axis, at, start, end) => {
      let seenPaint = false;
      let gapStart = null;
      let gap = 0;
      for (let p = Math.ceil(start * scale); p < Math.floor(end * scale); p++) {
        const hit =
          axis === "x"
            ? painted(alpha, (p + 0.5) / scale, at)
            : painted(alpha, at, (p + 0.5) / scale);
        if (hit) {
          if (gapStart !== null) gap = Math.max(gap, (p - gapStart) / scale);
          seenPaint = true;
          gapStart = null;
        } else if (seenPaint && gapStart === null) gapStart = p;
      }
      return gap;
    };
    const regions = (alpha, inverse = false) => {
      const seen = new Uint8Array(alpha.length);
      const queue = new Uint32Array(alpha.length);
      const found = [];
      const included = (i) => (inverse ? alpha[i] < 128 : alpha[i] >= 128);
      for (let start = 0; start < alpha.length; start++) {
        if (seen[start] || !included(start)) continue;
        let head = 0;
        let tail = 1;
        let touchesCanvas = false;
        const boundary = [];
        queue[0] = start;
        seen[start] = 1;
        while (head < tail) {
          const i = queue[head++];
          const x = i % side;
          const y = Math.floor(i / side);
          touchesCanvas ||=
            x === 0 || y === 0 || x === side - 1 || y === side - 1;
          let edge = false;
          for (const j of [
            x ? i - 1 : -1,
            x + 1 < side ? i + 1 : -1,
            y ? i - side : -1,
            y + 1 < side ? i + side : -1,
          ]) {
            if (j < 0 || !included(j)) {
              edge = true;
              continue;
            }
            if (!seen[j]) {
              seen[j] = 1;
              queue[tail++] = j;
            }
          }
          if (edge) boundary.push([x, y]);
        }
        found.push({ area: tail, touchesCanvas, boundary });
      }
      return found;
    };
    const edgeGap = (first, second) => {
      const ordered = second.boundary.toSorted((a, b) => a[0] - b[0]);
      let minimum = 2 * scale;
      for (const [x, y] of first.boundary) {
        let low = 0;
        let high = ordered.length;
        while (low < high) {
          const middle = (low + high) >>> 1;
          if (ordered[middle][0] < x - minimum) low = middle + 1;
          else high = middle;
        }
        for (
          let i = low;
          i < ordered.length && ordered[i][0] <= x + minimum;
          i++
        ) {
          const dx = x - ordered[i][0];
          const dy = y - ordered[i][1];
          if (Math.abs(dy) < minimum)
            minimum = Math.min(minimum, Math.hypot(dx, dy));
        }
      }
      // Boundary samples are pixel centers; subtract one pixel conservatively.
      return Math.max(0, (minimum - 1) / scale);
    };
    // Each window selects an exposed retained member, excluding the surface
    // that intentionally fills. The clock window lies wholly inside its dial.
    const retained = [
      { name: "coffee", feature: "steam", box: [0, 0, 16, 3.5] },
      { name: "delete", feature: "handle above lid", box: [0, 0, 16, 3] },
      { name: "locked", feature: "shackle above housing", box: [0, 0, 16, 6] },
      {
        name: "display",
        feature: "pedestal below screen",
        box: [0, 12.7, 16, 16],
      },
      {
        name: "devices",
        feature: "display pedestal beside phone",
        box: [3, 11.4, 9.5, 16],
      },
      {
        name: "schedule-time",
        feature: "clock hands inside dial",
        box: [5.5, 6.9, 10.5, 12],
        circle: [8, 9.43586, 2.3],
      },
    ];
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const paint = new Map();
      for (const { name, svg } of selected)
        paint.set(name, await render(svg, weight));
      for (const name of ["group.svg", "group_solid.svg"]) {
        for (const axis of ["x", "y"]) {
          const gap = gapAlong(paint.get(name), axis, 8.55, 4.5, 8);
          report(
            {
              name,
              weight,
              feature: `rear/foreground ${axis} separation`,
              gap,
              minimum: 0.7,
              maximum: 1.35,
            },
            gap >= 0.7 && gap <= 1.35,
          );
        }
      }
      for (const name of ["chat-group.svg", "chat-group_solid.svg"]) {
        const parts = regions(paint.get(name)).filter(
          ({ area }) => area >= scale * scale * 0.03,
        );
        const gap = parts.length === 2 ? edgeGap(parts[0], parts[1]) : 0;
        report(
          {
            name,
            weight,
            feature: "separate overlapping bubbles",
            objects: parts.length,
            gap,
            minimum: 0.5,
          },
          parts.length === 2 && gap >= 0.5,
        );
      }
      for (const { name, feature, box, circle } of retained) {
        const outline = paint.get(`${name}.svg`);
        const solid = paint.get(`${name}_solid.svg`);
        let union = 0;
        let mismatch = 0;
        for (
          let y = Math.ceil(box[1] * scale);
          y < Math.floor(box[3] * scale);
          y++
        )
          for (
            let x = Math.ceil(box[0] * scale);
            x < Math.floor(box[2] * scale);
            x++
          ) {
            if (
              circle &&
              Math.hypot(
                (x + 0.5) / scale - circle[0],
                (y + 0.5) / scale - circle[1],
              ) > circle[2]
            )
              continue;
            const a = outline[y * side + x] >= 128;
            const b = solid[y * side + x] >= 128;
            if (a || b) union++;
            if (a !== b) mismatch++;
          }
        const mismatchRatio = union ? mismatch / union : 1;
        report(
          {
            name: `${name}_solid.svg`,
            companion: `${name}.svg`,
            weight,
            feature: `retained ${feature}`,
            paintedArea: union / scale ** 2,
            mismatchRatio,
            maximum: 0.01,
          },
          union > scale ** 2 * 0.1 && mismatchRatio <= 0.01,
        );
      }
      for (const name of ["add-user.svg", "remove-user.svg"]) {
        const alpha = paint.get(name);
        const parts = regions(alpha).filter(
          ({ area }) => area >= scale * scale * 0.03,
        );
        const holes = regions(alpha, true).filter(
          ({ area, touchesCanvas }) =>
            !touchesCanvas && area >= scale * scale * 0.4,
        );
        const gap =
          parts.length === 3
            ? Math.min(
                ...parts.flatMap((a, i) =>
                  parts.slice(i + 1).map((b) => edgeGap(a, b)),
                ),
              )
            : 0;
        report(
          {
            name,
            weight,
            feature: "complete person and separate modifier",
            parts: parts.length,
            enclosedHeadAndBody: holes.length,
            gap,
            minimum: 0.5,
          },
          parts.length === 3 && holes.length === 2 && gap >= 0.5,
        );
      }
      if (weight === 0.67) {
        for (const [name, expected] of [
          ["add.svg", 0],
          ["light.svg", 1],
        ]) {
          // Add has no intrinsic hole; Light has its one central opening.
          // A tiny enclosed transparent island in a weld is an unintended hole.
          const holes = regions(paint.get(name), true).filter(
            ({ area, touchesCanvas }) => !touchesCanvas && area >= 4,
          );
          report(
            {
              name,
              weight,
              feature: "no enclosed weld pinholes",
              holes: holes.length,
              expected,
              areas: holes.map(({ area }) => area / scale ** 2),
            },
            holes.length === expected,
          );
        }
      }
    }
    return { results, failures };
  }, selected);
}
