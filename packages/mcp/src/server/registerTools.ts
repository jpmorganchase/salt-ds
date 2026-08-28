import type { McpServer, ServerContext } from "@modelcontextprotocol/server";
import {
  analyzeSaltCode,
  inspectSaltProjectFacts,
  searchSaltRecords,
  type KnowledgeRuntimeContext,
} from "@salt-ds/knowledge";
import { selectProjectRoot, type ConfiguredProjectRoot } from "./projectAccess.js";
import {
  assertStructuredBudget,
  createToolResult,
  evidenceLocatorResourceUri,
  knowledgeRecordUri,
  structuredUtf8Bytes,
} from "./responseAdapters.js";
import {
  inspectSaltProjectInputSchema,
  inspectSaltProjectOutputSchema,
  MAX_TOOL_STRUCTURED_UTF8_BYTES,
  READ_ONLY_TOOL_ANNOTATIONS,
  reviewSaltCodeInputSchema,
  reviewSaltCodeOutputSchema,
  searchSaltInputSchema,
  searchSaltOutputSchema,
  type InspectSaltProjectInput,
  type InspectSaltProjectOutput,
  type ReviewSaltCodeInput,
  type ReviewSaltCodeOutput,
  type SearchSaltInput,
  type SearchSaltOutput,
} from "./toolDefinitions.js";

export type SaltToolContext = KnowledgeRuntimeContext & {
  projectRoots: readonly ConfiguredProjectRoot[];
};

function checkCancellation(ctx: ServerContext): void {
  ctx.mcpReq.signal.throwIfAborted();
}

function boundedStrings(values: readonly string[], max = 32): string[] {
  return [...new Set(values)]
    .slice(0, max)
    .map((value) =>
      value.length <= 500 ? value : `${value.slice(0, 499).trimEnd()}…`,
    );
}

export function searchSaltOperation(
  context: SaltToolContext,
  input: SearchSaltInput,
): SearchSaltOutput {
  const neutral = searchSaltRecords(context.store, {
    query: input.query,
    families: input.families,
    statuses: input.statuses,
    limit: input.limit,
  });
  const matches = neutral.matches.map((match) => ({
    family: match.reference.family,
    id: match.reference.id,
    title: match.title,
    summary:
      match.summary.length <= 240
        ? match.summary
        : `${match.summary.slice(0, 239).trimEnd()}…`,
    resource_uri: knowledgeRecordUri(
      context.store.manifest,
      match.reference.family,
      match.reference.id,
    ),
    score: match.evidence.score,
    source_records: match.citation.source_records,
  }));
  const output: SearchSaltOutput = {
    contract: "salt-mcp-search-result/1",
    bundle_digest: context.store.manifest.bundle_digest,
    query: neutral.query,
    matches,
    coverage: {
      indexed_documents: neutral.indexed_documents,
      evaluated_documents: neutral.evaluated_documents,
      matched_documents: neutral.matched_documents,
      returned_matches: matches.length,
      truncated: neutral.matched_documents > matches.length,
    },
    limitations: [
      "Search returns bounded summaries; read the digest-bound resource for exact record data.",
    ],
  };
  assertStructuredBudget(output);
  return output;
}

async function inspectConfiguredProject(
  context: SaltToolContext,
  input: InspectSaltProjectInput,
) {
  const root = selectProjectRoot(context.projectRoots, input.project_root_index);
  const inspected = await inspectSaltProjectFacts({
    rootDir: root.rootDir,
    authorityRoot: root.rootDir,
  });
  return { root, inspected };
}

export async function inspectSaltProjectOperation(
  context: SaltToolContext,
  input: InspectSaltProjectInput,
): Promise<InspectSaltProjectOutput> {
  const { root, inspected } = await inspectConfiguredProject(context, input);
  const { facts } = inspected;
  const manifest = facts.package_manifest;
  const output: InspectSaltProjectOutput = {
    contract: "salt-mcp-project-inspection/1",
    bundle_digest: context.store.manifest.bundle_digest,
    project_root_index: root.index,
    project: {
      package_manifest: {
        status: manifest.status,
        name: manifest.status === "valid" ? manifest.name : null,
        package_manager:
          manifest.status === "valid" ? manifest.packageManager : null,
      },
      declared_salt_packages: facts.declared_salt_packages.map((entry) => ({
        name: entry.name,
        version: entry.version,
      })),
      installation: {
        status: facts.installation.inspection.status,
        package_layout: facts.installation.inspection.packageLayout,
        resolved_packages: facts.installation.resolvedPackages.map((entry) => ({
          name: entry.name,
          declared_version: entry.declaredVersion,
          resolved_version: entry.resolvedVersion,
          satisfies_declared_version: entry.satisfiesDeclaredVersion,
        })),
      },
      workspace: { kind: facts.workspace.kind },
      policy: { mode: facts.policy.detection.mode },
    },
    limitations: boundedStrings(inspected.limitations),
  };
  assertStructuredBudget(output);
  return output;
}

function versionRecord(input: ReviewSaltCodeInput): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const entry of input.package_versions ?? []) {
    if (Object.hasOwn(versions, entry.name)) {
      throw new Error(`Duplicate package_versions entry: ${entry.name}.`);
    }
    versions[entry.name] = entry.version;
  }
  return versions;
}

export async function reviewSaltCodeOperation(
  context: SaltToolContext,
  input: ReviewSaltCodeInput,
): Promise<ReviewSaltCodeOutput> {
  const callerVersions = versionRecord(input);
  let projectLimitations: string[] = [];
  let packageVersionEvidence: Record<string, string | null> | undefined;
  if (input.project_root_index !== undefined) {
    const { inspected } = await inspectConfiguredProject(context, {
      project_root_index: input.project_root_index,
    });
    packageVersionEvidence = Object.fromEntries(
      inspected.facts.installation.resolvedPackages.map((entry) => [
        entry.name,
        entry.resolvedVersion,
      ]),
    );
    projectLimitations = inspected.limitations;
  }
  const analysis = analyzeSaltCode(
    {
      store: context.store,
      reviewCatalog: context.reviewCatalog,
      ...(packageVersionEvidence ? { packageVersionEvidence } : {}),
    },
    {
      artifacts: input.artifacts,
      ...(Object.keys(callerVersions).length > 0
        ? { package_versions: callerVersions }
        : {}),
      ...(input.max_findings ? { max_findings: input.max_findings } : {}),
    },
    null,
    null,
    packageVersionEvidence
      ? "fresh_project_inspection"
      : Object.keys(callerVersions).length > 0
        ? "caller_package_versions"
        : "none",
  );

  let remaining = input.max_findings ?? 20;
  const results: ReviewSaltCodeOutput["results"] = analysis.results.map(
    (result) => {
      const selected = result.findings.slice(0, remaining);
      remaining -= selected.length;
      return {
        artifact: result.artifact,
        outcome: result.outcome,
        summary: result.summary,
        findings: selected.map((finding) => ({
          id: finding.id,
          rule_id: finding.rule_id,
          rule_description: finding.rule_description,
          severity: finding.severity,
          location: finding.location,
          remediation: finding.remediation,
          evidence_resource_uris: [
            ...new Set(
              finding.evidence.references
                .map((reference) =>
                  evidenceLocatorResourceUri(
                    context.store.manifest,
                    reference.locator,
                  ),
                )
                .filter((uri): uri is string => uri !== null),
            ),
          ],
        })),
        coverage: {
          parser: result.coverage.parser,
          detected_findings: result.coverage.detected_findings,
          returned_findings: selected.length,
          truncated: selected.length < result.coverage.detected_findings,
        },
        limitations: boundedStrings(result.limitations, 8),
      };
    },
  );
  const output: ReviewSaltCodeOutput = {
    contract: "salt-mcp-code-review/1",
    bundle_digest: context.store.manifest.bundle_digest,
    results,
    coverage: {
      submitted_artifacts: analysis.coverage.submitted_artifacts,
      evaluated_artifacts: analysis.coverage.evaluated_artifacts,
      detected_findings: analysis.coverage.detected_findings,
      returned_findings: results.reduce(
        (count, result) => count + result.findings.length,
        0,
      ),
      truncated: false,
    },
    limitations: boundedStrings(
      [...analysis.limitations, ...projectLimitations],
      16,
    ),
  };

  const removeLastFinding = (): boolean => {
    for (let index = output.results.length - 1; index >= 0; index -= 1) {
      const result = output.results[index];
      if (!result || result.findings.length === 0) continue;
      result.findings.pop();
      result.coverage.returned_findings = result.findings.length;
      result.coverage.truncated = true;
      output.coverage.returned_findings -= 1;
      return true;
    }
    return false;
  };
  while (structuredUtf8Bytes(output) > MAX_TOOL_STRUCTURED_UTF8_BYTES) {
    if (!removeLastFinding()) {
      throw new Error("review_salt_code mandatory result metadata exceeds its byte budget.");
    }
  }
  output.coverage.truncated =
    output.coverage.returned_findings < output.coverage.detected_findings;
  if (output.coverage.truncated) {
    output.limitations.push(
      `Returned ${output.coverage.returned_findings} of ${output.coverage.detected_findings} findings because of max_findings or the response byte budget.`,
    );
  }
  assertStructuredBudget(output);
  return output;
}

function searchText(output: SearchSaltOutput): string {
  const matches = output.matches
    .map((match) => `- ${match.title}: ${match.summary}\n  ${match.resource_uri}`)
    .join("\n");
  return `# Salt search: ${output.query}\n\n${matches || "No matches."}\n\nBundle: ${output.bundle_digest}\n`;
}

function inspectText(output: InspectSaltProjectOutput): string {
  const packages = output.project.declared_salt_packages
    .map((entry) => `${entry.name}@${entry.version}`)
    .join(", ");
  return `# Salt project ${output.project_root_index}\n\nPackages: ${packages || "none observed"}\nWorkspace: ${output.project.workspace.kind}\nPolicy: ${output.project.policy.mode}\nBundle: ${output.bundle_digest}\n`;
}

function reviewText(output: ReviewSaltCodeOutput): string {
  const findings = output.results.flatMap((result) =>
    result.findings.map(
      (finding) =>
        `- [${finding.severity}] ${result.artifact.id}: ${finding.rule_description}`,
    ),
  );
  return `# Salt code review\n\n${findings.join("\n") || "No findings in the evaluated scope."}\n\nBundle: ${output.bundle_digest}\n`;
}

export function registerSaltTools(
  server: McpServer,
  context: SaltToolContext,
): void {
  server.registerTool(
    "search_salt",
    {
      title: "Search Salt knowledge",
      description: "Search immutable, version-matched Salt Design System knowledge.",
      inputSchema: searchSaltInputSchema,
      outputSchema: searchSaltOutputSchema,
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async (input, ctx) => {
      checkCancellation(ctx);
      const output = searchSaltOperation(context, input);
      checkCancellation(ctx);
      return createToolResult(output, searchText(output));
    },
  );
  server.registerTool(
    "inspect_salt_project",
    {
      title: "Inspect a configured Salt project",
      description:
        "Inspect one startup-authorized project root using bounded, data-only reads.",
      inputSchema: inspectSaltProjectInputSchema,
      outputSchema: inspectSaltProjectOutputSchema,
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async (input, ctx) => {
      checkCancellation(ctx);
      const output = await inspectSaltProjectOperation(context, input);
      checkCancellation(ctx);
      return createToolResult(output, inspectText(output));
    },
  );
  server.registerTool(
    "review_salt_code",
    {
      title: "Review submitted Salt code",
      description:
        "Run deterministic Salt compatibility and deprecation rules over bounded submitted text.",
      inputSchema: reviewSaltCodeInputSchema,
      outputSchema: reviewSaltCodeOutputSchema,
      annotations: READ_ONLY_TOOL_ANNOTATIONS,
    },
    async (input, ctx) => {
      checkCancellation(ctx);
      const output = await reviewSaltCodeOperation(context, input);
      checkCancellation(ctx);
      return createToolResult(output, reviewText(output));
    },
  );
}
