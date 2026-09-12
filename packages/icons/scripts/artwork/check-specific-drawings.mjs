// Inspect semantic landmarks in actual fitted exports, independent of recipes,
// path order and SVG optimization. These checks complement native visual review.
export async function checkSpecificDrawings(page, records) {
  const names = [
    "globe.svg",
    "globe_solid.svg",
    "currency-exchange.svg",
    "currency.svg",
    "medical-kit.svg",
    "medical-kit_solid.svg",
  ];
  const samples = names.map((name) => {
    const record = records.find((candidate) => candidate.name === name);
    if (!record) throw new Error(`Missing specific drawing: ${name}`);
    return record;
  });
  return page.evaluate(async (samples) => {
    const scale = 32;
    const side = 16 * scale;
    const results = [];
    const failures = [];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const record = (details, passed) => {
      results.push(details);
      if (!passed) failures.push(details);
    };
    const render = async (name, weight = 1.333333) => {
      const { svg } = samples.find((sample) => sample.name === name);
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
          image.onerror = () => reject(new Error(`Could not render ${name}`));
          image.src = url;
        });
        context.clearRect(0, 0, side, side);
        context.drawImage(image, 0, 0, side, side);
      } finally {
        URL.revokeObjectURL(url);
      }
      const pixels = context.getImageData(0, 0, side, side).data;
      return Uint8Array.from(
        { length: side * side },
        (_, i) => pixels[i * 4 + 3],
      );
    };
    const regions = (alpha, inverse = false, inside = () => true) => {
      const values = Uint8Array.from(alpha, (value) =>
        inverse ? 255 - value : value,
      );
      const labels = new Uint32Array(values.length);
      const queue = new Uint32Array(values.length);
      const components = [];
      let id = 0;
      const included = (index) =>
        values[index] >= 128 &&
        inside(
          ((index % side) + 0.5) / scale,
          (Math.floor(index / side) + 0.5) / scale,
        );
      for (let start = 0; start < values.length; start++) {
        if (labels[start] || !included(start)) continue;
        id++;
        let read = 0;
        let length = 1;
        let left = side;
        let top = side;
        let right = 0;
        let bottom = 0;
        queue[0] = start;
        labels[start] = id;
        while (read < length) {
          const index = queue[read++];
          const x = index % side;
          const y = Math.floor(index / side);
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (
                (!dx && !dy) ||
                x + dx < 0 ||
                x + dx >= side ||
                y + dy < 0 ||
                y + dy >= side
              )
                continue;
              const next = index + dy * side + dx;
              if (!labels[next] && included(next)) {
                labels[next] = id;
                queue[length++] = next;
              }
            }
        }
        components.push({
          id,
          left: left / scale,
          top: top / scale,
          right: (right + 1) / scale,
          bottom: (bottom + 1) / scale,
          area: length / (scale * scale),
          exterior:
            left === 0 ||
            top === 0 ||
            right === side - 1 ||
            bottom === side - 1,
        });
      }
      return { values, labels, components };
    };
    const at = (alpha, x, y) =>
      alpha[Math.floor(y * scale) * side + Math.floor(x * scale)];
    const bounds = (components) => ({
      left: Math.min(...components.map((component) => component.left)),
      top: Math.min(...components.map((component) => component.top)),
      right: Math.max(...components.map((component) => component.right)),
      bottom: Math.max(...components.map((component) => component.bottom)),
    });
    const runWidth = (alpha, x, y, axis, inverse = false) => {
      const value = (distance) => {
        const a = at(
          alpha,
          x + (axis === "x" ? distance : 0),
          y + (axis === "y" ? distance : 0),
        );
        return inverse ? 255 - a : a;
      };
      if (value(0) < 128) return 0;
      const edges = [-1, 1].map((direction) => {
        for (let step = 1; step <= 4 * scale; step++) {
          const distance = (step / scale) * direction;
          if (value(distance) < 128) return step / scale;
        }
        return 4;
      });
      return edges[0] + edges[1] - 1 / scale;
    };
    const maskFor = ({ values, labels }, component) => {
      const mask = new Uint8Array(values.length);
      for (let index = 0; index < values.length; index++) {
        if (labels[index] === component.id) mask[index] = values[index];
        else if (!labels[index] && values[index]) {
          const x = index % side;
          const y = Math.floor(index / side);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
              if (
                x + dx >= 0 &&
                x + dx < side &&
                y + dy >= 0 &&
                y + dy < side &&
                labels[index + dy * side + dx] === component.id
              )
                mask[index] = values[index];
        }
      }
      return mask;
    };
    const difference = (left, right) => {
      let delta = 0;
      let union = 0;
      for (let i = 0; i < left.length; i++) {
        delta += Math.abs(left[i] - right[i]);
        union += Math.max(left[i], right[i]);
      }
      return delta / Math.max(union, 1);
    };

    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      for (const name of ["globe.svg", "globe_solid.svg"]) {
        const alpha = await render(name, weight);
        const painted = regions(alpha);
        const box = bounds(painted.components);
        const center = [(box.left + box.right) / 2, (box.top + box.bottom) / 2];
        const paintedRadius = (box.right - box.left) / 2;
        const radius = paintedRadius - weight / 2;
        const solid = name.endsWith("_solid.svg");
        // Exclude the entire solid rim, which deliberately joins the six outer
        // cells. Counting the remaining regions tests all twelve visible fields.
        const cells = solid
          ? regions(
              alpha,
              false,
              (x, y) =>
                Math.hypot(x - center[0], y - center[1]) <
                paintedRadius - weight - 0.3,
            ).components
          : regions(alpha, true).components.filter(
              (component) => !component.exterior,
            );
        const count = cells.filter((component) => component.area > 0.1).length;
        record(
          {
            name,
            weight,
            feature: "twelve globe grid cells",
            count,
            expected: 12,
          },
          count === 12,
        );
        for (const fraction of [-0.6, 0, 0.6]) {
          const point = [center[0], center[1] + radius * fraction];
          const width = runWidth(alpha, ...point, "x", solid);
          record(
            {
              name,
              weight,
              feature: solid
                ? "continuous inverse central meridian"
                : "continuous positive central meridian",
              point,
              width,
            },
            solid
              ? width >= 0.8 && width <= 1.5
              : width >= weight * 0.45 && width <= weight + 0.08,
          );
        }
      }
    }

    const exchangeName = "currency-exchange.svg";
    const exchange = await render(exchangeName);
    const coinSpaces = regions(exchange, true)
      .components.filter(
        (component) => !component.exterior && component.area > 5,
      )
      .sort((a, b) => a.top - b.top || a.left - b.left);
    record(
      {
        name: exchangeName,
        feature: "three enclosed coin interiors",
        count: coinSpaces.length,
        expected: 3,
      },
      coinSpaces.length === 3,
    );
    const currencyPaint = regions(await render("currency.svg"));
    const currencyDollar = currencyPaint.components.find((component) =>
      currencyPaint.components.some(
        (rim) =>
          rim.id !== component.id &&
          component.left > rim.left &&
          component.top > rim.top &&
          component.right < rim.right &&
          component.bottom < rim.bottom,
      ),
    );
    const exchangePaint = regions(exchange);
    const glyphs = [];
    for (const [index, coin] of coinSpaces.entries()) {
      const width = coin.right - coin.left;
      const height = coin.bottom - coin.top;
      const center = [
        (coin.left + coin.right) / 2,
        (coin.top + coin.bottom) / 2,
      ];
      let circularProbes = 0;
      for (let step = 0; step < 24; step++) {
        const angle = (step * Math.PI) / 12;
        const point = (radius) => [
          center[0] + (Math.cos(angle) * width * radius) / 2,
          center[1] + (Math.sin(angle) * height * radius) / 2,
        ];
        if (
          at(exchange, ...point(0.9)) < 128 &&
          at(exchange, ...point(1.07)) >= 128
        )
          circularProbes++;
      }
      record(
        {
          name: exchangeName,
          feature: "circular coin rim",
          coin: index,
          center,
          width,
          height,
          circularProbes,
        },
        Math.abs(width / height - 1) < 0.06 && circularProbes >= 22,
      );
      const contained = exchangePaint.components.filter(
        (component) =>
          component.left > coin.left &&
          component.top > coin.top &&
          component.right < coin.right &&
          component.bottom < coin.bottom &&
          component.area > 0.5,
      );
      record(
        {
          name: exchangeName,
          feature: "one separate substantial currency glyph per coin",
          coin: index,
          count: contained.length,
        },
        contained.length === 1,
      );
      if (contained.length === 1) glyphs.push(contained[0]);
    }
    const normalized = (paint, component) => {
      const size = 96;
      return Uint8Array.from({ length: size * size }, (_, index) => {
        const x =
          component.left +
          (((index % size) + 0.5) * (component.right - component.left)) / size;
        const y =
          component.top +
          ((Math.floor(index / size) + 0.5) *
            (component.bottom - component.top)) /
            size;
        return at(paint.labels, x, y) === component.id ? 255 : 0;
      });
    };
    if (coinSpaces.length === 3) {
      const centers = coinSpaces.map((coin) => [
        (coin.left + coin.right) / 2,
        (coin.top + coin.bottom) / 2,
      ]);
      record(
        {
          name: exchangeName,
          feature: "one upper coin and two balanced lower coins",
          centers,
        },
        centers[0][1] + 2 < centers[1][1] &&
          Math.abs(centers[1][1] - centers[2][1]) < 0.15 &&
          centers[1][0] < centers[0][0] &&
          centers[0][0] < centers[2][0],
      );
    }
    if (glyphs.length === 3) {
      const shapes = glyphs.map((glyph) => normalized(exchangePaint, glyph));
      for (let left = 0; left < shapes.length; left++)
        for (let right = left + 1; right < shapes.length; right++) {
          const delta = difference(shapes[left], shapes[right]);
          record(
            {
              name: exchangeName,
              feature: "distinct currency glyph contours",
              coins: [left, right],
              difference: delta,
            },
            delta > 0.12,
          );
        }
      const dollarDifference = currencyDollar
        ? difference(shapes[0], normalized(currencyPaint, currencyDollar))
        : null;
      record(
        {
          name: exchangeName,
          feature: "upper coin retains Currency dollar contour",
          difference: dollarDifference,
        },
        dollarDifference !== null && dollarDifference < 0.09,
      );
    }

    const medicalBaseline = new Map();
    for (const weight of [0.67, 1, 1.333333, 1.5]) {
      let positive;
      for (const name of ["medical-kit.svg", "medical-kit_solid.svg"]) {
        const alpha = await render(name, weight);
        const paint = regions(alpha, name.endsWith("_solid.svg"));
        const centerLabel = at(paint.labels, 8, 8);
        const cross = paint.components.find(
          (component) => component.id === centerLabel && !component.exterior,
        );
        record(
          {
            name,
            weight,
            feature: "separate central medical cross",
            present: Boolean(cross),
          },
          Boolean(cross),
        );
        if (!cross) continue;
        const mask = maskFor(paint, cross);
        const width = cross.right - cross.left;
        const height = cross.bottom - cross.top;
        const center = [
          (cross.left + cross.right) / 2,
          (cross.top + cross.bottom) / 2,
        ];
        record(
          {
            name,
            weight,
            feature: "balanced six-unit medical cross",
            width,
            height,
            center,
            area: cross.area,
          },
          Math.abs(width - 6) <= 0.063 &&
            Math.abs(height - 6) <= 0.063 &&
            center.every((value) => Math.abs(value - 8) <= 0.032) &&
            Math.abs(cross.area - 23.75) <= 0.3,
        );
        for (const [x, y, axis] of [
          [8, 5.75, "x"],
          [8, 10.25, "x"],
          [5.75, 8, "y"],
          [10.25, 8, "y"],
        ]) {
          const stemWidth = runWidth(mask, x, y, axis);
          record(
            {
              name,
              weight,
              feature: "fixed 2.5-unit medical cross stem",
              point: [x, y],
              axis,
              width: stemWidth,
            },
            Math.abs(stemWidth - 2.5) <= 0.063,
          );
        }
        if (positive) {
          const delta = difference(mask, positive);
          record(
            {
              name,
              weight,
              feature: "identical positive/inverse medical cross",
              difference: delta,
            },
            delta <= 0.005,
          );
        } else positive = mask;
        if (medicalBaseline.has(name)) {
          const delta = difference(mask, medicalBaseline.get(name));
          record(
            {
              name,
              weight,
              feature: "medical cross independent of case stroke",
              difference: delta,
            },
            delta <= 0.005,
          );
        } else medicalBaseline.set(name, mask);
      }
    }
    return { results, failures };
  }, samples);
}
