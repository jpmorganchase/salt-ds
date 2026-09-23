import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateReview,
  reviewFingerprint,
  reviewWeights,
} from "./junction-review-state.mjs";

const record = () => {
  const r = {
    svg: "<svg/>",
    recipeHash: "source-a",
    joins: [
      {
        id: "j001",
        observations: reviewWeights.map((weight) => ({
          weight,
          status: "visible",
        })),
      },
    ],
    candidates: [{ id: "d001", kind: "corner" }],
    discovery: { warnings: [], version: 1 },
  };
  return { ...r, fingerprint: reviewFingerprint(r) };
};
const decision = (r) => ({
  fingerprint: r.fingerprint,
  reviewedBy: "Test reviewer",
  rationale: "Inspected whole drawing and annotated evidence.",
  checks: {
    sizes: [12, 16],
    weights: reviewWeights,
    backgrounds: ["light", "dark"],
    completeDrawing: true,
  },
  decisions: [
    {
      ids: ["d001"],
      treatment: "sharp",
      reason: "Outer tip defines the direction.",
    },
  ],
});

test("generation alone never approves an icon", () => {
  assert.equal(evaluateReview(record()).status, "pending");
});
test("review may inherit a measured shared join but must classify discoveries", () => {
  const r = record(),
    d = decision(r);
  assert.equal(evaluateReview(r, d).status, "current");
  d.decisions = [];
  assert.match(evaluateReview(r, d).reason, /Unclassified feature d001/);
});
test("artwork, construction and discovery changes independently invalidate review", () => {
  const r = record(),
    d = decision(r);
  for (const mutate of [
    (x) => (x.svg += " "),
    (x) => (x.recipeHash = "changed"),
    (x) => (x.joins[0].observations[0].status = "submerged"),
    (x) => x.candidates.push({ id: "d002" }),
  ]) {
    const changed = structuredClone(r);
    mutate(changed);
    changed.fingerprint = reviewFingerprint(changed);
    assert.equal(evaluateReview(changed, d).status, "stale");
  }
});
test("unexposed joins need specific decisions and cannot be waved through as welded", () => {
  const r = record();
  r.joins[0].observations[3].status = "submerged";
  r.fingerprint = reviewFingerprint(r);
  const d = decision(r);
  assert.match(evaluateReview(r, d).reason, /Unclassified feature j001/);
  d.decisions.push({
    ids: ["j001"],
    treatment: "weld",
    reason: "It has a curve command.",
  });
  assert.match(evaluateReview(r, d).reason, /not measured as visible/);
});
test("partial or duplicated weight measurements cannot approve a weld", () => {
  for (const observations of [
    [{ weight: 1.5, status: "visible" }],
    Array(4).fill({ weight: 1.5, status: "visible" }),
  ]) {
    const r = record();
    r.joins[0].observations = observations;
    r.fingerprint = reviewFingerprint(r);
    const d = decision(r);
    assert.equal(evaluateReview(r, d).status, "pending");
    d.decisions.push({
      ids: ["j001"],
      treatment: "weld",
      reason: "Measured a curve.",
    });
    assert.match(evaluateReview(r, d).reason, /not measured as visible/);
  }
});
test("unknown IDs, repeated decisions, missing evidence and scan warnings block approval", () => {
  for (const mutate of [
    (r, d) => d.decisions[0].ids.push("bogus"),
    (r, d) => d.decisions.push(d.decisions[0]),
    (r, d) => (d.checks.completeDrawing = false),
    (r, d) => (d.checks.sizes = [16]),
    (r, d) => r.discovery.warnings.push("Unsupported drawing"),
    (r, d) => (d.decisions[0].reason = ""),
  ]) {
    const r = record(),
      d = decision(r);
    mutate(r, d);
    assert.equal(evaluateReview(r, d).status, "pending");
  }
});
test("malformed review fields give pending feedback instead of crashing", () => {
  for (const mutate of [
    (d) => (d.decisions = {}),
    (d) => (d.decisions = [null]),
    (d) => (d.decisions[0].reason = 3),
    (d) => (d.checks.sizes = 12),
    (d) => (d.checks.weights = "all"),
    (d) => (d.checks.backgrounds = false),
  ]) {
    const r = record(),
      d = decision(r);
    mutate(d);
    assert.equal(evaluateReview(r, d).status, "pending");
  }
});
test("a contact with four sectors cannot pass after classifying only one", () => {
  const r = record();
  r.candidates[0].sectors = Array.from({ length: 4 }, (_, i) => ({
    id: `sector-${i + 1}`,
  }));
  r.fingerprint = reviewFingerprint(r);
  const d = decision(r);
  d.decisions[0].ids = ["d001.1"];
  assert.match(evaluateReview(r, d).reason, /Unclassified feature d001.2/);
  d.decisions[0].ids = ["d001.1", "d001.2", "d001.3", "d001.4"];
  assert.equal(evaluateReview(r, d).status, "current");
});

test("checkout line endings preserve a recorded decision", () => {
  const original = record();
  original.svg = "<svg>\n<path d='M0 0h1'/>\n</svg>\n";
  original.fingerprint = reviewFingerprint(original);
  const windows = { ...original, svg: original.svg.replaceAll("\n", "\r\n") };
  windows.fingerprint = reviewFingerprint(windows);
  assert.equal(windows.fingerprint, original.fingerprint);
  assert.equal(evaluateReview(windows, decision(original)).status, "current");
});
