import type { ContentBlock, ResourceLink } from "@modelcontextprotocol/server";
import {
  jsonUtf8Bytes,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
} from "../core/runtime.js";
import type { SaltToolName } from "./toolDefinitions.js";

export const MAX_SEARCH_TOOL_RESULT_UTF8_BYTES = 16 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createNonSearchToolResult<T>(payload: T) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload),
      },
    ],
    structuredContent: payload,
  };
}

export function measureNonSearchToolResultUtf8Bytes(payload: unknown): number {
  return jsonUtf8Bytes(createNonSearchToolResult(payload));
}

function searchResourceLinks(payload: Record<string, unknown>): ResourceLink[] {
  const data = isRecord(payload.data) ? payload.data : null;
  const matches = Array.isArray(data?.matches) ? data.matches : [];
  return matches.flatMap((match) => {
    if (!isRecord(match) || typeof match.uri !== "string") return [];
    return [
      {
        type: "resource_link" as const,
        uri: match.uri,
        name:
          typeof match.family === "string" && typeof match.id === "string"
            ? `${match.family}:${match.id}`
            : typeof match.id === "string"
              ? match.id
              : match.uri,
        mimeType: "application/json",
      },
    ];
  });
}

function nonSearchResourceLinks(
  payload: Record<string, unknown>,
): ResourceLink[] {
  const uris = new Set<string>();
  const data = isRecord(payload.data) ? payload.data : null;
  const policy = isRecord(data?.policy) ? data.policy : null;
  const policyIr = isRecord(policy?.ir) ? policy.ir : null;
  if (typeof policyIr?.manifest_uri === "string") {
    uris.add(policyIr.manifest_uri);
  }
  const results = Array.isArray(data?.results) ? data.results : [];
  for (const result of results) {
    if (!isRecord(result)) continue;
    const decisions = [
      ...(Array.isArray(result.findings) ? result.findings : []),
      ...(Array.isArray(result.version_decisions)
        ? result.version_decisions
        : []),
    ];
    for (const decision of decisions) {
      if (!isRecord(decision)) continue;
      const evidence = isRecord(decision.evidence) ? decision.evidence : null;
      const references = Array.isArray(evidence?.references)
        ? evidence.references
        : [];
      for (const reference of references) {
        if (
          isRecord(reference) &&
          typeof reference.locator === "string" &&
          reference.locator.startsWith("salt://")
        ) {
          uris.add(reference.locator);
        }
      }
    }
  }
  return [...uris].map((uri, index) => ({
    type: "resource_link" as const,
    uri,
    name: `salt-evidence-${index + 1}`,
    mimeType: "application/json",
  }));
}

function searchTextFallback(payload: Record<string, unknown>): string {
  const data = isRecord(payload.data) ? payload.data : {};
  const scope = isRecord(payload.scope) ? payload.scope : {};
  const coverage = isRecord(payload.coverage) ? payload.coverage : {};
  const provenance = isRecord(payload.provenance) ? payload.provenance : {};
  const ambiguity = isRecord(data.ambiguity) ? data.ambiguity : {};
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const applicability = isRecord(payload.applicability)
    ? payload.applicability
    : {};
  const lines = [
    `Salt catalog search: ${String(data.query ?? "")}`,
    `Returned ${String(scope.returned ?? matches.length)} of ${String(
      ambiguity.candidate_count ?? coverage.matched_documents ?? matches.length,
    )} matches; truncated=${String(scope.truncated ?? false)}; ambiguous=${String(ambiguity.is_ambiguous ?? false)}; top-score ties=${String(ambiguity.top_score_tie_count ?? 0)}.`,
    `Scope: families=${Array.isArray(scope.searched_families) ? scope.searched_families.join(",") : ""}; statuses=${Array.isArray(scope.searched_statuses) ? scope.searched_statuses.join(",") : "all"}; total=${String(scope.total_documents ?? "")}.`,
    `Coverage: indexed=${String(coverage.indexed_documents ?? "")}; evaluated=${String(coverage.evaluated_documents ?? "")}; matched=${String(coverage.matched_documents ?? "")}; ranking=${String(coverage.ranking ?? "")}.`,
    `Applicability: ${String(applicability.state ?? "unknown")} (${String(applicability.basis ?? "evidence_unavailable")}); historical completeness=${String(applicability.historical_completeness ?? false)}.`,
  ];
  for (const match of matches) {
    if (!isRecord(match)) continue;
    const evidence = isRecord(match.evidence) ? match.evidence : {};
    const fields = Array.isArray(evidence.matched_fields)
      ? evidence.matched_fields.join(",")
      : "";
    const terms = Array.isArray(evidence.matched_terms)
      ? evidence.matched_terms.join(",")
      : "";
    lines.push(
      `${String(match.family ?? "catalog")}:${String(match.id ?? "unknown")} — ${String(match.title ?? "")}`,
      String(match.summary ?? ""),
      `${String(match.uri ?? "")} (score=${String(evidence.score ?? "")}; fields=${fields}; terms=${terms})`,
    );
  }
  lines.push(
    `Catalog ${String(provenance.catalog_version ?? "unknown")} (${String(provenance.semantic_digest ?? "unknown")}).`,
  );
  const limitations = Array.isArray(payload.limitations)
    ? payload.limitations.map(String)
    : [];
  if (limitations.length > 0) {
    lines.push(`Limitations: ${limitations.join(" ")}`);
  }
  return lines.join("\n");
}

function nonSearchTextFallback(
  name: SaltToolName,
  payload: Record<string, unknown>,
): string {
  if (name !== "inspect_salt_project") return JSON.stringify(payload);
  const fallback = structuredClone(payload);
  const data = isRecord(fallback.data) ? fallback.data : null;
  const installation = isRecord(data?.installation) ? data.installation : null;
  const untrustedProjectData = isRecord(installation?.untrusted_project_data)
    ? installation.untrusted_project_data
    : null;
  if (untrustedProjectData) {
    const resolvedPackages = Array.isArray(
      untrustedProjectData.resolved_packages,
    )
      ? untrustedProjectData.resolved_packages
      : [];
    const applicabilityCounts = {
      exact_catalog_package_version: 0,
      current: 0,
      unknown: 0,
    };
    for (const entry of resolvedPackages) {
      if (!isRecord(entry)) continue;
      const catalogAssessment = isRecord(entry.catalog_assessment)
        ? entry.catalog_assessment
        : null;
      const applicability = isRecord(catalogAssessment?.applicability)
        ? catalogAssessment.applicability
        : null;
      if (
        applicability?.state === "applicable" &&
        applicability.basis === "exact_catalog_package_version"
      ) {
        applicabilityCounts.exact_catalog_package_version += 1;
      } else if (applicability?.state === "current") {
        applicabilityCounts.current += 1;
      } else {
        applicabilityCounts.unknown += 1;
      }
    }
    const coverage = isRecord(fallback.coverage) ? fallback.coverage : null;
    const resultBudget = isRecord(coverage?.result_budget)
      ? coverage.result_budget
      : null;
    const omissions = Array.isArray(resultBudget?.omissions)
      ? resultBudget.omissions
      : [];
    const packageOmission = omissions.find(
      (entry) =>
        isRecord(entry) &&
        entry.section ===
          "installation.untrusted_project_data.resolved_packages",
    );
    const availableSaltPackages =
      isRecord(packageOmission) &&
      typeof packageOmission.available === "number"
        ? packageOmission.available
        : resolvedPackages.length;
    if (availableSaltPackages > 0) {
      installation!.catalog_assessment_summary = {
        observed_salt_packages: availableSaltPackages,
        returned_salt_packages: resolvedPackages.length,
        package_assessments_truncated:
          resolvedPackages.length < availableSaltPackages,
        applicability_count_scope: "returned_packages_only",
        ...applicabilityCounts,
        peer_compatibility: "not_evaluated",
        historical_completeness: false,
      };
    }
    untrustedProjectData.resolved_packages = [];
  }
  return JSON.stringify(fallback);
}

export function adaptSaltToolResult(
  name: SaltToolName,
  payload: Record<string, unknown>,
) {
  if (name !== "search_salt") {
    const result = createNonSearchToolResult(payload);
    if (name === "inspect_salt_project") {
      const textContent = result.content[0];
      if (textContent) textContent.text = nonSearchTextFallback(name, payload);
    }
    const content: ContentBlock[] = [...result.content];
    const linkedResult = { ...result, content };
    for (const link of nonSearchResourceLinks(payload)) {
      const candidate = { ...result, content: [...content, link] };
      if (jsonUtf8Bytes(candidate) > MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES) break;
      content.push(link);
    }
    if (jsonUtf8Bytes(linkedResult) > MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES) {
      throw new Error(
        `${name} exceeded its ${MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
      );
    }
    return linkedResult;
  }

  const content: ContentBlock[] = [
    {
      type: "text",
      text: searchTextFallback(payload),
    },
  ];
  for (const link of searchResourceLinks(payload)) {
    const candidate = {
      content: [...content, link],
      structuredContent: payload,
    };
    if (jsonUtf8Bytes(candidate) > MAX_SEARCH_TOOL_RESULT_UTF8_BYTES) break;
    content.push(link);
  }
  const result = { content, structuredContent: payload };
  if (jsonUtf8Bytes(result) > MAX_SEARCH_TOOL_RESULT_UTF8_BYTES) {
    throw new Error(
      `search_salt exceeded its ${MAX_SEARCH_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  if (jsonUtf8Bytes(result) > MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES) {
    throw new Error(
      `${name} exceeded its ${MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  return result;
}
