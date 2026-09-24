import assert from "node:assert/strict";
import test from "node:test";
import { compareComponentContours } from "./pair-contours.mjs";
import { classifyPair } from "./pair-contracts.mjs";
const side = 64;
const mask = (paint) =>
  Uint8Array.from({ length: side * side }, (_, p) =>
    paint(p % side, Math.floor(p / side)) ? 1 : 0,
  );
const square = (x, y) => x >= 8 && x <= 55 && y >= 8 && y <= 55;
const ring = (x, y) => square(x, y) && (x < 12 || x > 51 || y < 12 || y > 51);
const compare = (a, b) => compareComponentContours(a, b, side, 4);
test("filled interior preserves the full exterior", () => {
  assert.equal(compare(mask(ring), mask(square)).matches, true);
});
test("equal bounds do not conceal a different silhouette", () => {
  const diamond = (x, y) => Math.abs(x - 31.5) + Math.abs(y - 31.5) <= 24;
  assert.equal(compare(mask(square), mask(diamond)).matches, false);
});
test("a frame does not conceal a moved internal component", () => {
  const a = mask(
    (x, y) => ring(x, y) || (x >= 24 && x < 32 && y >= 24 && y < 32),
  );
  const b = mask(
    (x, y) => ring(x, y) || (x >= 28 && x < 36 && y >= 24 && y < 32),
  );
  const result = compare(a, b);
  assert.equal(result.outlineComponents, 2);
  assert.equal(result.matches, false);
});
test("retains separate components when an internal outline fills", () => {
  const a = mask(
    (x, y) =>
      ring(x, y) ||
      (x >= 24 &&
        x <= 39 &&
        y >= 24 &&
        y <= 39 &&
        (x < 27 || x > 36 || y < 27 || y > 36)),
  );
  const b = mask(
    (x, y) => ring(x, y) || (x >= 24 && x <= 39 && y >= 24 && y <= 39),
  );
  assert.equal(compare(a, b).matches, true);
});
test("missing and empty components fail", () => {
  assert.equal(
    compare(
      mask(ring),
      mask(() => false),
    ).matches,
    false,
  );
  assert.equal(
    compare(
      mask(() => false),
      mask(() => false),
    ).matches,
    false,
  );
});
test("an unclassified pair never receives approval from a match", () => {
  const samples = Array(4).fill({ matches: true, identicalPaint: true });
  assert.equal(classifyPair("unknown", samples), "needs-review");
  assert.equal(classifyPair("sparkle", samples), "pass");
  assert.equal(classifyPair("sparkle", samples.slice(1)), "fail");
  assert.equal(
    classifyPair("sparkle", [...samples.slice(1), { matches: false }]),
    "fail",
  );
  assert.equal(
    classifyPair(
      "import",
      Array(4).fill({ matches: true, identicalPaint: false }),
    ),
    "fail",
  );
});
