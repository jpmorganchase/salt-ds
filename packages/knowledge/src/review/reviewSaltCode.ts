import { createHash } from "node:crypto";
import type { KnowledgeRecordStore } from "../manifest/knowledgeStore.js";
import type { ReviewCatalog } from "./reviewCatalogAdapter.js";
import {
  type EvaluatedReviewFinding,
  evaluateReviewRules,
  MAX_REVIEW_RULE_COMPARISONS,
  type NonFindingVersionDecision,
  REVIEW_RULE_IDS,
  ReviewRuleBudgetError,
  type ReviewRuleEvaluation,
} from "./reviewRuleRegistry.js";
import {
  MAX_SUBMITTED_AGGREGATE_AST_NODES,
  MAX_SUBMITTED_AGGREGATE_FACTS,
  MAX_SUBMITTED_AST_NODES,
  MAX_SUBMITTED_AST_NODES_ABSOLUTE,
  MAX_SUBMITTED_FACTS,
  MAX_SUBMITTED_FACTS_ABSOLUTE,
  type ParsedFactKind,
  parseSubmittedArtifact,
  type SubmittedAnalysisBudget,
  type SubmittedArtifactLanguage,
} from "./submittedArtifactFacts.js";

export interface ReviewSaltCodeArtifactInput {
  id: string;
  language: SubmittedArtifactLanguage;
  text: string;
}

export interface ReviewSaltCodeInput {
  artifacts: ReviewSaltCodeArtifactInput[];
  package_versions?: Record<string, string>;
  max_findings?: number;
}

export const MAX_REVIEW_SUBMITTED_UTF8_BYTES = 512 * 1024;
export const MAX_REVIEW_ARTIFACT_UTF8_BYTES = 256 * 1024;
export const MAX_REVIEW_ARTIFACTS = 8;
export const MAX_REVIEW_ARTIFACT_ID_CHARS = 512;
export const MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES = 512;
export const MAX_REVIEW_PACKAGE_VERSIONS = 32;
export const MAX_REVIEW_SCAN_ARTIFACT_UTF8_BYTES = 5 * 1024 * 1024;

export interface AnalyzeSaltCodeExecutionLimits {
  max_artifact_utf8_bytes?: number;
  max_ast_nodes_per_artifact?: number;
  max_facts_per_artifact?: number;
  max_rule_comparisons_per_artifact?: number;
}

function boundedExecutionLimit(
  value: number | undefined,
  fallback: number,
  ceiling: number,
  label: string,
): number {
  const selected = value ?? fallback;
  if (!Number.isSafeInteger(selected) || selected < 1 || selected > ceiling) {
    throw new RangeError(`${label} must be an integer from 1 to ${ceiling}.`);
  }
  return selected;
}

function jsonUtf8Bytes(payload: unknown): number {
  return Buffer.byteLength(JSON.stringify(payload), "utf8");
}

export function detectedValidationFindingCount(summary: {
  errors: number;
  warnings: number;
  infos: number;
}): number {
  return summary.errors + summary.warnings + summary.infos;
}

function contentDigest(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function artifactFindingId(findingId: string, artifactId: string): string {
  const artifactIdentity = createHash("sha256")
    .update(artifactId, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `${findingId}.artifact.${artifactIdentity}`;
}

function emptyFactCounts(): Record<ParsedFactKind, number> {
  return {
    import: 0,
    jsx_element: 0,
    jsx_prop: 0,
    style_declaration: 0,
    token_use: 0,
  };
}

function publicFactCounts(counts: Record<ParsedFactKind, number>) {
  return (Object.entries(counts) as Array<[ParsedFactKind, number]>)
    .filter(([, count]) => count > 0)
    .map(([kind, count]) => ({ kind, count }));
}

function canonicalSaltPackageName(moduleSpecifier: string): string | null {
  return (
    /^(@salt-ds\/[a-z0-9][a-z0-9._-]{0,204})(?:\/.*)?$/u.exec(
      moduleSpecifier,
    )?.[1] ?? null
  );
}

const MAX_MISSING_VERSION_PACKAGE_NAMES = 8;

export type ReviewContextSource =
  | "none"
  | "caller_package_versions"
  | "retained_project_snapshot"
  | "fresh_project_inspection";

export interface ReviewSaltCodeContext {
  reviewCatalog: ReviewCatalog;
  store: KnowledgeRecordStore;
  packageVersionEvidence?: Readonly<Record<string, string | null>>;
}

export type CompleteReviewFinding = Omit<EvaluatedReviewFinding, "evidence"> & {
  evidence: EvaluatedReviewFinding["evidence"] & {
    submitted_artifact_id: string;
  };
};

export interface CompleteReviewArtifactAnalysis {
  artifact: {
    id: string;
    language: SubmittedArtifactLanguage;
    utf8_bytes: number;
    content_digest: string;
  };
  outcome: "not_evaluated" | "findings" | "no_findings_in_evaluated_scope";
  summary: { errors: number; warnings: number; infos: number };
  findings: CompleteReviewFinding[];
  version_decisions: NonFindingVersionDecision[];
  coverage: {
    parser: "limited" | "babel" | "postcss" | "failed" | "not_run";
    fact_counts: Array<{ kind: ParsedFactKind; count: number }>;
    unknown_fact_count: number;
    evaluated_rule_ids: string[];
    skipped_rule_matches: number;
    detected_findings: number;
    returned_findings: number;
    detected_nonfinding_version_decisions: number;
    returned_nonfinding_version_decisions: number;
    nonfinding_version_decisions_truncated: boolean;
    truncated: boolean;
  };
  limitations: string[];
}

export interface CompleteReviewSaltCodeAnalysis {
  results: CompleteReviewArtifactAnalysis[];
  scope: {
    kind: "submitted_text_only";
    context_source: ReviewContextSource;
    artifact_count: number;
    submitted_utf8_bytes: number;
  };
  coverage: {
    submitted_artifacts: number;
    evaluated_artifacts: number;
    analyzer: "salt_submitted_fact_rules_v1";
    semantic_validation: "source_bound_allowlist";
    location_encoding: "utf8_bytes_end_exclusive";
    detected_findings: number;
    detected_nonfinding_version_decisions: number;
  };
  limitations: string[];
  provenance: {
    knowledge_version: string;
    semantic_digest: string | null;
    project_context_digest: string | null;
  };
}

function summarizeFindings(
  findings: Array<{ severity: "info" | "warning" | "error" }>,
) {
  return findings.reduce(
    (summary, finding) => {
      if (finding.severity === "error") summary.errors += 1;
      else if (finding.severity === "warning") summary.warnings += 1;
      else summary.infos += 1;
      return summary;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function firstEvidenceReference(decision: NonFindingVersionDecision) {
  const reference = decision.evidence.references[0];
  if (!reference) {
    throw new Error(
      "A non-finding version decision requires source-bound evidence.",
    );
  }
  return reference;
}

/**
 * Returns every detected finding and version decision before any transport
 * selection, truncation, response envelope, or wire-size measurement.
 */
export function analyzeSaltCode(
  context: ReviewSaltCodeContext,
  input: ReviewSaltCodeInput,
  projectContextDigest: string | null = null,
  contextSource: ReviewContextSource = "none",
  executionLimits: AnalyzeSaltCodeExecutionLimits = {},
): CompleteReviewSaltCodeAnalysis {
  const { reviewCatalog: registry, store } = context;
  const maxArtifactBytes = boundedExecutionLimit(
    executionLimits.max_artifact_utf8_bytes,
    MAX_REVIEW_ARTIFACT_UTF8_BYTES,
    MAX_REVIEW_SCAN_ARTIFACT_UTF8_BYTES,
    "max_artifact_utf8_bytes",
  );
  const maxAstNodes = boundedExecutionLimit(
    executionLimits.max_ast_nodes_per_artifact,
    MAX_SUBMITTED_AST_NODES,
    MAX_SUBMITTED_AST_NODES_ABSOLUTE,
    "max_ast_nodes_per_artifact",
  );
  const maxFacts = boundedExecutionLimit(
    executionLimits.max_facts_per_artifact,
    MAX_SUBMITTED_FACTS,
    MAX_SUBMITTED_FACTS_ABSOLUTE,
    "max_facts_per_artifact",
  );
  const maxRuleComparisons = boundedExecutionLimit(
    executionLimits.max_rule_comparisons_per_artifact,
    MAX_REVIEW_RULE_COMPARISONS,
    MAX_REVIEW_RULE_COMPARISONS,
    "max_rule_comparisons_per_artifact",
  );
  if (
    input.artifacts.length < 1 ||
    input.artifacts.length > MAX_REVIEW_ARTIFACTS
  ) {
    throw new Error(
      `review_salt_code requires between 1 and ${MAX_REVIEW_ARTIFACTS} artifacts.`,
    );
  }
  const packageVersions = new Map<string, string | null>();
  const callerPackageVersionEntries = Object.entries(
    input.package_versions ?? {},
  );
  if (callerPackageVersionEntries.length > MAX_REVIEW_PACKAGE_VERSIONS) {
    throw new Error(
      `review_salt_code accepts at most ${MAX_REVIEW_PACKAGE_VERSIONS} package_versions entries.`,
    );
  }
  const packageVersionEntries = Object.entries(
    context.packageVersionEvidence ?? input.package_versions ?? {},
  );
  for (const [packageName, version] of packageVersionEntries) {
    packageVersions.set(packageName, version);
  }
  if (context.packageVersionEvidence !== undefined) {
    for (const catalogPackage of store.getFamily("package")) {
      if (!packageVersions.has(catalogPackage.name)) {
        packageVersions.set(catalogPackage.name, null);
      }
    }
  }
  const artifactIds = new Set<string>();
  for (const artifact of input.artifacts) {
    if (
      artifact.id.length < 1 ||
      artifact.id.length > MAX_REVIEW_ARTIFACT_ID_CHARS ||
      !/\S/u.test(artifact.id) ||
      jsonUtf8Bytes(artifact.id) > MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES
    ) {
      throw new Error(
        `review_salt_code artifact ids must contain non-whitespace text and cannot exceed ${MAX_REVIEW_ARTIFACT_ID_CHARS} characters or ${MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES} JSON-encoded UTF-8 bytes.`,
      );
    }
    if (artifactIds.has(artifact.id)) {
      throw new Error("review_salt_code requires unique artifact ids.");
    }
    artifactIds.add(artifact.id);
    if (Buffer.byteLength(artifact.text, "utf8") > maxArtifactBytes) {
      throw new Error(
        `review_salt_code accepts at most ${maxArtifactBytes} UTF-8 bytes per artifact.`,
      );
    }
  }
  const submittedBytes = input.artifacts.reduce(
    (total, artifact) => total + Buffer.byteLength(artifact.text, "utf8"),
    0,
  );
  const maxSubmittedBytes = Math.max(
    MAX_REVIEW_SUBMITTED_UTF8_BYTES,
    maxArtifactBytes,
  );
  if (submittedBytes > maxSubmittedBytes) {
    throw new Error(
      `review_salt_code accepts at most ${maxSubmittedBytes} aggregate submitted UTF-8 bytes.`,
    );
  }

  const knownTokenNames = new Set(
    registry.tokens.map((token) => token.name.toLowerCase()),
  );
  const evaluatedArtifactCount = Math.max(
    1,
    input.artifacts.filter((artifact) => /\S/u.test(artifact.text)).length,
  );
  const nodeShare = Math.min(
    maxAstNodes,
    executionLimits.max_ast_nodes_per_artifact === undefined
      ? Math.floor(MAX_SUBMITTED_AGGREGATE_AST_NODES / evaluatedArtifactCount)
      : maxAstNodes,
  );
  const factShare = Math.min(
    maxFacts,
    executionLimits.max_facts_per_artifact === undefined
      ? Math.floor(MAX_SUBMITTED_AGGREGATE_FACTS / evaluatedArtifactCount)
      : maxFacts,
  );
  const comparisonShare =
    executionLimits.max_rule_comparisons_per_artifact === undefined
      ? Math.floor(MAX_REVIEW_RULE_COMPARISONS / evaluatedArtifactCount)
      : maxRuleComparisons;
  const analyzedResults = input.artifacts.map((artifact) => {
    const artifactMetadata = {
      id: artifact.id,
      language: artifact.language,
      utf8_bytes: Buffer.byteLength(artifact.text, "utf8"),
      content_digest: contentDigest(artifact.text),
    };

    if (!/\S/u.test(artifact.text)) {
      return {
        artifact: artifactMetadata,
        outcome: "not_evaluated" as const,
        summary: { errors: 0, warnings: 0, infos: 0 },
        findings: [],
        version_decisions: [] as NonFindingVersionDecision[],
        coverage: {
          parser: "not_run" as const,
          fact_counts: [] as Array<{ kind: ParsedFactKind; count: number }>,
          unknown_fact_count: 0,
          evaluated_rule_ids: [] as string[],
          skipped_rule_matches: 0,
          detected_findings: 0,
          returned_findings: 0,
          detected_nonfinding_version_decisions: 0,
          returned_nonfinding_version_decisions: 0,
          nonfinding_version_decisions_truncated: false,
          truncated: false,
        },
        limitations: ["No submitted source text was available to parse."],
      };
    }

    const analysisBudget: SubmittedAnalysisBudget = {
      remaining_nodes: nodeShare,
      remaining_facts: factShare,
      node_limit: nodeShare,
      fact_limit: factShare,
    };
    const parsed = parseSubmittedArtifact(artifact, analysisBudget);
    let effectiveParser = parsed.parser;
    let effectiveFacts = parsed.facts;
    let parserEvaluated =
      effectiveParser === "babel" || effectiveParser === "postcss";
    const emptyRuleEvaluation = (): ReviewRuleEvaluation => ({
      findings: [],
      version_decisions: [],
      evaluated_rule_ids: [],
      skipped_match_count: 0,
      limitations: [] as string[],
    });
    let ruleEvaluation: ReviewRuleEvaluation = emptyRuleEvaluation();
    if (parserEvaluated) {
      try {
        ruleEvaluation = evaluateReviewRules({
          registry,
          store,
          facts: effectiveFacts,
          packageVersions,
          budget: {
            remaining: comparisonShare,
            limit: comparisonShare,
          },
        });
      } catch (error) {
        if (!(error instanceof ReviewRuleBudgetError)) throw error;
        effectiveParser = "limited";
        effectiveFacts = [];
        parserEvaluated = false;
        ruleEvaluation = emptyRuleEvaluation();
        ruleEvaluation.limitations.push(
          `${error.message} No partial findings or rule coverage were returned.`,
        );
      }
    }
    const factCounts = effectiveFacts.reduce((counts, fact) => {
      counts[fact.kind] += 1;
      return counts;
    }, emptyFactCounts());
    const findings = ruleEvaluation.findings.map((finding) => ({
      ...finding,
      id: artifactFindingId(finding.id, artifact.id),
      evidence: {
        submitted_artifact_id: artifact.id,
        ...finding.evidence,
      },
    }));
    const versionDecisions = [...ruleEvaluation.version_decisions].sort(
      (left, right) =>
        left.location.start_offset - right.location.start_offset ||
        REVIEW_RULE_IDS.indexOf(left.rule_id) -
          REVIEW_RULE_IDS.indexOf(right.rule_id) ||
        compareOrdinal(
          firstEvidenceReference(left).locator,
          firstEvidenceReference(right).locator,
        ) ||
        compareOrdinal(
          firstEvidenceReference(left).field_path,
          firstEvidenceReference(right).field_path,
        ),
    );
    const unknownTokenCount = effectiveFacts.filter(
      (fact) =>
        fact.kind === "token_use" &&
        !knownTokenNames.has(fact.subject.toLowerCase()),
    ).length;
    const observedPackages = [
      ...new Set(
        effectiveFacts.flatMap((fact) =>
          fact.package_name
            ? [canonicalSaltPackageName(fact.package_name)].filter(
                (packageName): packageName is string => packageName !== null,
              )
            : [],
        ),
      ),
    ].sort();
    const packagesWithoutVersions = observedPackages.filter(
      (packageName) => !packageVersions.has(packageName),
    );
    const visiblePackagesWithoutVersions = packagesWithoutVersions.slice(
      0,
      MAX_MISSING_VERSION_PACKAGE_NAMES,
    );
    const omittedPackageCount =
      packagesWithoutVersions.length - visiblePackagesWithoutVersions.length;
    const contextualLimitations = [
      ...parsed.limitations,
      ...ruleEvaluation.limitations,
      ...(unknownTokenCount > 0
        ? [
            `${unknownTokenCount} parsed Salt token reference${unknownTokenCount === 1 ? " was" : "s were"} absent from the loaded registry; absence alone did not ground a source-bound finding.`,
          ]
        : []),
      ...(parserEvaluated && packagesWithoutVersions.length > 0
        ? [
            `No package_versions entry was supplied for ${visiblePackagesWithoutVersions.join(", ")}${omittedPackageCount > 0 ? ` and ${omittedPackageCount} more Salt package${omittedPackageCount === 1 ? "" : "s"}` : ""}; deprecation rules considered every matching source-bound catalog deprecation relevant for those packages.`,
          ]
        : []),
    ];

    return {
      artifact: artifactMetadata,
      outcome: !parserEvaluated
        ? ("not_evaluated" as const)
        : findings.length > 0
          ? ("findings" as const)
          : ("no_findings_in_evaluated_scope" as const),
      summary: summarizeFindings(findings),
      findings,
      version_decisions: versionDecisions,
      coverage: {
        parser: effectiveParser,
        fact_counts: publicFactCounts(factCounts),
        unknown_fact_count: parsed.unknown_fact_count,
        evaluated_rule_ids: ruleEvaluation.evaluated_rule_ids,
        skipped_rule_matches: ruleEvaluation.skipped_match_count,
        detected_findings: findings.length,
        returned_findings: findings.length,
        detected_nonfinding_version_decisions: versionDecisions.length,
        returned_nonfinding_version_decisions: versionDecisions.length,
        nonfinding_version_decisions_truncated: false,
        truncated: false,
      },
      limitations: contextualLimitations,
    };
  });

  const detectedFindings = analyzedResults.reduce(
    (total, result) => total + result.coverage.detected_findings,
    0,
  );
  const detectedNonFindingVersionDecisions = analyzedResults.reduce(
    (total, result) =>
      total + result.coverage.detected_nonfinding_version_decisions,
    0,
  );
  const completeAnalysis: CompleteReviewSaltCodeAnalysis = {
    results: analyzedResults,
    scope: {
      kind: "submitted_text_only",
      context_source: contextSource,
      artifact_count: analyzedResults.length,
      submitted_utf8_bytes: submittedBytes,
    },
    coverage: {
      submitted_artifacts: analyzedResults.length,
      evaluated_artifacts: analyzedResults.filter(
        (result) => result.outcome !== "not_evaluated",
      ).length,
      analyzer: "salt_submitted_fact_rules_v1",
      semantic_validation: "source_bound_allowlist",
      location_encoding: "utf8_bytes_end_exclusive",
      detected_findings: detectedFindings,
      detected_nonfinding_version_decisions: detectedNonFindingVersionDecisions,
    },
    limitations: [
      contextSource === "none"
        ? "Only submitted artifact text was analyzed; no project context was supplied, and files that were not submitted, compilation, runtime behavior, and user acceptance were not analyzed."
        : contextSource === "caller_package_versions"
          ? "Only submitted artifact text was analyzed; caller-supplied package versions informed version-specific rules, but files that were not submitted, repository state, compilation, runtime behavior, and user acceptance were not analyzed."
          : contextSource === "retained_project_snapshot"
            ? "Only submitted artifact text was analyzed; a retained authorized project snapshot supplied installed-version facts, but project source that was not submitted, compilation, runtime behavior, and user acceptance were not analyzed."
            : "Only submitted artifact text was analyzed; a fresh authorized project inspection supplied installed-version facts, but project source that was not submitted, compilation, runtime behavior, and user acceptance were not analyzed.",
      "Dynamic expressions, spread props, indirect exports, method calls, runtime values, and rules outside the listed allowlist do not ground findings.",
    ],
    provenance: {
      knowledge_version: registry.version,
      semantic_digest: registry.semanticDigest,
      project_context_digest: projectContextDigest,
    },
  };
  return completeAnalysis;
}
