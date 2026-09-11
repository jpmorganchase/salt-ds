import { brandIconNames } from "./brands.mjs";
import { getOpticalFit, validateOpticalFits } from "./optical-fits.mjs";
import { getViewBoxGroupKey } from "./view-box.mjs";

// Validate the generated fit metadata independently of its measurements. Every
// export has its own target; only exact compatibility aliases share a fit.
export function validateViewBoxTransforms(records, transforms) {
  if (
    !transforms ||
    typeof transforms !== "object" ||
    Array.isArray(transforms)
  )
    throw new Error("Missing viewBox fit manifest");
  const names = records.map(({ name }) => name).sort();
  if (JSON.stringify(Object.keys(transforms).sort()) !== JSON.stringify(names))
    throw new Error("ViewBox fit manifest does not match the icon inventory");

  const registeredGroups = new Set(names.map(getViewBoxGroupKey));
  validateOpticalFits(registeredGroups);

  const groups = new Map();
  for (const { name, svg } of records) {
    const fit = transforms[name];
    if (
      !fit ||
      typeof fit !== "object" ||
      !Number.isFinite(fit.scale) ||
      fit.scale <= 0 ||
      !Number.isFinite(fit.translateX) ||
      !Number.isFinite(fit.translateY) ||
      typeof fit.fitted !== "boolean" ||
      fit.groupKey !== getViewBoxGroupKey(name)
    )
      throw new Error(`Invalid viewBox fit metadata: ${name}`);
    const base = name.replace(/_solid\.svg$|\.svg$/g, "");
    const exemption = brandIconNames.has(base)
      ? "official-brand"
      : fit.groupKey === "checkmark_solid.svg"
        ? "full-canvas-badge"
        : undefined;
    const optical = getOpticalFit(fit.groupKey);
    if (optical && exemption)
      throw new Error(`Exempt artwork cannot have an optical fit: ${name}`);
    if (
      fit.fitted !== !exemption ||
      fit.targetSpan !== (exemption ? 16 : (optical?.targetSpan ?? 15.5)) ||
      fit.reason !== exemption ||
      fit.opticalReason !== optical?.reason ||
      JSON.stringify(fit.opticalCenter) !== JSON.stringify(optical?.center)
    )
      throw new Error(`Invalid viewBox fit target or exemption: ${name}`);

    const previous = groups.get(fit.groupKey);
    if (previous) {
      for (const key of [
        "scale",
        "translateX",
        "translateY",
        "targetSpan",
        "fitted",
      ])
        if (fit[key] !== previous.fit[key])
          throw new Error(
            `Alias viewBox fit differs: ${name} and ${previous.name}`,
          );
      if (svg !== previous.svg)
        throw new Error(`Alias artwork differs: ${name} and ${previous.name}`);
    } else {
      groups.set(fit.groupKey, { name, svg, fit });
    }
  }
}

// Measure the final exported paint, not inverse-normalized regression inputs.
// A padded raster exposes clipping and checks each variant's own occupancy.
export async function checkViewBoxFit(page, records, transforms) {
  validateViewBoxTransforms(records, transforms);
  const artwork = records.map(({ name, svg }) => ({
    name,
    svg,
    fit: transforms[name],
    preserveBrandContours: brandIconNames.has(
      name.replace(/_solid\.svg$|\.svg$/g, ""),
    ),
  }));
  return page.evaluate(async (artwork) => {
    const weight = 1.5;
    const tolerance = 0.1;
    const pixelsPerUnit = 32;
    const padding = 2;
    const side = 20 * pixelsPerUnit;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const results = [];
    const failures = [];

    for (const { name, svg, fit, preserveBrandContours } of artwork) {
      const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
      if (parsed.querySelector("parsererror"))
        throw new Error(`Could not parse fitted artwork: ${name}`);
      const source = parsed.documentElement;
      source.setAttribute("viewBox", "-2 -2 20 20");
      source.setAttribute("width", side);
      source.setAttribute("height", side);
      source.setAttribute("style", "color:black");
      if (!preserveBrandContours)
        for (const element of source.querySelectorAll("[stroke-width]"))
          element.setAttribute(
            "stroke-width",
            (Number(element.getAttribute("stroke-width")) / 0.67) * weight,
          );
      if (!preserveBrandContours && source.hasAttribute("stroke-width"))
        source.setAttribute(
          "stroke-width",
          (Number(source.getAttribute("stroke-width")) / 0.67) * weight,
        );
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(source)], {
          type: "image/svg+xml",
        }),
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
        const pixels = context.getImageData(0, 0, side, side).data;
        let minX = side;
        let minY = side;
        let maxX = 0;
        let maxY = 0;
        let paintedPixels = 0;
        for (let index = 0; index < side * side; index++) {
          if (pixels[index * 4 + 3] < 128) continue;
          const x = index % side;
          const y = Math.floor(index / side);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + 1);
          maxY = Math.max(maxY, y + 1);
          paintedPixels++;
        }
        const bounds = paintedPixels
          ? [minX, minY, maxX, maxY].map(
              (value) => value / pixelsPerUnit - padding,
            )
          : null;
        const center = bounds
          ? [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2]
          : null;
        const span = bounds
          ? Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1])
          : 0;
        const targetCenter = fit.opticalCenter ?? [8, 8];
        const result = {
          name,
          weight,
          targetSpan: fit.targetSpan,
          targetCenter,
          bounds,
          center,
          span,
          paintedPixels,
          tolerance,
        };
        results.push(result);
        if (
          !bounds ||
          bounds[0] < 0 ||
          bounds[1] < 0 ||
          bounds[2] > 16 ||
          bounds[3] > 16 ||
          Math.abs(span - fit.targetSpan) > tolerance ||
          Math.abs(center[0] - targetCenter[0]) > tolerance ||
          Math.abs(center[1] - targetCenter[1]) > tolerance
        )
          failures.push(result);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    return { samples: results.length, results, failures };
  }, artwork);
}
