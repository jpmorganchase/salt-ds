import test from "node:test";
import assert from "node:assert/strict";
import { alignedCurvedArrow } from "./curved-arrow.mjs";
import { inspectCurvedArrowAlignment } from "./arrow-alignment.mjs";
import { parseContours } from "./path-segments.mjs";
import { stripJunctionTraces } from "./junction-trace.mjs";
const x = 12 + Math.sqrt(81 - 5.25 ** 2);
const shaft = "M" + x + " 7.5A9 9 0 1 0 21 12.75";
const arms = [
  [0, -3.75],
  [-3.75, 0],
];
const svg = (body) => "<svg>" + stripJunctionTraces(body) + "</svg>";

test("the independent check detects the previous circular approach mismatch", () => {
  const old = svg(
    '<path fill="none" stroke="currentColor" d="' +
      shaft +
      "M" +
      x +
      " 3.75V7.5H" +
      (x - 3.75) +
      '"/>',
  );
  const result = inspectCurvedArrowAlignment(old);
  assert.equal(result.length, 1);
  assert.ok(Math.abs(result[0].angleDegrees - 9.314665) < 0.001);
});
test("the local curve meets the head axis and preserves its arms and far tangent", () => {
  const body = svg(alignedCurvedArrow(shaft, arms));
  const result = inspectCurvedArrowAlignment(body);
  assert.equal(result.length, 1);
  assert.ok(result[0].angleDegrees < 0.0001);
  const d = body.match(/\bd="([^"]+)"/)[1];
  const [line, head] = parseContours(d);
  assert.deepEqual(line.segments.at(-1).end, [21, 12.75]);
  assert.ok(
    Math.hypot(
      head.segments[0].start[0] - x,
      head.segments[0].start[1] - 3.75,
    ) < 0.00001,
  );
  const a = line.segments[0].derivative(1),
    b = line.segments[1].derivative(0);
  const dot =
    (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b));
  assert.ok(dot > 0.999999);
});
test("a cubic shaft is aligned without moving its far endpoint", () => {
  const body = svg(
    alignedCurvedArrow(
      "M20.5 8C19 4.6 16 2.5 12 2.5A9.5 9.5 0 1 0 21.15 14.5",
      [
        [-6, 0],
        [0, -5.5],
      ],
    ),
  );
  const result = inspectCurvedArrowAlignment(body);
  assert.equal(result.length, 1);
  assert.ok(result[0].angleDegrees < 0.0001);
  const path = parseContours(body.match(/\bd="([^"]+)"/)[1])[0];
  assert.deepEqual(path.segments.at(-1).end, [21.15, 14.5]);
});
test("mirrored heads are measured in their own direction", () => {
  const tx = 24 - x;
  const body = svg(
    alignedCurvedArrow("M" + tx + " 7.5A9 9 0 1 1 3 12.75", [
      [0, -3.75],
      [3.75, 0],
    ]),
  );
  const result = inspectCurvedArrowAlignment(body);
  assert.equal(result.length, 1);
  assert.ok(result[0].angleDegrees < 0.0001);
  assert.ok(result[0].axis[0] < 0 && result[0].axis[1] > 0);
});
test("ordinary strokes are not mistaken for a complete curved arrow", () => {
  assert.deepEqual(
    inspectCurvedArrowAlignment(
      svg('<path fill="none" stroke="currentColor" d="M2 2L8 8L2 14"/>'),
    ),
    [],
  );
  assert.throws(() => alignedCurvedArrow("M1 1L5 5", arms), /curved approach/);
  assert.throws(
    () => alignedCurvedArrow("M1 1C2 1 2 2 3 3", arms),
    /too short/,
  );
});

// Mutation tests exercise the exported relationship rather than replaying
// the constructor's own arithmetic. The old artwork remains a failing fixture.
const { readFile } = await import("node:fs/promises");
const { optimize } = await import("svgo");
const { curvedArrowExports, checkCircularArrowProportions } = await import(
  "./arrow-alignment.mjs"
);
const familyRecords = await Promise.all(
  curvedArrowExports.map(async (name) => ({
    name,
    svg: await readFile(
      new URL("../../src/SVG/" + name, import.meta.url),
      "utf8",
    ),
  })),
);
const altered = (name, edit) =>
  familyRecords.map((row) =>
    row.name === name ? { ...row, svg: edit(row.svg) } : row,
  );
const transform = (svg, value) =>
  optimize(
    svg
      .replace(/(<svg[^>]*>)/, '$1<g transform="' + value + '">')
      .replace("</svg>", "</g></svg>"),
    { multipass: true },
  ).data;

test("all exported circular actions share the reviewed proportions and openings", () => {
  assert.deepEqual(checkCircularArrowProportions(familyRecords).failures, []);
});
test("enlarging a head still aligns its tangent but fails the family check", () => {
  const changed = altered("history.svg", (svg) =>
    svg.replace(/d="([^"]+)"/, (_, d) => {
      const [shaft, head] = parseContours(d);
      const tip = head.segments[0].end;
      const ends = [head.segments[0].start, head.segments[1].end].map((p) =>
        p.map((n, i) => tip[i] + (n - tip[i]) * 1.4),
      );
      return (
        'd="M' +
        shaft.segments[0].start.join(" ") +
        shaft.segments.map((s) => s.portion(0, 1)).join("") +
        "M" +
        ends[0].join(" ") +
        "L" +
        tip.join(" ") +
        "L" +
        ends[1].join(" ") +
        '"'
      );
    }),
  );
  assert.ok(
    inspectCurvedArrowAlignment(
      changed.find((r) => r.name === "history.svg").svg,
    ).every((h) => h.angleDegrees < 0.1),
  );
  assert.ok(
    checkCircularArrowProportions(changed).failures.some(
      (r) =>
        r.name === "history.svg" &&
        r.reasons.includes("shared arrowhead arm length"),
    ),
  );
});
test("a shifted or independently scaled return arrow fails its shared frame", () => {
  for (const change of [
    "translate(.25 0)",
    "translate(8 8) scale(.9) translate(-8 -8)",
  ]) {
    const result = checkCircularArrowProportions(
      altered("undo.svg", (svg) => transform(svg, change)),
    );
    assert.ok(
      result.failures.some(
        (r) =>
          r.name === "undo.svg" &&
          r.reasons.includes("shared circle and centre"),
      ),
    );
  }
});
test("reversing an action or substituting a return arc is detected", () => {
  const redo = familyRecords.find((r) => r.name === "redo.svg").svg;
  assert.ok(
    checkCircularArrowProportions(
      altered("undo.svg", () => redo),
    ).failures.some((r) => r.reasons.includes("action direction")),
  );
  const undo = familyRecords.find((r) => r.name === "undo.svg").svg;
  assert.ok(
    checkCircularArrowProportions(
      altered("history.svg", () => undo),
    ).failures.some((r) => r.reasons.includes("documented arc opening")),
  );
});
test("the preceding artwork demonstrates the original family inconsistency", async () => {
  const before = JSON.parse(
    await readFile(
      new URL(
        "./reviews/circular-arrow-family-2026-09-24/before.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const result = checkCircularArrowProportions(
    Object.entries(before).map(([name, svg]) => ({ name: name + ".svg", svg })),
  );
  for (const name of ["history.svg", "refresh.svg", "undo.svg", "redo.svg"])
    assert.ok(result.failures.some((r) => r.name === name));
});
