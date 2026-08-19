import { createHash } from "node:crypto";
import type { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import {
  jsonUtf8Bytes,
  MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
} from "../publicResultBudget.js";
import type { ReviewCatalog } from "./reviewCatalogAdapter.js";
import {
  evaluateReviewRules,
  MAX_REVIEW_RULE_COMPARISONS,
  type NonFindingVersionDecision,
  REVIEW_RULE_IDS,
  type ReviewProjectPolicyContext,
  ReviewRuleBudgetError,
  type ReviewRuleEvaluation,
} from "./reviewRuleRegistry.js";
import {
  MAX_SUBMITTED_AGGREGATE_AST_NODES,
  MAX_SUBMITTED_AGGREGATE_FACTS,
  MAX_SUBMITTED_AST_NODES,
  MAX_SUBMITTED_FACTS,
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
export const MAX_REVIEW_NONFINDING_VERSION_DECISIONS = 50;

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

export function reviewSaltCode(
  context: {
    reviewCatalog: ReviewCatalog;
    store: CatalogStoreV2;
    packageVersionEvidence?: Readonly<Record<string, string | null>>;
  },
  input: ReviewSaltCodeInput,
  policy: ReviewProjectPolicyContext | null = null,
  projectContextDigest: string | null = null,
  contextSource: ReviewContextSource = "none",
  measureFinalResultUtf8Bytes: (payload: unknown) => number = jsonUtf8Bytes,
) {
  const { reviewCatalog: registry, store } = context;
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
    if (
      Buffer.byteLength(artifact.text, "utf8") > MAX_REVIEW_ARTIFACT_UTF8_BYTES
    ) {
      throw new Error(
        `review_salt_code accepts at most ${MAX_REVIEW_ARTIFACT_UTF8_BYTES} UTF-8 bytes per artifact.`,
      );
    }
  }
  const submittedBytes = input.artifacts.reduce(
    (total, artifact) => total + Buffer.byteLength(artifact.text, "utf8"),
    0,
  );
  if (submittedBytes > MAX_REVIEW_SUBMITTED_UTF8_BYTES) {
    throw new Error(
      `review_salt_code accepts at most ${MAX_REVIEW_SUBMITTED_UTF8_BYTES} aggregate submitted UTF-8 bytes.`,
    );
  }

  const maxFindings = Math.min(50, Math.max(1, input.max_findings ?? 20));
  const unresolvedRequiredLayerCount =
    policy?.ir.layers.filter(
      (layer) => !layer.optional && layer.resolution_status !== "resolved",
    ).length ?? 0;
  const policyCoverageStatus = !policy
    ? ("not_supplied" as const)
    : unresolvedRequiredLayerCount > 0
      ? ("limited" as const)
      : ("evaluated" as const);
  const knownTokenNames = new Set(
    registry.tokens.map((token) => token.name.toLowerCase()),
  );
  const evaluatedArtifactCount = Math.max(
    1,
    input.artifacts.filter((artifact) => /\S/u.test(artifact.text)).length,
  );
  const nodeShare = Math.min(
    MAX_SUBMITTED_AST_NODES,
    Math.floor(MAX_SUBMITTED_AGGREGATE_AST_NODES / evaluatedArtifactCount),
  );
  const factShare = Math.min(
    MAX_SUBMITTED_FACTS,
    Math.floor(MAX_SUBMITTED_AGGREGATE_FACTS / evaluatedArtifactCount),
  );
  const comparisonShare = Math.floor(
    MAX_REVIEW_RULE_COMPARISONS / evaluatedArtifactCount,
  );
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
          policy: {
            status: policyCoverageStatus,
            digest: policy?.digest ?? null,
            unresolved_required_layers: unresolvedRequiredLayerCount,
            evaluated_occurrences: 0,
            applicable_occurrences: 0,
            contradicted_occurrences: 0,
            unknown_occurrences: 0,
          },
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
      policy: {
        status: policyCoverageStatus,
        digest: policy?.digest ?? null,
        unresolved_required_layers: unresolvedRequiredLayerCount,
        evaluated_occurrences: 0,
        applicable_occurrences: 0,
        contradicted_occurrences: 0,
        unknown_occurrences: 0,
      },
    });
    let ruleEvaluation: ReviewRuleEvaluation = emptyRuleEvaluation();
    if (parserEvaluated) {
      try {
        ruleEvaluation = evaluateReviewRules({
          registry,
          store,
          facts: effectiveFacts,
          packageVersions,
          policy,
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
        policy: ruleEvaluation.policy,
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
  const policyCoverage = analyzedResults.reduce(
    (summary, result) => {
      const policyResult = result.coverage.policy;
      summary.evaluated_occurrence_artifact_pairs +=
        policyResult.evaluated_occurrences;
      summary.applicable_occurrence_artifact_pairs +=
        policyResult.applicable_occurrences;
      summary.contradicted_occurrence_artifact_pairs +=
        policyResult.contradicted_occurrences;
      summary.unknown_occurrence_artifact_pairs +=
        policyResult.unknown_occurrences;
      return summary;
    },
    {
      status: policyCoverageStatus,
      digest: policy?.digest ?? null,
      unresolved_required_layers: unresolvedRequiredLayerCount,
      evaluated_occurrence_artifact_pairs: 0,
      applicable_occurrence_artifact_pairs: 0,
      contradicted_occurrence_artifact_pairs: 0,
      unknown_occurrence_artifact_pairs: 0,
    },
  );
  type PublicReviewFinding =
    (typeof analyzedResults)[number]["findings"][number];
  type PublicVersionDecision =
    (typeof analyzedResults)[number]["version_decisions"][number];
  const results = analyzedResults.map((result) => ({
    ...result,
    findings: [] as PublicReviewFinding[],
    version_decisions: [] as PublicVersionDecision[],
    coverage: {
      ...result.coverage,
      returned_findings: 0,
      returned_nonfinding_version_decisions: 0,
      nonfinding_version_decisions_truncated:
        result.version_decisions.length > 0,
      truncated:
        result.findings.length > 0 || result.version_decisions.length > 0,
    },
  }));
  const response = {
    data: { results },
    scope: {
      kind: "submitted_text_only" as const,
      context_source: contextSource,
      artifact_count: results.length,
      submitted_utf8_bytes: submittedBytes,
    },
    coverage: {
      submitted_artifacts: results.length,
      evaluated_artifacts: results.filter(
        (result) => result.outcome !== "not_evaluated",
      ).length,
      analyzer: "salt_submitted_fact_rules_v1" as const,
      semantic_validation: "source_bound_allowlist" as const,
      location_encoding: "utf8_bytes_end_exclusive" as const,
      project_policy: policyCoverage,
      detected_findings: detectedFindings,
      returned_findings: 0,
      detected_nonfinding_version_decisions: detectedNonFindingVersionDecisions,
      returned_nonfinding_version_decisions: 0,
      nonfinding_version_decisions_truncated:
        detectedNonFindingVersionDecisions > 0,
      truncated: detectedFindings > 0 || detectedNonFindingVersionDecisions > 0,
      result_budget: {
        max_utf8_bytes: MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
        truncated:
          detectedFindings > 0 || detectedNonFindingVersionDecisions > 0,
        omissions: [
          {
            section: "findings",
            available: detectedFindings,
            returned: 0,
          },
          {
            section: "version_decisions",
            available: detectedNonFindingVersionDecisions,
            returned: 0,
          },
        ],
      },
    },
    limitations: [
      contextSource === "none"
        ? "Only submitted artifact text was analyzed; no project context was supplied, and files that were not submitted, compilation, runtime behavior, and user acceptance were not analyzed."
        : contextSource === "caller_package_versions"
          ? "Only submitted artifact text was analyzed; caller-supplied package versions informed version-specific rules, but files that were not submitted, repository state, compilation, runtime behavior, and user acceptance were not analyzed."
          : contextSource === "retained_project_snapshot"
            ? "Only submitted artifact text was analyzed; a retained authorized project snapshot supplied policy and installed-version facts, but project source that was not submitted, compilation, runtime behavior, and user acceptance were not analyzed."
            : "Only submitted artifact text was analyzed; a fresh authorized project inspection supplied policy and installed-version facts, but project source that was not submitted, compilation, runtime behavior, and user acceptance were not analyzed.",
      "Dynamic expressions, spread props, indirect exports, method calls, runtime values, and rules outside the listed allowlist do not ground findings.",
    ],
    provenance: {
      catalog_version: registry.version,
      semantic_digest: registry.semanticDigest,
      project_context_digest: projectContextDigest,
      project_policy_digest: policy?.digest ?? null,
    },
  };
  const severityRank = { error: 0, warning: 1, info: 2 } as const;
  const prioritizedFindings = analyzedResults
    .flatMap((result, resultIndex) =>
      result.findings.map((finding, findingIndex) => ({
        finding,
        findingIndex,
        resultIndex,
      })),
    )
    .sort(
      (left, right) =>
        severityRank[left.finding.severity] -
          severityRank[right.finding.severity] ||
        left.resultIndex - right.resultIndex ||
        left.findingIndex - right.findingIndex,
    );
  const acceptedEntries: Array<{
    section: "findings" | "version_decisions";
    resultIndex: number;
  }> = [];
  for (const { finding, resultIndex } of prioritizedFindings.slice(
    0,
    maxFindings,
  )) {
    const target = response.data.results[resultIndex];
    if (!target) continue;
    target.findings.push(finding);
    acceptedEntries.push({ section: "findings", resultIndex });
  }

  const prioritizedVersionDecisions = analyzedResults.flatMap(
    (result, resultIndex) =>
      result.version_decisions.map((decision) => ({
        decision,
        resultIndex,
      })),
  );
  for (const { decision, resultIndex } of prioritizedVersionDecisions.slice(
    0,
    MAX_REVIEW_NONFINDING_VERSION_DECISIONS,
  )) {
    const target = response.data.results[resultIndex];
    if (!target) continue;
    target.version_decisions.push(decision);
    acceptedEntries.push({ section: "version_decisions", resultIndex });
  }

  const baseLimitations = [...response.limitations];
  const baseResultLimitations = response.data.results.map((result) => [
    ...result.limitations,
  ]);
  const finalizeSelection = (): void => {
    const returnedFindings = response.data.results.reduce(
      (total, result) => total + result.findings.length,
      0,
    );
    const returnedVersionDecisions = response.data.results.reduce(
      (total, result) => total + result.version_decisions.length,
      0,
    );
    const findingsTruncated = returnedFindings < detectedFindings;
    const versionDecisionsTruncated =
      returnedVersionDecisions < detectedNonFindingVersionDecisions;
    const truncated = findingsTruncated || versionDecisionsTruncated;

    response.coverage.returned_findings = returnedFindings;
    response.coverage.returned_nonfinding_version_decisions =
      returnedVersionDecisions;
    response.coverage.nonfinding_version_decisions_truncated =
      versionDecisionsTruncated;
    response.coverage.truncated = truncated;
    response.coverage.result_budget.truncated = truncated;
    response.coverage.result_budget.omissions = [
      ...(findingsTruncated
        ? [
            {
              section: "findings",
              available: detectedFindings,
              returned: returnedFindings,
            },
          ]
        : []),
      ...(versionDecisionsTruncated
        ? [
            {
              section: "version_decisions",
              available: detectedNonFindingVersionDecisions,
              returned: returnedVersionDecisions,
            },
          ]
        : []),
    ];
    response.limitations = [
      ...baseLimitations,
      ...(findingsTruncated
        ? [
            `The public result returned ${returnedFindings} of ${detectedFindings} findings because of the aggregate finding or response budget.`,
          ]
        : []),
      ...(versionDecisionsTruncated
        ? [
            `The public result returned ${returnedVersionDecisions} of ${detectedNonFindingVersionDecisions} non-finding version decisions because of the 50-decision or response budget.`,
          ]
        : []),
    ];

    for (const [resultIndex, result] of response.data.results.entries()) {
      result.coverage.returned_findings = result.findings.length;
      result.coverage.returned_nonfinding_version_decisions =
        result.version_decisions.length;
      result.coverage.nonfinding_version_decisions_truncated =
        result.version_decisions.length <
        result.coverage.detected_nonfinding_version_decisions;
      result.coverage.truncated =
        result.findings.length < result.coverage.detected_findings ||
        result.coverage.nonfinding_version_decisions_truncated;
      result.limitations = [
        ...(baseResultLimitations[resultIndex] ?? []),
        ...(result.findings.length < result.coverage.detected_findings
          ? [
              `Returned ${result.findings.length} of ${result.coverage.detected_findings} findings for this artifact.`,
            ]
          : []),
        ...(result.coverage.nonfinding_version_decisions_truncated
          ? [
              `Returned ${result.version_decisions.length} of ${result.coverage.detected_nonfinding_version_decisions} non-finding version decisions for this artifact.`,
            ]
          : []),
      ];
    }
  };

  finalizeSelection();
  while (
    jsonUtf8Bytes(response) > MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES ||
    measureFinalResultUtf8Bytes(response) > MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
  ) {
    const removedEntry = acceptedEntries.pop();
    if (!removedEntry) {
      if (
        jsonUtf8Bytes(response) > MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
      ) {
        throw new Error(
          "review_salt_code could not fit its mandatory result skeleton within the structured-content budget.",
        );
      }
      throw new Error(
        "review_salt_code could not fit its mandatory result skeleton within the public wire budget.",
      );
    }
    const target = response.data.results[removedEntry.resultIndex];
    if (!target) {
      throw new Error("Review result selection lost its target artifact.");
    }
    if (removedEntry.section === "findings") target.findings.pop();
    else target.version_decisions.pop();
    finalizeSelection();
  }
  return response;
}
