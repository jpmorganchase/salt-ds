// Compare retained paint in the final exports: reversing the fit would hide
// the clip, page, cap and grain drift corrected by this review.
export async function checkReviewClipboardDocumentShaker(page, records) {
  const pairs = [
    {
      name: "woman",
      feature: "retained head rim and center",
      outline: { strokes: [0] },
      solid: { strokes: [0] },
    },
    {
      name: "paste",
      feature: "retained clipboard rim and clip",
      outline: { strokes: [0, 1] },
      solid: { strokes: [0, 1] },
    },
    {
      name: "remove-document",
      feature: "retained folded-page perimeter",
      outline: { strokes: [0], firstClosedContour: true },
      solid: { strokes: [0], firstClosedContour: true },
    },
    {
      name: "salt-shaker",
      feature: "retained bottle rim, perforated cap and falling grains",
      outline: { strokes: [0], compoundFills: 3 },
      solid: { strokes: [0], compoundFills: 3 },
    },
  ].map((pair) => ({
    ...pair,
    variants: [".svg", "_solid.svg"].map((suffix) => {
      const record = records.find(({ name }) => name === pair.name + suffix);
      if (!record)
        throw new Error(`Missing reviewed artwork: ${pair.name + suffix}`);
      return record.svg;
    }),
  }));
  const userGroup = records.find(({ name }) => name === "user-group_solid.svg");
  if (!userGroup)
    throw new Error("Missing reviewed artwork: user-group_solid.svg");
  return page.evaluate(
    async ({ pairs, userGroup }) => {
      const scale = 64;
      const size = 16 * scale;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const results = [];
      const failures = [];
      const report = (result, pass) => {
        results.push(result);
        if (!pass) failures.push(result);
      };
      const inherited = (node, attribute) => {
        while (node?.getAttribute) {
          if (node.hasAttribute(attribute)) return node.getAttribute(attribute);
          node = node.parentNode;
        }
        return null;
      };
      const render = async (svg, width, retained) => {
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        doc.documentElement.setAttribute("style", "color:black");
        let missingRetained = 0;
        if (retained) {
          const paths = [...doc.querySelectorAll("path")];
          const strokes = paths.filter(
            (path) => inherited(path, "stroke") === "currentColor",
          );
          const fills = paths.filter(
            (path) => inherited(path, "fill") === "currentColor",
          );
          const keep = [
            ...(retained.strokes ?? []).map((index) => strokes[index]),
            ...(retained.fills ?? []).map((index) => fills[index]),
            ...(retained.compoundFills ? fills.filter(path => (path.getAttribute("d").match(/[Mm]/g) ?? []).length === retained.compoundFills) : []),
          ];
          // A removed rim is a failed assertion, not a reason to abort other
          // pairs. Keep the available paint so baseline checks report all defects.
          missingRetained = keep.filter((path) => !path).length;
          if (retained.compoundFills && keep.length !== 3) missingRetained++;
          if (retained.firstClosedContour) {
            const rim = keep[0];
            const contour = rim?.getAttribute("d").match(/^[^Zz]*[Zz]/)?.[0];
            if (contour) rim.setAttribute("d", contour); else missingRetained++;
          }
          for (const path of paths) if (!keep.includes(path)) path.remove();
        }
        for (const node of doc.querySelectorAll("[stroke-width]"))
          node.setAttribute(
            "stroke-width",
            String((Number(node.getAttribute("stroke-width")) * width) / 0.67),
          );
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(doc)], {
            type: "image/svg+xml",
          }),
        );
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          context.clearRect(0, 0, size, size);
          context.drawImage(image, 0, 0, size, size);
          const rgba = context.getImageData(0, 0, size, size).data;
          return {
            pixels: Uint8Array.from(
              { length: size * size },
              (_, i) => rgba[4 * i + 3],
            ),
            missingRetained,
          };
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      for (const pair of pairs) {
        for (const width of [0.67, 1, 4 / 3, 1.5]) {
          const a = await render(pair.variants[0], width, pair.outline);
          const b = await render(pair.variants[1], width, pair.solid);
          const outline = a.pixels;
          const solid = b.pixels;
          let error = 0;
          let paint = 0;
          for (let i = 0; i < outline.length; i++) {
            error += Math.abs(outline[i] - solid[i]);
            paint += Math.max(outline[i], solid[i]);
          }
          const difference = paint ? error / paint : 1;
          report(
            {
              name: pair.name,
              feature: pair.feature,
              width,
              difference,
              missingRetained: a.missingRetained + b.missingRetained,
            },
            difference <= 0.002 && a.missingRetained + b.missingRetained === 0,
          );
        }
      }
      // The inverse minus has an intentional fixed thickness. Compare its
      // anchor and flat terminal positions, independently of that thickness.
      const documentPair = pairs.find(({ name }) => name === "remove-document");
      const minusBounds = (pixels, inverse) => {
        let left = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        let top = Number.POSITIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        for (let y = Math.ceil(8.25 * scale); y < 11 * scale; y++) {
          for (let x = 4 * scale; x < 12 * scale; x++) {
            const alpha = pixels[y * size + x];
            if (inverse ? alpha < 128 : alpha >= 128) {
              left = Math.min(left, x / scale);
              right = Math.max(right, (x + 1) / scale);
              top = Math.min(top, y / scale);
              bottom = Math.max(bottom, (y + 1) / scale);
            }
          }
        }
        return { left, right, centerY: (top + bottom) / 2 };
      };
      for (const width of [0.67, 1, 4 / 3, 1.5]) {
        const outline = minusBounds(
          (await render(documentPair.variants[0], width)).pixels,
          false,
        );
        const solid = minusBounds(
          (await render(documentPair.variants[1], width)).pixels,
          true,
        );
        const drift = Math.max(
          ...["left", "right", "centerY"].map((key) =>
            Math.abs(outline[key] - solid[key]),
          ),
        );
        report(
          {
            name: "remove-document",
            feature: "positive/inverse minus anchor and terminals",
            width,
            outline,
            solid,
            drift,
          },
          Number.isFinite(drift) && drift <= 1 / scale,
        );
      }
      // Inspect the entire filled pair, including all overlaid rims. The rear
      // contour is two units from the unchanged foreground centerline, so its
      // clear gap must include the retained foreground stroke's half width.
      const groupProbes = [0.76, 0.8, 0.84, 0.88, 0.92, 0.96].map((t) => {
        const vx = 9 * (1 - t);
        const vy = 6 * t;
        const length = Math.hypot(vx, vy);
        return {
          feature: `filled rear shoulder clearance t=${t}`,
          point: [5.5 + 9 * t - 4.5 * t * t, 9 + 3 * t * t - 0.296875],
          normal: [vy / length, -vx / length],
        };
      });
      groupProbes.push({
        feature: "filled rear torso clearance",
        point: [10, 13 - 0.296875],
        normal: [1, 0],
      });
      for (const width of [0.67, 1, 4 / 3, 1.5]) {
        const { pixels } = await render(userGroup, width);
        for (const { feature, point, normal } of groupProbes) {
          let exit = null;
          let enter = null;
          for (let step = 0; step <= 4 * scale; step++) {
            const distance = step / scale;
            const x = Math.floor((point[0] + normal[0] * distance) * scale);
            const y = Math.floor((point[1] + normal[1] * distance) * scale);
            const painted = pixels[y * size + x] >= 128;
            if (exit === null && !painted) exit = distance;
            else if (exit !== null && painted) {
              enter = distance;
              break;
            }
          }
          const gap = exit !== null && enter !== null ? enter - exit : null;
          const expected = 2 - width / 2;
          report(
            { name: "user-group", feature, width, gap, expected },
            gap !== null && Math.abs(gap - expected) <= 1 / 16,
          );
        }
      }
      return { results, failures };
    },
    { pairs, userGroup: userGroup.svg },
  );
}
