import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { optimize } from "svgo";
import { parseContours } from "./artwork/path-segments.mjs";
import { optimizeIconSvg } from "./optimizeIconSvg.mjs";

const readIcon = (name) =>
  fs.readFile(new URL(`../src/SVG/${name}.svg`, import.meta.url), "utf8");
const contours = (svg) =>
  [...svg.matchAll(/\bd="([^"]+)"/g)].flatMap(([, d]) => parseContours(d));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function assertPreservedCurveClosure(master, generated) {
  const originalCurves = contours(master).filter(
    ({ closed, segments }) =>
      closed &&
      segments.length > 0 &&
      segments.every(({ kind }) => kind === "C"),
  );
  assert.ok(
    originalCurves.length > 0,
    "Fixture must contain a closed cubic curve",
  );
  const converted = contours(generated);
  for (const original of originalCurves) {
    const start = original.segments[0].start;
    const candidate = converted.find(
      ({ closed, segments }) =>
        closed && distance(segments[0].start, start) < 0.002,
    );
    assert.ok(candidate, "Conversion must retain the closed curve");
    assert.deepEqual(
      candidate.segments.map(({ kind }) => kind),
      original.segments.map(({ kind }) => kind),
      "Conversion must not add a closing line to a curve that already meets its start",
    );
    assert.ok(
      distance(candidate.segments.at(-1).end, candidate.segments[0].start) <
        1e-8,
      "The final curve endpoint must coincide with the initial point",
    );
  }
}

for (const name of [
  "sparkle",
  "sparkle_solid",
  "sparkle-refresh",
  "sparkle-refresh_solid",
]) {
  test(`${name}: component optimization retains exact curved closure`, async () => {
    const master = await readIcon(name);
    assertPreservedCurveClosure(master, optimizeIconSvg(master));
  });
}

test("sensitive join preservation follows miter limits inherited from groups or the SVG root", async () => {
  const sparkle = await readIcon("sparkle");
  const d = sparkle.match(/\bd="([^"]+)"/)[1];
  for (const container of [
    `<svg xmlns="http://www.w3.org/2000/svg" stroke-miterlimit = '5'>CONTENT</svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg"><g stroke-miterlimit="5">CONTENT</g></svg>`,
  ]) {
    const master = container.replace(
      "CONTENT",
      `<path fill="none" stroke="currentColor" d="${d}"/>`,
    );
    assertPreservedCurveClosure(master, optimizeIconSvg(master));
  }
});

test("ordinary icons retain the existing optimized output", async () => {
  for (const name of ["add", "close", "arrow-right", "document", "bank"]) {
    const master = await readIcon(name);
    const previous = optimize(master, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              cleanupNumericValues: { floatPrecision: 8 },
            },
          },
        },
        { name: "removeAttrs", params: { attrs: "(width|height)" } },
      ],
    }).data;
    assert.equal(optimizeIconSvg(master), previous, name);
  }
});

test("official brand contours keep their existing path-preservation policy", () => {
  const d =
    "M1.123456789 2.123456789L9.234567891 2.123456789L9.234567891 12.234567891Z";
  const master = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
  assert.ok(
    optimizeIconSvg(master, { preserveBrandContours: true }).includes(
      `d="${d}"`,
    ),
  );
});

test("disjoint sensitive curves retain exact closure when path merging would round them", () => {
  const curve =
    "c1 0 2 1 3.3334 3.3334c0 1-1 2-1.6667 3.3334c-1-2-2-4-1.6667-6.6668Z";
  const master = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16"><g stroke="currentColor" stroke-miterlimit="5" fill="none"><path d="M2 2${curve}"/><path d="M22 2${curve}"/></g></svg>`;
  // Rounding each relative endpoint to three decimals introduces a closing
  // diagonal in both curves, even with convertPathData disabled.
  assertPreservedCurveClosure(master, optimizeIconSvg(master));
});
