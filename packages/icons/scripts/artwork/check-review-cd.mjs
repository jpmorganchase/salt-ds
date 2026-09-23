// Compare final painted landmarks; restoring construction coordinates would
// hide the outline/solid drift that this regression check guards against.
export async function checkReviewCd(page, records) {
  const pairs = [
    { name: "stethoscope" },
    { name: "workflow" },
    { name: "tag", outline: [0], solid: [0] },
    { name: "tag-clear", outline: "primary", solid: "primary" },
    { name: "settings", outline: [0], solid: [0] },
    { name: "tree" },
    { name: "ungroup" },
    { name: "user" },
    { name: "user-group" },
  ];
  const samples = pairs.map((pair) => ({
    ...pair,
    variants: [".svg", "_solid.svg"].map((suffix) => {
      const sample = records.find(({ name }) => name === pair.name + suffix);
      if (!sample)
        throw new Error(`Missing reviewed pair: ${pair.name + suffix}`);
      return sample.svg;
    }),
  }));
  return page.evaluate(async (samples) => {
    const scale = 64;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const record = (result, pass) => {
      results.push(result);
      if (!pass) failures.push(result);
    };
    const render = async (svg, width, retained) => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      if (retained) {
        const paths = [...doc.querySelectorAll("path")];
        const inherited = (node, attribute) => {
          while (node?.getAttribute) {
            if (node.hasAttribute(attribute))
              return node.getAttribute(attribute);
            node = node.parentNode;
          }
          return null;
        };
        const strokes = paths.filter(
          (path) => inherited(path, "stroke") === "currentColor",
        );
        const keep =
          retained === "primary"
            ? strokes.filter(path => Number(inherited(path, "stroke-width")) >= 0.669)
            : retained === "all"
            ? strokes
            : retained.map((index) => strokes[index]);
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
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
        return Uint8Array.from(
          context
            .getImageData(0, 0, size, size)
            .data.filter((_, index) => index % 4 === 3),
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    for (const sample of samples) {
      for (const width of [0.67, 1, 4 / 3, 1.5]) {
        const outline = await render(
          sample.variants[0],
          width,
          sample.outline ?? "all",
        );
        const solid = await render(
          sample.variants[1],
          width,
          sample.solid ?? "all",
        );
        let error = 0;
        let paint = 0;
        for (let pixel = 0; pixel < outline.length; pixel++) {
          error += Math.abs(outline[pixel] - solid[pixel]);
          paint += Math.max(outline[pixel], solid[pixel]);
        }
        const difference = paint ? error / paint : 1;
        record(
          {
            name: sample.name,
            feature: "retained final rim and route",
            width,
            difference,
          },
          difference <= 0.002,
        );
      }
    }
    // The solid gear has a modest optical opening, rather than the previous
    // more-than-double bore radius. Measure paint, including the themed rim.
    const settings = samples.find(({ name }) => name === "settings");
    const radius = (pixels) => {
      const y = 8 * scale;
      let left = 8 * scale;
      let right = 8 * scale;
      while (left > 0 && pixels[y * size + left] < 128) left--;
      while (right < size && pixels[y * size + right] < 128) right++;
      return {
        radius: (right - left) / (2 * scale),
        center: (right + left) / (2 * scale),
      };
    };
    const outlineBore = radius(await render(settings.variants[0], 4 / 3));
    const solidBore = radius(await render(settings.variants[1], 4 / 3));
    const ratio = solidBore.radius / outlineBore.radius;
    record(
      {
        name: "settings",
        feature: "reviewed optical bore",
        width: 4 / 3,
        outlineBore,
        solidBore,
        ratio,
      },
      ratio >= 1.15 &&
        ratio <= 1.5 &&
        solidBore.radius >= 1.75 &&
        Math.abs(outlineBore.center - solidBore.center) <= 1 / scale,
    );
    return { results, failures };
  }, samples);
}
