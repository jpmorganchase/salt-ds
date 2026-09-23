import { createHash } from "node:crypto";

// Final-paint review is independent of construction traces. A clean scan is
// evidence for review, never an automatic approval of the drawing.
export const cornerTreatments = new Set([
  "softened",
  "already-smooth",
  "outward",
  "hidden",
  "retained-sharp",
  "unresolved",
]);
export const cornerChecks = [
  "native12",
  "native16",
  "light",
  "dark",
  "referenceWeight",
  "lightWeight",
  "standardWeight",
  "heavyWeight",
  "completeDrawing",
  "components",
  "masks",
];
export function cornerLocations(record) {
  return record.observations.flatMap((observation, wi) =>
    observation.corners.map((corner, ci) => ({
      ...corner,
      id: `w${wi + 1}-${ci + 1}`,
      weight: observation.weight,
    })),
  );
}
export function assessCornerReview(record, review) {
  const locations = cornerLocations(record);
  const required = locations.filter((c) => c.kind !== "outer");
  const problems = [];
  if (!review)
    return {
      status: "pending",
      required: required.length,
      problems: ["No visual decision recorded."],
    };
  if (review.fingerprint !== record.fingerprint)
    return {
      status: "stale",
      required: required.length,
      problems: ["Artwork or detector changed after review."],
    };
  if (!review.reviewer?.trim()) problems.push("Name the reviewer.");
  for (const check of cornerChecks)
    if (review.checks?.[check] !== true)
      problems.push(`Missing ${check} check.`);
  if (!review.evidence?.length)
    problems.push("Link the complete-drawing review evidence.");
  if (!review.rationale?.trim())
    problems.push("Record the complete-drawing conclusion.");
  const byId = new Map(locations.map((c) => [c.id, c]));
  for (const [id, decision] of Object.entries(review.decisions ?? {})) {
    if (!byId.has(id)) problems.push(`Unknown location ${id}.`);
    if (!cornerTreatments.has(decision.treatment))
      problems.push(`Invalid treatment at ${id}.`);
    if (!decision.reason?.trim()) problems.push(`Missing reason at ${id}.`);
    if (
      decision.treatment === "retained-sharp" &&
      (!decision.comparison?.before12 ||
        !decision.comparison?.after12 ||
        !decision.comparison?.before16 ||
        !decision.comparison?.after16)
    )
      problems.push(
        `Sharp interior ${id} needs both-size before/after evidence.`,
      );
    if (
      ["hidden", "outward", "already-smooth"].includes(decision.treatment) &&
      !decision.evidence
    )
      problems.push(
        `Explain the detector disagreement with evidence at ${id}.`,
      );
  }
  for (const corner of required) {
    const decision = review.decisions?.[corner.id];
    if (!decision || decision.treatment === "unresolved")
      problems.push(`Unresolved ${corner.id}.`);
  }
  if (record.observations.some((o) => o.warnings.length))
    problems.push("Resolve rendering warnings.");
  return {
    status: problems.length ? "needs-review" : "approved",
    required: required.length,
    problems,
  };
}
export function cornerReviewTemplate(record) {
  return {
    fingerprint: record.fingerprint,
    reviewer: "",
    rationale: "",
    evidence: [],
    checks: Object.fromEntries(cornerChecks.map((c) => [c, false])),
    decisions: Object.fromEntries(
      cornerLocations(record)
        .filter((c) => c.kind !== "outer")
        .map((c) => [
          c.id,
          {
            treatment: "unresolved",
            reason: "",
            point: [c.x, c.y],
            weight: c.weight,
          },
        ]),
    ),
  };
}

// Checkout line endings do not change paint; renderer changes must refresh
// computed evidence without invalidating approval when that evidence is identical.
const canonicalText = (text) => text.replace(/\r\n?/g, "\n");
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function cornerAnalysisKey(svg, detectorSource, renderer) {
  return hash({
    svg: canonicalText(svg),
    detectorSource: canonicalText(detectorSource),
    renderer,
  });
}
export function cornerReviewFingerprint({
  svg,
  version,
  pixelsPerUnit,
  observations,
}) {
  return hash({
    svg: canonicalText(svg),
    version,
    pixelsPerUnit,
    observations,
  });
}
