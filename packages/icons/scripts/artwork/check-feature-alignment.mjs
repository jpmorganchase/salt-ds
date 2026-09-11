// Measure painted landmarks in the exported artwork. These checks compare
// related features rather than SVG path syntax or whole-icon mass centers.
export async function checkFeatureAlignment(page, records) {
  const names = [
    "group.svg",
    "group_solid.svg",
    "stethoscope.svg",
    "stethoscope_solid.svg",
    "storefront.svg",
    "storefront_solid.svg",
    "presentation_solid.svg",
    "document-draft.svg",
    "document-search.svg",
    "export.svg",
    "export_solid.svg",
    "import.svg",
    "import_solid.svg",
    "history.svg",
    "watch.svg",
    "watch_solid.svg",
    "schedule-time.svg",
    "schedule-time_solid.svg",
    "progress-pending.svg",
  ];
  const artwork = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing alignment artwork: ${name}`);
    return record;
  });
  return page.evaluate(async (artwork) => {
    const scale = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16 * scale;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const samples = {};
    function measure(pixels, axis, at, from, to, inverse = false) {
      let mass = 0;
      let moment = 0;
      for (let p = Math.round(from * scale); p < Math.round(to * scale); p++) {
        const x = axis === "x" ? p : Math.floor(at * scale);
        const y = axis === "y" ? p : Math.floor(at * scale);
        const alpha = pixels[(y * canvas.width + x) * 4 + 3] / 255;
        const value = inverse ? 1 - alpha : alpha;
        mass += value;
        moment += (value * (p + 0.5)) / scale;
      }
      return { width: mass / scale, center: mass ? moment / mass : null };
    }
    function check(result, passed) {
      results.push(result);
      if (!passed) failures.push(result);
    }
    const tolerance = 2 / scale;
    for (const { name, svg } of artwork)
      for (const weight of [0.67]) {
        const source = svg.replace("<svg ", '<svg style="color:black" ');
        const url = URL.createObjectURL(
          new Blob([source], { type: "image/svg+xml" }),
        );
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
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
          if (name.startsWith("group")) {
            for (const axis of ["x", "y"]) {
              const m = measure(pixels, axis, 9.25, 6, 12.75);
              samples[`${name}:${weight}:${axis}`] = m;
              if (name.endsWith("_solid.svg")) {
                const outline = samples[`group.svg:${weight}:${axis}`];
                check(
                  {
                    name,
                    weight,
                    feature: `foreground square ${axis} center`,
                    outline,
                    solid: m,
                  },
                  m.center !== null &&
                    outline.center !== null &&
                    Math.abs(m.center - outline.center) <= tolerance,
                );
              }
            }
          } else if (name.startsWith("stethoscope")) {
            const chest = measure(pixels, "x", 7, 9.25, 15);
            const tube = measure(pixels, "x", 9.875, 9.25, 15);
            check(
              {
                name,
                weight,
                feature: "tube aligned with chest piece",
                chest,
                tube,
              },
              chest.center !== null &&
                tube.center !== null &&
                Math.abs(chest.center - tube.center) <= tolerance,
            );
          } else if (name.startsWith("storefront")) {
            for (const [feature, y, from, to] of [
              ["window", 10.5, 3.5, 8.5],
              ["door", 11.5, 8.75, 12.25],
            ]) {
              const m = measure(
                pixels,
                "x",
                y,
                from,
                to,
                name.endsWith("_solid.svg"),
              );
              samples[`${name}:${weight}:${feature}`] = m;
              if (name.endsWith("_solid.svg")) {
                const outline = samples[`storefront.svg:${weight}:${feature}`];
                check(
                  {
                    name,
                    weight,
                    feature: `${feature} center`,
                    outline,
                    solidCounter: m,
                  },
                  m.center !== null &&
                    outline.center !== null &&
                    Math.abs(m.center - outline.center) <= tolerance,
                );
              }
            }
          } else if (name.startsWith("export") || name.startsWith("import")) {
            const solid = name.endsWith("_solid.svg");
            const base = name.split("_")[0].replace(".svg", "");
            const probes =
              base === "export"
                ? [
                    ["upright", "x", 8, 1.625, 4.25],
                    ["top", "y", 4.5, 1.625, 3.5],
                    ["bottom", "y", 4.5, 12.5, 14.375],
                  ]
                : [
                    ["upright", "x", 8, 12.25, 14.375],
                    ["top", "y", 9.5, 1.625, 3.5],
                    ["bottom", "y", 9.5, 12.5, 14.375],
                  ];
            for (const [feature, axis, at, from, to] of probes) {
              const m = measure(pixels, axis, at, from, to, solid);
              samples[`${name}:${weight}:${feature}`] = m;
              if (solid) {
                const outline = samples[`${base}.svg:${weight}:${feature}`];
                check(
                  {
                    name,
                    weight,
                    feature: `${feature} bracket alignment`,
                    outline,
                    inverseCounter: m,
                  },
                  m.center !== null &&
                    outline.center !== null &&
                    Math.abs(m.center - outline.center) <= tolerance,
                );
              }
            }
          } else if (
            name.startsWith("watch") ||
            name === "history.svg" ||
            name.startsWith("schedule-time") ||
            name === "progress-pending.svg"
          ) {
            const inverse =
              name === "watch_solid.svg" || name === "progress-pending.svg";
            const secondary = name.startsWith("schedule-time");
            const hostCenter = { x: 8, y: secondary ? 28 / 3 : 8 };
            const handWidth = inverse ? 1 : weight * (secondary ? 0.72 : 1);
            const stem = measure(
              pixels,
              "x",
              secondary ? hostCenter.y - 0.8 : 6.75,
              6.75,
              9.25,
              inverse,
            );
            check(
              {
                name,
                weight,
                feature: "vertical clock hand centered on host",
                stem,
                hostCenter,
              },
              stem.center !== null &&
                Math.abs(stem.center - hostCenter.x) <= tolerance &&
                Math.abs(stem.width - handWidth) <= tolerance,
            );
            // Sample the short hand beyond the vertical stem and before its
            // square tip. Two sections distinguish a diagonal from an L mark
            // or a displaced horizontal hand, including the compact watch.
            const sections = (secondary ? [0.6, 0.75] : [0.78, 0.9]).map(
              (offset) => {
                const at = hostCenter.x + offset;
                const x = (Math.floor(at * scale) + 0.5) / scale;
                const measured = measure(
                  pixels,
                  "y",
                  at,
                  hostCenter.y - 1.125,
                  hostCenter.y + 1.75,
                  inverse,
                );
                const expectedCenter =
                  hostCenter.y + (2 / 3) * (x - hostCenter.x);
                check(
                  {
                    name,
                    weight,
                    feature: "angled short clock hand",
                    x,
                    measured,
                    expectedCenter,
                  },
                  measured.center !== null &&
                    Math.abs(measured.center - expectedCenter) <= tolerance &&
                    Math.abs(
                      measured.width - (handWidth * Math.sqrt(13)) / 3,
                    ) <= tolerance,
                );
                return { x, ...measured };
              },
            );
            const slope = sections.every((section) => section.center !== null)
              ? (sections[1].center - sections[0].center) /
                (sections[1].x - sections[0].x)
              : null;
            const pivotY =
              stem.center !== null && sections[0].center !== null
                ? sections[0].center - (2 / 3) * (sections[0].x - stem.center)
                : null;
            check(
              {
                name,
                weight,
                feature: "clock hands meet at centered pivot",
                slope,
                pivotY,
                hostCenter,
              },
              slope !== null &&
                Math.abs(slope - 2 / 3) <= 0.12 &&
                pivotY !== null &&
                Math.abs(pivotY - hostCenter.y) <= tolerance,
            );
          } else if (name === "presentation_solid.svg") {
            // The header is a filled band above an inverse separator at y5.
            const separator = measure(pixels, "y", 8, 4.25, 5.75, true);
            const header = measure(pixels, "x", 3.5, 3, 13);
            check(
              {
                name,
                weight,
                feature: "filled header and aligned separator",
                separator,
                header,
              },
              separator.center !== null &&
                Math.abs(separator.center - 5) <= tolerance &&
                header.width >= 10 - tolerance,
            );
          } else {
            const lines =
              name === "document-draft.svg"
                ? [
                    ["upper content line", 6, 10],
                    ["lower content line", 6, 12],
                  ]
                : [
                    ["upper content line", 6, 6.5],
                    ["lower content mark", 5.5, 9.5],
                  ];
            for (const [feature, x, y] of lines) {
              const m = measure(pixels, "y", x, y - 0.875, y + 0.875);
              check(
                { name, weight, feature, measurement: m },
                Math.abs(m.width - weight) <= tolerance,
              );
            }
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    return { results, failures };
  }, artwork);
}
