import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { discoverJunctionCandidates } from "./junction-discovery.mjs";

let browser;
let page;
before(async () => {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  page = await browser.newPage();
});
after(async () => {
  await browser?.close();
});

const svg = (body, attributes = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" ${attributes}>${body}</svg>`;
const line = (d) =>
  `<path d="${d}" fill="none" stroke="black" stroke-width="0.67"/>`;
const discover = async (artwork) =>
  page.evaluate(({ source, artwork }) => (0, eval)(`(${source})`)(artwork), {
    source: discoverJunctionCandidates.toString(),
    artwork,
  });
const at = (result, x, y, kind) =>
  result.candidates.filter(
    (candidate) =>
      Math.hypot(candidate.x - x, candidate.y - y) < 0.12 &&
      (!kind || candidate.kind === kind),
  );

test("separate-path X exposes four individually unclassified sectors", async () => {
  const result = await discover(svg(line("M2 8H14") + line("M8 2V14")));
  const crossing = at(result, 8, 8, "centerline-crossing");
  assert.equal(crossing.length, 1);
  assert.equal(crossing[0].sectors.length, 4);
  assert.deepEqual(
    crossing[0].sectors.map((sector) => sector.sweepDegrees),
    [90, 90, 90, 90],
  );
  assert(
    crossing[0].sectors.every(
      (sector) => sector.classification === "unreviewed",
    ),
  );
  assert.equal(crossing[0].classification, "unreviewed");
});

test("a T is found across paths and across moveto subpaths", async () => {
  for (const body of [
    line("M2 8H14") + line("M8 8V14"),
    line("M2 8H14M8 8V14"),
  ]) {
    const result = await discover(svg(body));
    const crossings = at(result, 8, 8, "centerline-crossing");
    assert.equal(crossings.length, 1);
    assert.equal(crossings[0].sectors.length, 3);
    assert.deepEqual(
      crossings[0].sectors.map((sector) => sector.sweepDegrees).sort(),
      [90, 90, 180].sort(),
    );
  }
});

test("one continuous path with a self crossing is discovered", async () => {
  const result = await discover(svg(line("M2 2L14 14H2L14 2")));
  assert.equal(at(result, 8, 8, "centerline-crossing").length, 1);
});

test("all corners of a filled notch and negative counter remain enumerable", async () => {
  const notched = await discover(svg('<path d="M2 2H14V14H10V8H6V14H2Z"/>'));
  for (const [x, y] of [
    [10, 8],
    [6, 8],
  ]) {
    const candidates = at(notched, x, y, "contour-corner");
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].details.boundary, "filled-concavity");
  }
  const counter = await discover(
    svg('<path fill-rule="evenodd" d="M1 1H15V15H1ZM5 5H11V11H5Z"/>'),
  );
  for (const [x, y] of [
    [5, 5],
    [11, 5],
    [11, 11],
    [5, 11],
  ]) {
    const candidates = at(counter, x, y, "contour-corner");
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].details.boundary, "filled-concavity");
  }
});

test("implicit filled closure is included, but a moveto gap is never a line", async () => {
  const triangle = await discover(svg('<path d="M2 2H10V10"/>'));
  assert.equal(
    triangle.candidates.filter(
      (candidate) => candidate.kind === "contour-corner",
    ).length,
    3,
  );
  const apart = await discover(svg(line("M1 1H3M13 13H15")));
  assert.equal(apart.candidates.length, 0);
});

test("a separate overlapping object is a candidate, never an automatic defect", async () => {
  const result = await discover(
    svg(
      '<path d="M2 2H10V10H2Z" fill="none" stroke="black" stroke-width="0.67"/><path d="M6 6H14V14H6Z"/>',
    ),
  );
  assert(at(result, 10, 6, "centerline-crossing").length);
  assert(at(result, 6, 10, "centerline-crossing").length);
  assert(
    result.candidates.every(
      (candidate) => candidate.classification === "unreviewed",
    ),
  );
  assert(
    result.scope.limitations.some((limitation) =>
      limitation.includes("which member is in front"),
    ),
  );
});

test("a tangent circular weld is not labeled an abrupt corner", async () => {
  const result = await discover(svg(line("M2 8H6A2 2 0 0 1 8 10V14")));
  assert.equal(
    result.candidates.filter((candidate) => candidate.kind === "contour-corner")
      .length,
    0,
  );
  assert.equal(
    result.candidates.filter((candidate) => candidate.kind === "tight-curve")
      .length,
    0,
  );
});

test("a short curve submerged by heavy stroke is conservatively surfaced", async () => {
  const result = await discover(svg(line("M2 8H7.6A.4 .4 0 0 1 8 8.4V14")));
  assert(
    result.candidates.some((candidate) => candidate.kind === "tight-curve"),
  );
  assert.equal(
    result.candidates.filter((candidate) => candidate.kind === "contour-corner")
      .length,
    0,
  );
});

test("contact near the heavy painted edges is surfaced without inventing a crossing", async () => {
  const result = await discover(svg(line("M2 8H14") + line("M8 9.55V14")));
  assert.equal(
    result.candidates.filter(
      (candidate) => candidate.kind === "centerline-crossing",
    ).length,
    0,
  );
  assert(
    result.candidates.some((candidate) => candidate.kind === "near-contact"),
  );
});

test("relative paths, inherited transforms, and primitive shapes use final coordinates", async () => {
  const result = await discover(
    svg(
      '<g transform="translate(2 2) scale(2)" fill="none" stroke="black" stroke-width=".335"><path d="m0 3h6"/><line x1="3" y1="0" x2="3" y2="6"/></g>',
    ),
  );
  assert.equal(at(result, 8, 8, "centerline-crossing").length, 1);
  assert.equal(at(result, 8, 8, "centerline-crossing")[0].sectors.length, 4);
});

test("smooth controls and rounded basic shapes do not invent sharp joins", async () => {
  const result = await discover(
    svg(
      '<rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="black" stroke-width=".67"/>',
    ),
  );
  assert.equal(
    result.candidates.filter((candidate) => candidate.kind === "contour-corner")
      .length,
    0,
  );
  const smooth = await discover(svg(line("M2 8Q4 4 6 8T10 8")));
  assert.equal(at(smooth, 6, 8, "contour-corner").length, 0);
});

test("exact aliases produce deterministic IDs and duplicate fill/rim contours merge", async () => {
  const artwork = svg(line("M2 8H14") + line("M8 2V14"));
  assert.deepEqual(await discover(artwork), await discover(artwork));
  const duplicate = await discover(
    svg(
      '<path d="M2 2H14V14H2Z"/><path d="M2 2H14V14H2Z" fill="none" stroke="black" stroke-width=".67"/>',
    ),
  );
  assert.equal(duplicate.scope.contourCount, 1);
  assert.equal(
    duplicate.candidates.filter(
      (candidate) => candidate.kind === "contour-corner",
    ).length,
    4,
  );
  assert(
    duplicate.candidates.every((candidate) => candidate.contours.length === 2),
  );
});

test("unsupported masking is explicitly disclosed and temporary DOM is removed", async () => {
  const result = await discover(
    svg(
      '<defs><mask id="m"><rect width="16" height="16" fill="white"/></mask></defs><path mask="url(#m)" d="M2 8H14" fill="none" stroke="black"/>',
    ),
  );
  assert(result.warnings.some((warning) => warning.includes("mask")));
  assert.equal(await page.locator("svg").count(), 0);
});

test("nearby distinct crossings keep separate four-sector inventories", async () => {
  const result = await discover(
    svg(line("M2 8H14") + line("M8 2V14") + line("M8.08 2V14")),
  );
  const crossings = result.candidates.filter(
    (candidate) => candidate.kind === "centerline-crossing",
  );
  assert.equal(crossings.length, 2);
  assert.deepEqual(
    crossings.map((candidate) => candidate.x),
    [8, 8.08],
  );
  assert(crossings.every((candidate) => candidate.sectors.length === 4));
});

test("a continuous sampled near-contact produces regions rather than one decision per sample", async () => {
  const result = await discover(
    svg(
      line("M2 8H14") +
        '<path d="M2 9.55Q8 9.7 14 9.55" fill="none" stroke="black" stroke-width=".67"/>',
    ),
  );
  assert(result.scope.rawContactBins > 20);
  assert(result.candidates.length < 6);
  assert(
    result.candidates.some(
      (candidate) => candidate.details.connectedContactBins > 10,
    ),
  );
  assert(
    result.candidates.every(
      (candidate) => candidate.classification === "unreviewed",
    ),
  );
});

test("line elements do not acquire an implicit filled return segment", async () => {
  const result = await discover(
    svg(
      '<line x1="2" y1="8" x2="14" y2="8" stroke="black" stroke-width=".67"/><line x1="8" y1="8" x2="8" y2="14" stroke="black" stroke-width=".67"/>',
    ),
  );
  assert.equal(at(result, 8, 8, "centerline-crossing").length, 1);
  assert.equal(at(result, 8, 8, "centerline-crossing")[0].sectors.length, 3);
});

test("filled contours returning to their start without Z keep the starting corner", async () => {
  const result = await discover(svg('<path d="M2 2H14V14H2V2"/>'));
  assert.equal(
    result.candidates.filter((candidate) => candidate.kind === "contour-corner")
      .length,
    4,
  );
  assert.equal(at(result, 2, 2, "contour-corner").length, 1);
});

test("equivalent fill/rim transforms retain the correct local fill coordinate system", async () => {
  const result = await discover(
    svg(
      '<path transform="scale(2)" d="M1 1H7V7H1Z" fill="none" stroke="black" stroke-width=".335"/><path d="M2 2H14V14H2Z"/>',
    ),
  );
  assert.equal(result.scope.contourCount, 1);
  const corners = result.candidates.filter(
    (candidate) => candidate.kind === "contour-corner",
  );
  assert.equal(corners.length, 4);
  assert(
    corners.every(
      (candidate) => candidate.details.boundary === "filled-convexity",
    ),
  );
});
