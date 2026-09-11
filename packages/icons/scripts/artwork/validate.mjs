import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { checkClearance } from "./check-clearance.mjs";
import { checkCutoutActions } from "./check-cutout-actions.mjs";
import { checkCutoutClearance } from "./check-cutout-clearance.mjs";
import { checkCutoutComposites } from "./check-cutout-composites.mjs";
import { checkCutoutDisabled } from "./check-cutout-disabled.mjs";
import { checkCutoutPeople } from "./check-cutout-people.mjs";
import { checkFeatureAlignment } from "./check-feature-alignment.mjs";
import { checkNumberCentering } from "./check-number-centering.mjs";
import { checkPaintedBounds } from "./check-painted-bounds.mjs";
import { checkPairFeatures } from "./check-pair-features.mjs";
import { checkPairStrokes } from "./check-pair-strokes.mjs";
import { checkSchoolCutout } from "./check-school-cutout.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const dir = path.join(root, "packages/icons/src/SVG");
const files = (await fs.readdir(dir)).filter((n) => n.endsWith(".svg")).sort();
const expected = JSON.parse(
  await fs.readFile(
    path.join(root, "packages/icons/scripts/artwork/inventory.json"),
    "utf8",
  ),
);
if (JSON.stringify(files) !== JSON.stringify(expected))
  throw new Error("Icon inventory changed");
const records = await Promise.all(
  files.map(async (name) => ({
    name,
    svg: await fs.readFile(path.join(dir, name), "utf8"),
  })),
);
for (const { name, svg } of records) {
  if (!svg.includes('viewBox="0 0 16 16"'))
    throw new Error(`Incorrect viewBox: ${name}`);
  if (/<(?:text|mask|clipPath|image|script)\b|\b(?:NaN|undefined)\b/.test(svg))
    throw new Error(`Unsupported geometry: ${name}`);
  for (const [, width] of svg.matchAll(/stroke-width="([^"]+)"/g)) {
    if (!Number.isFinite(Number(width)) || Number(width) <= 0)
      throw new Error(`Stroke width must be a fixed positive number: ${name}`);
  }
}
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setContent(
    `<style>body{margin:0;background:white;color:#000}.grid{display:grid;grid-template-columns:repeat(24,48px);gap:2px}.cell{width:48px;height:48px;display:grid;place-items:center}.cell svg{width:32px;height:32px}</style><div class="grid">${records.map(({ name, svg }) => `<div class="cell" data-name="${name}">${svg}</div>`).join("")}</div>`,
  );
  const result = await page.evaluate(() => {
    const bounds = [];
    const empty = [];
    let strokeElements = 0;
    for (const cell of document.querySelectorAll(".cell")) {
      const name = cell.dataset.name;
      const svg = cell.querySelector("svg");
      let drawable = 0;
      for (const el of svg.querySelectorAll("path")) {
        const style = getComputedStyle(el);
        const b = el.getBBox();
        const s =
          style.stroke === "none"
            ? 0
            : Number.parseFloat(style.strokeWidth) / 2;
        if (b.width || b.height) drawable++;
        if (
          b.x - s < -0.03 ||
          b.y - s < -0.03 ||
          b.x + b.width + s > 16.03 ||
          b.y + b.height + s > 16.03
        )
          bounds.push({
            name,
            d: el.getAttribute("d"),
            x: b.x - s,
            y: b.y - s,
            right: b.x + b.width + s,
            bottom: b.y + b.height + s,
          });
        if (style.stroke !== "none") strokeElements++;
      }
      if (!drawable) empty.push(name);
    }
    return { bounds, empty, strokeElements };
  });
  const centering = await checkNumberCentering(page, records);
  result.numberCenteringFailures = centering.failures;
  result.numberCenteringSamples = centering.results.length;
  const pairFeatures = await checkPairFeatures(page, records);
  result.pairFeatureFailures = pairFeatures.failures;
  result.pairFeatureSamples = pairFeatures.results.length;
  const pairStrokes = await checkPairStrokes(page, records);
  result.pairStrokeFailures = pairStrokes.failures;
  result.pairStrokeSamples = pairStrokes.results.length;
  const alignment = await checkFeatureAlignment(page, records);
  result.featureAlignmentFailures = alignment.failures;
  result.featureAlignmentSamples = alignment.results.length;
  const clearance = await checkClearance(page, records);
  result.clearanceFailures = clearance.failures;
  result.clearanceSamples = clearance.results.length;
  const cutout = await checkCutoutClearance(page, records);
  for (const check of [
    checkCutoutActions,
    checkCutoutComposites,
    checkCutoutDisabled,
    checkCutoutPeople,
    checkSchoolCutout,
  ]) {
    const checked = await check(page, records);
    cutout.results.push(...checked.results);
    cutout.failures.push(...checked.failures);
  }
  result.cutoutClearanceFailures = cutout.failures;
  result.cutoutClearanceSamples = cutout.results.length;
  const painted = await checkPaintedBounds(page, records);
  result.paintedBoundsFailures = painted.failures;
  result.paintedBoundsSamples = painted.samples;
  const out = path.join(root, "dist/icon-validation");
  await fs.mkdir(out, { recursive: true });
  await page
    .locator(".grid")
    .screenshot({ path: path.join(out, "all-icons-32.png") });
  await page.addStyleTag({ content: ".cell svg{width:16px;height:16px}" });
  await page
    .locator(".grid")
    .screenshot({ path: path.join(out, "all-icons-16.png") });
  await fs.writeFile(
    path.join(out, "validation.json"),
    `${JSON.stringify({ icons: files.length, errors, ...result }, null, 2)}\n`,
  );
  console.log(
    JSON.stringify({ icons: files.length, errors, ...result }, null, 2),
  );
  if (
    errors.length ||
    result.empty.length ||
    result.bounds.length ||
    result.numberCenteringFailures.length ||
    result.pairFeatureFailures.length ||
    result.pairStrokeFailures.length ||
    result.featureAlignmentFailures.length ||
    result.clearanceFailures.length ||
    result.cutoutClearanceFailures.length ||
    result.paintedBoundsFailures.length
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
