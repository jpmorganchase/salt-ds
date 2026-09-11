import { chromium } from "playwright";
import { optimize } from "svgo";
import { brandIconNames } from "./brands.mjs";
import { getOpticalFit, validateOpticalFits } from "./optical-fits.mjs";

// Aliases retain exactly the same fitted artwork as their supported export.
export const iconAliases = {
  "bar-chart": "chart-bar",
  "pie-chart": "chart-pie",
  "line-chart": "chart-line",
  "error-execute": "not-allowed",
  help: "help-circle",
  "icon-figma": "figma",
  success: "checkmark",
  "success-tick": "checkmark",
  success_small: "checkmark",
};

export function getViewBoxGroupKey(filename) {
  const solid = filename.endsWith("_solid.svg");
  const name = filename.replace(/_solid\.svg$|\.svg$/g, "");
  return `${iconAliases[name] ?? name}${solid ? "_solid" : ""}.svg`;
}

const round = (value) => Number(value.toFixed(6));
const fitWidth = 1.5;
const targetSpan = 15.5;

function transformGeometry(
  svg,
  { scale, translateX, translateY },
  preserveBrandContours = false,
) {
  if (scale === 1 && translateX === 0 && translateY === 0) return svg;
  // Uniformly transform the complete drawing, including counters and cutouts,
  // while compensating every authored width so strokes keep their own weight.
  const widths = [
    ...new Set(
      [...svg.matchAll(/stroke-width="([\d.]+)"/g)].map((match) =>
        Number(match[1]),
      ),
    ),
  ];
  const compensated = svg.replace(
    /stroke-width="([\d.]+)"/g,
    (_, width) => `stroke-width="${Number(width) / scale}"`,
  );
  const wrapped = compensated
    .replace(
      /(<svg\b[^>]*>)/,
      `$1<g transform="translate(${translateX} ${translateY}) scale(${scale})">`,
    )
    .replace(/<\/svg>\s*$/, "</g></svg>");
  const result = optimize(wrapped, {
    multipass: true,
    floatPrecision: preserveBrandContours ? 8 : 6,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            convertPathData: {
              applyTransforms: true,
              applyTransformsStroked: true,
              ...(preserveBrandContours && {
                makeArcs: false,
                straightCurves: false,
                convertToQ: false,
                lineShorthands: false,
                convertToZ: false,
                curveSmoothShorthands: false,
                removeUseless: false,
                collapseRepeated: false,
                forceAbsolutePath: true,
                transformPrecision: 12,
              }),
            },
            mergePaths: false,
          },
        },
      },
    ],
    js2svg: { pretty: true, indent: 2 },
  }).data;
  if (/transform=/.test(result))
    throw new Error("View-box transform was not baked");
  // SVGO resolves transformed inherited strokes onto child paths/groups. The
  // SVG root itself is outside the transform, so restore its reference default.
  const rootWidth = svg.match(/<svg\b[^>]*?\bstroke-width="([^"]+)"/)?.[1];
  const restoredRoot = rootWidth
    ? result.replace(/<svg\b[^>]*>/, (root) =>
        root.replace(/stroke-width="[^"]+"/, `stroke-width="${rootWidth}"`),
      )
    : result;
  return restoredRoot.replace(/stroke-width="([\d.]+)"/g, (_, width) => {
    const value = Number(width);
    const original = widths.find(
      (candidate) => Math.abs(candidate - value) < 0.00001,
    );
    if (original === undefined)
      throw new Error(`View-box fitting changed a stroke width: ${width}`);
    return `stroke-width="${original}"`;
  });
}

// The existing feature regressions use recipe coordinates. Restore those
// coordinates from the actual generated output; raw fitted bounds and occupancy
// are checked separately, so inverse normalization cannot hide unused canvas.
export function restoreReferenceGeometry(
  svg,
  transform,
  preserveBrandContours = false,
) {
  return transformGeometry(
    svg,
    {
      scale: 1 / transform.scale,
      translateX: -transform.translateX / transform.scale,
      translateY: -transform.translateY / transform.scale,
    },
    preserveBrandContours,
  );
}

async function measure(page, records) {
  return page.evaluate(async (records) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    for (const {
      svg,
      width,
      scale = 1,
      translateX = 0,
      translateY = 0,
      pixelsPerUnit = 32,
    } of records) {
      const canvasSize = 20 * pixelsPerUnit;
      canvas.width = canvas.height = canvasSize;
      const document = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = document.documentElement;
      root.setAttribute("viewBox", "-2 -2 20 20");
      root.setAttribute("width", String(canvasSize));
      root.setAttribute("height", String(canvasSize));
      root.setAttribute("style", "color:black");
      for (const element of [
        root,
        ...root.querySelectorAll("[stroke-width]"),
      ]) {
        if (!element.hasAttribute("stroke-width")) continue;
        element.setAttribute(
          "stroke-width",
          String(
            (Number(element.getAttribute("stroke-width")) * width) /
              0.67 /
              scale,
          ),
        );
      }
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute(
        "transform",
        `translate(${translateX} ${translateY}) scale(${scale})`,
      );
      group.append(...root.childNodes);
      root.append(group);
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(document)], {
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
        context.clearRect(0, 0, canvasSize, canvasSize);
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvasSize, canvasSize).data;
        let left = canvasSize;
        let top = canvasSize;
        let right = 0;
        let bottom = 0;
        for (let i = 0; i < canvasSize * canvasSize; i++) {
          if (pixels[i * 4 + 3] < 128) continue;
          const x = i % canvasSize;
          const y = Math.floor(i / canvasSize);
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
        if (right <= left || bottom <= top)
          throw new Error("Cannot fit an empty icon");
        results.push(
          [left, top, right, bottom].map((value) => value / pixelsPerUnit - 2),
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    return results;
  }, records);
}

export async function fitViewBoxes(records) {
  validateOpticalFits();
  const profiles = new Map();
  for (const record of records) {
    const groupKey = getViewBoxGroupKey(record.name);
    const existing = profiles.get(groupKey);
    if (existing && existing.svg !== record.svg)
      throw new Error(`Alias artwork differs: ${record.name}`);
    if (existing) continue;
    const base = record.name.replace(/_solid\.svg$|\.svg$/g, "");
    const reason = brandIconNames.has(base)
      ? "official-brand"
      : groupKey === "checkmark_solid.svg"
        ? "full-canvas-badge"
        : undefined;
    const optical = getOpticalFit(groupKey);
    if (optical && reason)
      throw new Error(`Exempt artwork cannot have an optical fit: ${groupKey}`);
    profiles.set(groupKey, {
      svg: record.svg,
      transform: {
        groupKey,
        fitted: !reason,
        targetSpan: reason ? 16 : (optical?.targetSpan ?? targetSpan),
        ...(optical && {
          opticalCenter: optical.center,
          opticalReason: optical.reason,
        }),
        ...(reason && { reason }),
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    });
  }
  const fittedProfiles = [...profiles.values()].filter(
    ({ transform }) => transform.fitted,
  );
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    const baselines = await measure(
      page,
      fittedProfiles.flatMap(({ svg, transform }) =>
        [1, fitWidth].map((width) => ({
          svg,
          width,
          pixelsPerUnit: transform.opticalCenter ? 64 : 32,
        })),
      ),
    );
    for (let i = 0; i < fittedProfiles.length; i++) {
      const profile = fittedProfiles[i];
      const spanTarget = profile.transform.targetSpan;
      const centerTarget = profile.transform.opticalCenter ?? [8, 8];
      const at1 = baselines[i * 2];
      const atFit = baselines[i * 2 + 1];
      // Painted extents combine scaled coordinates with fixed stroke reach.
      // Estimate those terms, then refine against actual paint below.
      const geometry = at1.map((value, axis) => 3 * value - 2 * atFit[axis]);
      const stroke = atFit.map((value, axis) => 3 * (value - at1[axis]));
      profile.geometryCenter = [
        (geometry[0] + geometry[2]) / 2,
        (geometry[1] + geometry[3]) / 2,
      ];
      profile.strokeSpan = [stroke[2] - stroke[0], stroke[3] - stroke[1]];
      const geometrySpan = [
        geometry[2] - geometry[0],
        geometry[3] - geometry[1],
      ];
      const scale = Math.min(
        ...geometrySpan.map((span, axis) =>
          span > 0.01
            ? (spanTarget - profile.strokeSpan[axis]) / span
            : Number.POSITIVE_INFINITY,
        ),
      );
      if (!Number.isFinite(scale) || scale <= 0)
        throw new Error(`Invalid icon fit: ${profile.transform.groupKey}`);
      profile.transform.scale = round(scale);
      profile.transform.translateX = round(
        centerTarget[0] -
          scale * profile.geometryCenter[0] -
          (stroke[0] + stroke[2]) / 2,
      );
      profile.transform.translateY = round(
        centerTarget[1] -
          scale * profile.geometryCenter[1] -
          (stroke[1] + stroke[3]) / 2,
      );
    }
    for (let iteration = 0; iteration < 4; iteration++) {
      const measured = await measure(
        page,
        fittedProfiles.map(({ svg, transform }) => ({
          svg,
          width: fitWidth,
          // Subpixel optical offsets need a finer grid to avoid oscillating
          // across the raster threshold at the tips of filled triangles.
          pixelsPerUnit: transform.opticalCenter ? 64 : 32,
          ...transform,
        })),
      );
      let adjustments = 0;
      for (let i = 0; i < fittedProfiles.length; i++) {
        const profile = fittedProfiles[i];
        const spanTarget = profile.transform.targetSpan;
        const centerTarget = profile.transform.opticalCenter ?? [8, 8];
        const bounds = measured[i];
        const span = [bounds[2] - bounds[0], bounds[3] - bounds[1]];
        const center = [
          (bounds[0] + bounds[2]) / 2,
          (bounds[1] + bounds[3]) / 2,
        ];
        if (
          Math.abs(Math.max(...span) - spanTarget) <= 0.04 &&
          center.every(
            (value, axis) => Math.abs(value - centerTarget[axis]) <= 0.03,
          )
        )
          continue;
        if (iteration === 3)
          throw new Error(
            `Icon fit did not converge: ${profile.transform.groupKey} (${JSON.stringify({ bounds, spanTarget, centerTarget, transform: profile.transform })})`,
          );
        const previousScale = profile.transform.scale;
        const factor = Math.min(
          ...span.map((value, axis) =>
            value - profile.strokeSpan[axis] > 0.01
              ? (spanTarget - profile.strokeSpan[axis]) /
                (value - profile.strokeSpan[axis])
              : Number.POSITIVE_INFINITY,
          ),
        );
        const nextScale = round(previousScale * factor);
        profile.transform.translateX = round(
          profile.transform.translateX +
            centerTarget[0] -
            center[0] +
            (previousScale - nextScale) * profile.geometryCenter[0],
        );
        profile.transform.translateY = round(
          profile.transform.translateY +
            centerTarget[1] -
            center[1] +
            (previousScale - nextScale) * profile.geometryCenter[1],
        );
        profile.transform.scale = nextScale;
        adjustments++;
      }
      if (!adjustments) break;
    }
  } finally {
    await browser.close();
  }
  const transforms = {};
  const fitted = records.map(({ name, svg }) => {
    const { transform } = profiles.get(getViewBoxGroupKey(name));
    transforms[name] = transform;
    return { name, svg: transformGeometry(svg, transform) };
  });
  return { records: fitted, transforms };
}
