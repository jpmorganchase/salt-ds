import { createHash } from "node:crypto";

export const reviewVersion = 1;
export const reviewWeights = [0.67, 1, 4 / 3, 1.5];
export const treatments = new Set([
  "weld",
  "sharp",
  "separate",
  "hidden",
  "compact",
]);

export function reviewFeatures(record) {
  return [
    ...record.joins,
    ...record.candidates.flatMap((candidate) =>
      candidate.sectors?.length
        ? candidate.sectors.map((sector, index) => ({
            ...candidate,
            id: `${candidate.id}.${index + 1}`,
            parentId: candidate.id,
            candidateSector: sector,
          }))
        : [candidate],
    ),
  ];
}

function hasCompleteVisibleEvidence(feature) {
  const observations = feature.observations;
  return (
    Array.isArray(observations) &&
    observations.length === reviewWeights.length &&
    observations.every(
      (o) => Number.isFinite(o.weight) && o.status === "visible",
    ) &&
    reviewWeights.every(
      (weight) =>
        observations.filter((o) => Math.abs(o.weight - weight) < 0.00001)
          .length === 1,
    )
  );
}

export function reviewFingerprint(record) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: reviewVersion,
        svg: record.svg.replace(/\r\n?/g, "\n"),
        recipeHash: record.recipeHash,
        joins: record.joins,
        discovery: record.discovery,
        candidates: record.candidates,
      }),
    )
    .digest("hex");
}

// Decisions reference generated feature IDs, never a second set of coordinates.
// A changed drawing, construction trace, discovery result or review algorithm
// invalidates approval. Merely rerunning generation cannot approve anything.
export function evaluateReview(record, decision) {
  if (!decision) return { status: "pending", reason: "Not yet reviewed." };
  if (typeof decision !== "object" || Array.isArray(decision))
    return { status: "pending", reason: "Review must be an object." };
  if (decision.fingerprint !== record.fingerprint)
    return {
      status: "stale",
      reason: "Artwork or generated evidence changed. Review again.",
    };
  const problems = [];
  for (const field of ["reviewedBy", "rationale"])
    if (typeof decision[field] !== "string" || !decision[field].trim())
      problems.push(`Missing ${field}.`);
  const checks = decision.checks ?? {};
  if (
    !Array.isArray(checks.sizes) ||
    ![12, 16].every((n) => checks.sizes.includes(n))
  )
    problems.push("Review both 12px and 16px.");
  if (
    !Array.isArray(checks.weights) ||
    !reviewWeights.every((n) =>
      checks.weights.some(
        (v) => Number.isFinite(v) && Math.abs(v - n) < 0.00001,
      ),
    )
  )
    problems.push("Review reference, both default and heavy widths.");
  if (
    !Array.isArray(checks.backgrounds) ||
    !["light", "dark"].every((n) => checks.backgrounds.includes(n))
  )
    problems.push("Review both backgrounds.");
  if (checks.completeDrawing !== true)
    problems.push(
      "Inspect the whole drawing for contacts outside the generated map.",
    );
  if (record.discovery.warnings?.length)
    problems.push("Resolve discovery warnings before approval.");
  const features = new Map(
    reviewFeatures(record).map((feature) => [feature.id, feature]),
  );
  const classified = new Set();
  if (!Array.isArray(decision.decisions))
    problems.push("Decisions must be an array.");
  for (const item of Array.isArray(decision.decisions)
    ? decision.decisions
    : []) {
    if (
      !item ||
      !treatments.has(item.treatment) ||
      typeof item.reason !== "string" ||
      !item.reason.trim() ||
      !Array.isArray(item.ids) ||
      !item.ids.length
    ) {
      problems.push(
        "Each classification needs feature IDs, a treatment and a specific reason.",
      );
      continue;
    }
    for (const id of item.ids) {
      if (!features.has(id)) {
        problems.push(`Unknown feature ${id}.`);
        continue;
      }
      if (classified.has(id)) problems.push(`Repeated decision for ${id}.`);
      classified.add(id);
      const feature = features.get(id);
      if (item.treatment === "weld") {
        // A detected contact has no known curve to measure. Review cannot
        // turn it green by selecting 'weld': identify it in its construction.
        if (!hasCompleteVisibleEvidence(feature))
          problems.push(
            `${id}: required weld is not measured as visible at every width.`,
          );
      }
    }
  }
  for (const [id, feature] of features) {
    // Shared construction supplies its intended treatment and final-paint
    // evidence. A separate decision is needed only for an exception or an
    // independently discovered contact. Visual approval still covers it.
    const visibleSharedJoin = hasCompleteVisibleEvidence(feature);
    if (!classified.has(id) && !visibleSharedJoin)
      problems.push(`Unclassified feature ${id}.`);
  }
  return problems.length
    ? { status: "pending", reason: problems.join(" "), problems }
    : {
        status: "current",
        reason: decision.rationale,
        reviewedBy: decision.reviewedBy,
      };
}

export function summarizeReviews(records) {
  return {
    exports: records.length,
    tracedTreatments: records.reduce((n, r) => n + r.joins.length, 0),
    structuralWelds: records.reduce(
      (n, r) =>
        n +
        r.joins.filter((join) => join.expected !== "softened-opening").length,
      0,
    ),
    visibleSoftenedOpenings: records.reduce(
      (n, r) =>
        n +
        r.joins.filter(
          (join) =>
            join.expected === "softened-opening" &&
            join.observations.some(
              (observation) => observation.status === "visible",
            ),
        ).length,
      0,
    ),
    unexposedOpeningTraces: records.reduce(
      (n, r) =>
        n +
        r.joins.filter(
          (join) =>
            join.expected === "softened-opening" &&
            !join.observations.some(
              (observation) => observation.status === "visible",
            ),
        ).length,
      0,
    ),
    candidates: records.reduce((n, r) => n + r.candidates.length, 0),
    reviewed: records.filter((r) => r.review.status === "current").length,
    pending: records.filter((r) => r.review.status === "pending").length,
    stale: records.filter((r) => r.review.status === "stale").length,
    discoveryWarnings: records.reduce(
      (n, r) => n + r.discovery.warnings.length,
      0,
    ),
  };
}
