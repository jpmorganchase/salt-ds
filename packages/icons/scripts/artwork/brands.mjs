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

// Preserved brand frames bypass fitting. Bare LinkedIn letters occupy the
// original source bounds [1.9, 1.9, 12, 11.9] within its 14-unit square.
export function getBrandFrame(filename) {
  if (!brandIconNames.has(filename.replace(/_solid\.svg$|\.svg$/g, "")))
    return undefined;
  if (filename === "linkedin.svg")
    return {
      reason: "brand-letterforms",
      targetSpan: (10.1 * 16) / 14,
      center: [(6.95 * 16) / 14, (6.9 * 16) / 14],
    };
  return { reason: "official-brand", targetSpan: 16 };
}

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
export const linkedinSolid = officialPath(
  "linkedin.svg",
  "0 0 14 14",
  [0, 0, 14, 14],
);
// Salt's outline presentation keeps the original in-bug letter contours and
// placement, omitting only the square. The supplied source and solid stay intact.
export const linkedin = linkedinSolid.replace(/\bd="([^"]+)"/, (_, data) => {
  const contours = data.match(/[^z]+z/g);
  if (
    contours?.length !== 4 ||
    !contours[0].startsWith("m13 0") ||
    !contours[1].startsWith("m-8.8 11.9")
  )
    throw new Error(
      "Review the LinkedIn contours before extracting its letters",
    );
  // The first retained move was relative to the square's closed start (13, 0).
  const letters = contours
    .slice(1)
    .join("")
    .replace(/^m-8.8 11.9/, "M4.2 11.9");
  return `d="${letters}"`;
});

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
