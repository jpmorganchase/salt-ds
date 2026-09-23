import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";
import { createHash } from "node:crypto";
import { drawings } from "./drawings.mjs";
import { brandIconNames } from "./brands.mjs";
import { lineOnlySolidVariants } from "./line-only-variants.mjs";
import { composeSharedMark } from "./mark-composition.mjs";
import { stripJunctionTraces } from "./junction-trace.mjs";
import { fitViewBoxes } from "./view-box.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(dir, "../../src/SVG");
const inventory = JSON.parse(
  await fs.readFile(path.join(dir, "inventory.json"), "utf8"),
);
const expected = new Set(
  inventory.map((n) => n.replace(/_solid\.svg$|\.svg$/g, "")),
);
for (const name of Object.keys(drawings))
  if (!expected.has(name)) throw new Error(`Unexpected drawing: ${name}`);
for (const name of lineOnlySolidVariants) {
  if (!expected.has(name) || !drawings[name]?.[1])
    throw new Error(`Unknown line-only Solid alias: ${name}`);
}
const referenceRecords = [];
const sharedMarks = new Map();
const sourceHashes = {};
for (const file of inventory) {
  const solid = file.endsWith("_solid.svg");
  const name = file.replace(/_solid\.svg$|\.svg$/g, "");
  const drawing = drawings[name]?.[solid ? 1 : 0];
  if (!drawing) throw new Error(`Missing ${file}`);
  if (solid) {
    const identical =
      JSON.stringify(drawing) === JSON.stringify(drawings[name][0]);
    if (identical !== lineOnlySolidVariants.has(name))
      throw new Error(`Unexpected identical-variant contract: ${name}`);
  }
  sourceHashes[file] = createHash("sha256")
    .update(JSON.stringify(drawing))
    .digest("hex");
  const rawBody = typeof drawing === "string" ? drawing : drawing.body;
  const body =
    typeof rawBody === "string" ? stripJunctionTraces(rawBody) : rawBody;
  if (typeof body !== "string" || !body.trim())
    throw new Error(`Invalid drawing body: ${file}`);
  const preserveBrandContours = brandIconNames.has(name);
  if (typeof drawing !== "string") {
    if (!drawing.mark || preserveBrandContours)
      throw new Error(`Invalid shared mark recipe: ${file}`);
    // Aliases resolve to their canonical descriptor above, retaining the same
    // final mark even when their container is fitted independently.
    sharedMarks.set(file, drawing.mark);
  }
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
  referenceRecords.push({ name: file, svg: result });
}
const { records, transforms } = await fitViewBoxes(referenceRecords);
// Validate and compose every descriptor before writing any output. Containers
// alone determine the fit; shared marks retain their final 16-unit geometry.
const composedRecords = records.map(({ name, svg }) => ({
  name,
  svg: composeSharedMark(svg, sharedMarks.get(name)),
}));
await fs.writeFile(
  path.join(dir, "junction-source-hashes.json"),
  `${JSON.stringify({ schemaVersion: 1, records: sourceHashes }, null, 2)}\n`,
);
await fs.writeFile(
  path.join(dir, "view-box-transforms.json"),
  `${JSON.stringify(transforms, null, 2)}\n`,
);
for (const { name: file, svg: result } of composedRecords) {
  await fs.writeFile(path.join(target, file), result);
  if (file === "github.svg") {
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
