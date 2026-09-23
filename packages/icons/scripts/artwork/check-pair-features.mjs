// Verify reported missing or misplaced features in the exported artwork.
// Rasterization measures actual paint at the fixed authored stroke widths.
export async function checkPairFeatures(page, records, fittedRecords) {
  // Probe final export coordinates: reversing the fit changes the visible
  // width of a filled counter, unlike the authored stroke checks below.
  const successProbes = [
    {
      feature: "inverse short check arm",
      point: [5, 9.25],
      normal: [-Math.SQRT1_2, Math.SQRT1_2],
    },
    {
      feature: "inverse long check arm",
      point: [9.5, 7.75],
      normal: [Math.SQRT1_2, Math.SQRT1_2],
    },
  ];
  const dotProbes = (point, label = "inverse dot") =>
    [
      ["horizontal", [1, 0]],
      ["vertical", [0, 1]],
    ].map(([axis, normal]) => ({
      feature: `${label} ${axis} diameter`,
      point,
      normal,
    }));
  const inverseMarks = {
    "success-circle_solid.svg": successProbes,
    "step-success.svg": successProbes,
    "info_solid.svg": [
      { feature: "inverse i stem", point: [8, 9.8], normal: [1, 0] },
      ...dotProbes([8, 4]),
    ],
    "error_solid.svg": [
      { feature: "inverse error stem", point: [8, 6.375], normal: [1, 0] },
      ...dotProbes([8, 12]),
    ],
    "warning_solid.svg": [
      { feature: "inverse warning stem", point: [8, 8], normal: [1, 0] },
      ...dotProbes([8, 12.375]),
    ],
    "chatting_solid.svg": [4, 8, 12].flatMap((x, index) =>
      dotProbes([x, 6.5], `inverse chat dot ${index + 1}`).map((probe) => ({
        ...probe,
        minimumWidth: 1.8,
      })),
    ),
  };
  const samples = [
    "accessible.svg",
    "accessible_solid.svg",
    "travel.svg",
    "travel_solid.svg",
    "checkmark_solid.svg",
  ].map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing pair-feature artwork: ${name}`);
    return record;
  });
  for (const [name, probes] of Object.entries(inverseMarks)) {
    const record = fittedRecords.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing inverse-mark artwork: ${name}`);
    samples.push({ ...record, probes });
  }
  return page.evaluate(async (samples) => {
    const size = 256;
    const scale = size / 16;
    const expectedMinAlpha = 128;
    const results = [];
    const failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    for (const { name, svg, probes } of samples) {
      for (const weight of [0.67]) {
        const markup = svg.replace("<svg ", '<svg style="color:black" ');
        const url = URL.createObjectURL(
          new Blob([markup], { type: "image/svg+xml" }),
        );
        const img = new Image();
        try {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Could not render ${name}`));
            img.src = url;
          });
          context.clearRect(0, 0, size, size);
          context.drawImage(img, 0, 0, size, size);
          if (name.startsWith("accessible")) {
            // The patch lies safely inside the arm at the authored width.
            const point = [10, 6.5];
            const pixels = context.getImageData(
              point[0] * scale - 1,
              point[1] * scale - 1,
              3,
              3,
            ).data;
            let minAlpha = 255;
            for (let offset = 3; offset < pixels.length; offset += 4)
              minAlpha = Math.min(minAlpha, pixels[offset]);
            const result = {
              name,
              weight,
              feature: "arm",
              point,
              minAlpha,
              expectedMinAlpha,
            };
            results.push(result);
            if (minAlpha < expectedMinAlpha) failures.push(result);
          } else if (name.startsWith("travel")) {
            // Scan below each case's painted body. Count
            // separate wheels and measure their symmetry without prescribing
            // their individual positions or depending on path construction.
            for (const wheel of [
              {
                feature: "large suitcase wheels",
                left: 1,
                right: 8.75,
                y: 13.625,
                center: 4.75,
              },
              {
                feature: "small suitcase wheels",
                left: 9.5,
                right: 15.75,
                y: 14.375,
                center: 12.5,
              },
            ]) {
              const left = Math.round(wheel.left * scale);
              const width = Math.round((wheel.right - wheel.left) * scale);
              const pixels = context.getImageData(
                left,
                Math.round(wheel.y * scale),
                width,
                1,
              ).data;
              const centers = [];
              let start = null;
              for (let x = 0; x <= width; x++) {
                const painted =
                  x < width && pixels[x * 4 + 3] >= expectedMinAlpha;
                if (painted && start === null) start = x;
                if (!painted && start !== null) {
                  if (x - start >= 4)
                    centers.push((left + (start + x) / 2) / scale);
                  start = null;
                }
              }
              const center =
                centers.length === 2 ? (centers[0] + centers[1]) / 2 : null;
              const result = {
                name,
                weight,
                feature: wheel.feature,
                wheelCount: centers.length,
                centers,
                center,
                expectedCenter: wheel.center,
              };
              results.push(result);
              if (
                centers.length !== 2 ||
                Math.abs(center - wheel.center) > 1 / scale
              )
                failures.push(result);
            }
          } else if (name === "checkmark_solid.svg") {
            // The inverse check is the visible selected mark in Checkbox,
            // Pill and Switch. Measure its transparent mass and both arms;
            // an edge-to-edge square can pass framing checks while its mark
            // is too thin to read. A 1.75-unit arm remains over 1.3px at 12px.
            const pixels = context.getImageData(0, 0, size, size).data;
            let transparentArea = 0;
            for (let offset = 3; offset < pixels.length; offset += 4)
              transparentArea += 1 - pixels[offset] / 255;
            transparentArea /= scale * scale;
            const areaResult = {
              name,
              weight,
              feature: "transparent check area",
              transparentArea,
              minimumArea: 23,
            };
            results.push(areaResult);
            if (transparentArea < areaResult.minimumArea)
              failures.push(areaResult);

            // These mid-arm cross sections avoid the elbow and flat caps.
            // Sample perpendicular to each arm, so diagonal angle does not
            // inflate the reported width. Legacy and restored marks are
            // approximately 2 units wide; the thin regression was only 1.067.
            for (const probe of [
              {
                feature: "transparent short check arm",
                point: [5, 9.25],
                normal: [-Math.SQRT1_2, Math.SQRT1_2],
              },
              {
                feature: "transparent long check arm",
                point: [9.5, 7.75],
                normal: [Math.SQRT1_2, Math.SQRT1_2],
              },
            ]) {
              let width = 0;
              for (let sample = -24; sample < 24; sample++) {
                const distance = (sample + 0.5) / scale;
                const x = Math.floor(
                  (probe.point[0] + probe.normal[0] * distance) * scale,
                );
                const y = Math.floor(
                  (probe.point[1] + probe.normal[1] * distance) * scale,
                );
                width += (1 - pixels[(y * size + x) * 4 + 3] / 255) / scale;
              }
              const result = {
                name,
                weight,
                feature: probe.feature,
                width,
                minimumWidth: 1.75,
              };
              results.push(result);
              if (width < result.minimumWidth) failures.push(result);
            }
          } else {
            const pixels = context.getImageData(0, 0, size, size).data;
            for (const probe of probes) {
              const alphaAt = (distance) => {
                const x = Math.floor(
                  (probe.point[0] + probe.normal[0] * distance) * scale,
                );
                const y = Math.floor(
                  (probe.point[1] + probe.normal[1] * distance) * scale,
                );
                return pixels[(y * size + x) * 4 + 3];
              };
              // The three-unit scan crosses only the local mark. Opaque
              // ends anchor it inside the surrounding filled surface, so
              // exterior transparency cannot masquerade as a wide counter.
              const surroundingAlpha = Math.min(alphaAt(-1.5), alphaAt(1.5));
              let width = 0;
              for (let sample = -24; sample < 24; sample++)
                width += (1 - alphaAt((sample + 0.5) / scale) / 255) / scale;
              const result = {
                name,
                feature: probe.feature,
                coordinateSpace: "fitted export",
                width,
                // 1.75 units gives over 1.3 CSS pixels at native 12px.
                minimumWidth: probe.minimumWidth ?? 1.75,
                surroundingAlpha,
                minimumSurroundingAlpha: 250,
              };
              results.push(result);
              if (
                !Number.isFinite(width) ||
                width < result.minimumWidth ||
                surroundingAlpha < result.minimumSurroundingAlpha
              )
                failures.push(result);
            }
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    }
    return { results, failures };
  }, samples);
}
