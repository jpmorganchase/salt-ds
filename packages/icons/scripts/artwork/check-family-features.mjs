// Verify the final repeated speaker and the optical weights of peer statuses.
// These measurements use rendered exports, independently of their recipes.
export async function checkFamilyFeatures(page, records) {
  const names = [
    "volume-down.svg",
    "volume-up.svg",
    "volume-off.svg",
    "progress-cancelled.svg",
    "progress-closed.svg",
    "progress-complete.svg",
    "progress-onhold.svg",
    "progress-pending.svg",
    "progress-rejected.svg",
  ];
  const samples = names.map((name) => {
    const sample = records.find((record) => record.name === name);
    if (!sample) throw new Error(`Missing family feature specimen: ${name}`);
    return sample;
  });
  return page.evaluate(async (samples) => {
    const results = [];
    const failures = [];
    const record = (details, pass) => {
      results.push(details);
      if (!pass) failures.push(details);
    };
    const scale = 64;
    const size = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const render = async (svg, weight = 1.333333) => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      for (const element of doc.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
        if (Number.isFinite(width))
          element.setAttribute("stroke-width", String((width * weight) / 0.67));
      }
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        }),
      );
      const image = new Image();
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () =>
            reject(new Error("Could not render family specimen"));
          image.src = url;
        });
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
      return Uint8Array.from(
        context
          .getImageData(0, 0, size, size)
          .data.filter((_, i) => i % 4 === 3),
      );
    };
    const at = (alpha, x, y) =>
      alpha[Math.floor(y * scale) * size + Math.floor(x * scale)];
    const speakers = [];
    for (const sample of samples.filter(({ name }) =>
      name.startsWith("volume-"),
    )) {
      const host = document.createElement("div");
      host.innerHTML = sample.svg;
      document.body.append(host);
      try {
        const filled = [...host.querySelectorAll("path")].filter(
          (path) => getComputedStyle(path).fill !== "none",
        );
        record(
          {
            name: sample.name,
            check: "one-filled-speaker",
            count: filled.length,
          },
          filled.length === 1,
        );
        if (filled.length !== 1) continue;
        const path = filled[0];
        const bounds = path.getBBox();
        const measured = [bounds.x, bounds.y, bounds.width, bounds.height];
        const target = [0.25, 2.1, 7.509091, 11.8];
        record(
          { name: sample.name, check: "speaker-final-frame", measured, target },
          measured.every(
            (value, axis) => Math.abs(value - target[axis]) < 0.02,
          ),
        );
        speakers.push({ name: sample.name, measured });
        // Check the six-vertex speaker independently of the shared source: its
        // rectangular throat and sloping horn must survive a family-wide edit.
        const expected = new Path2D();
        const points = [
          [0, 3.5 / 11],
          [3 / 7, 3.5 / 11],
          [1, 0],
          [1, 1],
          [3 / 7, 7.5 / 11],
          [0, 7.5 / 11],
        ];
        points.forEach(([x, y], index) => {
          expected[index ? "lineTo" : "moveTo"](
            bounds.x + x * bounds.width,
            bounds.y + y * bounds.height,
          );
        });
        expected.closePath();
        let differences = 0;
        let area = 0;
        for (let y = bounds.y + 0.037; y < bounds.y + bounds.height; y += 0.075)
          for (
            let x = bounds.x + 0.037;
            x < bounds.x + bounds.width;
            x += 0.075
          ) {
            const wanted = context.isPointInPath(expected, x, y);
            const actual = path.isPointInFill(new DOMPoint(x, y));
            area += Number(wanted || actual);
            differences += Number(wanted !== actual);
          }
        record(
          {
            name: sample.name,
            check: "speaker-preserved-contour",
            differences,
            area,
          },
          area > 100 && differences / area < 0.003,
        );
      } finally {
        host.remove();
      }
    }
    for (const speaker of speakers.slice(1)) {
      const drift = speaker.measured.map((value, axis) =>
        Math.abs(value - speakers[0].measured[axis]),
      );
      record(
        {
          name: speaker.name,
          check: "speaker-shared-anchor-and-size",
          comparedWith: speakers[0].name,
          drift,
        },
        drift.every((value) => value < 0.01),
      );
    }
    const q = Math.SQRT1_2;
    const probes = [
      {
        name: "progress-cancelled.svg",
        center: [6, 6],
        normal: [-q, q],
        target: 1.75,
      },
      {
        name: "progress-closed.svg",
        center: [8, 5.225],
        normal: [0, 1],
        target: 1.6,
      },
      {
        name: "progress-complete.svg",
        center: [5, 9.25],
        normal: [-q, q],
        target: 2,
      },
      {
        name: "progress-onhold.svg",
        center: [5.913462, 8],
        normal: [1, 0],
        target: 1.788462,
      },
      {
        name: "progress-pending.svg",
        center: [8, 5.5],
        normal: [1, 0],
        target: 1.192308,
      },
      {
        name: "progress-rejected.svg",
        center: [8, 8],
        normal: [0, 1],
        target: 2,
      },
    ];
    for (const probe of probes) {
      let reference;
      const svg = samples.find(({ name }) => name === probe.name).svg;
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const alpha = await render(svg, weight);
        // Integrate inverse coverage across the stem, away from joins/caps.
        // A fixed 3-unit sampling interval excludes other sides of the square.
        let width = 0;
        const step = 1 / 256;
        for (let offset = -1.5 + step / 2; offset < 1.5; offset += step)
          width +=
            (1 -
              at(
                alpha,
                probe.center[0] + probe.normal[0] * offset,
                probe.center[1] + probe.normal[1] * offset,
              ) /
                255) *
            step;
        record(
          {
            name: probe.name,
            check: "progress-optical-stem",
            weight,
            measured: width,
            target: probe.target,
          },
          Math.abs(width - probe.target) < 0.04,
        );
        if (reference) {
          let changed = 0;
          for (let i = 0; i < alpha.length; i++)
            changed += Number(alpha[i] !== reference[i]);
          record(
            {
              name: probe.name,
              check: "progress-filled-mark-stroke-invariance",
              weight,
              changed,
            },
            changed === 0,
          );
        } else reference = alpha;
      }
    }
    return { results, failures };
  }, samples);
}
