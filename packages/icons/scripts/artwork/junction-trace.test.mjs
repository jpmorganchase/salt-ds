import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { stripJunctionTraces, traceJunctions } from "./junction-trace.mjs";
import {
  circularCrossJunction,
  crossJunction,
  ellipseJunction,
  rayJunctions,
} from "./junctions.mjs";
import {
  angledJunction,
  circleOnBaseJunction,
  radialCircleJunction,
} from "./structural-junctions.mjs";

const feature = {
  construction: "example",
  sector: "left-up",
  curve: "M1 2Q3 2 3 4",
};
const decodeAttribute = (value) =>
  value.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => {
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[name];
  });
const readFeatures = (svg) =>
  [...svg.matchAll(/data-salt-junctions="([^"]*)"/g)].flatMap((match) =>
    JSON.parse(decodeAttribute(match[1])),
  );

test("metadata is escaped, defaults to a weld, and leaves supplied values untouched", () => {
  const special = {
    ...feature,
    construction: "family \"quoted\" & <tag> 'single'",
  };
  const body = '<path d="M1 2Q3 2 3 4" fill="none"/>';
  const traced = traceJunctions(body, [special]);
  assert.deepEqual(readFeatures(traced), [{ ...special, expected: "weld" }]);
  assert.ok(traced.includes("&quot;"));
  assert.ok(traced.includes("&amp;"));
  assert.ok(traced.includes("&lt;"));
  assert.ok(traced.includes("&apos;"));
  assert.equal(stripJunctionTraces(traced), body);
  assert.equal(Object.hasOwn(special, "expected"), false);
  assert.equal(traceJunctions(body, []), body);
  const opening = traceJunctions(body, [{ ...feature, expected: "softened-opening" }]);
  assert.equal(readFeatures(opening)[0].expected, "softened-opening");
});

test("stripping preserves all original bytes through nested transformed groups", () => {
  const leaf =
    '<g transform="rotate(45 12 12)">\n <path d="M1 2Q3 2 3 4"/>\n</g>';
  const inner = `<g transform='scale(.5)'>${traceJunctions(leaf, [feature])}</g>`;
  const annotated = `<g id="outside">${traceJunctions(inner, [feature])}<g/></g>`;
  const original = `<g id="outside"><g transform='scale(.5)'>${leaf}</g><g/></g>`;
  assert.equal(stripJunctionTraces(annotated), original);
  assert.equal(stripJunctionTraces(original), original);
  assert.equal(stripJunctionTraces(stripJunctionTraces(annotated)), original);
});

test("stripping skips comments, CDATA, processing instructions and quoted tag-like text", () => {
  const body =
    '<!-- <g data-salt-junctions="[]"></g> -->' +
    '<![CDATA[<g data-salt-junctions="[]"></g>]]>' +
    '<?review example="<g></g>"?>' +
    "<g data-note='example > <g data-salt-junctions=\"[]\"></g>'>" +
    '<path d="M1 2Q3 2 3 4"/></g>';
  assert.equal(stripJunctionTraces(traceJunctions(body, [feature])), body);
  const attributedGroup =
    '<g transform="scale(2)" data-salt-junctions="[]"><path/></g>';
  assert.equal(stripJunctionTraces(attributedGroup), attributedGroup);
});

test("stripping fails closed for unbalanced groups", () => {
  const traced = traceJunctions("<path/>", [feature]);
  assert.throws(() => stripJunctionTraces(traced.slice(0, -4)), /Unclosed/);
  assert.throws(() => stripJunctionTraces(`${traced}</g>`), /Unbalanced/);
  assert.throws(() => stripJunctionTraces(`${traced}<!--`), /Unclosed/);
  assert.throws(() => stripJunctionTraces(`${traced}<g x="`), /Unclosed/);
});

test("descriptors reject duplicate identities, duplicate curves and malformed data", () => {
  assert.throws(() => traceJunctions("", [feature, feature]), /Duplicate/);
  assert.throws(
    () => traceJunctions("", [feature, { ...feature, curve: "M2 2Q3 2 3 4" }]),
    /Duplicate/,
  );
  assert.throws(
    () => traceJunctions("", [feature, { ...feature, sector: "right-up" }]),
    /Duplicate/,
  );
  for (const invalid of [
    null,
    [],
    { ...feature, construction: " " },
    { ...feature, sector: 0 },
    { ...feature, expected: "optional" },
    { ...feature, extraField: true },
    { ...feature, curve: "M1 2L3 4" },
    { ...feature, curve: "M1 2Q3 2 3 4M5 6Q7 6 7 8" },
    { ...feature, curve: "M1 2Q3 NaN 3 4" },
    { ...feature, curve: "M1 2Q3 1e999 3 4" },
    { ...feature, curve: "M1 2Q3 2 3" },
    { ...feature, curve: "M1 2A0 1 0 0 1 3 4" },
    { ...feature, curve: "M1 2A1 1 0 2 1 3 4" },
  ])
    assert.throws(() => traceJunctions("", [invalid]), TypeError);
  assert.throws(() => traceJunctions(null, [feature]), TypeError);
  assert.throws(() => traceJunctions("", feature), TypeError);
  assert.throws(() => stripJunctionTraces(null), TypeError);
});

test("isolated opening traces are reviewable without asserting a structural join", () => {
  const features = readFeatures(circularCrossJunction(12, 12, 2, undefined, [[1, 1]], "softened-opening"));
  assert.equal(features.length, 1);
  assert.equal(features[0].construction, "isolatedOpening");
  assert.equal(features[0].expected, "softened-opening");
});

test("all helpers expose each generated curve sector, including selected sectors", () => {
  const examples = [
    [crossJunction(12, 12, 2), "crossJunction", 4],
    [circularCrossJunction(12, 12, 2), "circularCrossJunction", 4],
    [
      circularCrossJunction(12, 12, 2, undefined, [
        [1, -1],
        [1, 1],
      ]),
      "circularCrossJunction",
      2,
    ],
    [
      ellipseJunction({
        cx: 12,
        cy: 12,
        rx: 9,
        ry: 8,
        y: 12,
        side: -1,
        reach: 1.25,
      }),
      "ellipseJunction",
      4,
    ],
    [
      ellipseJunction({
        cx: 12,
        cy: 12,
        rx: 9,
        ry: 8,
        y: 8,
        side: 1,
        reach: 1.2,
        directions: [-1],
      }),
      "ellipseJunction",
      2,
    ],
    [
      rayJunctions(12, 12, 4.5, 1.2, [0, Math.PI / 4, Math.PI]),
      "rayJunctions",
      6,
    ],
    [radialCircleJunction(12, 12, 6.75, 1.65, 90), "radialCircleJunction", 2],
    [circleOnBaseJunction(12, 6, 3.75, 1.5), "circleOnBaseJunction", 2],
    [angledJunction(12, 12, [-1, -1], [1, -1], 1.8), "angledJunction", 1],
  ];
  for (const [svg, construction, count] of examples) {
    const features = readFeatures(svg);
    assert.equal(features.length, count, construction);
    assert.equal(new Set(features.map(({ sector }) => sector)).size, count);
    for (const descriptor of features) {
      assert.equal(descriptor.construction, construction);
      assert.equal(descriptor.expected, "weld");
      assert.ok(stripJunctionTraces(svg).includes(descriptor.curve));
      assert.equal((descriptor.curve.match(/[MQA]/g) ?? []).length, 2);
    }
  }
  assert.deepEqual(
    readFeatures(crossJunction(12, 12, 2)).map(({ sector }) => sector),
    ["left-up", "left-down", "right-up", "right-down"],
  );
  const selected = readFeatures(
    circularCrossJunction(12, 12, 2, undefined, [[1, 1]]),
  );
  assert.equal(selected[0].sector, "right-down");
  assert.throws(
    () =>
      circularCrossJunction(12, 12, 2, undefined, [
        [1, 1],
        [1, 1],
      ]),
    /Duplicate/,
  );
});

test("radial descriptors are inside the rotation and remain in its local coordinates", () => {
  const rotated = radialCircleJunction(12, 12, 6.75, 1.65, 90);
  assert.ok(
    rotated.startsWith(
      '<g transform="rotate(90 12 12)"><g data-salt-junctions=',
    ),
  );
  assert.deepEqual(
    readFeatures(rotated),
    readFeatures(radialCircleJunction(12, 12, 6.75, 1.65)),
  );
});

// Frozen outputs captured before tracing was added. These protect paint order,
// fill patches, widths, transforms and exact path bytes from metadata changes.
const paintCases = [
  [
    crossJunction,
    [12, 12, 2],
    "20fd05c6565d979932a670eae4cb516aafc444ec103cd5a487d6b3d4c13ac26a",
  ],
  [
    crossJunction,
    [-2.25, 4.625, 1.7, 1.08],
    "a9e1696d14128915b071bdfbd2d5ead2d27c8ed60083dd0b4a765d0b0e1966e6",
  ],
  [
    circularCrossJunction,
    [12, 12, 2],
    "69982fb9667757555e44b2dcc0b97bf4989106a26d80325c08ad716b7603200f",
  ],
  [
    circularCrossJunction,
    [
      3.75,
      10.5,
      1.45,
      1.08,
      [
        [1, -1],
        [1, 1],
      ],
    ],
    "f46fc2ac3cad7286da509ad292e490f04d2e6bf40cfb812d834fbea92ad1cf48",
  ],
  [
    circularCrossJunction,
    [12, 12, 2, undefined, []],
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  ],
  [
    ellipseJunction,
    [{ cx: 12, cy: 12, rx: 9, ry: 8, y: 12, side: -1, reach: 1.25 }],
    "6eb66fed8e303daa74dd0c097ae4d6bae2f1b4e8639443abb781982cfe76c94c",
  ],
  [
    ellipseJunction,
    [
      {
        cx: 12,
        cy: 12,
        rx: 9,
        ry: 8,
        y: 8,
        side: 1,
        reach: 1.2,
        directions: [-1],
        width: 1.08,
      },
    ],
    "627a6317960a0447e294f292e98e518c382a2c4d278afb1ca316046e9ca5d6c0",
  ],
  [
    rayJunctions,
    [12, 12, 4.5, 1.2, [0, Math.PI / 4, Math.PI], 1.05],
    "8450ecea5f57fa49cc3715a78418a59b7dbf4a0350f3043605d505b84341bfef",
  ],
  [
    rayJunctions,
    [12, 12, 4.5, 1.2, []],
    "b4239264a84578ee9ca5895018c89bc7eeddd185095737c9817260e8065b170c",
  ],
  [
    radialCircleJunction,
    [12, 12, 6.75, 1.65],
    "127b6c189f0746af021ab610230733a56bf068719cfeaf7db5a4c1a2791be3f1",
  ],
  [
    radialCircleJunction,
    [12, 12, 6.75, 1.65, 90, 1.08],
    "d854a82ace9c34cb931d4034e7b159e000aeabb0c0264da75fda60db89719141",
  ],
  [
    circleOnBaseJunction,
    [12, 6, 3.75, 1.5],
    "361d875f611d5c323947b1fde1e74bd9f6eb2cf005c18a8bed989e70fde2e2ed",
  ],
  [
    circleOnBaseJunction,
    [-2.25, 4.625, 2.75, 1.2, 1.05],
    "9de6c73c5e5f5623c4ecbca7add1082e3d2d5850a24e6225f1fee1a902754657",
  ],
  [
    angledJunction,
    [12, 12, [-1, -1], [1, -1], 1.8],
    "33c0bd95ee8c982853301a885df2391f1208a412c9e14975ddb1432ad66dec1a",
  ],
  [
    angledJunction,
    [5.25, 6, [1, 0], [0.75, 15.75], 1.5, 1.05],
    "18c34e9dc8029379de96b5b8b5c62b918397b8b300a4b18b5ad2268d2601648b",
  ],
];

test("trace removal returns the pre-trace helper paint byte for byte", () => {
  for (const [helper, args, expectedHash] of paintCases) {
    const actual = stripJunctionTraces(helper(...args));
    assert.equal(
      createHash("sha256").update(actual).digest("hex"),
      expectedHash,
      helper.name,
    );
  }
});
