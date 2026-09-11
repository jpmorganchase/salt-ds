import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";
import a from "./a.mjs";
import architecture from "./architecture.mjs";
import b from "./b.mjs";
import { brandIconNames, brandVariantAliases } from "./brands.mjs";
import c from "./c.mjs";
import cloudActions from "./cloud-actions.mjs";
import d from "./d.mjs";
import fileFormats from "./file-formats.mjs";
import referenceControls from "./reference-controls.mjs";
import referenceFrames from "./reference-frames.mjs";
import referenceSymbols from "./reference-symbols.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(dir, "../../src/SVG");
const inventory = JSON.parse(
  await fs.readFile(path.join(dir, "inventory.json"), "utf8"),
);
const drawings = {};
// Each meaning has one owning recipe; aliases are assigned separately.
for (const batch of [
  a,
  b,
  c,
  d,
  architecture,
  referenceSymbols,
  referenceFrames,
  referenceControls,
  cloudActions,
  fileFormats,
]) {
  for (const [name, pair] of Object.entries(batch)) {
    if (drawings[name]) throw new Error(`Duplicate drawing: ${name}`);
    drawings[name] = pair;
  }
}
// Deprecated aliases follow their supported replacement. The historic filled
// step-success badge is retained by its drawing recipe.
const aliases = {
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
for (const [alias, canonical] of Object.entries(aliases)) {
  if (drawings[alias]) throw new Error(`Duplicate drawing: ${alias}`);
  drawings[alias] = drawings[canonical];
}
const expected = new Set(
  inventory.map((n) => n.replace(/_solid\.svg$|\.svg$/g, "")),
);
for (const name of Object.keys(drawings))
  if (!expected.has(name)) throw new Error(`Unexpected drawing: ${name}`);
for (const file of inventory) {
  const solid = file.endsWith("_solid.svg");
  const name = file.replace(/_solid\.svg$|\.svg$/g, "");
  const body = drawings[name]?.[solid ? 1 : 0];
  if (!body) throw new Error(`Missing ${file}`);
  if (solid && body === drawings[name][0] && !brandVariantAliases.has(file))
    throw new Error(`Identical variants: ${name}`);
  const preserveBrandContours = brandIconNames.has(name);
  // Bake construction transforms into coordinates and widths, then apply the
  // fixed family weight while preserving lighter secondary details.
  const normalized = optimize(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g transform="scale(.6666666667)">${body}</g></svg>`,
    {
      multipass: true,
      floatPrecision: preserveBrandContours ? 8 : 4,
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
              ...(preserveBrandContours && {
                convertTransform: {
                  floatPrecision: 12,
                  transformPrecision: 12,
                },
              }),
              mergePaths: false,
            },
          },
        },
      ],
    },
  ).data;
  if (/transform=/.test(normalized))
    throw new Error(`Unbaked transform: ${file}`);
  const result = optimize(normalized, {
    plugins: [
      {
        name: "fixedStroke",
        fn: () => ({
          element: {
            enter(node) {
              const width = node.attributes["stroke-width"];
              if (width && !preserveBrandContours)
                node.attributes["stroke-width"] = String(
                  Number((Number(width) * 0.67).toFixed(8)),
                );
              if (node.name === "svg" && !preserveBrandContours)
                node.attributes["stroke-width"] = "0.67";
            },
          },
        }),
      },
    ],
    js2svg: { pretty: true, indent: 2 },
  }).data;
  await fs.writeFile(path.join(target, file), result);
  if (name === "github") {
    // Keep the site's standalone image synchronized with the package mark.
    await fs.writeFile(
      path.resolve(dir, "../../../../site/public/img/github_logo.svg"),
      result
        .replace('width="16" height="16"', 'width="14" height="14"')
        .replace('fill="currentColor"', 'fill="black"'),
    );
  }
}
// Site-only color assets preserve the complete supplied SVG contents.
for (const [sourceFile, outputFile, width, height, viewBox] of [
  ["figma-color.svg", "figma_logo.svg", 12, 18, "312 340 400 600"],
  ["storybook.svg", "storybook_logo.svg", 15, 19, "0 0 52 64"],
]) {
  const source = await fs.readFile(
    path.join(dir, "brands", sourceFile),
    "utf8",
  );
  const result = source.replace(/<svg\b[^>]*>/, (root) => {
    const attributes = root
      .replace(/\s(?:width|height|viewBox)="[^"]*"/g, "")
      .replace(/>$/, "");
    return `${attributes} width="${width}" height="${height}" viewBox="${viewBox}">`;
  });
  await fs.writeFile(
    path.resolve(dir, "../../../../site/public/img", outputFile),
    result,
  );
}
console.log(
  `Generated ${inventory.length} SVGs: ${expected.size} meanings, ${inventory.length - expected.size} solid variants, 16px master.`,
);
