import { optimize } from "svgo";

// Inspect final painted details independently of recipes and fit metadata.
// Optical placement must survive export fitting; shared marks must agree in
// positive/inverse form without normalizing away size or position differences.
export async function checkOpticalDetails(page, records) {
  const names = [
    "exponentiation.svg",
    "locked.svg",
    "locked_solid.svg",
    "unlocked.svg",
    "unlocked_solid.svg",
  ];
  const samples = names.map((name) => {
    const sample = records.find((candidate) => candidate.name === name);
    if (!sample) throw new Error(`Missing optical detail specimen: ${name}`);
    // Preserve geometry while making each subpath independently addressable.
    const geometricSvg = optimize(sample.svg, {
      plugins: [
        {
          name: "convertPathData",
          params: {
            applyTransforms: false,
            makeArcs: false,
            straightCurves: false,
            convertToQ: false,
            lineShorthands: false,
            convertToZ: false,
            curveSmoothShorthands: false,
            removeUseless: false,
            collapseRepeated: false,
            forceAbsolutePath: true,
            smartArcRounding: false,
            floatPrecision: 12,
          },
        },
      ],
    }).data;
    return { ...sample, geometricSvg };
  });
  return page.evaluate(async (samples) => {
    const scale = 64;
    const side = 16 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];
    const record = (details, passed) => {
      results.push(details);
      if (!passed) failures.push(details);
    };
    const render = async (svg, weight) => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      doc.documentElement.setAttribute("style", "color:black");
      for (const element of doc.querySelectorAll("[stroke-width]")) {
        const width = Number(element.getAttribute("stroke-width"));
        element.setAttribute("stroke-width", String((width * weight) / 0.67));
      }
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        }),
      );
      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () =>
            reject(new Error("Could not render optical detail"));
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
    const regions = (alpha, inverse = false) => {
      const labels = new Uint32Array(alpha.length);
      const queue = new Uint32Array(alpha.length);
      const components = [];
      const included = (index) =>
        inverse ? alpha[index] < 128 : alpha[index] >= 128;
      for (let start = 0; start < labels.length; start++) {
        if (labels[start] || !included(start)) continue;
        const id = components.length + 1;
        let head = 0;
        let tail = 1;
        let left = side;
        let top = side;
        let right = 0;
        let bottom = 0;
        labels[start] = id;
        queue[0] = start;
        while (head < tail) {
          const index = queue[head++];
          const x = index % side;
          const y = Math.floor(index / side);
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= side || ny < 0 || ny >= side) continue;
              const next = ny * side + nx;
              if (!labels[next] && included(next)) {
                labels[next] = id;
                queue[tail++] = next;
              }
            }
        }
        components.push({
          id,
          area: tail / scale ** 2,
          left: left / scale,
          top: top / scale,
          right: (right + 1) / scale,
          bottom: (bottom + 1) / scale,
          exterior:
            left === 0 ||
            top === 0 ||
            right === side - 1 ||
            bottom === side - 1,
        });
      }
      return {
        labels,
        components: components.filter(({ area }) => area > 0.002),
      };
    };
    // Chrome can classify near-boundary points differently for an inverse
    // compound path. Isolate the actual subpath in its original coordinates
    // and compare every state in positive polarity; do not shift or resize it.
    const geometricKeyhole = (svg) => {
      const holder = document.createElement("div");
      holder.style.cssText =
        "position:absolute;left:-10000px;top:0;pointer-events:none";
      holder.innerHTML = svg;
      document.body.appendChild(holder);
      try {
        const root = holder.querySelector("svg");
        const filled = [...root.querySelectorAll("path")].filter(
          (path) => getComputedStyle(path).fill !== "none",
        );
        const candidates = [];
        for (const path of filled)
          for (const data of path.getAttribute("d").match(/M[^M]*/g) ?? []) {
            const contour = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
            contour.setAttribute("d", data);
            contour.setAttribute("fill", "black");
            contour.setAttribute("fill-rule", "evenodd");
            contour.setAttribute("stroke", "none");
            root.appendChild(contour);
            const bounds = contour.getBBox();
            if (
              bounds.x > 4.5 &&
              bounds.x + bounds.width < 11.5 &&
              bounds.y > 8 &&
              bounds.y + bounds.height < 15 &&
              bounds.width > 0.5
            )
              candidates.push(contour);
          }
        if (candidates.length !== 1)
          throw new Error("Cannot isolate one final keyhole contour");
        const mask = new Uint8Array(side * side);
        const point = new DOMPoint();
        for (let y = 8 * scale; y < 15 * scale; y++)
          for (let x = 4.5 * scale; x < 11.5 * scale; x++) {
            point.x = (x + 0.5) / scale;
            point.y = (y + 0.5) / scale;
            mask[y * side + x] = Number(candidates[0].isPointInFill(point));
          }
        return mask;
      } finally {
        holder.remove();
      }
    };
    const geometryByName = new Map();
    const rasterByName = new Map();
    let sharedKeyhole;
    for (const { name, svg, geometricSvg } of samples)
      for (const weight of [0.67, 1, 1.333333, 1.5]) {
        const alpha = await render(svg, weight);
        if (name === "exponentiation.svg") {
          const { components } = regions(alpha);
          const left = Math.min(...components.map((part) => part.left));
          const top = Math.min(...components.map((part) => part.top));
          const right = Math.max(...components.map((part) => part.right));
          const bottom = Math.max(...components.map((part) => part.bottom));
          const width = right - left;
          const center = [(left + right) / 2, (top + bottom) / 2];
          // This outcome guard catches accidental restoration of a full-sized,
          // centered navigation chevron without reading the optical-fit config.
          record(
            {
              name,
              weight,
              check: "compact-raised-power-operator",
              components: components.length,
              bounds: [left, top, right, bottom],
              width,
              center,
            },
            components.length === 1 &&
              width >= 6 &&
              width <= 8.1 &&
              Math.abs(center[0] - 8) <= 0.04 &&
              center[1] >= 3.5 &&
              center[1] <= 4.8 &&
              top > 0.25 &&
              bottom < 8,
          );
          continue;
        }
        const inverse = name.endsWith("_solid.svg");
        const { labels, components } = regions(alpha, inverse);
        const keyholes = components.filter(
          (part) =>
            !part.exterior &&
            part.left > 4.5 &&
            part.right < 11.5 &&
            part.top > 8 &&
            part.bottom < 15 &&
            part.area > 0.25,
        );
        record(
          {
            name,
            weight,
            check: "single-contained-keyhole",
            components: keyholes.length,
          },
          keyholes.length === 1,
        );
        if (keyholes.length !== 1) continue;
        const keyhole = keyholes[0];
        const mask = Uint8Array.from(labels, (label) =>
          Number(label === keyhole.id),
        );
        // Probe inside the lower stem, away from its shoulder and flat bottom.
        // At 12px a final-canvas width of 4/3 gives one CSS pixel of counter.
        const y = Math.floor((keyhole.bottom - 0.5) * scale);
        let stemPixels = 0;
        let runs = 0;
        let preceding = false;
        for (let x = 0; x < side; x++) {
          const painted = Boolean(mask[y * side + x]);
          if (painted) stemPixels++;
          if (painted && !preceding) runs++;
          preceding = painted;
        }
        const stemWidth = stemPixels / scale;
        const headWidth = keyhole.right - keyhole.left;
        const centerX = (keyhole.left + keyhole.right) / 2;
        record(
          {
            name,
            weight,
            check: "legible-keyhole-head-and-stem",
            bounds: [keyhole.left, keyhole.top, keyhole.right, keyhole.bottom],
            stemWidth,
            headWidth,
            centerX,
            runs,
          },
          runs === 1 &&
            stemWidth >= 4 / 3 &&
            headWidth >= 2.8 &&
            stemWidth < headWidth * 0.65 &&
            keyhole.bottom - keyhole.top >= 4 &&
            Math.abs(centerX - 8) <= 1 / scale,
        );
        const previousRaster = rasterByName.get(name);
        if (previousRaster) {
          let changedPixels = 0;
          for (let index = 0; index < mask.length; index++)
            changedPixels += Number(mask[index] !== previousRaster[index]);
          record(
            {
              name,
              weight,
              check: "keyhole-raster-independent-of-container-stroke",
              changedPixels,
            },
            changedPixels === 0,
          );
        } else rasterByName.set(name, mask);
        if (!geometryByName.has(name))
          geometryByName.set(name, geometricKeyhole(geometricSvg));
        const geometricMask = geometryByName.get(name);
        if (sharedKeyhole) {
          let changedSamples = 0;
          for (let index = 0; index < geometricMask.length; index++)
            changedSamples += Number(
              geometricMask[index] !== sharedKeyhole.mask[index],
            );
          record(
            {
              name,
              weight,
              check: "identical-final-keyhole-across-states-and-weights",
              comparedWith: sharedKeyhole.name,
              comparedWeight: sharedKeyhole.weight,
              method:
                "isPointInFill of isolated final subpath at fixed canvas coordinates",
              changedSamples,
            },
            changedSamples === 0,
          );
        } else sharedKeyhole = { name, weight, mask: geometricMask };
      }
    return { results, failures };
  }, samples);
}
