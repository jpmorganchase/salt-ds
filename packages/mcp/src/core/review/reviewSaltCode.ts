import {
  analyzeSaltCode,
  detectedValidationFindingCount,
  MAX_REVIEW_ARTIFACT_ID_CHARS,
  MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES,
  MAX_REVIEW_ARTIFACT_UTF8_BYTES,
  MAX_REVIEW_ARTIFACTS,
  MAX_REVIEW_PACKAGE_VERSIONS,
  MAX_REVIEW_SUBMITTED_UTF8_BYTES,
  type CompleteReviewArtifactAnalysis,
  type CompleteReviewFinding,
  type CompleteReviewSaltCodeAnalysis,
  type CatalogRuntimeFamilyName,
  type ReviewContextSource,
  type ReviewProjectPolicyContext,
  type ReviewSaltCodeContext,
  type ReviewSaltCodeInput,
} from "@salt-ds/knowledge";
import { normalizeCatalogPublicCitation } from "../catalog/catalogPublicCitation.js";
import {
  jsonUtf8Bytes,
  MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
} from "../publicResultBudget.js";

export {
  analyzeSaltCode,
  detectedValidationFindingCount,
  MAX_REVIEW_ARTIFACT_ID_CHARS,
  MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES,
  MAX_REVIEW_ARTIFACT_UTF8_BYTES,
  MAX_REVIEW_ARTIFACTS,
  MAX_REVIEW_PACKAGE_VERSIONS,
  MAX_REVIEW_SUBMITTED_UTF8_BYTES,
};
export type {
  CompleteReviewArtifactAnalysis,
  CompleteReviewFinding,
  CompleteReviewSaltCodeAnalysis,
  ReviewSaltCodeContext,
  ReviewSaltCodeInput,
};

export const MAX_REVIEW_NONFINDING_VERSION_DECISIONS = 50;

function renderPublicEvidenceLocator(
  locator: string,
  context: ReviewSaltCodeContext,
  policy: ReviewProjectPolicyContext | null,
): string {
  const recordMatch = /^knowledge-record:([^:]+):(.+)$/u.exec(locator);
  if (recordMatch?.[1] && recordMatch[2]) {
    return normalizeCatalogPublicCitation({
      kind: "catalog_record",
      manifest: context.store.manifest,
      family: recordMatch[1] as CatalogRuntimeFamilyName,
      id: decodeURIComponent(recordMatch[2]),
    });
  }
  const claimMatch = /^knowledge-policy-claim:(.+)$/u.exec(locator);
  if (claimMatch?.[1] && policy) {
    return normalizeCatalogPublicCitation({
      kind: "project_policy_resource",
      rootDir: policy.root_dir,
      digest: policy.digest,
      resourceKind: "claim",
      id: decodeURIComponent(claimMatch[1]),
    });
  }
  return locator;
}

export function reviewSaltCode(
  context: ReviewSaltCodeContext,
  input: ReviewSaltCodeInput,
  policy: ReviewProjectPolicyContext | null = null,
  projectContextDigest: string | null = null,
  contextSource: ReviewContextSource = "none",
  measureFinalResultUtf8Bytes: (payload: unknown) => number = jsonUtf8Bytes,
) {
  const maxFindings = Math.min(50, Math.max(1, input.max_findings ?? 20));
  const completeAnalysis = analyzeSaltCode(
    context,
    input,
    policy,
    projectContextDigest,
    contextSource,
  );
  const analyzedResults = completeAnalysis.results.map((result) => ({
    ...result,
    findings: result.findings.map((finding) => ({
      ...finding,
      ...(finding.policy_evaluation
        ? {
            policy_evaluation: {
              ...finding.policy_evaluation,
              competing_claims:
                finding.policy_evaluation.competing_claims.map((claim) => ({
                  ...claim,
                  locator: renderPublicEvidenceLocator(
                    claim.locator,
                    context,
                    policy,
                  ),
                })),
            },
          }
        : {}),
      evidence: {
        ...finding.evidence,
        references: finding.evidence.references.map((reference) => ({
          ...reference,
          locator: renderPublicEvidenceLocator(
            reference.locator,
            context,
            policy,
          ),
        })),
      },
    })),
    version_decisions: result.version_decisions.map((decision) => ({
      ...decision,
      evidence: {
        ...decision.evidence,
        references: decision.evidence.references.map((reference) => ({
          ...reference,
          locator: renderPublicEvidenceLocator(
            reference.locator,
            context,
            policy,
          ),
        })),
      },
    })),
  }));
  const detectedFindings = completeAnalysis.coverage.detected_findings;
  const detectedNonFindingVersionDecisions =
    completeAnalysis.coverage.detected_nonfinding_version_decisions;
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
    scope: completeAnalysis.scope,
    coverage: {
      ...completeAnalysis.coverage,
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
    limitations: [...completeAnalysis.limitations],
    provenance: completeAnalysis.provenance,
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

export type ReviewSaltCodeResult = ReturnType<typeof reviewSaltCode>;
