import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { inspectPaintedCorners } from "./painted-corners.mjs";
let browser, page;
before(async () => {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  page = await browser.newPage();
});
after(async () => {
  await browser?.close();
});
const scan = async (body) =>
  (
    await page.evaluate(inspectPaintedCorners, {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`,
      weights: [0.67],
    })
  ).observations[0];
const inner = (o) => o.corners.filter((c) => c.kind === "inner");
test("a square ring distinguishes four inner from four outer corners", async () => {
  const o = await scan(
    '<path d="M2 2H14V14H2ZM4 4V12H12V4Z" fill-rule="evenodd"/>',
  );
  assert.equal(inner(o).length, 4);
  assert.equal(o.corners.filter((c) => c.kind === "outer").length, 4);
  assert.equal(o.warnings.length, 0);
});
test("triangular apertures receive the same inner-corner assessment", async () => {
  const o = await scan(
    '<path d="M1 15L8 1L15 15ZM4 13H12L8 5Z" fill-rule="evenodd"/>',
  );
  assert.equal(inner(o).length, 3);
});
test("separate source shapes and hidden source joins are judged by their composed paint", async () => {
  const o = await scan('<path d="M3 3H9V9H3Z"/><path d="M7 3H13V9H7Z"/>');
  assert.equal(inner(o).length, 0);
  assert.equal(o.corners.length, 4);
});
test("smooth circular holes and rounded openings are not abrupt corners", async () => {
  const o = await scan(
    '<path d="M1 1H15V15H1ZM4 3H12Q13 3 13 4V12Q13 13 12 13H4Q3 13 3 12V4Q3 3 4 3Z" fill-rule="evenodd"/>',
  );
  assert.equal(inner(o).length, 0);
  const c = await scan(
    '<path d="M1 1H15V15H1ZM5 8a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z" fill-rule="evenodd"/>',
  );
  assert.equal(inner(c).length, 0);
});
test("visible notch and crossing sectors survive union and source-path changes", async () => {
  const o = await scan('<path d="M2 7H14V9H2Z"/><path d="M7 2H9V14H7Z"/>');
  assert.equal(inner(o).length, 4);
  const n = await scan('<path d="M2 2H14V14H10V8H6V14H2Z"/>');
  assert.equal(inner(n).length, 2);
});
test("curve-to-line corners remain discoverable", async () => {
  const o = await scan(
    '<path d="M2 2H14V14H2ZM4 4H10Q12 8 10 12H4Z" fill-rule="evenodd"/>',
  );
  assert.ok(inner(o).length >= 4);
});
test("every requested weight is analyzed and the result is deterministic", async () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 3H13V13H3Z" fill="none" stroke="black" stroke-width=".67"/></svg>';
  const a = await page.evaluate(inspectPaintedCorners, { svg });
  const b = await page.evaluate(inspectPaintedCorners, { svg });
  assert.deepEqual(a, b);
  assert.deepEqual(
    a.observations.map((o) => o.weight),
    [0.67, 1, 4 / 3, 1.5],
  );
  assert.ok(a.observations.every((o) => inner(o).length === 4));
});
