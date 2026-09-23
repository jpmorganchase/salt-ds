import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assessCornerReview,
  cornerAnalysisKey,
  cornerReviewFingerprint,
  cornerReviewTemplate,
  cornerChecks,
} from "./corner-review-state.mjs";
const record = {
  fingerprint: "current",
  observations: [
    {
      weight: 1,
      warnings: [],
      corners: [
        { kind: "inner", x: 4, y: 4 },
        { kind: "outer", x: 2, y: 2 },
        { kind: "uncertain", x: 7, y: 7 },
      ],
    },
  ],
};
const approval = () => ({
  ...cornerReviewTemplate(record),
  reviewer: "Reviewer",
  rationale: "Inspected full paint and native sizes.",
  evidence: ["sheet.png"],
  checks: Object.fromEntries(cornerChecks.map((c) => [c, true])),
  decisions: {
    "w1-1": { treatment: "softened", reason: "Exposed inner arc confirmed." },
    "w1-3": {
      treatment: "already-smooth",
      reason: "Raster spike on continuous circle.",
      evidence: "detail.png",
    },
  },
});
test("a clean scan and a populated template cannot approve themselves", () => {
  assert.equal(
    assessCornerReview(
      { ...record, observations: [{ weight: 1, warnings: [], corners: [] }] },
      null,
    ).status,
    "pending",
  );
  assert.equal(
    assessCornerReview(record, cornerReviewTemplate(record)).status,
    "needs-review",
  );
});
test("both candidate accounting and complete drawing checks are required", () => {
  const a = approval();
  assert.equal(assessCornerReview(record, a).status, "approved");
  delete a.decisions["w1-3"];
  assert.equal(assessCornerReview(record, a).status, "needs-review");
  const b = approval();
  b.checks.native12 = false;
  assert.equal(assessCornerReview(record, b).status, "needs-review");
});
test("an artwork or analyzer change invalidates approval", () => {
  assert.equal(
    assessCornerReview({ ...record, fingerprint: "changed" }, approval())
      .status,
    "stale",
  );
});
test("sharp retention needs an actual comparison at both sizes", () => {
  const a = approval();
  a.decisions["w1-1"] = {
    treatment: "retained-sharp",
    reason: "Preserve a required opening.",
  };
  assert.equal(assessCornerReview(record, a).status, "needs-review");
  a.decisions["w1-1"].comparison = {
    before12: "a.png",
    after12: "b.png",
    before16: "c.png",
    after16: "d.png",
  };
  assert.equal(assessCornerReview(record, a).status, "approved");
});
test("unknown locations, missing reasons and renderer warnings fail closed", () => {
  const a = approval();
  a.decisions["invented"] = { treatment: "softened", reason: "" };
  assert.equal(assessCornerReview(record, a).status, "needs-review");
  assert.equal(
    assessCornerReview(
      {
        ...record,
        observations: [{ ...record.observations[0], warnings: ["truncated"] }],
      },
      approval(),
    ).status,
    "needs-review",
  );
});

test("checkout line endings preserve review identity while real artwork changes invalidate it", () => {
  const record = {
    svg: "<svg>\n<path d='M0 0h1'/>\n</svg>\n",
    version: "painted-corners/1",
    pixelsPerUnit: 96,
    observations: [],
  };
  const fingerprint = cornerReviewFingerprint(record);
  assert.equal(
    cornerReviewFingerprint({
      ...record,
      svg: record.svg.replaceAll("\n", "\r\n"),
    }),
    fingerprint,
  );
  assert.notEqual(
    cornerReviewFingerprint({ ...record, svg: record.svg.replace("h1", "h2") }),
    fingerprint,
  );
});
test("renderer changes refresh evidence and only changed analysis invalidates approval", () => {
  const svg = "<svg/>\n",
    detector = "const version = 1;\n";
  const key = cornerAnalysisKey(svg, detector, "Chrome 1/windows");
  assert.equal(
    cornerAnalysisKey(
      svg.replaceAll("\n", "\r\n"),
      detector.replaceAll("\n", "\r\n"),
      "Chrome 1/windows",
    ),
    key,
  );
  assert.notEqual(cornerAnalysisKey(svg, detector, "Chrome 2/windows"), key);
  assert.notEqual(
    cornerAnalysisKey(svg, detector + "// comment", "Chrome 1/windows"),
    key,
  );
  const record = {
    svg,
    version: "painted-corners/1",
    pixelsPerUnit: 96,
    observations: [{ weight: 1, corners: [{ x: 4, y: 4 }], warnings: [] }],
  };
  const fingerprint = cornerReviewFingerprint(record);
  assert.equal(
    cornerReviewFingerprint({ ...record, analysisKey: "new renderer" }),
    fingerprint,
  );
  assert.notEqual(
    cornerReviewFingerprint({ ...record, version: "painted-corners/2" }),
    fingerprint,
  );
  assert.notEqual(
    cornerReviewFingerprint({ ...record, pixelsPerUnit: 192 }),
    fingerprint,
  );
  assert.notEqual(
    cornerReviewFingerprint({ ...record, observations: [] }),
    fingerprint,
  );
});
