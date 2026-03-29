import { deriveReviewRuleId } from "../../../semantic-core/src/tools/workflowRuleIds.js";
import type { LintCommandResult } from "../types.js";

export interface ReviewFixCandidate {
  candidateType: "migration" | "guided_fix";
  safety: "deterministic" | "manual_review";
  kind: string | null;
  title: string;
  recommendation: string | null;
  from: string | null;
  to: string | null;
  reason: string | null;
  category: string | null;
  rule: string | null;
  ruleId: string | null;
  sourceUrls: string[];
}

export interface ReviewFixCandidateFileResult {
  path: string;
  relativePath: string;
  candidates: ReviewFixCandidate[];
}

export interface ReviewFixCandidatesResult {
  totalCount: number;
  deterministicCount: number;
  manualReviewCount: number;
  files: ReviewFixCandidateFileResult[];
  notes: string[];
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

function buildMigrationCandidate(
  record: Record<string, unknown>,
): ReviewFixCandidate | null {
  const kind = readString(record, "kind");
  const from = readString(record, "from");
  const to = readString(record, "to");
  const reason = readString(record, "reason");
  if (!kind && !from && !to && !reason) {
    return null;
  }

  const deterministic = kind === "prop" && Boolean(from) && Boolean(to);
  return {
    candidateType: "migration",
    safety: deterministic ? "deterministic" : "manual_review",
    kind,
    title:
      reason ??
      (from && to
        ? `Replace ${from} with ${to}.`
        : "Review the suggested Salt migration."),
    recommendation:
      from && to
        ? `Replace ${from} with ${to}.`
        : (reason ?? "Review and apply the migration manually."),
    from,
    to,
    reason,
    category: "deprecated",
    rule: null,
    ruleId: "review-migration-upgrade-risk",
    sourceUrls: readStringArray(record, "source_urls"),
  };
}

function buildGuidedFixCandidate(
  record: Record<string, unknown>,
): ReviewFixCandidate | null {
  const problem = readString(record, "problem");
  const recommendedFix = readString(record, "recommended_fix");
  const category = readString(record, "category");
  const rule = readString(record, "rule");
  if (!problem && !recommendedFix) {
    return null;
  }

  const sourceUrls = [
    ...readStringArray(record, "docs"),
    ...readStringArray(record, "related_guides"),
  ];

  return {
    candidateType: "guided_fix",
    safety: "manual_review",
    kind: null,
    title:
      problem ?? recommendedFix ?? "Review the suggested Salt remediation.",
    recommendation: recommendedFix,
    from: null,
    to: null,
    reason: problem,
    category,
    rule,
    ruleId: deriveReviewRuleId({ category, rule }),
    sourceUrls: [...new Set(sourceUrls)],
  };
}

export function buildReviewFixCandidates(
  sourceValidation: LintCommandResult,
): ReviewFixCandidatesResult {
  const files: ReviewFixCandidateFileResult[] = [];
  let totalCount = 0;
  let deterministicCount = 0;
  let manualReviewCount = 0;

  for (const file of sourceValidation.files) {
    const candidates: ReviewFixCandidate[] = [];

    for (const migration of file.migrations ?? []) {
      if (!migration || typeof migration !== "object") {
        continue;
      }

      const candidate = buildMigrationCandidate(
        migration as Record<string, unknown>,
      );
      if (!candidate) {
        continue;
      }

      candidates.push(candidate);
      totalCount += 1;
      if (candidate.safety === "deterministic") {
        deterministicCount += 1;
      } else {
        manualReviewCount += 1;
      }
    }

    for (const fix of file.fixes ?? []) {
      if (!fix || typeof fix !== "object") {
        continue;
      }

      const candidate = buildGuidedFixCandidate(fix as Record<string, unknown>);
      if (!candidate) {
        continue;
      }

      candidates.push(candidate);
      totalCount += 1;
      manualReviewCount += 1;
    }

    if (candidates.length > 0) {
      files.push({
        path: file.path,
        relativePath: file.relativePath,
        candidates,
      });
    }
  }

  const notes =
    totalCount > 0
      ? [
          "Use review fix candidates as agent-applied remediation guidance. The CLI does not mutate files directly.",
        ]
      : [];

  return {
    totalCount,
    deterministicCount,
    manualReviewCount,
    files,
    notes,
  };
}
