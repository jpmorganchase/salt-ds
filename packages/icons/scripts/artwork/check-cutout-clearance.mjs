// Check the visible gap between the rear monitor and the sharp-cornered phone.
// Isolated painted layers avoid counting the stand, header, or phone interior.
export async function checkCutoutClearance(page, records) {
  const record = records.find(
    (candidate) => candidate.name === "devices_solid.svg",
  );
  if (!record) throw new Error("Missing cutout artwork: devices_solid.svg");

  return page.evaluate(async ({ name, svg }) => {
    const scale = 128;
    const side = 16 * scale;
    const tolerance = 0.03;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const holder = document.createElement("div");
    holder.style.cssText =
      "position:absolute;left:-9999px;top:0;pointer-events:none";
    holder.innerHTML = svg;
    document.body.appendChild(holder);

    try {
      const source = holder.querySelector("svg");
      const paths = [...source.querySelectorAll("path")].map((element) => ({
        element,
        bounds: element.getBBox(),
        style: getComputedStyle(element),
        referenceWidth: Number(element.getAttribute("stroke-width")),
      }));
      // Locate the rear surface by its painted role and region, not path order.
      const monitors = paths.filter(
        ({ bounds, style }) =>
          style.fill !== "none" &&
          bounds.x < 2 &&
          bounds.width > 10 &&
          bounds.height > 7,
      );
      const phone = paths.filter(
        ({ bounds }) =>
          bounds.x >= 10 && bounds.x + bounds.width <= 15 && bounds.y >= 5.5,
      );
      const frames = phone.filter(
        ({ bounds, style }) =>
          style.fill === "none" &&
          style.stroke !== "none" &&
          bounds.width > 3 &&
          bounds.height > 8,
      );
      if (monitors.length !== 1 || phone.length < 2 || frames.length !== 1)
        throw new Error("Cannot isolate Devices monitor and phone artwork");

      async function render(selected) {
        const isolated = source.cloneNode(false);
        isolated.setAttribute("width", side);
        isolated.setAttribute("height", side);
        isolated.setAttribute("style", "color:black");
        for (const { element } of selected)
          isolated.appendChild(element.cloneNode(true));
        const url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(isolated)], {
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
          context.drawImage(image, 0, 0, side, side);
          return context.getImageData(0, 0, side, side).data;
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      // Pixel-center interpolation keeps oblique probes comparable with the
      // horizontal/vertical probes without rounding their sampling positions.
      function alphaAt(pixels, x, y) {
        const px = x * scale - 0.5;
        const py = y * scale - 0.5;
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const fx = px - ix;
        const fy = py - iy;
        const alpha = (dx, dy) =>
          pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
        return (
          alpha(0, 0) * (1 - fx) * (1 - fy) +
          alpha(1, 0) * fx * (1 - fy) +
          alpha(0, 1) * (1 - fx) * fy +
          alpha(1, 1) * fx * fy
        );
      }

      function boundary(pixels, point, normal, entering) {
        const value = (distance) =>
          alphaAt(
            pixels,
            point[0] + normal[0] * distance,
            point[1] + normal[1] * distance,
          );
        let previousDistance = 0;
        let previousAlpha = value(previousDistance);
        if (
          (entering && previousAlpha >= 0.5) ||
          (!entering && previousAlpha < 0.5)
        )
          return null;
        for (let i = 1; i <= 2.5 * scale; i++) {
          const distance = i / scale;
          const alpha = value(distance);
          const crossed = entering
            ? previousAlpha < 0.5 && alpha >= 0.5
            : previousAlpha >= 0.5 && alpha < 0.5;
          if (crossed)
            return (
              previousDistance +
              ((0.5 - previousAlpha) / (alpha - previousAlpha)) *
                (distance - previousDistance)
            );
          previousDistance = distance;
          previousAlpha = alpha;
        }
        return null;
      }

      // These are foreground-phone landmarks. No rear cutout path or generated
      // control points are used to predict its measured boundary.
      const phoneLeft = 10.5;
      const phoneTop = 17 / 3;
      const probes = [
        { feature: "straight top", point: [12, phoneTop], normal: [0, -1] },
        { feature: "straight left", point: [phoneLeft, 9], normal: [-1, 0] },
        ...[22.5, 45, 67.5].map((angle) => ({
          feature: `sharp exterior corner ${angle} degrees`,
          point: [phoneLeft, phoneTop],
          normal: [
            -Math.sin((angle * Math.PI) / 180),
            -Math.cos((angle * Math.PI) / 180),
          ],
        })),
      ];
      const results = [];
      const failures = [];
      for (const weight of [0.67, 1, 4 / 3, 1.5]) {
        for (const item of paths)
          if (item.referenceWidth > 0)
            item.element.setAttribute(
              "stroke-width",
              (item.referenceWidth / 0.67) * weight,
            );
        const rearPixels = await render(monitors);
        const phonePixels = await render(phone);
        for (const { feature, point, normal } of probes) {
          const phoneEdge = boundary(phonePixels, point, normal, false);
          const rearEdge = boundary(rearPixels, point, normal, true);
          const gap =
            phoneEdge === null || rearEdge === null
              ? null
              : rearEdge - phoneEdge;
          // The independent design target is a 1.25-unit envelope around a
          // sharp corner, calibrated at the theme midpoint after the 14/13 fit.
          // Test its bounded width response, not the obsolete quadratic corner.
          const inset = 13 / 24;
          const radius = 17 / 24;
          const projection = -inset * (normal[0] + normal[1]);
          const expected = feature.startsWith("straight")
            ? 1.25 - weight / 2
            : projection +
              Math.sqrt(radius ** 2 - 2 * inset ** 2 + projection ** 2) -
              weight / 2 / Math.max(Math.abs(normal[0]), Math.abs(normal[1]));
          const result = {
            name,
            weight,
            feature,
            point,
            normal,
            phoneEdge,
            rearEdge,
            gap,
            expected,
            tolerance,
          };
          results.push(result);
          if (
            gap === null ||
            !Number.isFinite(gap) ||
            Math.abs(gap - expected) > tolerance
          )
            failures.push(result);
        }
      }
      return { results, failures };
    } finally {
      holder.remove();
    }
  }, record);
}
