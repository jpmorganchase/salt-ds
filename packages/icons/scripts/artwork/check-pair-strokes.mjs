// Measure visible line widths, including contours mistakenly encoded as fills.
// These samples cover retained open features, away from filled surfaces or joins.
export async function checkPairStrokes(page, records) {
  const features = [
    {
      name: "group",
      feature: "exposed rear square",
      point: [4.5, 6],
      axis: "x",
      span: 0.8,
    },
    {
      name: "devices",
      feature: "phone header rim",
      point: [12.5, 17 / 3],
      axis: "y",
      span: 0.9,
    },
    {
      name: "building",
      feature: "doorway baseline",
      point: [8, 14.5],
      axis: "y",
      span: 1,
    },
    {
      name: "buildings",
      feature: "ground between buildings",
      point: [10, 14.5],
      axis: "y",
      span: 1,
    },
    { name: "accessible", feature: "arm", point: [10, 6.5], axis: "y" },
    { name: "accessible", feature: "foot", point: [14, 13], axis: "y" },
    { name: "map", feature: "left perimeter", point: [2, 8], axis: "x" },
    { name: "utensils", feature: "fork handle", point: [5, 12], axis: "x" },
    { name: "utensils", feature: "knife handle", point: [13, 12], axis: "x" },
    {
      name: "column-chooser",
      feature: "left perimeter",
      point: [1.5, 8],
      axis: "x",
    },
    {
      name: "column-chooser",
      feature: "center rule",
      point: [8, 8],
      axis: "x",
    },
    {
      name: "maximize",
      feature: "top header rim",
      point: [8, 2.5],
      axis: "y",
      span: 1,
    },
    {
      name: "calendar",
      feature: "top header rim",
      point: [8, 11 / 3],
      axis: "y",
      span: 1,
    },
    {
      name: "mobile",
      feature: "top header rim",
      point: [8, 5 / 3],
      axis: "y",
      span: 0.95,
    },
    {
      name: "inbox",
      feature: "upper tray extension",
      point: [2.5, 7.75],
      axis: "x",
    },
    ...["csv", "pdf", "xls", "zip"].map((name) => ({
      name,
      feature: "open page frame",
      point: [2.5, 4.5],
      axis: "x",
    })),
    ...["open", "close"].flatMap((operation) =>
      [
        { name: `panel-${operation}-left`, point: [9, 5 / 3], axis: "y" },
        { name: `panel-${operation}-top`, point: [43 / 3, 9], axis: "x" },
        { name: `panel-${operation}-right`, point: [7, 43 / 3], axis: "y" },
        { name: `panel-${operation}-bottom`, point: [5 / 3, 7], axis: "x" },
      ].map((sample) => ({ ...sample, feature: "exposed perimeter", span: 1 })),
    ),
    { name: "music", feature: "left note stem", point: [6.5, 7.5], axis: "x" },
    {
      name: "music-disabled",
      feature: "right note stem",
      point: [13.5, 6.5],
      axis: "x",
    },
    {
      name: "search",
      feature: "handle",
      point: [13, 13],
      axis: "y",
      factor: Math.SQRT2,
      span: 1.125,
    },
    {
      name: "browser",
      feature: "left content frame",
      point: [5 / 3, 26 / 3],
      axis: "x",
    },
    {
      name: "laptop",
      feature: "base bottom",
      point: [8, 38 / 3],
      axis: "y",
      span: 0.8,
    },
    {
      name: "globe",
      feature: "right outer rim",
      point: [43 / 3, 8],
      axis: "x",
    },
  ];
  const samples = features.map((feature) => ({
    ...feature,
    artwork: [".svg", "_solid.svg"].map((suffix) => {
      const file = feature.name + suffix;
      const record = records.find((candidate) => candidate.name === file);
      if (!record) throw new Error(`Missing pair-stroke artwork: ${file}`);
      return record.svg;
    }),
  }));
  return page.evaluate(async (samples) => {
    const scale = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16 * scale;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    for (const {
      name,
      feature,
      point,
      axis,
      artwork,
      span = 1.125,
      factor = 1,
    } of samples) {
      for (const weight of [0.67]) {
        const measurements = [];
        for (const svg of artwork) {
          const markup = svg.replace("<svg ", '<svg style="color:black" ');
          const url = URL.createObjectURL(
            new Blob([markup], { type: "image/svg+xml" }),
          );
          try {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => reject(new Error(`Could not render ${name}`));
              img.src = url;
            });
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pixels = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let alpha = 0;
            let moment = 0;
            const normal = axis === "x" ? 0 : 1;
            const start = Math.floor((point[normal] - span) * scale);
            const end = Math.ceil((point[normal] + span) * scale);
            for (let p = start; p < end; p++) {
              const x = normal === 0 ? p : Math.floor(point[0] * scale);
              const y = normal === 1 ? p : Math.floor(point[1] * scale);
              const value = pixels[(y * canvas.width + x) * 4 + 3] / 255;
              alpha += value;
              moment += (value * (p + 0.5)) / scale;
            }
            measurements.push({
              width: alpha / scale,
              center: alpha ? moment / alpha : null,
            });
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        const [outline, solid] = measurements;
        const result = { name, feature, weight, point, axis, outline, solid };
        results.push(result);
        const tolerance = 2 / scale;
        if (
          measurements.some(
            (m) => Math.abs(m.width - weight * factor) > tolerance,
          ) ||
          Math.abs(outline.width - solid.width) > tolerance ||
          outline.center === null ||
          solid.center === null ||
          Math.abs(outline.center - solid.center) > tolerance
        )
          failures.push(result);
      }
    }
    return { results, failures };
  }, samples);
}
