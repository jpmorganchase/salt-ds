import assert from "node:assert/strict";
import test from "node:test";
import {
  contourTurns,
  innerContour,
  softenedFrame,
  softenedFill,
  softenedRect,
} from "./contour-profiles.mjs";
import { stripJunctionTraces } from "./junction-trace.mjs";

test("closed frame finds four inside turns, independent of path direction", () => {
  assert.equal(contourTurns("M0 0h12v10H0Z").length, 4);
  assert.equal(contourTurns("M0 0v10h12V0Z").length, 4);
});
test("curves, separate strokes, free terminals and tiny details stay intact", () => {
  assert.equal(contourTurns("M0 0H10M10 0V10").length, 0);
  assert.equal(contourTurns("M0 0H10Q12 0 12 2V10").length, 0);
  assert.equal(innerContour("M0 0h2v2H0Z"), "");
  assert.equal(innerContour("M0 0h12"), "");
});
test("frame profile preserves its original outline and records contour treatment", () => {
  const d = "M0 0h12v10H0Z";
  const result = softenedFrame(d);
  assert.ok(result.includes(`d="${d}"`));
  assert.match(result, /softened-opening/);
  assert.equal(
    (stripJunctionTraces(result).match(/stroke="none"/g) ?? []).length,
    4,
  );
});
test("family can select angled turns without adding joins across moveto gaps", () => {
  const d = "M0 0H12L16 8H22";
  assert.ok(innerContour(d).includes("softened-opening"));
  assert.equal(
    (
      innerContour(d, { turns: "all", at: [[12, 0]] }).match(
        /stroke="none"/g,
      ) ?? []
    ).length,
    1,
  );
});
test("closed concave notch exposes inner sectors as well as frame corners", () => {
  const turns = contourTurns("M0 0H12V12H8V6H4V12H0Z");
  assert.equal(turns.filter((t) => t.p[1] === 6).length, 2);
});

test("B rectangle keeps the original sharp outside contour", () => {
  const result = softenedRect(2, 3, 12, 10);
  assert.ok(result.includes('d="M2 3h12v10h-12Z"'));
  assert.equal(
    (stripJunctionTraces(result).match(/stroke="none"/g) ?? []).length,
    4,
  );
});

test("filled rings soften their negative opening without rounding the outside", () => {
  const d = "M0 0H12V12H0ZM3 3H9V9H3Z";
  const svg = softenedFill(d);
  assert.ok(svg.includes(d));
  assert.equal(
    (stripJunctionTraces(svg).match(/stroke="none"/g) ?? []).length,
    4,
  );
});
test("filled silhouette notches receive relief but exterior vertices do not", () => {
  const svg = softenedFill("M0 0H12V12H8V6H4V12H0Z");
  assert.equal(
    (stripJunctionTraces(svg).match(/stroke="none"/g) ?? []).length,
    2,
  );
  assert.equal(
    softenedFill("M0 0H12V12H0Z").includes("softened-opening"),
    false,
  );
});
test("filled curved exterior preserves its outward corners", () => {
  assert.equal(
    softenedFill("M0 0H12V12Q6 8 0 12Z").includes("softened-opening"),
    false,
  );
});

test("T and X roots are inherited across actual subpath contacts", () => {
  const t = softenedFrame("M0 0H16M8 0V10");
  assert.equal((t.match(/joinedLineContours/g) ?? []).length, 2);
  const x = softenedFrame("M0 8H16M8 0V16");
  assert.equal((x.match(/joinedLineContours/g) ?? []).length, 4);
  assert.equal(
    softenedFrame("M0 0H6M8 0V10").includes("joinedLineContours"),
    false,
  );
});
