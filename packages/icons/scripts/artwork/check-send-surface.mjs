// Send's solid uses one filled exterior calibrated to the midpoint theme width.
// The original final tapered seam is subtracted after forming that silhouette.
export async function checkSendSurface(page, records) {
  const artwork = ["send.svg", "send_solid.svg"].map((name) => {
    const record = records.find((entry) => entry.name === name);
    if (!record) throw new Error(`Missing send surface: ${name}`);
    return { name, svg: record.svg };
  });
  return page.evaluate(async (artwork) => {
    const scale = 128;
    const side = 16 * scale;
    const calibrationWidth = 7 / 6;
    // These are the established final seam lines, independent of candidate d.
    const seamTip = [12.83883, 8];
    const seamSlope = 1 / 16;
    const results = [];
    const failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const check = (item, pass) => {
      const result = { ...item, pass };
      results.push(result);
      if (!pass) failures.push(result);
    };
    const raster = async (name, weight) => {
      const source = artwork
        .find((entry) => entry.name === name)
        .svg.replace("<svg ", '<svg style="color:black" ')
        .replace(
          /stroke-width="([\d.]+)"/g,
          (_, width) => `stroke-width="${(Number(width) * weight) / 0.67}"`,
        );
      const url = URL.createObjectURL(
        new Blob([source], { type: "image/svg+xml" }),
      );
      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error(`Could not render ${name}`));
          image.src = url;
        });
        context.clearRect(0, 0, side, side);
        context.drawImage(image, 0, 0, side, side);
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    const bounds = (pixels) => {
      const result = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];
      for (let i = 0; i < side * side; i++) {
        if (pixels[i * 4 + 3] < 128) continue;
        const x = i % side;
        const y = Math.floor(i / side);
        result[0] = Math.min(result[0], x / scale);
        result[1] = Math.min(result[1], y / scale);
        result[2] = Math.max(result[2], (x + 1) / scale);
        result[3] = Math.max(result[3], (y + 1) / scale);
      }
      return result;
    };
    const calibrated = bounds(await raster("send.svg", calibrationWidth));
    for (const weight of [0.67, 1, 4 / 3, 1.5]) {
      const solid = await raster("send_solid.svg", weight);
      const solidBounds = bounds(solid);
      const outlineBounds = bounds(await raster("send.svg", weight));
      const calibratedDelta = Math.max(
        ...solidBounds.map((value, i) => Math.abs(value - calibrated[i])),
      );
      check(
        {
          name: "send_solid.svg",
          feature: "original outline exterior at midpoint theme weight",
          weight,
          calibrated,
          solidBounds,
          calibratedDelta,
          tolerance: 0.025,
        },
        calibratedDelta <= 0.025,
      );
      // The acute point has the greatest paint motion as configurable outline
      // width changes. Its miter projects half-width by this geometric factor.
      const miterProjection = Math.hypot(18.5, 8.25) / 8.25;
      const tolerance =
        0.025 + (Math.abs(weight - calibrationWidth) * miterProjection) / 2;
      const actualDelta = Math.max(
        ...solidBounds.map((value, i) => Math.abs(value - outlineBounds[i])),
      );
      check(
        {
          name: "send",
          feature: "bounded pair edge variation across weights",
          weight,
          outlineBounds,
          solidBounds,
          actualDelta,
          tolerance,
        },
        actualDelta <= tolerance,
      );
      let intrusion = 0;
      for (let x = 2 * scale; x < 12.5 * scale; x++) {
        const px = (x + 0.5) / scale;
        const halfGap = (seamTip[0] - px) * seamSlope;
        for (
          let y = Math.ceil((8 - halfGap + 0.025) * scale);
          y < (8 + halfGap - 0.025) * scale;
          y++
        ) {
          if (solid[(y * side + x) * 4 + 3] >= 128) intrusion++;
        }
      }
      check(
        {
          name: "send_solid.svg",
          feature: "continuous seam mouth without cap overpaint",
          weight,
          intrudingArea: intrusion / scale ** 2,
          tolerance: 0.0001,
        },
        intrusion === 0,
      );
      for (const position of [2.8, 3.1, 3.5, 4, 6, 8, 10, 12]) {
        const x = Math.floor(position * scale);
        const actualX = (x + 0.5) / scale;
        const center = 8 * scale;
        let upper = center - 1;
        let lower = center;
        while (upper >= 0 && solid[(upper * side + x) * 4 + 3] < 128) upper--;
        while (lower < side && solid[(lower * side + x) * 4 + 3] < 128) lower++;
        const expected = 2 * (seamTip[0] - actualX) * seamSlope;
        const gap = (lower - upper - 1) / scale;
        check(
          {
            name: "send_solid.svg",
            feature: "preserved linear taper",
            weight,
            x: actualX,
            gap,
            expected,
            tolerance: 0.025,
          },
          Math.abs(gap - expected) <= 0.025 && upper >= 0 && lower < side,
        );
      }
      const visited = new Uint8Array(side * side);
      const queue = new Int32Array(side * side);
      let islands = 0;
      for (let i = 0; i < visited.length; i++) {
        if (visited[i] || solid[i * 4 + 3] < 128) continue;
        islands++;
        let start = 0;
        let end = 1;
        queue[0] = i;
        visited[i] = 1;
        while (start < end) {
          const p = queue[start++];
          const x = p % side;
          const y = Math.floor(p / side);
          for (const n of [
            x > 0 ? p - 1 : -1,
            x < side - 1 ? p + 1 : -1,
            y > 0 ? p - side : -1,
            y < side - 1 ? p + side : -1,
          ]) {
            if (n < 0 || visited[n] || solid[n * 4 + 3] < 128) continue;
            visited[n] = 1;
            queue[end++] = n;
          }
        }
      }
      check(
        {
          name: "send_solid.svg",
          feature: "one connected plane silhouette",
          weight,
          islands,
        },
        islands === 1,
      );
    }
    return { results, failures };
  }, artwork);
}
