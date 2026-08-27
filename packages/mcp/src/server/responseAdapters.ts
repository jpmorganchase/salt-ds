import {
  JSONRPC_VERSION,
  SERVER_INFO_META_KEY,
  serializeMessage,
  type ContentBlock,
  type Implementation,
  type RequestId,
  type ResourceLink,
  type ServerContext,
} from "@modelcontextprotocol/server";
import {
  jsonUtf8Bytes,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
} from "../core/runtime.js";
import type { SaltToolName } from "./toolDefinitions.js";

export const MAX_SEARCH_TOOL_RESULT_UTF8_BYTES = 16 * 1024;

export interface SaltToolWireContext {
  era: "legacy" | "modern";
  requestId: RequestId;
  serverInfo: Implementation;
}

export interface SaltToolResult {
  content: ContentBlock[];
  structuredContent: Record<string, unknown>;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createNonSearchToolResult(payload: Record<string, unknown>) {
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
    `Knowledge ${String(provenance.knowledge_version ?? "unknown")} (${String(provenance.semantic_digest ?? "unknown")}).`,
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
  const data = isRecord(payload.data) ? payload.data : null;
  const context = isRecord(data?.context) ? data.context : null;
  const workspace = isRecord(data?.workspace) ? data.workspace : null;
  const installation = isRecord(data?.installation) ? data.installation : null;
  const assessment = isRecord(installation?.assessment)
    ? installation.assessment
    : null;
  const untrustedProjectData = isRecord(installation?.untrusted_project_data)
    ? installation.untrusted_project_data
    : null;
  const diagnostics = Array.isArray(untrustedProjectData?.diagnostics)
    ? untrustedProjectData.diagnostics.flatMap((diagnostic) => {
        if (!isRecord(diagnostic)) return [];
        const parameters = isRecord(diagnostic.parameters)
          ? diagnostic.parameters
          : null;
        return [
          {
            code: diagnostic.code,
            parameters: { count: parameters?.count },
          },
        ];
      })
    : [];
  let catalogAssessmentSummary: Record<string, unknown> | undefined;
  if (untrustedProjectData) {
    const resolvedPackages = Array.isArray(
      untrustedProjectData.resolved_packages,
    )
      ? untrustedProjectData.resolved_packages
      : [];
    const applicabilityCounts = {
      exact_knowledge_package_version: 0,
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
        applicability.basis === "exact_knowledge_package_version"
      ) {
        applicabilityCounts.exact_knowledge_package_version += 1;
      } else if (applicability?.state === "current") {
        applicabilityCounts.current += 1;
      } else {
        applicabilityCounts.unknown += 1;
      }
    }
    const coverage = isRecord(payload.coverage) ? payload.coverage : null;
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
      catalogAssessmentSummary = {
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
  }
  const policy = isRecord(data?.policy) ? data.policy : null;
  const policyIr = isRecord(policy?.ir) ? policy.ir : null;
  const policyCounts = isRecord(policyIr?.counts) ? policyIr.counts : null;
  const policyImportTargets = isRecord(policy?.import_targets)
    ? policy.import_targets
    : null;
  const scope = isRecord(payload.scope) ? payload.scope : null;
  const ancestorWorkspaceDiscovery = isRecord(
    scope?.ancestor_workspace_discovery,
  )
    ? scope.ancestor_workspace_discovery
    : null;
  const coverage = isRecord(payload.coverage) ? payload.coverage : null;
  const resultBudget = isRecord(coverage?.result_budget)
    ? coverage.result_budget
    : null;
  const omissions = Array.isArray(resultBudget?.omissions)
    ? resultBudget.omissions.flatMap((omission) =>
        isRecord(omission)
          ? [
              {
                section: omission.section,
                available: omission.available,
                returned: omission.returned,
              },
            ]
          : [],
      )
    : [];
  const provenance = isRecord(payload.provenance) ? payload.provenance : null;
  const fallbackInstallation = installation
    ? {
        assessment: assessment
          ? {
              status: assessment.status,
              blocking: assessment.blocking,
              advisory_issue_count: assessment.advisory_issue_count,
              unverifiable_package_count: assessment.unverifiable_package_count,
            }
          : null,
        untrusted_project_data: untrustedProjectData
          ? {
              classification: untrustedProjectData.classification,
              instruction_authority: untrustedProjectData.instruction_authority,
              authorization_meaning:
                untrustedProjectData.authorization_meaning,
              diagnostics,
              resolved_packages: [],
            }
          : null,
        ...(catalogAssessmentSummary
          ? { catalog_assessment_summary: catalogAssessmentSummary }
          : {}),
      }
    : null;
  const fallback = {
    data: {
      context: context
        ? {
            handle: context.handle,
            digest: context.digest,
            retention: context.retention,
          }
        : null,
      root_dir: null,
      package_manifest: null,
      workspace: workspace
        ? { kind: workspace.kind, workspace_root: null }
        : null,
      installation: fallbackInstallation,
      policy: policy
        ? {
            mode: policy.mode,
            team_config_path: null,
            stack_config_path: null,
            ir: policyIr
              ? {
                  contract: policyIr.contract,
                  policy_mode: policyIr.policy_mode,
                  declared: policyIr.declared,
                  digest: policyIr.digest,
                  manifest_uri: null,
                  counts: policyCounts
                    ? {
                        layers: policyCounts.layers,
                        occurrences: policyCounts.occurrences,
                        diagnostics: policyCounts.diagnostics,
                      }
                    : null,
                  untrusted_ir: null,
                }
              : null,
            import_targets: policyImportTargets
              ? {
                  status: policyImportTargets.status,
                  declared_count: policyImportTargets.declared_count,
                  resolved_count: policyImportTargets.resolved_count,
                  issue_count: policyImportTargets.issue_count,
                  untrusted_diagnostics: null,
                }
              : null,
          }
        : null,
    },
    scope: scope
      ? {
          kind: scope.kind,
          filesystem_access: scope.filesystem_access,
          inspected_root: null,
          authorization: scope.authorization,
          ancestor_workspace_discovery: ancestorWorkspaceDiscovery
            ? {
                status: ancestorWorkspaceDiscovery.status,
                containment: ancestorWorkspaceDiscovery.containment,
                max_directories: ancestorWorkspaceDiscovery.max_directories,
                limited: ancestorWorkspaceDiscovery.limited,
              }
            : null,
        }
      : null,
    coverage: coverage
      ? {
          requested_root: coverage.requested_root,
          package_manifest: coverage.package_manifest,
          installation: coverage.installation,
          workspace: coverage.workspace,
          policy: coverage.policy,
          result_budget: resultBudget
            ? {
                max_utf8_bytes: resultBudget.max_utf8_bytes,
                truncated: resultBudget.truncated,
                omissions,
              }
            : null,
        }
      : null,
    limitations: Array.isArray(payload.limitations)
      ? payload.limitations.filter(
          (limitation): limitation is string => typeof limitation === "string",
        )
      : [],
    provenance: provenance
      ? {
          project_context_digest: provenance.project_context_digest,
          project_policy_digest: provenance.project_policy_digest,
        }
      : null,
  };
  return JSON.stringify(fallback);
}

function createSaltToolBaseResult(
  name: SaltToolName,
  payload: Record<string, unknown>,
): SaltToolResult {
  if (name === "search_salt") {
    return {
      content: [{ type: "text", text: searchTextFallback(payload) }],
      structuredContent: payload,
    };
  }
  const result = createNonSearchToolResult(payload);
  if (name === "inspect_salt_project") {
    const textContent = result.content[0];
    if (textContent) {
      textContent.text = nonSearchTextFallback(name, payload);
    }
  }
  return result;
}

export function createSaltToolWireContext(
  context: ServerContext,
  serverInfo: Implementation,
): SaltToolWireContext {
  return {
    era: context.mcpReq.envelope === undefined ? "legacy" : "modern",
    requestId: context.mcpReq.id,
    serverInfo,
  };
}

export function prepareSaltToolResultForWire(
  result: SaltToolResult,
  context: SaltToolWireContext,
): SaltToolResult {
  if (context.era === "legacy") return result;
  const projected: SaltToolResult = { ...result, resultType: "complete" };
  const meta = result._meta;
  if (meta === undefined) {
    return {
      ...projected,
      _meta: { [SERVER_INFO_META_KEY]: context.serverInfo },
    };
  }
  if (!isRecord(meta) || meta[SERVER_INFO_META_KEY] !== undefined) {
    return projected;
  }
  return {
    ...projected,
    _meta: {
      ...meta,
      [SERVER_INFO_META_KEY]: context.serverInfo,
    },
  };
}

export function measureSaltToolResultFrameUtf8Bytes(
  result: SaltToolResult,
  context: SaltToolWireContext,
): number {
  return Buffer.byteLength(
    serializeMessage({
      jsonrpc: JSONRPC_VERSION,
      id: context.requestId,
      result: prepareSaltToolResultForWire(result, context),
    }),
    "utf8",
  );
}

export function measureSaltToolBaseResultFrameUtf8Bytes(
  name: SaltToolName,
  payload: Record<string, unknown>,
  context: SaltToolWireContext,
): number {
  return measureSaltToolResultFrameUtf8Bytes(
    createSaltToolBaseResult(name, payload),
    context,
  );
}

export function adaptSaltToolResult(
  name: SaltToolName,
  payload: Record<string, unknown>,
  wireContext: SaltToolWireContext,
) {
  if (name !== "search_salt") {
    const result = createSaltToolBaseResult(name, payload);
    const content: ContentBlock[] = [...result.content];
    const linkedResult = { ...result, content };
    for (const link of nonSearchResourceLinks(payload)) {
      const candidate = { ...result, content: [...content, link] };
      if (
        measureSaltToolResultFrameUtf8Bytes(candidate, wireContext) >
        MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
      ) {
        break;
      }
      content.push(link);
    }
    const projected = prepareSaltToolResultForWire(linkedResult, wireContext);
    if (
      measureSaltToolResultFrameUtf8Bytes(projected, wireContext) >
      MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
    ) {
      throw new Error(
        `${name} exceeded its ${MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
      );
    }
    return projected;
  }

  const baseResult = createSaltToolBaseResult(name, payload);
  const content: ContentBlock[] = [...baseResult.content];
  for (const link of searchResourceLinks(payload)) {
    const candidate = {
      ...baseResult,
      content: [...content, link],
    };
    if (
      jsonUtf8Bytes(candidate) > MAX_SEARCH_TOOL_RESULT_UTF8_BYTES ||
      measureSaltToolResultFrameUtf8Bytes(candidate, wireContext) >
        MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
    ) {
      break;
    }
    content.push(link);
  }
  const result = { ...baseResult, content };
  if (jsonUtf8Bytes(result) > MAX_SEARCH_TOOL_RESULT_UTF8_BYTES) {
    throw new Error(
      `search_salt exceeded its ${MAX_SEARCH_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  const projected = prepareSaltToolResultForWire(result, wireContext);
  if (
    measureSaltToolResultFrameUtf8Bytes(projected, wireContext) >
    MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
  ) {
    throw new Error(
      `${name} exceeded its ${MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  return projected;
}
