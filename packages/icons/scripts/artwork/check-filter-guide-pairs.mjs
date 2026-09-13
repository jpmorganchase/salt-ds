// Inspect complete fitted paint. A solid surface must reach the same exterior
// boundary as its outline while retaining the clear mark, tabs and counters.
export async function checkFilterGuidePairs(page, records) {
  const names = [
    "filter",
    "filter-clear",
    "guide-closed",
    "flag",
    "folder-open",
    "marker",
    "laptop",
  ];
  const artwork = names.map((name) => ({
    name,
    pair: [".svg", "_solid.svg"].map((suffix) => {
      const record = records.find((item) => item.name === name + suffix);
      if (!record) throw new Error(`Missing paired artwork: ${name + suffix}`);
      return record.svg;
    }),
  }));
  return page.evaluate(async (artwork) => {
    const ppu = 128;
    const side = 16 * ppu;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const saved = new Map();
    const add = (row, pass) => {
      results.push({ ...row, pass });
      if (!pass) failures.push({ ...row, pass });
    };
    async function paint(svg, weight) {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.documentElement;
      root.setAttribute("width", side);
      root.setAttribute("height", side);
      root.setAttribute("style", "color:black");
      for (const el of [root, ...root.querySelectorAll("[stroke-width]")]) {
        const width = el.getAttribute("stroke-width");
        if (width)
          el.setAttribute("stroke-width", (Number(width) * weight) / 0.67);
      }
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(root)], {
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
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    function alphaAt(pixels, x, y) {
      const px = x * ppu - 0.5;
      const py = y * ppu - 0.5;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      if (ix < 0 || iy < 0 || ix + 1 >= side || iy + 1 >= side) return 0;
      const fx = px - ix;
      const fy = py - iy;
      const a = (dx, dy) => pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
      return (
        a(0, 0) * (1 - fx) * (1 - fy) +
        a(1, 0) * fx * (1 - fy) +
        a(0, 1) * (1 - fx) * fy +
        a(1, 1) * fx * fy
      );
    }
    function transitions(pixels, origin, direction, length) {
      const magnitude = Math.hypot(...direction);
      const d = direction.map((v) => v / magnitude);
      const at = (t) =>
        alphaAt(pixels, origin[0] + d[0] * t, origin[1] + d[1] * t);
      const crossings = [];
      let previous = at(0);
      let last = 0;
      const steps = Math.ceil(length * ppu * 2);
      for (let i = 1; i <= steps; i++) {
        const t = (length * i) / steps;
        const value = at(t);
        if (value >= 0.5 !== previous >= 0.5) {
          crossings.push({
            kind: value >= 0.5 ? "entry" : "exit",
            distance:
              last + ((t - last) * (0.5 - previous)) / (value - previous),
          });
        }
        previous = value;
        last = t;
      }
      return crossings;
    }
    function regionDifference(first, second, [left, top, right, bottom]) {
      let difference = 0;
      let union = 0;
      for (let y = Math.ceil(top * ppu); y < Math.floor(bottom * ppu); y++) {
        for (let x = Math.ceil(left * ppu); x < Math.floor(right * ppu); x++) {
          const index = (y * side + x) * 4 + 3;
          difference += Math.abs(first[index] - second[index]);
          union += Math.max(first[index], second[index]);
        }
      }
      return {
        relativeDifference: union ? difference / union : null,
        paintedAlpha: union / 255,
      };
    }
    const normalRay = (feature, point, normal) => ({
      feature,
      origin: point.map((v, i) => v + 1.75 * normal[i]),
      direction: normal.map((v) => -v),
      length: 3.5,
    });
    const diagonalLength = Math.hypot(3.953704, 4.447917);
    const funnelRays = [
      { feature: "funnel top", origin: [7, 0], direction: [0, 1], length: 3.5 },
      normalRay(
        "left funnel flank",
        [3.883464, 4.553242],
        [-4.447917 / diagonalLength, 3.953704 / diagonalLength],
      ),
      normalRay(
        "right funnel flank",
        [10.802446, 4.553242],
        [4.447917 / diagonalLength, 3.953704 / diagonalLength],
      ),
      {
        feature: "left funnel stem",
        origin: [4, 9],
        direction: [1, 0],
        length: 3,
      },
      {
        feature: "right funnel stem",
        origin: [10.5, 9],
        direction: [-1, 0],
        length: 3,
      },
      normalRay(
        "funnel lower diagonal",
        [7.342955, 12.46061],
        [1 / Math.sqrt(5), 2 / Math.sqrt(5)],
      ),
    ];
    const coverRays = [
      { feature: "cover top", origin: [10, 0], direction: [0, 1], length: 2 },
      {
        feature: "cover bottom",
        origin: [10, 16],
        direction: [0, -1],
        length: 2,
      },
      {
        feature: "cover left",
        origin: [1.5, 10],
        direction: [1, 0],
        length: 3,
      },
      {
        feature: "cover right",
        origin: [16, 10],
        direction: [-1, 0],
        length: 3,
      },
    ];
    const flagNormal = [3 / Math.sqrt(13), 2 / Math.sqrt(13)];
    const otherRays = {
      flag: [
        {
          feature: "flag upper field",
          origin: [4, 0.5],
          direction: [0, 1],
          length: 3,
        },
        {
          feature: "flag upper step",
          origin: [10, 2.7],
          direction: [0, 1],
          length: 3,
        },
        {
          feature: "flag lower field",
          origin: [3, 11],
          direction: [0, -1],
          length: 3,
        },
        normalRay("flag upper notch flank", [12.44111, 6.21154], flagNormal),
        normalRay(
          "flag lower notch flank",
          [12.44111, 9.78846],
          [flagNormal[0], -flagNormal[1]],
        ),
      ],
      "folder-open": [
        {
          feature: "folder front top",
          origin: [8, 5],
          direction: [0, 1],
          length: 3,
        },
        {
          feature: "folder front bottom",
          origin: [8, 16],
          direction: [0, -1],
          length: 3,
        },
        normalRay(
          "folder front right flank",
          [13.923917, 10.369569],
          [
            7.701089 / Math.hypot(7.701089, 1.777175),
            1.777175 / Math.hypot(7.701089, 1.777175),
          ],
        ),
      ],
      marker: [
        { feature: "sign top", origin: [8.5, 1], direction: [0, 1], length: 3 },
        {
          feature: "sign bottom",
          origin: [8.5, 10.5],
          direction: [0, -1],
          length: 3,
        },
        {
          feature: "sign left",
          origin: [0, 5.5],
          direction: [1, 0],
          length: 3,
        },
        normalRay(
          "sign upper point flank",
          [12.330533, 4.125001],
          [Math.SQRT1_2, -Math.SQRT1_2],
        ),
        normalRay(
          "sign lower point flank",
          [12.330533, 7.105771],
          [Math.SQRT1_2, Math.SQRT1_2],
        ),
      ],
      laptop: [
        { feature: "screen top", origin: [8, 1], direction: [0, 1], length: 3 },
        {
          feature: "screen left",
          origin: [0, 7],
          direction: [1, 0],
          length: 3,
        },
        {
          feature: "screen right",
          origin: [16, 7],
          direction: [-1, 0],
          length: 3,
        },
      ],
    };
    for (const { name, pair } of artwork) {
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const pixels = await Promise.all(pair.map((svg) => paint(svg, weight)));
        if (name.startsWith("filter")) saved.set(`${name}:${weight}`, pixels);
        const rays =
          otherRays[name] ?? (name === "guide-closed" ? coverRays : funnelRays);
        for (const ray of rays) {
          const entries = pixels.map(
            (painted) =>
              transitions(painted, ray.origin, ray.direction, ray.length).find(
                (item) => item.kind === "entry",
              )?.distance ?? null,
          );
          const delta = entries.every((value) => value !== null)
            ? entries[1] - entries[0]
            : null;
          add(
            {
              name,
              weight,
              feature: ray.feature,
              coordinateSpace: "final-16-unit-canvas",
              outlineEntry: entries[0],
              solidEntry: entries[1],
              delta,
              tolerance: 0.025,
            },
            delta !== null && Math.abs(delta) <= 0.025,
          );
        }
        if (name === "filter-clear" || name === "guide-closed") {
          const region =
            name === "filter-clear" ? [10, 8, 16, 15.5] : [0.2, 3, 2.2, 12.6];
          const measured = regionDifference(pixels[0], pixels[1], region);
          add(
            {
              name,
              weight,
              feature:
                name === "filter-clear"
                  ? "retained clear cross"
                  : "retained binding tabs",
              region,
              measured,
              tolerance: 0.015,
            },
            measured.paintedAlpha > 24 && measured.relativeDifference <= 0.015,
          );
        }
        if (
          name === "marker" ||
          name === "laptop" ||
          name === "flag" ||
          name === "folder-open"
        ) {
          const regions = {
            marker: [4.4, 10, 6.6, 15.8],
            laptop: [0, 12, 16, 16],
            flag: [0.7, 12.5, 2.7, 15.8],
            "folder-open": [0, 0, 16, 5.5],
          };
          const region = regions[name];
          const measured = regionDifference(pixels[0], pixels[1], region);
          add(
            {
              name,
              weight,
              feature: "retained companion geometry",
              region,
              measured,
              tolerance: 0.015,
            },
            measured.paintedAlpha > 24 && measured.relativeDifference <= 0.015,
          );
        }
        if (name === "guide-closed") {
          for (const counter of [
            {
              feature: "spine counter",
              origin: [4.4, 7.5],
              direction: [1, 0],
              length: 2.6,
              expected: 1.272727,
            },
            {
              feature: "cover text counter",
              origin: [10, 3.4],
              direction: [0, 1],
              length: 2.8,
              expected: 1.272727,
            },
          ]) {
            const crossings = transitions(
              pixels[1],
              counter.origin,
              counter.direction,
              counter.length,
            );
            const gap =
              crossings.length === 2 &&
              crossings[0].kind === "exit" &&
              crossings[1].kind === "entry"
                ? crossings[1].distance - crossings[0].distance
                : null;
            add(
              {
                name,
                weight,
                feature: counter.feature,
                gap,
                expected: counter.expected,
                tolerance: 0.025,
              },
              gap !== null && Math.abs(gap - counter.expected) <= 0.025,
            );
          }
        }
      }
    }
    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      for (const variant of [0, 1]) {
        const first = saved.get(`filter:${weight}`)[variant];
        const second = saved.get(`filter-clear:${weight}`)[variant];
        const regions = [
          [0, 0, 16, 8],
          [0, 8, 9.8, 16],
        ];
        const measured = regions.map((region) => ({
          region,
          ...regionDifference(first, second, region),
        }));
        add(
          {
            name: variant ? "filter_solid.svg" : "filter.svg",
            weight,
            feature: "funnel stable across clear state",
            measured,
            tolerance: 0.015,
          },
          measured.every(
            (item) =>
              item.paintedAlpha > 24 && item.relativeDifference <= 0.015,
          ),
        );
      }
    }
    return { results, failures };
  }, artwork);
}
