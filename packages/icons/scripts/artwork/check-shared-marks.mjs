// Compare the visible marks in actual fitted exports. Deliberately do not
// import the drawing recipes: the contract is shared final geometry, including
// positive paint, transparent cutouts, aliases and configurable container strokes.
export async function checkSharedMarks(page, records) {
  const specimens = [];
  const add = (
    name,
    family,
    inverse,
    count,
    dots = [],
    bare = false,
    offsetY = 0,
    features = {},
  ) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing shared-mark artwork: ${name}`);
    specimens.push({
      ...record,
      family,
      inverse,
      count,
      dots,
      bare,
      offsetY,
      ...features,
    });
  };
  for (const name of [
    "checkmark_solid.svg",
    "success_solid.svg",
    "success_small_solid.svg",
    "success-circle_solid.svg",
    "step-success.svg",
    "progress-complete.svg",
  ])
    add(name, "tick", true, 1);
  for (const name of [
    "checkmark.svg",
    "success.svg",
    "success_small.svg",
    "success-tick.svg",
    "success-circle.svg",
  ])
    add(name, "tick", false, 1, [], name !== "success-circle.svg");
  // These lower bounds are review criteria for readable status punctuation,
  // independent of the source constructors. Pair equality alone would also
  // pass two identically weakened marks.
  const statusStemProbes = (
    centerY,
    minimumHeight,
    span,
    minimumStemWidth = 2.6,
  ) => [
    {
      feature: "strong status stem width",
      point: [8, centerY],
      normal: [1, 0],
      span: 4,
      minimumWidth: minimumStemWidth,
    },
    {
      feature: "legible status stem height",
      point: [8, centerY],
      normal: [0, 1],
      span,
      minimumWidth: minimumHeight,
    },
  ];
  for (const [name, family, dots, features = {}] of [
    // Their containers need different stem lengths. Each positive/inverse
    // pair retains exact geometry; their status dots still match each other.
    [
      "error",
      "error-exclamation",
      [[8, 12]],
      { dotRole: "status", probes: statusStemProbes(6, 6.55, 8) },
    ],
    [
      "warning",
      "warning-exclamation",
      [[8, 12.375]],
      { dotRole: "status", probes: statusStemProbes(8.675, 3.25, 4.6, 2.2) },
    ],
    [
      "info",
      "information",
      [[8, 4]],
      { dotRole: "status", probes: statusStemProbes(10, 6.55, 8) },
    ],
    ["help-circle", "question", [[8, 12]]],
    ["help", "question", [[8, 12]]],
    [
      "chatting",
      "ellipsis",
      [
        [4, 6.5],
        [8, 6.5],
        [12, 6.5],
      ],
    ],
  ]) {
    add(
      `${name}.svg`,
      family,
      false,
      family === "ellipsis" ? 3 : 2,
      dots,
      false,
      0,
      features,
    );
    add(
      `${name}_solid.svg`,
      family,
      true,
      family === "ellipsis" ? 3 : 2,
      dots,
      false,
      0,
      features,
    );
  }

  for (const [name, points] of [
    [
      "micro-menu.svg",
      [
        [8, 1.25],
        [8, 8],
        [8, 14.75],
      ],
    ],
    [
      "overflow-menu.svg",
      [
        [1.25, 8],
        [8, 8],
        [14.75, 8],
      ],
    ],
  ])
    add(name, name, false, 3, points, true);

  // A removal modifier must remain a distinct horizontal mark in either
  // polarity, independent of the surrounding bookmark's configurable stroke.
  for (const inverse of [false, true])
    add(
      `remove-bookmark${inverse ? "_solid" : ""}.svg`,
      "bookmark-removal",
      inverse,
      1,
      [],
      false,
      0,
      {
        probes: [
          {
            feature: "legible removal mark thickness",
            point: [8, 6.75],
            normal: [0, 1],
            minimumWidth: 1.45,
          },
          {
            feature: "horizontal removal gesture",
            point: [8, 6.75],
            normal: [1, 0],
            span: 6,
            minimumWidth: 4.9,
          },
        ],
      },
    );

  // Compact action ticks are validated with their own role-specific geometry.

  const faceEyes = [
    [5.25, 6.25],
    [10.75, 6.25],
  ];
  const mouthProbe = (point, feature = "legible facial mouth band") => ({
    feature,
    point,
    normal: [0, 1],
    // 1.45 final units retains over 1 CSS pixel of the intended 1.5-unit band.
    minimumWidth: 1.45,
  });
  for (const [expression, count, dots, point] of [
    ["dissatisfied", 3, faceEyes, [8, 10]],
    ["neutral", 3, faceEyes, [8, 11.25]],
    ["satisfied", 3, faceEyes, [8, 12]],
    [
      "very-dissatisfied",
      5,
      [
        [5.25, 6.75],
        [10.75, 6.75],
      ],
      [8, 10],
    ],
  ]) {
    for (const inverse of [false, true])
      add(
        `semantic-${expression}${inverse ? "_solid" : ""}.svg`,
        `face-${expression}`,
        inverse,
        count,
        dots,
        false,
        0,
        { probes: [mouthProbe(point)] },
      );
  }
  for (const inverse of [false, true])
    add(
      `semantic-very-satisfied${inverse ? "_solid" : ""}.svg`,
      "face-very-satisfied",
      inverse,
      3,
      [],
      false,
      0,
      {
        // This pair deliberately opens the inverse mouth. Only its happy eye
        // curves share a contour; each mouth must still have visible mass.
        comparisonRegion: [0, 0, 16, 8],
        // A narrow center opening makes these arches read as diamonds. Require
        // about one CSS pixel of interior at 12px, bounded by both painted arms.
        clearances: [5.25, 10.75].map((x) => ({
          feature: "open happy eye arch",
          point: [x, 6.25],
          minimumWidth: 1.2,
        })),
        probes: [
          {
            ...mouthProbe([5.25, 5.375], "legible left happy eye band"),
            minimumWidth: 1.05,
          },
          {
            ...mouthProbe([10.75, 5.375], "legible right happy eye band"),
            minimumWidth: 1.05,
          },
          ...(inverse
            ? [
                {
                  feature: "open broad-smile mouth height",
                  point: [8, 11.5],
                  normal: [0, 1],
                  span: 5,
                  minimumWidth: 3.9,
                },
              ]
            : [
                mouthProbe([8, 10.25], "legible broad-smile upper lip"),
                mouthProbe([8, 12.75], "legible broad-smile lower lip"),
              ]),
        ],
      },
    );

  return page.evaluate(async (specimens) => {
    const size = 512;
    const scale = size / 16;
    const weights = [0.67, 1, 1.333333, 1.5];
    const results = [];
    const failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const record = (result, passed) => {
      results.push(result);
      if (!passed) failures.push(result);
    };
    const compare = (actual, reference, details, maximumDifference = 0.04) => {
      let difference = 0;
      let union = 0;
      for (let i = 0; i < actual.length; i++) {
        difference += Math.abs(actual[i] - reference[i]);
        union += Math.max(actual[i], reference[i]);
      }
      const differenceArea = difference / (255 * scale * scale);
      const unionArea = union / (255 * scale * scale);
      // Allow raster edge rounding, while rejecting subpixel contour drift.
      const maximumDifferenceArea = Math.max(
        maximumDifference,
        unionArea * 0.005,
      );
      record(
        { ...details, differenceArea, unionArea, maximumDifferenceArea },
        differenceArea <= maximumDifferenceArea,
      );
    };

    const render = async ({ svg, inverse, bare }, weight) => {
      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      document.documentElement.setAttribute("style", "color:black");
      for (const element of document.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
        if (Number.isFinite(width))
          element.setAttribute("stroke-width", String((width * weight) / 0.67));
      }
      const markup = new XMLSerializer().serializeToString(document);
      const url = URL.createObjectURL(
        new Blob([markup], { type: "image/svg+xml" }),
      );
      const image = new Image();
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () =>
            reject(new Error("Could not render shared mark"));
          image.src = url;
        });
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
      const pixels = context.getImageData(0, 0, size, size).data;
      const values = new Uint8Array(size * size);
      for (let i = 0; i < values.length; i++)
        values[i] = inverse ? 255 - pixels[i * 4 + 3] : pixels[i * 4 + 3];

      // Label whole-image components before selecting the internal region.
      // Cropping first would turn portions of a container into apparent marks.
      // For inverse icons the exterior is one rejected boundary component.
      const labels = new Uint32Array(values.length);
      const queue = new Uint32Array(values.length);
      const components = [];
      let id = 0;
      const low = bare ? 0 : 2.25 * scale;
      const high = bare ? size : 13.75 * scale;
      for (let start = 0; start < values.length; start++) {
        if (values[start] < 128 || labels[start]) continue;
        id++;
        let read = 0;
        let write = 1;
        queue[0] = start;
        labels[start] = id;
        let left = size;
        let top = size;
        let right = 0;
        let bottom = 0;
        while (read < write) {
          const index = queue[read++];
          const x = index % size;
          const y = Math.floor(index / size);
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (
                (!dx && !dy) ||
                x + dx < 0 ||
                x + dx >= size ||
                y + dy < 0 ||
                y + dy >= size
              )
                continue;
              const neighbor = index + dy * size + dx;
              if (values[neighbor] >= 128 && !labels[neighbor]) {
                labels[neighbor] = id;
                queue[write++] = neighbor;
              }
            }
          }
        }
        if (
          left >= low &&
          top >= low &&
          right < high &&
          bottom < high &&
          write > 8
        )
          components.push({ id, left, top, right, bottom });
      }
      const selected = new Set(components.map((component) => component.id));
      const mask = new Uint8Array(values.length);
      const assigned = new Uint32Array(values.length);
      for (let index = 0; index < values.length; index++) {
        if (!values[index]) continue;
        let label = selected.has(labels[index]) ? labels[index] : 0;
        // Retain antialias coverage surrounding each selected hard component.
        if (!label && !labels[index]) {
          const x = index % size;
          const y = Math.floor(index / size);
          for (let dy = -1; dy <= 1 && !label; dy++) {
            for (let dx = -1; dx <= 1 && !label; dx++) {
              if (x + dx < 0 || x + dx >= size || y + dy < 0 || y + dy >= size)
                continue;
              const neighbor = labels[index + dy * size + dx];
              if (selected.has(neighbor)) label = neighbor;
            }
          }
        }
        if (label) {
          mask[index] = values[index];
          assigned[index] = label;
        }
      }
      return { mask, assigned, components };
    };

    const baseline = new Map();
    for (const weight of weights) {
      const families = new Map();
      const firstDots = new Map();
      let errorMask;
      for (const specimen of specimens) {
        const {
          name,
          family,
          dots,
          dotRole = "detail",
          count,
          offsetY,
          comparisonRegion,
          probes = [],
          clearances = [],
        } = specimen;
        const { mask, assigned, components } = await render(specimen, weight);
        record(
          {
            name,
            weight,
            feature: "separate internal mark components",
            count: components.length,
            expectedCount: count,
          },
          components.length === count,
        );
        if (name === "error.svg") errorMask = mask;
        if (name === "error_solid.svg")
          compare(mask, errorMask, {
            name,
            reference: "error.svg",
            weight,
            feature: "positive/inverse absolute mark alignment",
          });
        // Normalize only the reviewed vertical placement difference. Keep the
        // unshifted mask for pair alignment, dot anchors and stroke invariance.
        let fixedMask = mask;
        if (comparisonRegion) {
          const [left, top, right, bottom] = comparisonRegion;
          fixedMask = new Uint8Array(mask.length);
          for (let y = top * scale; y < bottom * scale; y++)
            for (let x = left * scale; x < right * scale; x++)
              fixedMask[y * size + x] = mask[y * size + x];
        }
        const normalized = offsetY ? new Uint8Array(mask.length) : fixedMask;
        if (offsetY) {
          const shift = Math.round(offsetY * scale);
          for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++)
              if (y - shift >= 0 && y - shift < size)
                normalized[y * size + x] = fixedMask[(y - shift) * size + x];
        }
        const reference = families.get(family);
        if (reference)
          compare(
            normalized,
            reference.mask,
            {
              name,
              reference: reference.name,
              weight,
              feature: "shared final mark contour",
              family,
              normalizedOffsetY: offsetY,
              referenceNormalizedOffsetY: reference.offsetY,
            },
            0.04,
          );
        else families.set(family, { name, mask: normalized, offsetY });
        if (weight === weights[0]) baseline.set(name, fixedMask);
        else
          compare(fixedMask, baseline.get(name), {
            name,
            weight,
            referenceWeight: weights[0],
            feature: "mark independent of container stroke",
          });

        for (const {
          feature,
          point,
          normal,
          minimumWidth,
          span = 3,
        } of probes) {
          let width = 0;
          for (
            let sample = (-span / 2) * scale;
            sample < (span / 2) * scale;
            sample++
          ) {
            const distance = (sample + 0.5) / scale;
            const x = Math.floor((point[0] + normal[0] * distance) * scale);
            const y = Math.floor((point[1] + normal[1] * distance) * scale);
            width += mask[y * size + x] / (255 * scale);
          }
          record(
            { name, weight, feature, point, width, minimumWidth },
            width >= minimumWidth,
          );
        }

        for (const { feature, point, minimumWidth } of clearances) {
          const alphaAt = (distance) => {
            const x = Math.floor((point[0] + distance) * scale);
            const y = Math.floor(point[1] * scale);
            return mask[y * size + x];
          };
          const edges = [-1, 1].map((direction) => {
            for (let sample = 0; sample < 1.5 * scale; sample++) {
              const distance = (sample + 0.5) / scale;
              if (alphaAt(direction * distance) >= 128) return distance;
            }
            return null;
          });
          const bounded = edges.every((edge) => edge !== null);
          const width = bounded ? edges[0] + edges[1] : null;
          const centerAlpha = alphaAt(0);
          record(
            {
              name,
              weight,
              feature,
              point,
              width,
              minimumWidth,
              centerAlpha,
              bounded,
            },
            bounded && centerAlpha < 128 && width >= minimumWidth,
          );
        }

        // Status dots are primary symbols. Help, chat, menu and eye dots keep
        // their existing two-unit role and all of its previous tolerances.
        const expectedDiameter = dotRole === "status" ? 8 / 3 : 2;
        const expectedVariance = expectedDiameter ** 2 / 16;
        const dotAreaBounds = dotRole === "status" ? [5.4, 5.8] : [3, 3.3];
        for (const [dotIndex, center] of dots.entries()) {
          const component = components.find(
            ({ left, right, top, bottom }) =>
              Math.abs((left + right + 1) / (2 * scale) - center[0]) < 0.75 &&
              Math.abs((top + bottom + 1) / (2 * scale) - center[1]) < 0.75,
          );
          if (!component) {
            record(
              {
                name,
                weight,
                feature: "shared dot present",
                dotIndex,
                center,
              },
              false,
            );
            continue;
          }
          let mass = 0;
          let sumX = 0;
          let sumY = 0;
          let sumXX = 0;
          let sumYY = 0;
          let sumXY = 0;
          for (let i = 0; i < mask.length; i++) {
            if (assigned[i] !== component.id) continue;
            const alpha = mask[i] / 255;
            const x = ((i % size) + 0.5) / scale;
            const y = (Math.floor(i / size) + 0.5) / scale;
            mass += alpha;
            sumX += alpha * x;
            sumY += alpha * y;
            sumXX += alpha * x * x;
            sumYY += alpha * y * y;
            sumXY += alpha * x * y;
          }
          const centroid = [sumX / mass, sumY / mass];
          const area = mass / (scale * scale);
          const diameter = [
            (component.right - component.left + 1) / scale,
            (component.bottom - component.top + 1) / scale,
          ];
          const variance = [
            sumXX / mass - centroid[0] ** 2,
            sumYY / mass - centroid[1] ** 2,
          ];
          const covariance = sumXY / mass - centroid[0] * centroid[1];
          record(
            {
              name,
              weight,
              feature: "round shared dot within role",
              dotRole,
              expectedDiameter,
              dotIndex,
              center,
              centroid,
              diameter,
              area,
              variance,
              covariance,
            },
            area >= dotAreaBounds[0] &&
              area <= dotAreaBounds[1] &&
              diameter.every(
                (value) => Math.abs(value - expectedDiameter) <= 0.0625,
              ) &&
              centroid.every(
                (value, axis) => Math.abs(value - center[axis]) <= 0.04,
              ) &&
              variance.every(
                (value) =>
                  Math.abs(value - expectedVariance) <= expectedVariance * 0.1,
              ) &&
              Math.abs(covariance) <= 0.02,
          );
          // Translation is allowed within a reviewed dot role; scaling,
          // unequal diameters and different positive/inverse contours are not.
          const patchSize = 3 * scale;
          const patch = new Uint8Array(patchSize * patchSize);
          for (let y = 0; y < patchSize; y++) {
            for (let x = 0; x < patchSize; x++) {
              const index =
                (center[1] * scale - patchSize / 2 + y) * size +
                center[0] * scale -
                patchSize / 2 +
                x;
              if (assigned[index] === component.id)
                patch[y * patchSize + x] = mask[index];
            }
          }
          const firstDot = firstDots.get(dotRole);
          if (firstDot)
            compare(
              patch,
              firstDot.patch,
              {
                name,
                weight,
                dotIndex,
                reference: firstDot.name,
                feature: "shared translated dot contour within role",
                dotRole,
              },
              0.025,
            );
          else firstDots.set(dotRole, { name, patch });
        }
      }
    }
    return { results, failures };
  }, specimens);
}
