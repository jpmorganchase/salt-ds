// Measure isolated painted layers from the actual exported SVG. Shape roles
// are identified by paint and bounds, so path merging/order is immaterial.
export async function checkCutoutPaint(page, records, specifications) {
  const inputs = specifications.map((specification) => {
    const record = records.find(({ name }) => name === specification.name);
    if (!record)
      throw new Error(`Missing cutout artwork: ${specification.name}`);
    return { ...specification, svg: record.svg };
  });
  return page.evaluate(async (specs) => {
    const scale = 128;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const holder = document.createElement("div");
    holder.style.cssText = "position:absolute;left:-9999px;top:0";
    document.body.appendChild(holder);

    function alpha(pixels, x, y) {
      const px = x * scale - 0.5;
      const py = y * scale - 0.5;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      const fx = px - ix;
      const fy = py - iy;
      const get = (dx, dy) =>
        pixels[((iy + dy) * side + ix + dx) * 4 + 3] / 255;
      return (
        get(0, 0) * (1 - fx) * (1 - fy) +
        get(1, 0) * fx * (1 - fy) +
        get(0, 1) * (1 - fx) * fy +
        get(1, 1) * fx * fy
      );
    }
    function boundary(pixels, point, normal, entering) {
      const value = (distance) =>
        alpha(
          pixels,
          point[0] + normal[0] * distance,
          point[1] + normal[1] * distance,
        );
      let lastDistance = -0.2;
      let lastAlpha = value(lastDistance);
      for (let i = 1; i <= 4.2 * scale; i++) {
        const distance = -0.2 + i / scale;
        const now = value(distance);
        if (
          entering
            ? lastAlpha < 0.5 && now >= 0.5
            : lastAlpha >= 0.5 && now < 0.5
        )
          return (
            lastDistance +
            ((0.5 - lastAlpha) / (now - lastAlpha)) * (distance - lastDistance)
          );
        lastDistance = distance;
        lastAlpha = now;
      }
      return null;
    }
    function edgePoints(pixels, region = [0, 0, 16, 16]) {
      const points = [];
      const x0 = Math.max(1, Math.floor(region[0] * scale));
      const y0 = Math.max(1, Math.floor(region[1] * scale));
      const x1 = Math.min(side - 2, Math.ceil(region[2] * scale));
      const y1 = Math.min(side - 2, Math.ceil(region[3] * scale));
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const index = (y * side + x) * 4 + 3;
          if (pixels[index] < 128) continue;
          if (
            pixels[index - 4] < 128 ||
            pixels[index + 4] < 128 ||
            pixels[index - side * 4] < 128 ||
            pixels[index + side * 4] < 128
          )
            points.push([(x + 0.5) / scale, (y + 0.5) / scale]);
        }
      return points;
    }
    function tree(points, depth = 0) {
      if (!points.length) return null;
      const axis = depth % 2;
      points.sort((a, b) => a[axis] - b[axis]);
      const middle = Math.floor(points.length / 2);
      return {
        point: points[middle],
        axis,
        left: tree(points.slice(0, middle), depth + 1),
        right: tree(points.slice(middle + 1), depth + 1),
      };
    }
    function nearest(node, point, best = Number.POSITIVE_INFINITY) {
      if (!node) return best;
      best = Math.min(
        best,
        (node.point[0] - point[0]) ** 2 + (node.point[1] - point[1]) ** 2,
      );
      const delta = point[node.axis] - node.point[node.axis];
      best = nearest(delta < 0 ? node.left : node.right, point, best);
      if (delta * delta < best)
        best = nearest(delta < 0 ? node.right : node.left, point, best);
      return best;
    }
    function selected(paths, role) {
      const filled = ({ element }) => getComputedStyle(element).fill !== "none";
      const isSlash = ({ element, bounds }) => {
        if (
          Math.abs(bounds.x - 2) > 0.01 ||
          Math.abs(bounds.y - 2) > 0.01 ||
          Math.abs(bounds.width - 12) > 0.01 ||
          Math.abs(bounds.height - 12) > 0.01
        )
          return false;
        return [0.2, 0.5, 0.8].every((t) => {
          const p = element.getPointAtLength(t * element.getTotalLength());
          return Math.abs(p.x - p.y) < 0.001;
        });
      };
      switch (role) {
        case "slash":
          return paths.filter(isSlash);
        case "letters":
          return paths.filter(filled);
        case "disabled-rear":
          return paths.filter((p) => !isSlash(p));
        case "group-outline":
          return paths;
        case "group-front":
          return paths.filter(
            (p) =>
              filled(p) && p.bounds.x < 2 && p.bounds.x + p.bounds.width < 10.1,
          );
        case "group-rear":
          return paths.filter(
            (p) =>
              filled(p) &&
              p.bounds.x >= 10 &&
              p.bounds.y + p.bounds.height > 13,
          );
        case "search-body":
          return paths.filter(
            ({ bounds }) =>
              bounds.x < 2 && bounds.y >= 8.9 && bounds.height > 4,
          );
        case "search-mark":
          return paths.filter(
            ({ bounds }) => bounds.x >= 8.9 && bounds.y >= 7.9,
          );
        case "feedback-panel":
          return paths.filter(
            ({ bounds }) =>
              bounds.x < 2.1 && bounds.y < 2.1 && bounds.width > 12,
          );
        case "feedback-person":
          return paths.filter(
            ({ bounds }) => bounds.x >= 6.9 && bounds.y >= 5.8,
          );
        default:
          throw new Error(`Unknown cutout layer role: ${role}`);
      }
    }
    async function render(source, selection, region) {
      const isolated = source.cloneNode(false);
      isolated.setAttribute("width", side);
      isolated.setAttribute("height", side);
      isolated.setAttribute("style", "color:black");
      for (const { element } of selection) {
        const style = getComputedStyle(element);
        const copy = element.cloneNode(true);
        for (const property of [
          "fill",
          "stroke",
          "stroke-width",
          "fill-rule",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-miterlimit",
        ])
          copy.setAttribute(property, style.getPropertyValue(property));
        isolated.appendChild(copy);
      }
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
        if (region) {
          // The paired people occupy separate regions at their authored widths.
          // This also isolates older SVGs which merge both bodies into one path.
          context.clearRect(0, 0, side, region[1] * scale);
          context.clearRect(0, region[3] * scale, side, side);
          context.clearRect(0, 0, region[0] * scale, side);
          context.clearRect(region[2] * scale, 0, side, side);
        }
        return context.getImageData(0, 0, side, side).data;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    const results = [];
    const failures = [];
    try {
      for (const spec of specs) {
        holder.innerHTML = spec.svg;
        const source = holder.querySelector("svg");
        const paths = [...source.querySelectorAll("path")].map((element) => ({
          element,
          bounds: element.getBBox(),
        }));
        const rear = selected(paths, spec.rear);
        const foreground = selected(paths, spec.foreground);
        if (!rear.length || !foreground.length)
          throw new Error(`Cannot isolate cutout layers: ${spec.name}`);
        for (const weight of [0.67]) {
          const rearPixels = await render(source, rear, spec.rearRegion);
          const foregroundPixels = await render(
            source,
            foreground,
            spec.foregroundRegion,
          );
          const foregroundTree = spec.probes.some((p) => p.region)
            ? tree(edgePoints(foregroundPixels))
            : null;
          for (const probe of spec.probes) {
            let gap = null;
            if (probe.region) {
              const points = edgePoints(rearPixels, probe.region);
              if (points.length && foregroundTree) {
                let distance = Number.POSITIVE_INFINITY;
                for (const point of points) {
                  if (alpha(foregroundPixels, ...point) >= 0.5) {
                    distance = 0;
                    break;
                  }
                  distance = Math.min(distance, nearest(foregroundTree, point));
                }
                gap = Math.sqrt(distance);
              }
            } else {
              const rearEdge = boundary(
                rearPixels,
                probe.point,
                probe.normal,
                true,
              );
              const foregroundEdge = boundary(
                foregroundPixels,
                probe.point,
                probe.normal,
                false,
              );
              if (rearEdge !== null && foregroundEdge !== null)
                gap = rearEdge - foregroundEdge;
            }
            const expected =
              typeof probe.expected === "number"
                ? probe.expected
                : probe.expected[String(weight)];
            const tolerance = probe.tolerance ?? 0.03;
            const result = {
              name: spec.name,
              weight,
              feature: probe.feature,
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
      }
      return { results, failures };
    } finally {
      holder.remove();
    }
  }, inputs);
}
