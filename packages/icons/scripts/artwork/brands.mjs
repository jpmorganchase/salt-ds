import { readFileSync } from "node:fs";
import { group } from "./primitives.mjs";

export const brandIconNames = new Set([
  "figma",
  "github",
  "icon-figma",
  "linkedin",
  "stackoverflow",
  "symphony",
]);

// Both historical exports use the owner's one official monochrome in-bug.
export const brandVariantAliases = new Set(["linkedin_solid.svg"]);

function officialPath(file, viewBox, bounds, pathIndex = 0, pathCount = 1) {
  const source = readFileSync(
    new URL(`./brands/${file}`, import.meta.url),
    "utf8",
  );
  const paths = [...source.matchAll(/<path\b[^>]*>/g)].map(([path]) => path);
  const selected = paths[pathIndex];
  const data = selected?.match(/\bd="([^"]+)"/)?.[1];
  if (
    !source.includes(`viewBox="${viewBox}"`) ||
    paths.length !== pathCount ||
    !data
  )
    throw new Error(
      `Review the official ${file} source before changing its export`,
    );
  const fillRule = selected.match(/\bfill-rule="([^"]+)"/)?.[1];
  const [x, y, width, height] = bounds;
  const scale = 24 / Math.max(width, height);
  return group(
    `<path d="${data}" fill="currentColor"${fillRule ? ` fill-rule="${fillRule}"` : ""}/>`,
    `translate(${(24 - width * scale) / 2 - x * scale} ${(24 - height * scale) / 2 - y * scale}) scale(${scale})`,
  );
}

// Remove presentation-artboard padding, preserving the supplied path geometry.
export const figma = officialPath(
  "figma.svg",
  "0 0 1024 1280",
  [304, 340, 416.156, 600],
);
export const linkedin = officialPath(
  "linkedin.svg",
  "0 0 14 14",
  [0, 0, 14, 14],
);
// The guide SVG also includes an orange presentation background; select its mark.
export const stackoverflow = officialPath(
  "stackoverflow.svg",
  "0 0 966 500",
  [365.876, 90.582, 234.248, 273.729],
);
// The second path is the company symbol; the first is the wordmark.
export const symphony = officialPath(
  "symphony.svg",
  "0 0 162 29",
  [0, 0, 20.1102, 28.4893],
  1,
  2,
);

// Keep the official source unchanged. Its 98×96 canvas is fitted uniformly
// into our 24-unit construction canvas; layouts supply the brand clear space.
const githubSource = readFileSync(
  new URL("./brands/github.svg", import.meta.url),
  "utf8",
);
const githubPath = githubSource.match(
  /<path d="([^"]+)" fill="black"\s*\/>/,
)?.[1];
if (!githubSource.includes('viewBox="0 0 98 96"') || !githubPath)
  throw new Error(
    "Review the official GitHub source before changing its export",
  );

export const github = group(
  `<path d="${githubPath}" fill="currentColor"/>`,
  `translate(0 ${24 / 98}) scale(${24 / 98})`,
);
