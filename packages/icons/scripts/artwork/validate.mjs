import fs from "node:fs/promises";
import { checkPairContours } from "./check-pair-contours.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { brandIconNames } from "./brands.mjs";
import { checkDetailRecognition } from "./check-detail-recognition.mjs";
import { checkCloudPairs } from "./check-cloud-pairs.mjs";
import { checkClearance } from "./check-clearance.mjs";
import { checkCompactActions } from "./check-compact-actions.mjs";
import { checkCutoutActions } from "./check-cutout-actions.mjs";
import { checkCutoutClearance } from "./check-cutout-clearance.mjs";
import { checkCutoutComposites } from "./check-cutout-composites.mjs";
import { checkCutoutContours } from "./check-cutout-contours.mjs";
import { checkCutoutDisabled } from "./check-cutout-disabled.mjs";
import { checkCutoutPeople } from "./check-cutout-people.mjs";
import { checkCutoutSpacingAbc } from "./check-cutout-spacing-abc.mjs";
import { checkCutoutSpacingActions } from "./check-cutout-spacing-actions.mjs";
import { checkCutoutSpacingCloud } from "./check-cutout-spacing-cloud.mjs";
import { checkCutoutSpacingD } from "./check-cutout-spacing-d.mjs";
import { checkFeedbackHome } from "./check-feedback-home.mjs";
import { checkFamilyFeatures } from "./check-family-features.mjs";
import { checkInternalJunctions } from "./check-internal-junctions.mjs";
import { checkFeatureAlignment } from "./check-feature-alignment.mjs";
import { checkFilterGuidePairs } from "./check-filter-guide-pairs.mjs";
import { checkNumberCentering } from "./check-number-centering.mjs";
import { checkOpticalDetails } from "./check-optical-details.mjs";
import { checkPaintedBounds } from "./check-painted-bounds.mjs";
import { checkPairFeatures } from "./check-pair-features.mjs";
import { checkPairStrokes } from "./check-pair-strokes.mjs";
import { checkPairedSurfaceExteriors } from "./check-paired-surface-exteriors.mjs";
import { checkPrinterPaper } from "./check-printer-paper.mjs";
import { checkOpenApertureSeams } from "./check-open-aperture-seams.mjs";
import { checkPolishFeatures } from "./check-polish-features.mjs";
import { checkReviewAb } from "./check-review-ab.mjs";
import { checkReviewCd } from "./check-review-cd.mjs";
import { checkReviewABank } from "./check-review-a-bank.mjs";
import { checkReviewBRetained } from "./check-review-b-retained.mjs";
import { checkReviewClipboardDocumentShaker } from "./check-review-clipboard-document-shaker.mjs";
import { checkReviewSymbols } from "./check-review-symbols.mjs";
import { checkScalingActions } from "./check-scaling-actions.mjs";
import { checkScalingControls } from "./check-scaling-controls.mjs";
import { checkScalingMedia } from "./check-scaling-media.mjs";
import { checkScalingOther } from "./check-scaling-other.mjs";
import { checkSchoolCutout } from "./check-school-cutout.mjs";
import { checkSendSurface } from "./check-send-surface.mjs";
import { checkSharedMarks } from "./check-shared-marks.mjs";
import { checkSpecificDrawings } from "./check-specific-drawings.mjs";
import { checkStabilizationA } from "./check-stabilization-a.mjs";
import { checkStabilizationB } from "./check-stabilization-b.mjs";
import { checkStabilizationCd } from "./check-stabilization-cd.mjs";
import { checkSumWeight } from "./check-sum-weight.mjs";
import { checkStructuralFamilies } from "./check-structural-families.mjs";
import { checkTransferWeight } from "./check-transfer-weight.mjs";
import {
  checkViewBoxFit,
  validateViewBoxTransforms,
} from "./check-view-box-fit.mjs";
import { restoreReferenceGeometry } from "./view-box.mjs";

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
  const rootElement = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  if (
    !rootElement.includes('viewBox="0 0 16 16"') ||
    !/\bwidth="16"/.test(rootElement) ||
    !/\bheight="16"/.test(rootElement)
  )
    throw new Error(`Incorrect icon canvas: ${name}`);
  if (/\btransform=/.test(svg))
    throw new Error(`Unbaked export transform: ${name}`);
  if (/<(?:text|mask|clipPath|image|script)\b|\b(?:NaN|undefined)\b/.test(svg))
    throw new Error(`Unsupported geometry: ${name}`);
  for (const [, width] of svg.matchAll(/stroke-width="([^"]+)"/g)) {
    if (!Number.isFinite(Number(width)) || Number(width) <= 0)
      throw new Error(`Stroke width must be a fixed positive number: ${name}`);
  }
}
const transforms = JSON.parse(
  await fs.readFile(
    path.join(root, "packages/icons/scripts/artwork/view-box-transforms.json"),
    "utf8",
  ),
);
validateViewBoxTransforms(records, transforms);
// Invert only the export fit on the actual files. Keep reference-width shape
// regressions separate from the final exported paint and occupancy checks.
const referenceRecords = await Promise.all(
  records.map(async ({ name, svg }) => ({
    name,
    svg: await restoreReferenceGeometry(
      svg,
      transforms[name],
      brandIconNames.has(name.replace(/_solid\.svg$|\.svg$/g, "")),
    ),
  })),
);
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
        // getBBox reports path geometry. Expanding every axis by half a stroke
        // falsely extends flat line terminals; padded raster checks below own
        // the complete painted bounds, including acute joins and stroke caps.
        if (b.width || b.height) drawable++;
        if (
          b.x < -0.03 ||
          b.y < -0.03 ||
          b.x + b.width > 16.03 ||
          b.y + b.height > 16.03
        )
          bounds.push({
            name,
            d: el.getAttribute("d"),
            x: b.x,
            y: b.y,
            right: b.x + b.width,
            bottom: b.y + b.height,
          });
        if (style.stroke !== "none") strokeElements++;
      }
      if (!drawable) empty.push(name);
    }
    return { bounds, empty, strokeElements };
  });
  const fit = await checkViewBoxFit(page, records, transforms);
  result.viewBoxFitFailures = fit.failures;
  result.viewBoxFitSamples = fit.samples;
  const centering = await checkNumberCentering(page, referenceRecords);
  result.numberCenteringFailures = centering.failures;
  result.numberCenteringSamples = centering.results.length;
  const pairFeatures = await checkPairFeatures(page, referenceRecords, records);
  result.pairFeatureFailures = pairFeatures.failures;
  result.pairFeatureSamples = pairFeatures.results.length;
  const sharedMarks = await checkSharedMarks(page, records);
  result.sharedMarkFailures = sharedMarks.failures;
  result.sharedMarkSamples = sharedMarks.results.length;
  const specificDrawings = await checkSpecificDrawings(page, records);
  result.specificDrawingFailures = specificDrawings.failures;
  result.specificDrawingSamples = specificDrawings.results.length;
  const compactActions = await checkCompactActions(page, records);
  result.compactActionFailures = compactActions.failures;
  result.compactActionSamples = compactActions.results.length;
  const cutoutContours = await checkCutoutContours(page, records);
  result.cutoutContourFailures = cutoutContours.failures;
  result.cutoutContourSamples = cutoutContours.results.length;
  const cutoutSpacingMeasurements = [];
  result.cutoutSpacingFailures = [];
  result.cutoutSpacingSamples = 0;
  for (const check of [
    checkCutoutSpacingActions,
    checkCutoutSpacingAbc,
    checkCutoutSpacingCloud,
    checkCutoutSpacingD,
  ]) {
    const spacing = await check(page, records);
    cutoutSpacingMeasurements.push(...spacing.results);
    result.cutoutSpacingFailures.push(...spacing.failures);
    result.cutoutSpacingSamples += spacing.results.length;
  }
  const scalingMeasurements = [];
  result.scalingFailures = [];
  for (const check of [
    checkScalingControls,
    checkScalingMedia,
    checkScalingActions,
    checkScalingOther,
  ]) {
    const scaling = await check(page, records);
    scalingMeasurements.push(...scaling.results);
    result.scalingFailures.push(...scaling.failures);
  }
  result.scalingSamples = scalingMeasurements.length;
  const structuralFamilies = await checkStructuralFamilies(page, records);
  result.structuralFamilyFailures = structuralFamilies.failures;
  result.structuralFamilySamples = structuralFamilies.results.length;
  const familyFeatures = await checkFamilyFeatures(page, records);
  result.familyFeatureFailures = familyFeatures.failures;
  result.familyFeatureSamples = familyFeatures.results.length;
  const opticalDetails = await checkOpticalDetails(page, records);
  result.opticalDetailFailures = opticalDetails.failures;
  result.opticalDetailSamples = opticalDetails.results.length;
  const polish = await checkPolishFeatures(page, records);
  result.polishFeatureFailures = polish.failures;
  result.polishFeatureSamples = polish.results.length;
  // Check retained landmarks and open contours on the actual shipped frame.
  const stabilizationMeasurements = [];
  result.stabilizationFailures = [];
  for (const check of [
    checkStabilizationA,
    checkStabilizationB,
    checkStabilizationCd,
    checkSumWeight,
    checkTransferWeight,
    checkFilterGuidePairs,
    checkPairedSurfaceExteriors,
    checkSendSurface,
    checkCloudPairs,
    checkPrinterPaper,
    checkOpenApertureSeams,
    checkFeedbackHome,
    checkReviewAb,
    checkReviewCd,
    checkReviewABank,
    checkReviewBRetained,
    checkReviewClipboardDocumentShaker,
    checkReviewSymbols,
  ]) {
    const checked = await check(page, records);
    stabilizationMeasurements.push(...checked.results);
    result.stabilizationFailures.push(...checked.failures);
  }
  result.stabilizationSamples = stabilizationMeasurements.length;
  const pairContours = await checkPairContours(page, records);
  result.pairContourFailures = pairContours.failures;
  result.pairContourCoverage = {
    total: pairContours.results.length,
    passed: pairContours.results.filter((r) => r.status === "pass").length,
    needsReview: pairContours.needsReview.length,
  };
  const details = await checkDetailRecognition(page, records, transforms);
  result.detailRecognitionFailures = details.failures;
  result.detailRecognitionSamples = details.results.length;
  const internalJunctions = await checkInternalJunctions(page, records);
  result.internalJunctionFailures = internalJunctions.failures;
  result.internalJunctionSamples = internalJunctions.results.length;
  const pairStrokes = await checkPairStrokes(page, referenceRecords);
  result.pairStrokeFailures = pairStrokes.failures;
  result.pairStrokeSamples = pairStrokes.results.length;
  const alignment = await checkFeatureAlignment(page, referenceRecords);
  result.featureAlignmentFailures = alignment.failures;
  result.featureAlignmentSamples = alignment.results.length;
  const clearance = await checkClearance(page, referenceRecords);
  result.clearanceFailures = clearance.failures;
  result.clearanceSamples = clearance.results.length;
  const cutout = await checkCutoutClearance(page, referenceRecords);
  for (const check of [
    checkCutoutActions,
    checkCutoutComposites,
    checkCutoutDisabled,
    checkCutoutPeople,
    checkSchoolCutout,
  ]) {
    const checked = await check(page, referenceRecords);
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
  await fs.writeFile(
    path.join(out, "pair-contours.json"),
    JSON.stringify(pairContours, null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(out, "scaling.json"),
    `${JSON.stringify(scalingMeasurements, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(out, "cutout-spacing.json"),
    `${JSON.stringify(cutoutSpacingMeasurements, null, 2)}\n`,
  );
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
  await fs.writeFile(
    path.join(out, "internal-junctions.json"),
    `${JSON.stringify(internalJunctions.results, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(out, "stabilization.json"),
    `${JSON.stringify(stabilizationMeasurements, null, 2)}\n`,
  );
  console.log(
    JSON.stringify({ icons: files.length, errors, ...result }, null, 2),
  );
  if (
    errors.length ||
    result.empty.length ||
    result.bounds.length ||
    result.viewBoxFitFailures.length ||
    result.numberCenteringFailures.length ||
    result.pairFeatureFailures.length ||
    result.sharedMarkFailures.length ||
    result.specificDrawingFailures.length ||
    result.compactActionFailures.length ||
    result.cutoutContourFailures.length ||
    result.cutoutSpacingFailures.length ||
    result.scalingFailures.length ||
    result.stabilizationFailures.length ||
    result.structuralFamilyFailures.length ||
    result.familyFeatureFailures.length ||
    result.polishFeatureFailures.length ||
    result.opticalDetailFailures.length ||
    result.detailRecognitionFailures.length ||
    result.internalJunctionFailures.length ||
    result.pairStrokeFailures.length ||
    result.pairContourFailures.length ||
    result.featureAlignmentFailures.length ||
    result.clearanceFailures.length ||
    result.cutoutClearanceFailures.length ||
    result.paintedBoundsFailures.length
  )
    process.exitCode = 1;
} finally {
  await browser.close();
}
